import { create } from 'zustand';
import { Project, Task, TaskDependency, TaskStatus } from './types';
import { projects as initialProjects, tasks as initialTasks, dependencies as initialDependencies } from './mockData';

interface ProjectStore {
  projects: Project[];
  tasks: Task[];
  dependencies: TaskDependency[];

  // Getters
  getProject: (id: string) => Project | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTask: (id: string) => Task | undefined;
  getTaskDependencies: (taskId: string) => TaskDependency[];
  getDependentTask: (taskId: string) => Task | undefined;

  // Actions
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskDates: (taskId: string, startDate: Date, targetCompletionDate: Date) => void;
  createDependency: (taskId: string, dependsOnTaskId: string) => void;
  removeDependency: (taskId: string, dependsOnTaskId: string) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: initialProjects,
  tasks: initialTasks,
  dependencies: initialDependencies,

  getProject: (id: string) => {
    return get().projects.find(p => p.id === id);
  },

  getTasksByProject: (projectId: string) => {
    return get().tasks.filter(t => t.projectId === projectId);
  },

  getTask: (id: string) => {
    return get().tasks.find(t => t.id === id);
  },

  getTaskDependencies: (taskId: string) => {
    return get().dependencies.filter(d => d.taskId === taskId);
  },

  getDependentTask: (taskId: string) => {
    const dependency = get().dependencies.find(d => d.taskId === taskId);
    if (!dependency) return undefined;
    return get().tasks.find(t => t.id === dependency.dependsOnTaskId);
  },

  updateTaskStatus: (taskId: string, status: TaskStatus) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, status } : task
      ),
    }));
  },

  updateTaskDates: (taskId: string, startDate: Date, targetCompletionDate: Date) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, startDate, targetCompletionDate } : task
      ),
    }));
  },

  createDependency: (taskId: string, dependsOnTaskId: string) => {
    const existing = get().dependencies.find(
      d => d.taskId === taskId && d.dependsOnTaskId === dependsOnTaskId
    );
    if (existing) return;

    set(state => ({
      dependencies: [...state.dependencies, { taskId, dependsOnTaskId }],
    }));
  },

  removeDependency: (taskId: string, dependsOnTaskId: string) => {
    set(state => ({
      dependencies: state.dependencies.filter(
        d => !(d.taskId === taskId && d.dependsOnTaskId === dependsOnTaskId)
      ),
    }));
  },
}));
