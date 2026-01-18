import { create } from 'zustand';
import { Task, TaskDependency, TaskStatus } from './types';
import {
  fetchTasks,
  fetchDependencies,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  createDependencyApi,
  deleteDependencyApi,
  fetchCPM,
} from './api';

// Type for partial task updates
type TaskUpdate = Partial<Omit<Task, 'id'>>;

interface TaskStore {
  tasks: Task[];
  dependencies: TaskDependency[];
  isLoading: boolean;
  isSchedulingCPM: boolean;
  error: string | null;

  // Data fetching
  fetchAllData: () => Promise<void>;

  // Getters
  getTask: (id: string) => Task | undefined;
  getTaskDependencies: (taskId: string) => TaskDependency[];
  getDependentTask: (taskId: string) => Task | undefined;

  // Task Actions
  createTask: (taskData: Partial<Omit<Task, 'id'>>) => Promise<string>;
  updateTask: (taskId: string, updates: TaskUpdate) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // CPM Actions
  autoScheduleTasks: () => Promise<void>;

  // Legacy Actions (keeping for compatibility with existing components)
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTaskDates: (taskId: string, startDate: Date, targetCompletionDate: Date) => Promise<void>;
  createDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  removeDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
}

export const useProjectStore = create<TaskStore>((set, get) => ({
  tasks: [],
  dependencies: [],
  isLoading: false,
  isSchedulingCPM: false,
  error: null,

  fetchAllData: async () => {
    console.log('[Store] fetchAllData started');
    set({ isLoading: true, error: null });
    try {
      console.log('[Store] Fetching tasks and dependencies...');
      const [tasks, dependencies] = await Promise.all([
        fetchTasks(),
        fetchDependencies(),
      ]);
      console.log('[Store] Fetched successfully:', { tasksCount: tasks.length, depsCount: dependencies.length });
      set({ tasks, dependencies, isLoading: false });
      console.log('[Store] State updated, isLoading: false');
    } catch (error) {
      console.error('[Store] Error fetching data:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
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

  createTask: async (taskData: Partial<Omit<Task, 'id'>>) => {
    const today = new Date();
    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);

    // Calculate default orderIndex as the end of the list
    const currentTasks = get().tasks;
    const maxOrderIndex = currentTasks.reduce((max, task) => {
      const idx = task.orderIndex ?? -1;
      return idx > max ? idx : max;
    }, -1);

    const newTaskData = {
      name: taskData.name || 'New Task',
      description: taskData.description || '',
      duration: taskData.duration || 7,
      bufferTime: taskData.bufferTime || 0,
      startDate: taskData.startDate || today,
      targetCompletionDate: taskData.targetCompletionDate || defaultEndDate,
      status: taskData.status || 'not-started' as const,
      orderIndex: taskData.orderIndex ?? maxOrderIndex + 1,
    };

    try {
      const createdTask = await createTaskApi(newTaskData);
      set(state => ({
        tasks: [...state.tasks, createdTask],
      }));
      return createdTask.id;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateTask: async (taskId: string, updates: TaskUpdate) => {
    try {
      const updatedTask = await updateTaskApi(taskId, updates);
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? updatedTask : task
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      await deleteTaskApi(taskId);
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        dependencies: state.dependencies.filter(
          d => d.taskId !== taskId && d.dependsOnTaskId !== taskId
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  autoScheduleTasks: async () => {
    const { tasks } = get();
    if (tasks.length === 0) return;

    set({ isSchedulingCPM: true, error: null });

    try {
      const cpmResult = await fetchCPM();

      // Calculate project start date: earliest startDate among tasks, or today
      let projectStartDate = new Date();
      for (const task of tasks) {
        if (task.startDate && task.startDate < projectStartDate) {
          projectStartDate = task.startDate;
        }
      }

      // Create a set of critical path task IDs for quick lookup
      const criticalPathSet = new Set(cpmResult.critical_path);

      // Update tasks with new dates based on CPM results
      const updatedTasks = tasks.map(task => {
        const es = cpmResult.ES[task.id];
        const ef = cpmResult.EF[task.id];

        if (es === undefined || ef === undefined) {
          // Task not in CPM result, keep original dates
          return { ...task, isOnCriticalPath: false };
        }

        // Calculate new dates by adding ES/EF days to project start date
        const newStartDate = new Date(projectStartDate);
        newStartDate.setDate(newStartDate.getDate() + es);

        const newEndDate = new Date(projectStartDate);
        newEndDate.setDate(newEndDate.getDate() + ef);

        return {
          ...task,
          startDate: newStartDate,
          targetCompletionDate: newEndDate,
          isOnCriticalPath: criticalPathSet.has(task.id),
        };
      });

      // Optimistically update local state
      set({ tasks: updatedTasks, isSchedulingCPM: false });

      // Persist changes to backend
      for (const task of updatedTasks) {
        const originalTask = tasks.find(t => t.id === task.id);
        if (
          originalTask &&
          (originalTask.startDate.getTime() !== task.startDate.getTime() ||
            originalTask.targetCompletionDate.getTime() !== task.targetCompletionDate.getTime())
        ) {
          await updateTaskApi(task.id, {
            startDate: task.startDate,
            targetCompletionDate: task.targetCompletionDate,
          });
        }
      }
    } catch (error) {
      set({ error: (error as Error).message, isSchedulingCPM: false });
      throw error;
    }
  },

  updateTaskStatus: async (taskId: string, status: TaskStatus) => {
    await get().updateTask(taskId, { status });
  },

  updateTaskDates: async (taskId: string, startDate: Date, targetCompletionDate: Date) => {
    await get().updateTask(taskId, { startDate, targetCompletionDate });
  },

  createDependency: async (taskId: string, dependsOnTaskId: string) => {
    const existing = get().dependencies.find(
      d => d.taskId === taskId && d.dependsOnTaskId === dependsOnTaskId
    );
    if (existing) return;

    try {
      const createdDep = await createDependencyApi(taskId, dependsOnTaskId);
      set(state => ({
        dependencies: [...state.dependencies, createdDep],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  removeDependency: async (taskId: string, dependsOnTaskId: string) => {
    const dependency = get().dependencies.find(
      d => d.taskId === taskId && d.dependsOnTaskId === dependsOnTaskId
    );
    if (!dependency || !dependency.id) return;

    try {
      await deleteDependencyApi(dependency.id);
      set(state => ({
        dependencies: state.dependencies.filter(
          d => !(d.taskId === taskId && d.dependsOnTaskId === dependsOnTaskId)
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));
