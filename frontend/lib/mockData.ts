import { Project, Task, TaskDependency } from './types';

// Helper to create dates in January 2026
const createDate = (day: number): Date => new Date(2026, 0, day);

export const projects: Project[] = [
  {
    id: 'project-1',
    name: 'My Project',
    description: 'Manage and execute projects from start to finish.',
  },
  {
    id: 'project-2',
    name: 'Marketing Campaign',
    description: 'Q1 2026 product launch marketing initiative.',
  },
  {
    id: 'project-3',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with new branding.',
  },
];

// Helper to create end date from start date + duration
const createEndDate = (startDay: number, duration: number): Date => new Date(2026, 0, startDay + duration);

export const tasks: Task[] = [
  // Project 1 tasks - demonstrates branching dependencies
  // targetCompletionDate = startDate + duration
  {
    id: 'task-1',
    name: 'Task 1',
    duration: 6,
    description: 'Initial planning and requirements gathering phase. This includes stakeholder interviews and documentation.',
    bufferTime: 1, // default when not manually entered
    startDate: createDate(1),
    targetCompletionDate: createEndDate(1, 6), // Jan 1 + 6 = Jan 7
    status: 'done',
    projectId: 'project-1',
  },
  {
    id: 'task-2',
    name: 'Task 2',
    duration: 5,
    description: 'Design and architecture phase. Create technical specifications and system design documents.',
    bufferTime: 1,
    startDate: createDate(7),
    targetCompletionDate: createEndDate(7, 5), // Jan 7 + 5 = Jan 12
    status: 'in-progress',
    projectId: 'project-1',
  },
  {
    id: 'task-3',
    name: 'Task 3',
    duration: 5,
    description: 'Backend API development phase.',
    bufferTime: 1,
    startDate: createDate(7),
    targetCompletionDate: createEndDate(7, 5), // Jan 7 + 5 = Jan 12
    status: 'in-progress',
    projectId: 'project-1',
  },
  {
    id: 'task-4',
    name: 'Task 4',
    duration: 6,
    description: 'Integration and testing phase.',
    bufferTime: 1,
    startDate: createDate(16),
    targetCompletionDate: createEndDate(16, 6), // Jan 16 + 6 = Jan 22
    status: 'not-started',
    projectId: 'project-1',
  },
  {
    id: 'task-5',
    name: 'Task 5',
    duration: 4,
    description: 'Documentation and handoff phase.',
    bufferTime: 1,
    startDate: createDate(12),
    targetCompletionDate: createEndDate(12, 4), // Jan 12 + 4 = Jan 16
    status: 'not-started',
    projectId: 'project-1',
  },
  {
    id: 'task-6',
    name: 'Task 6',
    duration: 6,
    description: 'Final deployment and launch.',
    bufferTime: 1,
    startDate: createDate(22),
    targetCompletionDate: createEndDate(22, 6), // Jan 22 + 6 = Jan 28
    status: 'not-started',
    projectId: 'project-1',
  },
  // Project 2 tasks
  {
    id: 'task-7',
    name: 'Market Research',
    duration: 5,
    description: 'Conduct market analysis and competitor research for the campaign.',
    bufferTime: 1,
    startDate: createDate(6),
    targetCompletionDate: createEndDate(6, 5), // Jan 6 + 5 = Jan 11
    status: 'done',
    projectId: 'project-2',
  },
  {
    id: 'task-8',
    name: 'Content Creation',
    duration: 10,
    description: 'Create marketing materials, blog posts, and social media content.',
    bufferTime: 1,
    startDate: createDate(11),
    targetCompletionDate: createEndDate(11, 10), // Jan 11 + 10 = Jan 21
    status: 'in-progress',
    projectId: 'project-2',
  },
  {
    id: 'task-9',
    name: 'Campaign Launch',
    duration: 3,
    description: 'Execute the marketing campaign across all channels.',
    bufferTime: 1,
    startDate: createDate(21),
    targetCompletionDate: createEndDate(21, 3), // Jan 21 + 3 = Jan 24
    status: 'not-started',
    projectId: 'project-2',
  },
  {
    id: 'task-10',
    name: 'Analytics Review',
    duration: 4,
    description: 'Monitor campaign performance and create analytics report.',
    bufferTime: 1,
    startDate: createDate(24),
    targetCompletionDate: createEndDate(24, 4), // Jan 24 + 4 = Jan 28
    status: 'not-started',
    projectId: 'project-2',
  },
  // Project 3 tasks
  {
    id: 'task-11',
    name: 'Design Mockups',
    duration: 7,
    description: 'Create wireframes and high-fidelity mockups for all pages.',
    bufferTime: 1,
    startDate: createDate(5),
    targetCompletionDate: createEndDate(5, 7), // Jan 5 + 7 = Jan 12
    status: 'done',
    projectId: 'project-3',
  },
  {
    id: 'task-12',
    name: 'Frontend Development',
    duration: 14,
    description: 'Build responsive frontend with React and Tailwind CSS.',
    bufferTime: 1,
    startDate: createDate(12),
    targetCompletionDate: createEndDate(12, 14), // Jan 12 + 14 = Jan 26
    status: 'in-progress',
    projectId: 'project-3',
  },
  {
    id: 'task-13',
    name: 'Backend Integration',
    duration: 7,
    description: 'Connect frontend to backend APIs and database.',
    bufferTime: 1,
    startDate: createDate(26),
    targetCompletionDate: createEndDate(26, 7), // Jan 26 + 7 = Feb 2
    status: 'not-started',
    projectId: 'project-3',
  },
  {
    id: 'task-14',
    name: 'Testing & QA',
    duration: 5,
    description: 'Comprehensive testing including unit, integration, and E2E tests.',
    bufferTime: 1,
    startDate: createDate(33), // Feb 2
    targetCompletionDate: createEndDate(33, 5), // Feb 2 + 5 = Feb 7
    status: 'not-started',
    projectId: 'project-3',
  },
  {
    id: 'task-15',
    name: 'Deployment',
    duration: 2,
    description: 'Deploy to production environment and configure monitoring.',
    bufferTime: 1,
    startDate: createDate(38), // Feb 7
    targetCompletionDate: createEndDate(38, 2), // Feb 7 + 2 = Feb 9
    status: 'not-started',
    projectId: 'project-3',
  },
];

export const dependencies: TaskDependency[] = [
  // Project 1 dependencies - branching structure like the Figma design
  // Task 1 branches into Task 2 (upper) and Task 3 (middle)
  { taskId: 'task-2', dependsOnTaskId: 'task-1' },
  { taskId: 'task-3', dependsOnTaskId: 'task-1' },
  // Task 2 leads to Task 4 (upper path continues)
  { taskId: 'task-4', dependsOnTaskId: 'task-2' },
  // Task 3 leads to Task 5 (middle path)
  { taskId: 'task-5', dependsOnTaskId: 'task-3' },
  // Task 5 leads to Task 4 (paths converge)
  { taskId: 'task-4', dependsOnTaskId: 'task-5' },
  // Task 4 leads to final Task 6
  { taskId: 'task-6', dependsOnTaskId: 'task-4' },

  // Project 2 dependencies
  { taskId: 'task-8', dependsOnTaskId: 'task-7' },
  { taskId: 'task-9', dependsOnTaskId: 'task-8' },
  { taskId: 'task-10', dependsOnTaskId: 'task-9' },

  // Project 3 dependencies
  { taskId: 'task-12', dependsOnTaskId: 'task-11' },
  { taskId: 'task-13', dependsOnTaskId: 'task-12' },
  { taskId: 'task-14', dependsOnTaskId: 'task-13' },
  { taskId: 'task-15', dependsOnTaskId: 'task-14' },
];
