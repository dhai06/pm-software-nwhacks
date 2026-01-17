/**
 * UI Store - View State Management
 * Handles view mode, selection, and UI interactions
 */

import { create } from 'zustand';
import { ViewMode } from '@/types';

interface UIState {
  // View state
  currentView: ViewMode;
  selectedTaskId: string | null;
  selectedProjectId: string | null;

  // Interaction state
  isDragging: boolean;
  showScenarioOverlay: boolean;

  // Actions
  setCurrentView: (view: ViewMode) => void;
  setSelectedTask: (taskId: string | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  toggleScenarioOverlay: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  currentView: 'timeline',
  selectedTaskId: null,
  selectedProjectId: null,
  isDragging: false,
  showScenarioOverlay: false,

  // Actions
  setCurrentView: (view) => set({ currentView: view }),

  setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),

  setSelectedProject: (projectId) => set({ selectedProjectId: projectId }),

  setIsDragging: (isDragging) => set({ isDragging }),

  toggleScenarioOverlay: () =>
    set((state) => ({ showScenarioOverlay: !state.showScenarioOverlay })),
}));
