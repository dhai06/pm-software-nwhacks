// ============================================================================
// CPM (Critical Path Method) Scheduling Algorithm
// ============================================================================
// Pure, deterministic, side-effect free implementation with:
// - Per-task earliest start date constraints
// - Project target completion date comparison
// - Project buffer time (extra safety days at end)
// - Optional working-days-only calendar handling
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export type Task = {
  id: string;
  name?: string;
  duration: number; // integer days >= 0
  earliestStart?: string; // ISO date "YYYY-MM-DD" (constraint, optional)
};

export type Link = {
  from: string;
  to: string;
};

export type CPMOptions = {
  projectStartDate: string; // ISO date
  targetCompletionDate?: string; // ISO date, optional
  projectBufferDays?: number; // integer >= 0, optional (extra days appended after last task)
  workingDaysOnly?: boolean; // default false
  holidays?: string[]; // ISO dates to skip if workingDaysOnly true
};

export type TaskSchedule = {
  id: string;
  ES: number; // Earliest Start - offset in days from projectStartDate
  EF: number; // Earliest Finish - offset in days from projectStartDate
  LS: number; // Latest Start
  LF: number; // Latest Finish
  slack: number;
  isCritical: boolean;
  predecessors: string[];
  successors: string[];
  // Calendar dates mapped from offsets:
  startDate: string; // ISO date for ES
  endDate: string; // ISO date for EF
  // Constraint bookkeeping:
  earliestStartOffset?: number; // if earliestStart provided
};

export type ProjectTracking = {
  projectStartDate: string;
  computedFinishDate: string; // date mapped from projectDuration
  computedFinishDateWithBuffer: string; // date mapped from projectDuration + projectBufferDays
  projectDuration: number; // max EF
  projectDurationWithBuffer: number; // projectDuration + buffer
  targetCompletionDate?: string;
  targetOffset?: number; // days from start to target
  daysEarlyOrLate?: number; // (targetOffset - projectDurationWithBuffer)
  meetsTarget?: boolean; // true if projectDurationWithBuffer <= targetOffset
};

export type CPMResult = {
  schedule: Record<string, TaskSchedule>;
  topologicalOrder: string[];
  criticalPath: string[];
  project: ProjectTracking;
};

// ============================================================================
// Internal Calendar Helper Functions (UTC-safe, no external dependencies)
// ============================================================================

/**
 * Parse ISO date string to Date object at UTC midnight
 * @param iso - Date string in "YYYY-MM-DD" format
 * @returns Date object at UTC midnight
 */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Format Date object to ISO date string
 * @param date - Date object
 * @returns Date string in "YYYY-MM-DD" format
 */
function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Add calendar days to a date (UTC-safe)
 * @param date - Starting date
 * @param n - Number of days to add (can be negative)
 * @returns New Date object
 */
function addDays(date: Date, n: number): Date {
  return new Date(date.getTime() + n * 86400000);
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date - Date to check
 * @returns true if weekend
 */
function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a holiday
 * @param date - Date to check
 * @param holidays - Array of ISO date strings representing holidays
 * @returns true if holiday
 */
function isHoliday(date: Date, holidays: string[]): boolean {
  const iso = toISODate(date);
  return holidays.includes(iso);
}

/**
 * Check if a date is a working day (not weekend and not holiday)
 * @param date - Date to check
 * @param holidays - Array of ISO date strings representing holidays
 * @returns true if working day
 */
function isWorkingDay(date: Date, holidays: string[]): boolean {
  return !isWeekend(date) && !isHoliday(date, holidays);
}

/**
 * Add working days to a date, skipping weekends and holidays
 * @param date - Starting date
 * @param n - Number of working days to add (must be >= 0)
 * @param holidays - Array of ISO date strings representing holidays
 * @returns New Date object
 */
function addWorkingDays(date: Date, n: number, holidays: string[]): Date {
  if (n === 0) return date;

  let current = new Date(date.getTime());
  let remaining = n;

  while (remaining > 0) {
    current = addDays(current, 1);
    if (isWorkingDay(current, holidays)) {
      remaining--;
    }
  }

  return current;
}

/**
 * Calculate difference in calendar days between two ISO dates
 * @param startISO - Start date in ISO format
 * @param endISO - End date in ISO format
 * @returns Number of days (can be negative if end < start)
 */
function diffInDays(startISO: string, endISO: string): number {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

/**
 * Calculate difference in working days between two ISO dates
 * @param startISO - Start date in ISO format
 * @param endISO - End date in ISO format
 * @param holidays - Array of ISO date strings representing holidays
 * @returns Number of working days (can be negative if end < start)
 */
function diffInWorkingDays(startISO: string, endISO: string, holidays: string[]): number {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);

  if (start.getTime() === end.getTime()) return 0;

  const direction = end.getTime() > start.getTime() ? 1 : -1;
  let current = new Date(start.getTime());
  let count = 0;

  while (toISODate(current) !== toISODate(end)) {
    current = addDays(current, direction);
    if (isWorkingDay(current, holidays)) {
      count += direction;
    }
  }

  return count;
}

/**
 * Map a day offset to a calendar date
 * @param projectStartDate - Project start date in ISO format
 * @param offset - Day offset from project start
 * @param workingDaysOnly - If true, count only working days
 * @param holidays - Array of ISO date strings representing holidays
 * @returns ISO date string
 */
function offsetToDate(
  projectStartDate: string,
  offset: number,
  workingDaysOnly: boolean,
  holidays: string[]
): string {
  const start = parseISODate(projectStartDate);
  if (workingDaysOnly) {
    return toISODate(addWorkingDays(start, offset, holidays));
  }
  return toISODate(addDays(start, offset));
}

// ============================================================================
// Main CPM Algorithm
// ============================================================================

/**
 * Compute Critical Path Method schedule for a set of tasks and dependencies
 * @param tasks - Array of tasks with id, duration, and optional earliestStart
 * @param links - Array of dependency links (from -> to means "from" must finish before "to" starts)
 * @param options - Scheduling options including project start date and optional constraints
 * @returns CPMResult with schedule, topological order, critical path, and project tracking
 * @throws Error if duration < 0, link references invalid task, or cycle detected
 */
export function computeCPM(tasks: Task[], links: Link[], options: CPMOptions): CPMResult {
  const {
    projectStartDate,
    targetCompletionDate,
    projectBufferDays = 0,
    workingDaysOnly = false,
    holidays = [],
  } = options;

  // Handle empty tasks case
  if (tasks.length === 0) {
    const startDate = projectStartDate;
    return {
      schedule: {},
      topologicalOrder: [],
      criticalPath: [],
      project: {
        projectStartDate,
        computedFinishDate: startDate,
        computedFinishDateWithBuffer: startDate,
        projectDuration: 0,
        projectDurationWithBuffer: projectBufferDays,
        targetCompletionDate,
        targetOffset: targetCompletionDate
          ? workingDaysOnly
            ? diffInWorkingDays(projectStartDate, targetCompletionDate, holidays)
            : diffInDays(projectStartDate, targetCompletionDate)
          : undefined,
        daysEarlyOrLate: targetCompletionDate
          ? (workingDaysOnly
              ? diffInWorkingDays(projectStartDate, targetCompletionDate, holidays)
              : diffInDays(projectStartDate, targetCompletionDate)) - projectBufferDays
          : undefined,
        meetsTarget: targetCompletionDate ? projectBufferDays <= (workingDaysOnly
          ? diffInWorkingDays(projectStartDate, targetCompletionDate, holidays)
          : diffInDays(projectStartDate, targetCompletionDate)) : undefined,
      },
    };
  }

  // Build task lookup map
  const taskMap = new Map<string, Task>();
  for (const task of tasks) {
    // Validate duration
    if (task.duration < 0) {
      throw new Error(`Task "${task.id}" has invalid duration: ${task.duration}. Duration must be >= 0.`);
    }
    taskMap.set(task.id, task);
  }

  // Validate links and build adjacency maps
  const predecessors = new Map<string, string[]>();
  const successors = new Map<string, string[]>();

  for (const task of tasks) {
    predecessors.set(task.id, []);
    successors.set(task.id, []);
  }

  for (const link of links) {
    if (!taskMap.has(link.from)) {
      throw new Error(`Link references non-existent task: "${link.from}"`);
    }
    if (!taskMap.has(link.to)) {
      throw new Error(`Link references non-existent task: "${link.to}"`);
    }
    predecessors.get(link.to)!.push(link.from);
    successors.get(link.from)!.push(link.to);
  }

  // ========================================
  // Topological Sort using Kahn's Algorithm
  // ========================================
  const inDegree = new Map<string, number>();
  for (const task of tasks) {
    inDegree.set(task.id, predecessors.get(task.id)!.length);
  }

  const queue: string[] = [];
  for (const task of tasks) {
    if (inDegree.get(task.id) === 0) {
      queue.push(task.id);
    }
  }

  const topologicalOrder: string[] = [];

  while (queue.length > 0) {
    const taskId = queue.shift()!;
    topologicalOrder.push(taskId);

    for (const successorId of successors.get(taskId)!) {
      const newDegree = inDegree.get(successorId)! - 1;
      inDegree.set(successorId, newDegree);
      if (newDegree === 0) {
        queue.push(successorId);
      }
    }
  }

  // Cycle detection: if not all tasks are in topological order, there's a cycle
  if (topologicalOrder.length !== tasks.length) {
    throw new Error('Cycle detected');
  }

  // ========================================
  // Forward Pass: Compute ES and EF
  // ========================================
  const schedule: Record<string, Partial<TaskSchedule>> = {};

  for (const taskId of topologicalOrder) {
    const task = taskMap.get(taskId)!;
    const preds = predecessors.get(taskId)!;

    // Base ES is max of all predecessor EFs, or 0 if no predecessors
    let baseES = 0;
    if (preds.length > 0) {
      baseES = Math.max(...preds.map((p) => schedule[p].EF!));
    }

    let ES = baseES;
    let earliestStartOffset: number | undefined;

    // Apply earliestStart constraint if provided
    if (task.earliestStart) {
      earliestStartOffset = workingDaysOnly
        ? diffInWorkingDays(projectStartDate, task.earliestStart, holidays)
        : diffInDays(projectStartDate, task.earliestStart);
      ES = Math.max(baseES, earliestStartOffset);
    }

    const EF = ES + task.duration;

    schedule[taskId] = {
      id: taskId,
      ES,
      EF,
      predecessors: preds,
      successors: successors.get(taskId)!,
      earliestStartOffset,
    };
  }

  // ========================================
  // Calculate Project Duration
  // ========================================
  const projectDuration = Math.max(...topologicalOrder.map((id) => schedule[id].EF!));

  // ========================================
  // Backward Pass: Compute LS, LF, slack
  // ========================================
  const reverseOrder = [...topologicalOrder].reverse();

  for (const taskId of reverseOrder) {
    const task = taskMap.get(taskId)!;
    const succs = successors.get(taskId)!;

    // LF for end tasks (no successors) is projectDuration
    // Otherwise LF is min of all successor LSs
    let LF: number;
    if (succs.length === 0) {
      LF = projectDuration;
    } else {
      LF = Math.min(...succs.map((s) => schedule[s].LS!));
    }

    const LS = LF - task.duration;
    const slack = LS - schedule[taskId].ES!;
    const isCritical = slack === 0;

    schedule[taskId].LS = LS;
    schedule[taskId].LF = LF;
    schedule[taskId].slack = slack;
    schedule[taskId].isCritical = isCritical;
  }

  // ========================================
  // Map offsets to calendar dates
  // ========================================
  for (const taskId of topologicalOrder) {
    const s = schedule[taskId];
    s.startDate = offsetToDate(projectStartDate, s.ES!, workingDaysOnly, holidays);
    s.endDate = offsetToDate(projectStartDate, s.EF!, workingDaysOnly, holidays);
  }

  // ========================================
  // Critical Path Reconstruction
  // ========================================
  const criticalTasks = topologicalOrder.filter((id) => schedule[id].isCritical);

  let criticalPath: string[] = [];

  if (criticalTasks.length > 0) {
    // Find starting point: critical task with minimal ES (prefer ES === 0)
    const minES = Math.min(...criticalTasks.map((id) => schedule[id].ES!));
    const startCandidates = criticalTasks.filter((id) => schedule[id].ES === minES);
    let current = startCandidates[0];

    criticalPath.push(current);

    // Follow critical successors where successor.ES === current.EF
    while (true) {
      const currentEF = schedule[current].EF!;
      const succs = successors.get(current)!;
      const nextCritical = succs.find(
        (s) => schedule[s].isCritical && schedule[s].ES === currentEF
      );

      if (!nextCritical) break;

      criticalPath.push(nextCritical);
      current = nextCritical;
    }
  }

  // ========================================
  // Project Tracking Calculation
  // ========================================
  const projectDurationWithBuffer = projectDuration + projectBufferDays;
  const computedFinishDate = offsetToDate(projectStartDate, projectDuration, workingDaysOnly, holidays);
  const computedFinishDateWithBuffer = offsetToDate(
    projectStartDate,
    projectDurationWithBuffer,
    workingDaysOnly,
    holidays
  );

  let targetOffset: number | undefined;
  let daysEarlyOrLate: number | undefined;
  let meetsTarget: boolean | undefined;

  if (targetCompletionDate) {
    targetOffset = workingDaysOnly
      ? diffInWorkingDays(projectStartDate, targetCompletionDate, holidays)
      : diffInDays(projectStartDate, targetCompletionDate);
    daysEarlyOrLate = targetOffset - projectDurationWithBuffer;
    meetsTarget = projectDurationWithBuffer <= targetOffset;
  }

  const project: ProjectTracking = {
    projectStartDate,
    computedFinishDate,
    computedFinishDateWithBuffer,
    projectDuration,
    projectDurationWithBuffer,
    targetCompletionDate,
    targetOffset,
    daysEarlyOrLate,
    meetsTarget,
  };

  // ========================================
  // Build final result
  // ========================================
  const finalSchedule: Record<string, TaskSchedule> = {};
  for (const taskId of topologicalOrder) {
    finalSchedule[taskId] = schedule[taskId] as TaskSchedule;
  }

  return {
    schedule: finalSchedule,
    topologicalOrder,
    criticalPath,
    project,
  };
}
