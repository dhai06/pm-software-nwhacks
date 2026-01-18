import { create } from 'zustand';
import { Project, Task, TaskDependency, TaskStatus } from './types';
import { projects as initialProjects, tasks as initialTasks, dependencies as initialDependencies } from './mockData';

// Helper to generate unique IDs
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Type for partial task updates
type TaskUpdate = Partial<Omit<Task, 'id' | 'projectId'>>;

// Type for partial project updates
type ProjectUpdate = Partial<Omit<Project, 'id'>>;

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

  // Project Actions
  createProject: (name: string, description?: string) => string;
  updateProject: (projectId: string, updates: ProjectUpdate) => void;
  deleteProject: (projectId: string) => void;

  // Task Actions
  createTask: (projectId: string, taskData: Partial<Omit<Task, 'id' | 'projectId'>>) => string;
  updateTask: (taskId: string, updates: TaskUpdate) => void;
  deleteTask: (taskId: string) => void;

  // Legacy Actions (keeping for compatibility)
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

  // Project CRUD Actions
  createProject: (name: string, description: string = '') => {
    const id = generateId('project');
    const newProject: Project = {
      id,
      name,
      description,
    };
    set(state => ({
      projects: [...state.projects, newProject],
    }));
    return id;
  },

  updateProject: (projectId: string, updates: ProjectUpdate) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId ? { ...project, ...updates } : project
      ),
    }));
  },

  deleteProject: (projectId: string) => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== projectId),
      // Also delete all tasks belonging to this project
      tasks: state.tasks.filter(t => t.projectId !== projectId),
      // And their dependencies
      dependencies: state.dependencies.filter(d => {
        const taskIds = state.tasks
          .filter(t => t.projectId === projectId)
          .map(t => t.id);
        return !taskIds.includes(d.taskId) && !taskIds.includes(d.dependsOnTaskId);
      }),
    }));
  },

  // Task CRUD Actions
  createTask: (projectId: string, taskData: Partial<Omit<Task, 'id' | 'projectId'>>) => {
    const id = generateId('task');
    const today = new Date();
    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);

    const newTask: Task = {
      id,
      projectId,
      name: taskData.name || 'New Task',
      description: taskData.description || '',
      duration: taskData.duration || 7,
      bufferTime: taskData.bufferTime || 0,
      startDate: taskData.startDate || today,
      targetCompletionDate: taskData.targetCompletionDate || defaultEndDate,
      status: taskData.status || 'not-started',
    };
    set(state => ({
      tasks: [...state.tasks, newTask],
    }));
    return id;
  },

  updateTask: (taskId: string, updates: TaskUpdate) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  },

  deleteTask: (taskId: string) => {
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== taskId),
      // Also remove any dependencies involving this task
      dependencies: state.dependencies.filter(
        d => d.taskId !== taskId && d.dependsOnTaskId !== taskId
      ),
    }));
  },

  // Legacy Actions (keeping for backward compatibility)
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
