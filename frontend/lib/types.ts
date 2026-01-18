export interface Task {
  id: string;
  name: string;
  duration: number; // in days
  description: string;
  bufferTime: number; // in days
  startDate: Date;
  targetCompletionDate: Date;
  status: 'not-started' | 'in-progress' | 'done';
  projectId: string;
}

export interface TaskDependency {
  taskId: string;
  dependsOnTaskId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export type TaskStatus = Task['status'];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  'done': 'Done',
};

export const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string; dot: string }> = {
  'not-started': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  'done': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};
