/**
 * Project Store - Main State Management
 * Handles tasks, dependencies, and graph operations
 */

import { create } from 'zustand';
import { Task, Dependency, Project, ValidationError } from '@/types';

interface ProjectState {
  // Current project data
  currentProject: Project | null;
  tasks: Task[];
  dependencies: Dependency[];

  // Validation state
  validationErrors: ValidationError[];
  validationWarnings: ValidationError[];

  // Actions - Tasks
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;

  // Actions - Dependencies
  addDependency: (dependency: Dependency) => void;
  removeDependency: (dependencyId: string) => void;

  // Actions - Project
  setCurrentProject: (project: Project) => void;
  clearProject: () => void;

  // Actions - Validation
  setValidationErrors: (errors: ValidationError[], warnings: ValidationError[]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  // Initial state
  currentProject: null,
  tasks: [],
  dependencies: [],
  validationErrors: [],
  validationWarnings: [],

  // Task actions
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      // Remove associated dependencies
      dependencies: state.dependencies.filter(
        (dep) => dep.sourceTaskId !== taskId && dep.targetTaskId !== taskId
      ),
    })),

  // Dependency actions
  addDependency: (dependency) =>
    set((state) => ({
      dependencies: [...state.dependencies, dependency],
    })),

  removeDependency: (dependencyId) =>
    set((state) => ({
      dependencies: state.dependencies.filter((dep) => dep.id !== dependencyId),
    })),

  // Project actions
  setCurrentProject: (project) =>
    set({
      currentProject: project,
      tasks: project.tasks,
      dependencies: project.dependencies,
    }),

  clearProject: () =>
    set({
      currentProject: null,
      tasks: [],
      dependencies: [],
      validationErrors: [],
      validationWarnings: [],
    }),

  // Validation actions
  setValidationErrors: (errors, warnings) =>
    set({
      validationErrors: errors,
      validationWarnings: warnings,
    }),
}));
