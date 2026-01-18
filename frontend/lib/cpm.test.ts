import { describe, it, expect } from 'vitest';
import { computeCPM, Task, Link, CPMOptions } from './cpm';

describe('computeCPM', () => {
  // ========================================
  // Test a) earliestStart pushes ES later than dependencies would allow
  // ========================================
  describe('earliestStart constraint', () => {
    it('should push ES later when earliestStart constraint is beyond predecessor EF', () => {
      // Task A (duration 3) -> Task B (duration 2)
      // Without constraint: A: ES=0, EF=3; B: ES=3, EF=5
      // With B.earliestStart = "2026-01-10" (day 9 from project start "2026-01-01"):
      // B should have ES=9, EF=11
      const tasks: Task[] = [
        { id: 'A', duration: 3 },
        { id: 'B', duration: 2, earliestStart: '2026-01-10' },
      ];
      const links: Link[] = [{ from: 'A', to: 'B' }];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
      };

      const result = computeCPM(tasks, links, options);

      expect(result.schedule['A'].ES).toBe(0);
      expect(result.schedule['A'].EF).toBe(3);
      expect(result.schedule['B'].ES).toBe(9); // Pushed by earliestStart constraint
      expect(result.schedule['B'].EF).toBe(11);
      expect(result.schedule['B'].earliestStartOffset).toBe(9);
    });

    it('should not affect ES when earliestStart is before predecessor EF', () => {
      // Task A (duration 5) -> Task B (duration 2)
      // B.earliestStart = "2026-01-03" (day 2), but predecessor finishes on day 5
      // B should have ES=5, EF=7 (not affected by constraint)
      const tasks: Task[] = [
        { id: 'A', duration: 5 },
        { id: 'B', duration: 2, earliestStart: '2026-01-03' },
      ];
      const links: Link[] = [{ from: 'A', to: 'B' }];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
      };

      const result = computeCPM(tasks, links, options);

      expect(result.schedule['B'].ES).toBe(5); // Determined by predecessor, not constraint
      expect(result.schedule['B'].EF).toBe(7);
    });
  });

  // ========================================
  // Test b) Branching graph with correct projectDuration and critical path
  // ========================================
  describe('branching graph', () => {
    it('should compute correct projectDuration and critical path for diamond graph', () => {
      //     B (3)
      //    /     \
      // A(2)      D(2)
      //    \     /
      //     C (5)  <- Critical path goes through C
      //
      // A -> B -> D
      // A -> C -> D
      // Critical path: A -> C -> D (total: 2 + 5 + 2 = 9)
      const tasks: Task[] = [
        { id: 'A', duration: 2 },
        { id: 'B', duration: 3 },
        { id: 'C', duration: 5 },
        { id: 'D', duration: 2 },
      ];
      const links: Link[] = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' },
        { from: 'C', to: 'D' },
      ];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
      };

      const result = computeCPM(tasks, links, options);

      // Project duration should be 9 (A:2 + C:5 + D:2)
      expect(result.project.projectDuration).toBe(9);

      // Critical path should be A -> C -> D
      expect(result.criticalPath).toEqual(['A', 'C', 'D']);

      // Verify schedule details
      expect(result.schedule['A'].ES).toBe(0);
      expect(result.schedule['A'].EF).toBe(2);
      expect(result.schedule['A'].isCritical).toBe(true);

      expect(result.schedule['B'].ES).toBe(2);
      expect(result.schedule['B'].EF).toBe(5);
      expect(result.schedule['B'].isCritical).toBe(false);
      expect(result.schedule['B'].slack).toBe(2); // Can start 2 days later

      expect(result.schedule['C'].ES).toBe(2);
      expect(result.schedule['C'].EF).toBe(7);
      expect(result.schedule['C'].isCritical).toBe(true);

      expect(result.schedule['D'].ES).toBe(7);
      expect(result.schedule['D'].EF).toBe(9);
      expect(result.schedule['D'].isCritical).toBe(true);
    });

    it('should handle parallel paths with same length', () => {
      // A (5) -> C (2)
      // B (5) -> C (2)
      // Both A and B are critical (same duration)
      const tasks: Task[] = [
        { id: 'A', duration: 5 },
        { id: 'B', duration: 5 },
        { id: 'C', duration: 2 },
      ];
      const links: Link[] = [
        { from: 'A', to: 'C' },
        { from: 'B', to: 'C' },
      ];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
      };

      const result = computeCPM(tasks, links, options);

      expect(result.project.projectDuration).toBe(7);
      expect(result.schedule['A'].isCritical).toBe(true);
      expect(result.schedule['B'].isCritical).toBe(true);
      expect(result.schedule['C'].isCritical).toBe(true);
      // Critical path should be one valid chain (either A->C or B->C)
      expect(result.criticalPath.length).toBe(2);
      expect(result.criticalPath[1]).toBe('C');
    });
  });

  // ========================================
  // Test c) Cycle detection
  // ========================================
  describe('cycle detection', () => {
    it('should throw error when cycle detected', () => {
      // A -> B -> C -> A (cycle)
      const tasks: Task[] = [
        { id: 'A', duration: 2 },
        { id: 'B', duration: 3 },
        { id: 'C', duration: 1 },
      ];
      const links: Link[] = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'A' }, // Creates cycle
      ];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
      };

      expect(() => computeCPM(tasks, links, options)).toThrow('Cycle detected');
    });

    it('should throw error for self-referencing task', () => {
      const tasks: Task[] = [{ id: 'A', duration: 2 }];
      const links: Link[] = [{ from: 'A', to: 'A' }];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
      };

      expect(() => computeCPM(tasks, links, options)).toThrow('Cycle detected');
    });
  });

  // ========================================
  // Test d) targetCompletionDate comparison (meetsTarget + daysEarlyOrLate)
  // ========================================
  describe('targetCompletionDate comparison', () => {
    it('should calculate meetsTarget=true when project finishes early', () => {
      const tasks: Task[] = [
        { id: 'A', duration: 5 },
        { id: 'B', duration: 3 },
      ];
      const links: Link[] = [{ from: 'A', to: 'B' }];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
        targetCompletionDate: '2026-01-15', // Day 14 from start
      };

      const result = computeCPM(tasks, links, options);

      expect(result.project.projectDuration).toBe(8); // 5 + 3
      expect(result.project.targetOffset).toBe(14);
      expect(result.project.daysEarlyOrLate).toBe(6); // 14 - 8 = 6 days early
      expect(result.project.meetsTarget).toBe(true);
    });

    it('should calculate meetsTarget=false when project finishes late', () => {
      const tasks: Task[] = [
        { id: 'A', duration: 10 },
        { id: 'B', duration: 8 },
      ];
      const links: Link[] = [{ from: 'A', to: 'B' }];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
        targetCompletionDate: '2026-01-10', // Day 9 from start
      };

      const result = computeCPM(tasks, links, options);

      expect(result.project.projectDuration).toBe(18); // 10 + 8
      expect(result.project.targetOffset).toBe(9);
      expect(result.project.daysEarlyOrLate).toBe(-9); // 9 - 18 = -9 days (late)
      expect(result.project.meetsTarget).toBe(false);
    });

    it('should calculate meetsTarget=true when project finishes exactly on target', () => {
      const tasks: Task[] = [{ id: 'A', duration: 5 }];
      const links: Link[] = [];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
        targetCompletionDate: '2026-01-06', // Day 5 from start
      };

      const result = computeCPM(tasks, links, options);

      expect(result.project.projectDuration).toBe(5);
      expect(result.project.daysEarlyOrLate).toBe(0);
      expect(result.project.meetsTarget).toBe(true);
    });
  });

  // ========================================
  // Test e) projectBufferDays affects computedFinishDateWithBuffer
  // ========================================
  describe('projectBufferDays', () => {
    it('should add buffer days to project duration', () => {
      const tasks: Task[] = [
        { id: 'A', duration: 5 },
        { id: 'B', duration: 3 },
      ];
      const links: Link[] = [{ from: 'A', to: 'B' }];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
        projectBufferDays: 5,
      };

      const result = computeCPM(tasks, links, options);

      expect(result.project.projectDuration).toBe(8);
      expect(result.project.projectDurationWithBuffer).toBe(13); // 8 + 5
      expect(result.project.computedFinishDate).toBe('2026-01-09'); // Day 8
      expect(result.project.computedFinishDateWithBuffer).toBe('2026-01-14'); // Day 13
    });

    it('should affect meetsTarget calculation with buffer', () => {
      const tasks: Task[] = [{ id: 'A', duration: 8 }];
      const links: Link[] = [];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
        targetCompletionDate: '2026-01-12', // Day 11 from start
        projectBufferDays: 5,
      };

      const result = computeCPM(tasks, links, options);

      expect(result.project.projectDuration).toBe(8);
      expect(result.project.projectDurationWithBuffer).toBe(13);
      expect(result.project.targetOffset).toBe(11);
      // daysEarlyOrLate = targetOffset - projectDurationWithBuffer = 11 - 13 = -2
      expect(result.project.daysEarlyOrLate).toBe(-2);
      expect(result.project.meetsTarget).toBe(false); // 13 > 11
    });

    it('should handle zero buffer days', () => {
      const tasks: Task[] = [{ id: 'A', duration: 5 }];
      const links: Link[] = [];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
        projectBufferDays: 0,
      };

      const result = computeCPM(tasks, links, options);

      expect(result.project.projectDuration).toBe(5);
      expect(result.project.projectDurationWithBuffer).toBe(5);
      expect(result.project.computedFinishDate).toBe(result.project.computedFinishDateWithBuffer);
    });
  });

  // ========================================
  // Test f) workingDaysOnly skips weekends/holidays
  // ========================================
  describe('workingDaysOnly', () => {
    it('should skip weekends when calculating dates', () => {
      // 2026-01-01 is Thursday
      // Duration 5 working days should end on 2026-01-08 (skipping Sat/Sun)
      const tasks: Task[] = [{ id: 'A', duration: 5 }];
      const links: Link[] = [];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01', // Thursday
        workingDaysOnly: true,
      };

      const result = computeCPM(tasks, links, options);

      // Thu(1), Fri(2), [Sat, Sun skip], Mon(3), Tue(4), Wed(5) = 2026-01-07
      expect(result.schedule['A'].endDate).toBe('2026-01-08');
    });

    it('should skip holidays when calculating dates', () => {
      const tasks: Task[] = [{ id: 'A', duration: 3 }];
      const links: Link[] = [];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01', // Thursday
        workingDaysOnly: true,
        holidays: ['2026-01-02'], // Friday is a holiday
      };

      const result = computeCPM(tasks, links, options);

      // Start: Thu Jan 1 (day 0), add 3 working days:
      // Fri Jan 2 - holiday skip, Sat Jan 3 - weekend skip, Sun Jan 4 - weekend skip,
      // Mon Jan 5 - working day 1, Tue Jan 6 - working day 2, Wed Jan 7 - working day 3
      expect(result.schedule['A'].endDate).toBe('2026-01-07');
    });

    it('should handle earliestStart constraint with working days', () => {
      // 2026-01-01 is Thursday, 2026-01-05 is Monday
      // If earliestStart is 2026-01-05, that's 2 working days from start (Thu, Fri, skip weekend, Mon)
      const tasks: Task[] = [
        { id: 'A', duration: 2, earliestStart: '2026-01-05' },
      ];
      const links: Link[] = [];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01',
        workingDaysOnly: true,
      };

      const result = computeCPM(tasks, links, options);

      // earliestStartOffset should be 2 working days (Thu->Fri->skip weekend->Mon)
      expect(result.schedule['A'].earliestStartOffset).toBe(2);
      expect(result.schedule['A'].ES).toBe(2);
      expect(result.schedule['A'].startDate).toBe('2026-01-05');
    });

    it('should calculate target comparison with working days', () => {
      const tasks: Task[] = [{ id: 'A', duration: 10 }];
      const links: Link[] = [];
      const options: CPMOptions = {
        projectStartDate: '2026-01-01', // Thursday
        targetCompletionDate: '2026-01-19', // Monday, 2 weeks + 1 day later
        workingDaysOnly: true,
      };

      const result = computeCPM(tasks, links, options);

      // Target is 12 working days from start (10 weekdays + skip 2 weekends)
      expect(result.project.targetOffset).toBe(12);
      expect(result.project.meetsTarget).toBe(true); // 10 <= 12
    });
  });

  // ========================================
  // Additional edge cases
  // ========================================
  describe('edge cases', () => {
    it('should handle empty tasks array', () => {
      const result = computeCPM([], [], { projectStartDate: '2026-01-01' });

      expect(result.schedule).toEqual({});
      expect(result.topologicalOrder).toEqual([]);
      expect(result.criticalPath).toEqual([]);
      expect(result.project.projectDuration).toBe(0);
    });

    it('should throw error for negative duration', () => {
      const tasks: Task[] = [{ id: 'A', duration: -1 }];
      const options: CPMOptions = { projectStartDate: '2026-01-01' };

      expect(() => computeCPM(tasks, [], options)).toThrow(/duration/i);
    });

    it('should throw error for invalid link reference', () => {
      const tasks: Task[] = [{ id: 'A', duration: 5 }];
      const links: Link[] = [{ from: 'A', to: 'B' }]; // B doesn't exist
      const options: CPMOptions = { projectStartDate: '2026-01-01' };

      expect(() => computeCPM(tasks, links, options)).toThrow(/non-existent/i);
    });

    it('should handle single task with no dependencies', () => {
      const tasks: Task[] = [{ id: 'A', duration: 5 }];
      const links: Link[] = [];
      const options: CPMOptions = { projectStartDate: '2026-01-01' };

      const result = computeCPM(tasks, links, options);

      expect(result.schedule['A'].ES).toBe(0);
      expect(result.schedule['A'].EF).toBe(5);
      expect(result.schedule['A'].LS).toBe(0);
      expect(result.schedule['A'].LF).toBe(5);
      expect(result.schedule['A'].slack).toBe(0);
      expect(result.schedule['A'].isCritical).toBe(true);
      expect(result.criticalPath).toEqual(['A']);
    });

    it('should handle task with zero duration', () => {
      const tasks: Task[] = [
        { id: 'A', duration: 3 },
        { id: 'B', duration: 0 }, // Milestone
        { id: 'C', duration: 2 },
      ];
      const links: Link[] = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
      ];
      const options: CPMOptions = { projectStartDate: '2026-01-01' };

      const result = computeCPM(tasks, links, options);

      expect(result.schedule['B'].ES).toBe(3);
      expect(result.schedule['B'].EF).toBe(3); // Same as ES for zero duration
      expect(result.schedule['C'].ES).toBe(3);
      expect(result.project.projectDuration).toBe(5);
    });

    it('should map calendar dates correctly', () => {
      const tasks: Task[] = [{ id: 'A', duration: 5 }];
      const options: CPMOptions = { projectStartDate: '2026-03-15' };

      const result = computeCPM(tasks, [], options);

      expect(result.schedule['A'].startDate).toBe('2026-03-15');
      expect(result.schedule['A'].endDate).toBe('2026-03-20');
      expect(result.project.computedFinishDate).toBe('2026-03-20');
    });

    it('should include predecessors and successors in schedule', () => {
      const tasks: Task[] = [
        { id: 'A', duration: 2 },
        { id: 'B', duration: 3 },
        { id: 'C', duration: 1 },
      ];
      const links: Link[] = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
      ];
      const options: CPMOptions = { projectStartDate: '2026-01-01' };

      const result = computeCPM(tasks, links, options);

      expect(result.schedule['A'].predecessors).toEqual([]);
      expect(result.schedule['A'].successors).toEqual(['B', 'C']);
      expect(result.schedule['B'].predecessors).toEqual(['A']);
      expect(result.schedule['B'].successors).toEqual([]);
      expect(result.schedule['C'].predecessors).toEqual(['A']);
      expect(result.schedule['C'].successors).toEqual([]);
    });
  });
});
