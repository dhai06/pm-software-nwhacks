import { Task, TaskDependency, TaskStatus } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Backend status values use underscores
type BackendTaskStatus = 'not_started' | 'in_progress' | 'done';

// Backend task format (snake_case)
interface BackendTask {
  id: string;
  name: string;
  duration: number;
  description: string | null;
  status: BackendTaskStatus;
  buffer_time: number;
  start_date: string | null;
  target_completion_date: string | null;
  created_at?: string;
  updated_at?: string;
}

// Backend dependency format
interface BackendDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  created_at?: string;
}

// Convert frontend status to backend status
function toBackendStatus(status: TaskStatus): BackendTaskStatus {
  const map: Record<TaskStatus, BackendTaskStatus> = {
    'not-started': 'not_started',
    'in-progress': 'in_progress',
    'done': 'done',
  };
  return map[status];
}

// Convert backend status to frontend status
function toFrontendStatus(status: BackendTaskStatus): TaskStatus {
  const map: Record<BackendTaskStatus, TaskStatus> = {
    'not_started': 'not-started',
    'in_progress': 'in-progress',
    'done': 'done',
  };
  return map[status];
}

// Parse date string as local date (not UTC)
function parseLocalDate(dateStr: string): Date {
  // Date strings like "2026-01-15" should be treated as local dates
  // Adding T00:00:00 without Z makes it local time
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Transform backend task to frontend task
function transformTaskFromBackend(backendTask: BackendTask): Task {
  return {
    id: backendTask.id,
    name: backendTask.name,
    duration: backendTask.duration,
    description: backendTask.description || '',
    status: toFrontendStatus(backendTask.status),
    bufferTime: backendTask.buffer_time,
    startDate: backendTask.start_date ? parseLocalDate(backendTask.start_date) : new Date(),
    targetCompletionDate: backendTask.target_completion_date
      ? parseLocalDate(backendTask.target_completion_date)
      : new Date(),
    createdAt: backendTask.created_at ? new Date(backendTask.created_at) : undefined,
    updatedAt: backendTask.updated_at ? new Date(backendTask.updated_at) : undefined,
  };
}

// Format date as local date string (YYYY-MM-DD) without UTC conversion
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Transform frontend task data to backend format for creation/update
function transformTaskToBackend(task: Partial<Task>): Partial<BackendTask> {
  const result: Record<string, unknown> = {};

  if (task.name !== undefined) result.name = task.name;
  if (task.duration !== undefined) result.duration = task.duration;
  if (task.description !== undefined) result.description = task.description;
  if (task.status !== undefined) result.status = toBackendStatus(task.status);
  if (task.bufferTime !== undefined) result.buffer_time = task.bufferTime;
  if (task.startDate !== undefined) {
    result.start_date = task.startDate instanceof Date
      ? formatLocalDate(task.startDate)
      : task.startDate;
  }
  if (task.targetCompletionDate !== undefined) {
    result.target_completion_date = task.targetCompletionDate instanceof Date
      ? formatLocalDate(task.targetCompletionDate)
      : task.targetCompletionDate;
  }

  return result as Partial<BackendTask>;
}

// Transform backend dependency to frontend dependency
function transformDependencyFromBackend(backendDep: BackendDependency): TaskDependency {
  return {
    id: backendDep.id,
    taskId: backendDep.task_id,
    dependsOnTaskId: backendDep.depends_on_task_id,
    createdAt: backendDep.created_at ? new Date(backendDep.created_at) : undefined,
  };
}

// API Functions

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }
  const data: BackendTask[] = await response.json();
  return data.map(transformTaskFromBackend);
}

export async function fetchTask(taskId: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch task: ${response.statusText}`);
  }
  const data: BackendTask = await response.json();
  return transformTaskFromBackend(data);
}

export async function createTaskApi(taskData: Partial<Omit<Task, 'id'>>): Promise<Task> {
  const backendData = transformTaskToBackend(taskData);
  const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.statusText}`);
  }
  const data: BackendTask = await response.json();
  return transformTaskFromBackend(data);
}

export async function updateTaskApi(taskId: string, updates: Partial<Task>): Promise<Task> {
  const backendData = transformTaskToBackend(updates);
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.statusText}`);
  }
  const data: BackendTask = await response.json();
  return transformTaskFromBackend(data);
}

export async function deleteTaskApi(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.statusText}`);
  }
}

export async function fetchDependencies(): Promise<TaskDependency[]> {
  const response = await fetch(`${API_BASE_URL}/api/dependencies/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dependencies: ${response.statusText}`);
  }
  const data: BackendDependency[] = await response.json();
  return data.map(transformDependencyFromBackend);
}

export async function createDependencyApi(taskId: string, dependsOnTaskId: string): Promise<TaskDependency> {
  const response = await fetch(`${API_BASE_URL}/api/dependencies/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_id: taskId,
      depends_on_task_id: dependsOnTaskId,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create dependency: ${response.statusText}`);
  }
  const data: BackendDependency = await response.json();
  return transformDependencyFromBackend(data);
}

export async function deleteDependencyApi(dependencyId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/dependencies/${dependencyId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete dependency: ${response.statusText}`);
  }
}
