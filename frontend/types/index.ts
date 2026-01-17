/**
 * Core Type Definitions for Intelligent Critical Path System
 * Based on PRD v3.2
 */

// ============================================================================
// Task & Subtask Types
// ============================================================================

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;

  // Timeline properties
  startDate: Date;
  duration: number; // in days

  // Progress tracking
  progress: number; // 0-100
  subtasks: Subtask[];

  // Metadata
  assignee?: string;
  tags?: string[];

  // Calculated fields
  endDate?: Date; // computed from startDate + duration

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Dependency & Graph Types
// ============================================================================

export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish';

export interface Dependency {
  id: string;
  sourceTaskId: string; // predecessor
  targetTaskId: string; // successor
  type: DependencyType;
  lag?: number; // days of delay/overlap
}

export interface Graph {
  nodes: Task[];
  edges: Dependency[];
}

// ============================================================================
// Project & Scenario Types
// ============================================================================

export type ProjectType = 'live' | 'scenario';

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;

  // For scenarios: link to parent
  parentProjectId?: string;

  // Graph data
  tasks: Task[];
  dependencies: Dependency[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

// ============================================================================
// Critical Path & Analysis Types
// ============================================================================

export interface CriticalPathResult {
  path: string[]; // Task IDs in order
  totalDuration: number;
  projectEndDate: Date;
}

export interface TaskAnalysis {
  taskId: string;
  isCritical: boolean;
  slack: number; // days of buffer
  earlyStart: Date;
  earlyFinish: Date;
  lateStart: Date;
  lateFinish: Date;
}

// ============================================================================
// Validation & Error Types
// ============================================================================

export type ValidationErrorType =
  | 'circular_dependency'
  | 'orphan_task'
  | 'dead_end_task'
  | 'constraint_conflict'
  | 'weekend_warning';

export interface ValidationError {
  type: ValidationErrorType;
  taskIds: string[];
  message: string;
  suggestedFix?: string;
}

export interface GraphValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================================================
// UI State Types
// ============================================================================

export type ViewMode = 'timeline' | 'kanban';

export interface UIState {
  currentView: ViewMode;
  selectedTaskId?: string;
  selectedProjectId?: string;
  isDragging: boolean;
  showScenarioOverlay: boolean;
}

// ============================================================================
// AI/RAG Types
// ============================================================================

export interface TemplateMatch {
  id: string;
  name: string;
  description: string;
  similarity: number; // 0-1
  tasks: Partial<Task>[];
}

export interface AIGenerationRequest {
  prompt: string;
  projectContext?: string;
}

export interface AIGenerationResponse {
  tasks: Partial<Task>[];
  dependencies: Partial<Dependency>[];
  confidence: number;
}
