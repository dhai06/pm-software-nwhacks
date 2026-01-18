/**
 * CPM Algorithm Demo
 * Run with: npx tsx lib/cpm-demo.ts
 */

import { computeCPM, Task, Link, CPMOptions } from './cpm';

console.log('═'.repeat(60));
console.log('  CPM (Critical Path Method) Algorithm Demo');
console.log('═'.repeat(60));

// ============================================
// Example 1: Simple Project with Dependencies
// ============================================
console.log('\n📋 EXAMPLE 1: Website Redesign Project\n');

const tasks1: Task[] = [
  { id: 'design', name: 'Design mockups', duration: 5 },
  { id: 'frontend', name: 'Build frontend', duration: 8 },
  { id: 'backend', name: 'Build backend', duration: 10 },
  { id: 'testing', name: 'Testing', duration: 3 },
  { id: 'deploy', name: 'Deploy', duration: 1 },
];

const links1: Link[] = [
  { from: 'design', to: 'frontend' },
  { from: 'design', to: 'backend' },
  { from: 'frontend', to: 'testing' },
  { from: 'backend', to: 'testing' },
  { from: 'testing', to: 'deploy' },
];

const options1: CPMOptions = {
  projectStartDate: '2026-01-20',
  targetCompletionDate: '2026-02-15',
  projectBufferDays: 3,
};

const result1 = computeCPM(tasks1, links1, options1);

console.log('Tasks:');
console.log('  design (5 days) → frontend (8 days) → testing (3 days) → deploy (1 day)');
console.log('  design (5 days) → backend (10 days) → testing (3 days) → deploy (1 day)');
console.log('');

console.log('Schedule:');
console.log('─'.repeat(50));
for (const id of result1.topologicalOrder) {
  const s = result1.schedule[id];
  const critical = s.isCritical ? '🔴 CRITICAL' : '⚪ slack: ' + s.slack + ' days';
  console.log(`  ${s.id.padEnd(10)} | ${s.startDate} → ${s.endDate} | ${critical}`);
}

console.log('─'.repeat(50));
console.log(`\n📊 Project Summary:`);
console.log(`   Start Date:        ${result1.project.projectStartDate}`);
console.log(`   Finish Date:       ${result1.project.computedFinishDate}`);
console.log(`   With Buffer (+3):  ${result1.project.computedFinishDateWithBuffer}`);
console.log(`   Total Duration:    ${result1.project.projectDuration} days`);
console.log(`   Target Date:       ${result1.project.targetCompletionDate}`);
console.log(`   Meets Target?      ${result1.project.meetsTarget ? '✅ Yes' : '❌ No'} (${result1.project.daysEarlyOrLate! >= 0 ? result1.project.daysEarlyOrLate + ' days early' : Math.abs(result1.project.daysEarlyOrLate!) + ' days late'})`);
console.log(`\n🔴 Critical Path: ${result1.criticalPath.join(' → ')}`);

// ============================================
// Example 2: With earliestStart Constraint
// ============================================
console.log('\n' + '═'.repeat(60));
console.log('\n📋 EXAMPLE 2: With Earliest Start Constraint\n');

const tasks2: Task[] = [
  { id: 'A', name: 'Task A', duration: 3 },
  { id: 'B', name: 'Task B', duration: 4, earliestStart: '2026-01-28' }, // Must wait for external approval
  { id: 'C', name: 'Task C', duration: 2 },
];

const links2: Link[] = [
  { from: 'A', to: 'B' },
  { from: 'B', to: 'C' },
];

const options2: CPMOptions = {
  projectStartDate: '2026-01-20',
};

const result2 = computeCPM(tasks2, links2, options2);

console.log('Task B has earliestStart constraint: 2026-01-28');
console.log('(e.g., waiting for external approval)\n');

console.log('Schedule:');
console.log('─'.repeat(50));
for (const id of result2.topologicalOrder) {
  const s = result2.schedule[id];
  const constraint = s.earliestStartOffset !== undefined ? ` (constrained to day ${s.earliestStartOffset})` : '';
  console.log(`  ${s.id.padEnd(10)} | ${s.startDate} → ${s.endDate}${constraint}`);
}
console.log('─'.repeat(50));
console.log(`\nNote: Task B starts on ${result2.schedule['B'].startDate}, not ${result2.schedule['A'].endDate}`);
console.log(`      because of the earliestStart constraint.`);

// ============================================
// Example 3: Working Days Only
// ============================================
console.log('\n' + '═'.repeat(60));
console.log('\n📋 EXAMPLE 3: Working Days Only (skip weekends)\n');

const tasks3: Task[] = [
  { id: 'work', name: 'Development Work', duration: 10 }, // 10 working days
];

const options3: CPMOptions = {
  projectStartDate: '2026-01-19', // Monday
  workingDaysOnly: true,
  holidays: ['2026-01-26'], // Monday holiday
};

const result3 = computeCPM(tasks3, [], options3);

console.log('10 working days starting Monday 2026-01-19');
console.log('With holiday on Monday 2026-01-26\n');

console.log(`  Start:  ${result3.schedule['work'].startDate} (Monday)`);
console.log(`  End:    ${result3.schedule['work'].endDate}`);
console.log(`\nSkipped: Saturdays, Sundays, and 2026-01-26 (holiday)`);

console.log('\n' + '═'.repeat(60));
console.log('  Demo Complete! Run tests with: npm test');
console.log('═'.repeat(60));
