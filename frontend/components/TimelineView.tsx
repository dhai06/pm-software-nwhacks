'use client';

import { useMemo, useCallback, useRef, useState, useEffect, memo } from 'react';
import {
  ReactFlow,
  Background,
  Node,
  Edge,
  Position,
  MarkerType,
  NodeMouseHandler,
  Handle,
  NodeDragHandler,
  ReactFlowProvider,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  format,
  addDays,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Task, TaskDependency, STATUS_COLORS } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/store';

interface TimelineViewProps {
  tasks: Task[];
  dependencies: TaskDependency[];
}

// View mode types for timeline zoom levels
type ViewMode = 'day' | 'week' | 'month';

// Column gap constant (needed before VIEW_MODE_CONFIG)
const COLUMN_GAP = 4;

// Configuration for each view mode with visual scale
interface ViewModeConfig {
  label: string;
  columnWidth: number; // Width of each column in pixels
  pixelsPerDay: number; // Effective pixels per day for positioning
  scrollDays: number; // Days to scroll per navigation click
  headerFormat: (date: Date) => string; // How to format the header label
  getColumnDate: (date: Date) => Date; // Get the start date for a column
  getNextColumn: (date: Date) => Date; // Get the next column's start date
  bufferColumns: number; // Extra columns to render outside viewport
}

const VIEW_MODE_CONFIG: Record<ViewMode, ViewModeConfig> = {
  day: {
    label: 'Day',
    columnWidth: 80,
    pixelsPerDay: 80 + COLUMN_GAP, // Include gap for accurate positioning
    scrollDays: 1,
    headerFormat: (date: Date) => format(date, 'd'),
    getColumnDate: (date: Date) => date,
    getNextColumn: (date: Date) => addDays(date, 1),
    bufferColumns: 5,
  },
  week: {
    label: 'Week',
    columnWidth: 200,
    pixelsPerDay: (200 + COLUMN_GAP) / 7, // Include gap for accurate positioning
    scrollDays: 7,
    headerFormat: (date: Date) => {
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return `${format(date, 'MMM d')} - ${format(weekEnd, 'd')}`;
    },
    getColumnDate: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
    getNextColumn: (date: Date) => addDays(startOfWeek(date, { weekStartsOn: 1 }), 7),
    bufferColumns: 3,
  },
  month: {
    label: 'Month',
    columnWidth: 300,
    pixelsPerDay: (300 + COLUMN_GAP) / 30, // Include gap for accurate positioning
    scrollDays: 30,
    headerFormat: (date: Date) => format(date, 'MMMM yyyy'),
    getColumnDate: (date: Date) => startOfMonth(date),
    getNextColumn: (date: Date) => startOfMonth(addDays(endOfMonth(date), 1)),
    bufferColumns: 2,
  },
};

// Constants for timeline layout
const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 80;
const LEFT_MARGIN = 20;

// Helper function: Get pixel X position for a date based on view mode
function getDatePosition(date: Date, startDate: Date, viewMode: ViewMode): number {
  const config = VIEW_MODE_CONFIG[viewMode];
  const daysDiff = differenceInDays(date, startDate);
  return LEFT_MARGIN + daysDiff * config.pixelsPerDay;
}

// Helper function: Get task width in pixels based on duration and view mode
function getTaskWidth(startDate: Date, endDate: Date, viewMode: ViewMode): number {
  const config = VIEW_MODE_CONFIG[viewMode];
  const durationDays = differenceInDays(endDate, startDate);
  return Math.max(durationDays * config.pixelsPerDay, 60); // Minimum 60px width
}

// Custom task node component with status indicator and resize handles
const TaskNode = memo(function TaskNode({ data }: {
  data: {
    task: Task;
    width: number;
    isInvalid?: boolean;
    onResizeStart?: (taskId: string, edge: 'left' | 'right', e: React.MouseEvent) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  };
}) {
  const statusColor = STATUS_COLORS[data.task.status];

  const baseClasses = data.isInvalid
    ? 'bg-red-100 border-2 border-red-400'
    : 'bg-stone-100 border border-stone-200';

  const handleLeftEdgeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    data.onResizeStart?.(data.task.id, 'left', e);
  }, [data.onResizeStart, data.task.id]);

  const handleRightEdgeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    data.onResizeStart?.(data.task.id, 'right', e);
  }, [data.onResizeStart, data.task.id]);

  return (
    <div
      className={`${baseClasses} rounded-lg shadow-sm hover:shadow-md active:shadow-2xl active:scale-105 active:z-50 cursor-grab active:cursor-grabbing flex items-center relative group`}
      style={{ width: data.width, minWidth: 60, height: 36 }}
      onMouseEnter={data.onMouseEnter}
      onMouseLeave={data.onMouseLeave}
    >
      {data.isInvalid && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Dependency Violation
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600" />
        </div>
      )}

      <Handle type="target" position={Position.Left} className="opacity-0" />

      <div
        className="nodrag absolute left-0 top-0 bottom-0 w-[10px] cursor-ew-resize hover:bg-blue-400/30 rounded-l-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleLeftEdgeMouseDown}
      />

      <div className="flex items-center gap-2 px-4 py-2 flex-1 min-w-0">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor.dot}`}
          title={data.task.status}
        />
        <span className="text-sm font-medium text-stone-800 whitespace-nowrap overflow-hidden text-ellipsis">
          {data.task.name}
        </span>
      </div>

      <div
        className="nodrag absolute right-0 top-0 bottom-0 w-[10px] cursor-ew-resize hover:bg-blue-400/30 rounded-r-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleRightEdgeMouseDown}
      />

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
});

const nodeTypes = {
  taskNode: TaskNode,
};

const EDGE_COLOR = '#3B82F6';

// Helper function to check if a task violates dependency constraints
function isTaskInvalid(
  task: Task,
  allTasks: Task[],
  allDependencies: TaskDependency[]
): boolean {
  const prerequisites = allDependencies.filter(dep => dep.taskId === task.id);

  for (const dep of prerequisites) {
    const prerequisiteTask = allTasks.find(t => t.id === dep.dependsOnTaskId);
    if (prerequisiteTask && task.startDate < prerequisiteTask.targetCompletionDate) {
      return true;
    }
  }
  return false;
}

// Column type for virtualized rendering
interface VirtualColumn {
  date: Date;
  x: number;
  width: number;
  label: string;
  isToday: boolean;
  isWeekend: boolean;
}

// Hook for virtualization - calculates which columns to render
function useVirtualization(
  scrollLeft: number,
  containerWidth: number,
  startDate: Date,
  endDate: Date,
  viewMode: ViewMode,
  today: Date
) {
  const config = VIEW_MODE_CONFIG[viewMode];

  return useMemo(() => {
    const columns: VirtualColumn[] = [];

    // Calculate visible range with buffer
    const visibleStartX = scrollLeft - config.bufferColumns * config.columnWidth;
    const visibleEndX = scrollLeft + containerWidth + config.bufferColumns * config.columnWidth;

    // Generate columns based on view mode
    let currentDate = config.getColumnDate(startDate);
    let x = LEFT_MARGIN;

    while (currentDate <= endDate) {
      const columnEndX = x + config.columnWidth;

      // Only include columns that are in the visible range
      if (columnEndX >= visibleStartX && x <= visibleEndX) {
        const isToday = viewMode === 'day'
          ? differenceInDays(currentDate, today) === 0
          : currentDate <= today && config.getNextColumn(currentDate) > today;

        const isWeekend = viewMode === 'day'
          ? (currentDate.getDay() === 0 || currentDate.getDay() === 6)
          : false;

        columns.push({
          date: currentDate,
          x,
          width: config.columnWidth,
          label: config.headerFormat(currentDate),
          isToday,
          isWeekend,
        });
      }

      x += config.columnWidth + COLUMN_GAP;
      currentDate = config.getNextColumn(currentDate);
    }

    // Calculate total width
    let totalColumnCount = 0;
    let countDate = config.getColumnDate(startDate);
    while (countDate <= endDate) {
      totalColumnCount++;
      countDate = config.getNextColumn(countDate);
    }
    const totalWidth = LEFT_MARGIN + totalColumnCount * (config.columnWidth + COLUMN_GAP);

    return { columns, totalWidth };
  }, [scrollLeft, containerWidth, startDate, endDate, viewMode, today, config]);
}

function TimelineViewInner({ tasks, dependencies }: TimelineViewProps) {
  const router = useRouter();
  const updateTask = useProjectStore(state => state.updateTask);

  // Refs for drag-to-scroll and initial centering
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingScrollRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasCenteredRef = useRef(false);

  // Refs for node dragging
  const isDraggingNodeRef = useRef(false);
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const draggedTaskRef = useRef<Task | null>(null);
  const draggingNodeIdRef = useRef<string | null>(null);

  // Refs for edge resizing
  const isResizingRef = useRef(false);
  const resizeEdgeRef = useRef<'left' | 'right' | null>(null);
  const resizeStartXRef = useRef(0);
  const resizeTaskRef = useRef<Task | null>(null);
  const justFinishedResizingRef = useRef(false);

  // State for UI
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [visibleDate, setVisibleDate] = useState<Date | null>(null);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isDraggingScroll, setIsDraggingScroll] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isViewModeDropdownOpen, setIsViewModeDropdownOpen] = useState(false);

  // State for edge resizing
  const [isEdgeResizing, setIsEdgeResizing] = useState(false);

  // State for resize preview
  const [resizePreview, setResizePreview] = useState<{
    taskId: string;
    edge: 'left' | 'right';
    deltaX: number;
  } | null>(null);

  // Frozen nodes snapshot
  const frozenNodesRef = useRef<Node[] | null>(null);

  // Use ReactFlow's useNodesState
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const nodesRef = useRef<Node[]>([]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Get date range for the timeline
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(2025, 0, 1);
    const end = new Date(2027, 11, 31);
    return { startDate: start, endDate: end };
  }, []);

  // Memoize today to prevent re-renders from triggering scroll reset
  const today = useMemo(() => new Date(2026, 0, 18), []); // Current date: January 18, 2026

  // Get current view mode config
  const viewConfig = VIEW_MODE_CONFIG[viewMode];

  // Virtualization - only render visible columns
  const { columns: virtualizedColumns, totalWidth } = useVirtualization(
    scrollLeft,
    containerWidth,
    startDate,
    endDate,
    viewMode,
    today
  );

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Initialize visibleDate and center on "today" after mount
  useEffect(() => {
    if (scrollContainerRef.current && !hasCenteredRef.current) {
      const todayPosition = getDatePosition(today, startDate, viewMode);
      const containerWidth = scrollContainerRef.current.clientWidth;
      const centeredScrollLeft = todayPosition - containerWidth / 2;

      scrollContainerRef.current.scrollLeft = Math.max(0, centeredScrollLeft);
      hasCenteredRef.current = true;

      setScrollLeft(Math.max(0, centeredScrollLeft));
      setVisibleDate(today);
    } else if (visibleDate === null) {
      setVisibleDate(startDate);
    }
  }, [startDate, visibleDate, viewMode, today]);

  // Re-center on today when view mode changes
  useEffect(() => {
    if (scrollContainerRef.current && hasCenteredRef.current) {
      const todayPosition = getDatePosition(today, startDate, viewMode);
      const containerWidth = scrollContainerRef.current.clientWidth;
      const centeredScrollLeft = todayPosition - containerWidth / 2;

      scrollContainerRef.current.scrollLeft = Math.max(0, centeredScrollLeft);
      setScrollLeft(Math.max(0, centeredScrollLeft));
    }
  }, [viewMode, startDate, today]);

  // Handle scroll to update visible date and trigger virtualization
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const newScrollLeft = scrollContainerRef.current.scrollLeft;
      setScrollLeft(newScrollLeft);

      // Calculate visible date based on scroll position
      const dayOffset = Math.floor((newScrollLeft - LEFT_MARGIN) / viewConfig.pixelsPerDay);
      const newVisibleDate = addDays(startDate, Math.max(0, dayOffset));
      setVisibleDate(newVisibleDate);
    }
  }, [startDate, viewConfig.pixelsPerDay]);

  // Scroll by a number of days
  const scrollByDays = useCallback((numDays: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: numDays * viewConfig.pixelsPerDay,
        behavior: 'smooth'
      });
    }
  }, [viewConfig.pixelsPerDay]);

  // Scroll based on current view mode
  const scrollByViewMode = useCallback((direction: 1 | -1) => {
    const scrollDays = viewConfig.scrollDays;
    scrollByDays(direction * scrollDays);
  }, [viewConfig.scrollDays, scrollByDays]);

  // Scroll to "Today" - center today in the viewport
  const scrollToToday = useCallback(() => {
    if (scrollContainerRef.current) {
      const todayPosition = getDatePosition(today, startDate, viewMode);
      const containerWidth = scrollContainerRef.current.clientWidth;
      const centeredScrollLeft = todayPosition - containerWidth / 2;

      scrollContainerRef.current.scrollTo({
        left: Math.max(0, centeredScrollLeft),
        behavior: 'smooth'
      });
    }
  }, [startDate, viewMode, today]);

  // Scroll to a specific month - now scrolls instead of filtering
  const scrollToMonth = useCallback((year: number, month: number) => {
    if (scrollContainerRef.current) {
      const targetDate = new Date(year, month, 15); // Middle of month
      const targetPosition = getDatePosition(targetDate, startDate, viewMode);
      const containerWidth = scrollContainerRef.current.clientWidth;
      const centeredScrollLeft = targetPosition - containerWidth / 2;

      scrollContainerRef.current.scrollTo({
        left: Math.max(0, centeredScrollLeft),
        behavior: 'smooth'
      });
    }
    setIsMonthDropdownOpen(false);
    setIsYearDropdownOpen(false);
  }, [startDate, viewMode]);

  // Drag-to-scroll handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current || isDraggingNodeRef.current || isResizingRef.current) return;

    isDraggingScrollRef.current = true;
    setIsDraggingScroll(true);
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;

    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingScrollRef.current || !scrollContainerRef.current || isDraggingNodeRef.current || isResizingRef.current) return;

    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (startXRef.current - x) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current + walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingScrollRef.current = false;
    setIsDraggingScroll(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDraggingScrollRef.current = false;
    setIsDraggingScroll(false);
  }, []);

  // Edge resize handlers
  const handleResizeStart = useCallback((taskId: string, edge: 'left' | 'right', e: React.MouseEvent) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    isResizingRef.current = true;
    resizeEdgeRef.current = edge;
    resizeStartXRef.current = e.clientX;
    resizeTaskRef.current = task;

    frozenNodesRef.current = nodesRef.current;
    setIsEdgeResizing(true);

    e.preventDefault();
  }, [tasks]);

  // Global mouse move for resize
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !resizeTaskRef.current || !resizeEdgeRef.current) return;

      const deltaX = e.clientX - resizeStartXRef.current;
      const task = resizeTaskRef.current;
      const edge = resizeEdgeRef.current;

      const minWidth = 60;
      const currentWidth = getTaskWidth(task.startDate, task.targetCompletionDate, viewMode);

      if (edge === 'left') {
        const newWidth = currentWidth - deltaX;
        if (newWidth >= minWidth) {
          setResizePreview({ taskId: task.id, edge, deltaX });
        }
      } else {
        const newWidth = currentWidth + deltaX;
        if (newWidth >= minWidth) {
          setResizePreview({ taskId: task.id, edge, deltaX });
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isResizingRef.current && resizeTaskRef.current) {
        justFinishedResizingRef.current = true;
        setTimeout(() => {
          justFinishedResizingRef.current = false;
        }, 100);

        if (resizePreview) {
          const task = resizeTaskRef.current;
          const dayOffset = Math.round(resizePreview.deltaX / viewConfig.pixelsPerDay);

          if (dayOffset !== 0) {
            if (resizePreview.edge === 'left') {
              const newStartDate = addDays(task.startDate, dayOffset);
              if (newStartDate < task.targetCompletionDate) {
                const newDuration = differenceInDays(task.targetCompletionDate, newStartDate);
                updateTask(task.id, {
                  startDate: newStartDate,
                  duration: newDuration,
                });
              }
            } else {
              const newEndDate = addDays(task.targetCompletionDate, dayOffset);
              if (newEndDate > task.startDate) {
                const newDuration = differenceInDays(newEndDate, task.startDate);
                updateTask(task.id, {
                  targetCompletionDate: newEndDate,
                  duration: newDuration,
                });
              }
            }
          }
        }
      }

      isResizingRef.current = false;
      resizeEdgeRef.current = null;
      resizeTaskRef.current = null;
      frozenNodesRef.current = null;
      setResizePreview(null);
      setIsEdgeResizing(false);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [resizePreview, updateTask, viewConfig.pixelsPerDay, viewMode]);

  // Node drag handlers
  const handleNodeDragStart: NodeDragHandler = useCallback((_event, node) => {
    isDraggingNodeRef.current = true;
    draggingNodeIdRef.current = node.id;
    dragStartPositionRef.current = { x: node.position.x, y: node.position.y };
    const task = tasks.find(t => t.id === node.id);
    draggedTaskRef.current = task || null;
  }, [tasks]);

  const handleNodeDragStop: NodeDragHandler = useCallback((_event, node) => {
    if (!dragStartPositionRef.current || !draggedTaskRef.current) {
      isDraggingNodeRef.current = false;
      draggingNodeIdRef.current = null;
      return;
    }

    const task = draggedTaskRef.current;
    const deltaX = node.position.x - dragStartPositionRef.current.x;

    // Convert pixel distance to days based on current view mode
    const dayOffset = Math.round(deltaX / viewConfig.pixelsPerDay);

    const newOrderIndex = Math.max(0, Math.round((node.position.y - HEADER_HEIGHT) / ROW_HEIGHT));

    const hasDateChange = dayOffset !== 0;
    const hasOrderChange = newOrderIndex !== (task.orderIndex ?? 0);

    isDraggingNodeRef.current = false;
    draggingNodeIdRef.current = null;
    dragStartPositionRef.current = null;
    draggedTaskRef.current = null;

    if (hasDateChange || hasOrderChange) {
      const newStartDate = hasDateChange ? addDays(task.startDate, dayOffset) : task.startDate;
      const newEndDate = hasDateChange ? addDays(task.targetCompletionDate, dayOffset) : task.targetCompletionDate;

      const updatedTask = { ...task, startDate: newStartDate, targetCompletionDate: newEndDate };
      if (isTaskInvalid(updatedTask, tasks, dependencies)) {
        console.warn(`Task "${task.name}" now starts before a prerequisite finishes.`);
      }

      const updates: Partial<Task> = {};
      if (hasDateChange) {
        updates.startDate = newStartDate;
        updates.targetCompletionDate = newEndDate;
      }
      if (hasOrderChange) {
        updates.orderIndex = newOrderIndex;
      }

      updateTask(task.id, updates);
    }
  }, [updateTask, tasks, dependencies, viewConfig.pixelsPerDay]);

  // State for hover-based dependency visualization
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const hoverHandlersRef = useRef<Map<string, { enter: () => void; leave: () => void }>>(new Map());

  const getHoverHandlers = useCallback((taskId: string) => {
    if (!hoverHandlersRef.current.has(taskId)) {
      hoverHandlersRef.current.set(taskId, {
        enter: () => setHoveredTaskId(taskId),
        leave: () => setHoveredTaskId(null),
      });
    }
    return hoverHandlersRef.current.get(taskId)!;
  }, []);

  // Topological sort
  const topologicalSort = useCallback((
    taskList: Task[],
    deps: TaskDependency[]
  ): Task[] => {
    const taskMap = new Map(taskList.map(t => [t.id, t]));
    const inDegree = new Map<string, number>();
    const adjacencyList = new Map<string, string[]>();

    for (const task of taskList) {
      inDegree.set(task.id, 0);
      adjacencyList.set(task.id, []);
    }

    for (const dep of deps) {
      const source = dep.dependsOnTaskId;
      const target = dep.taskId;

      if (taskMap.has(source) && taskMap.has(target)) {
        adjacencyList.get(source)!.push(target);
        inDegree.set(target, (inDegree.get(target) || 0) + 1);
      }
    }

    const queue: Task[] = taskList
      .filter(t => inDegree.get(t.id) === 0)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const sorted: Task[] = [];
    let processedCount = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);
      processedCount++;

      const dependents = adjacencyList.get(current.id) || [];
      const newlyAvailable: Task[] = [];

      for (const dependentId of dependents) {
        const newInDegree = (inDegree.get(dependentId) || 0) - 1;
        inDegree.set(dependentId, newInDegree);

        if (newInDegree === 0) {
          const dependentTask = taskMap.get(dependentId);
          if (dependentTask) {
            newlyAvailable.push(dependentTask);
          }
        }
      }

      if (newlyAvailable.length > 0) {
        newlyAvailable.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        const merged: Task[] = [];
        let i = 0, j = 0;
        while (i < queue.length && j < newlyAvailable.length) {
          if (queue[i].startDate.getTime() <= newlyAvailable[j].startDate.getTime()) {
            merged.push(queue[i++]);
          } else {
            merged.push(newlyAvailable[j++]);
          }
        }
        while (i < queue.length) merged.push(queue[i++]);
        while (j < newlyAvailable.length) merged.push(newlyAvailable[j++]);

        queue.length = 0;
        queue.push(...merged);
      }
    }

    if (processedCount < taskList.length) {
      console.warn('Circular dependency detected, falling back to startDate sorting');
      return [...taskList].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }

    return sorted;
  }, []);

  // Calculate nodes with dynamic positioning based on view mode
  const calculateNodes = useCallback((
    taskList: Task[],
    deps: TaskDependency[],
    baseStartDate: Date,
    currentViewMode: ViewMode,
    preview: typeof resizePreview
  ): Node[] => {
    const sortedTasks = topologicalSort(taskList, deps);

    return sortedTasks.map((task, rowIndex) => {
      const taskPreview = preview?.taskId === task.id ? preview : null;

      // Use getDatePosition for dynamic positioning
      let baseX = getDatePosition(task.startDate, baseStartDate, currentViewMode);
      let width = getTaskWidth(task.startDate, task.targetCompletionDate, currentViewMode);

      // Validate numbers
      if (!Number.isFinite(baseX)) baseX = LEFT_MARGIN;
      if (!Number.isFinite(width)) width = 60;

      // Apply pixel-level adjustments for resize preview
      if (taskPreview && Number.isFinite(taskPreview.deltaX)) {
        if (taskPreview.edge === 'left') {
          baseX += taskPreview.deltaX;
          width -= taskPreview.deltaX;
        } else {
          width += taskPreview.deltaX;
        }
      }

      width = Math.max(Number.isFinite(width) ? width : 60, 60);

      const isInvalid = isTaskInvalid(task, taskList, deps);
      const hoverHandlers = getHoverHandlers(task.id);

      return {
        id: task.id,
        type: 'taskNode',
        position: {
          x: baseX,
          y: HEADER_HEIGHT + (rowIndex * ROW_HEIGHT),
        },
        data: {
          task,
          width,
          isInvalid,
          onResizeStart: handleResizeStart,
          onMouseEnter: hoverHandlers.enter,
          onMouseLeave: hoverHandlers.leave,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        draggable: true,
      };
    });
  }, [topologicalSort, handleResizeStart, getHoverHandlers]);

  // Update nodes when tasks, dependencies, or view mode changes
  useEffect(() => {
    if (!isDraggingNodeRef.current && !isEdgeResizing) {
      const calculatedNodes = calculateNodes(tasks, dependencies, startDate, viewMode, null);
      setNodes(calculatedNodes);
    }
  }, [tasks, dependencies, startDate, viewMode, calculateNodes, setNodes, isEdgeResizing]);

  // Resize preview effect
  useEffect(() => {
    if (isEdgeResizing && resizePreview && frozenNodesRef.current) {
      const { taskId, edge, deltaX } = resizePreview;

      const updatedNodes = frozenNodesRef.current.map(node => {
        if (node.id !== taskId) return node;

        const currentWidth = node.data.width as number;
        let newX = node.position.x;
        let newWidth = currentWidth;

        if (edge === 'left') {
          newX = node.position.x + deltaX;
          newWidth = currentWidth - deltaX;
        } else {
          newWidth = currentWidth + deltaX;
        }

        newWidth = Math.max(newWidth, 60);

        return {
          ...node,
          position: { ...node.position, x: newX },
          data: { ...node.data, width: newWidth },
        };
      });

      setNodes(updatedNodes);
    }
  }, [isEdgeResizing, resizePreview, setNodes]);

  // Create edges for dependencies
  const edges: Edge[] = useMemo(() => {
    return dependencies
      .filter(dep => {
        const sourceTask = tasks.find(t => t.id === dep.dependsOnTaskId);
        const targetTask = tasks.find(t => t.id === dep.taskId);
        return sourceTask && targetTask;
      })
      .map(dep => {
        // Check if this edge is related to the hovered task
        const isRelatedToHover = hoveredTaskId && 
          (dep.taskId === hoveredTaskId || dep.dependsOnTaskId === hoveredTaskId);
        
        return {
          id: `${dep.dependsOnTaskId}-${dep.taskId}`,
          source: dep.dependsOnTaskId,
          target: dep.taskId,
          type: 'bezier',
          animated: true,
          // Pulse when not hovered, solid when hovered
          className: isRelatedToHover ? '' : 'pulsing',
          style: { stroke: EDGE_COLOR, strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.Arrow,
            color: EDGE_COLOR,
            width: 20,
            height: 20,
          },
        };
      });
  }, [dependencies, tasks, hoveredTaskId]);

  // Handle node clicks
  const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    if (isDraggingNodeRef.current || isResizingRef.current || justFinishedResizingRef.current) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('lastView', 'timeline');
    }
    router.push(`/tasks/${node.id}`);
  }, [router]);

  // Calculate today marker position
  const todayPosition = getDatePosition(today, startDate, viewMode);

  // Format the visible date for display
  const displayedMonth = visibleDate ? format(visibleDate, 'MMMM') : format(startDate, 'MMMM');
  const displayedYear = visibleDate ? format(visibleDate, 'yyyy') : format(startDate, 'yyyy');

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const YEARS = [2025, 2026, 2027];

  return (
    <div className="flex flex-col h-full bg-stone-50 px-6 py-6">
      <div className="flex flex-col h-full bg-stone-50 rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Timeline header with date controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <div className="relative flex items-center gap-2">
            {/* Month dropdown */}
            <button
              onClick={() => {
                setIsMonthDropdownOpen(!isMonthDropdownOpen);
                setIsYearDropdownOpen(false);
              }}
              className="flex items-center gap-1 font-medium text-stone-900 hover:bg-stone-100 px-2 py-1 rounded transition-colors"
            >
              {displayedMonth}
              <ChevronDown size={16} className={`text-stone-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMonthDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMonthDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-stone-50 border border-stone-200 rounded-lg shadow-lg z-30 py-1 min-w-[140px]">
                  {MONTHS.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => scrollToMonth(parseInt(displayedYear), index)}
                      className="w-full text-left px-4 py-2 text-sm text-stone-800 hover:bg-stone-100 transition-colors"
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Year dropdown */}
            <button
              onClick={() => {
                setIsYearDropdownOpen(!isYearDropdownOpen);
                setIsMonthDropdownOpen(false);
              }}
              className="flex items-center gap-1 font-medium text-stone-900 hover:bg-stone-100 px-2 py-1 rounded transition-colors"
            >
              {displayedYear}
              <ChevronDown size={16} className={`text-stone-400 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isYearDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsYearDropdownOpen(false)}
                />
                <div className="absolute top-full left-20 mt-1 bg-stone-50 border border-stone-200 rounded-lg shadow-lg z-30 py-1 min-w-[100px]">
                  {YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => scrollToMonth(year, visibleDate ? visibleDate.getMonth() : 0)}
                      className="w-full text-left px-4 py-2 text-sm text-stone-800 hover:bg-stone-100 transition-colors"
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* View mode dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsViewModeDropdownOpen(!isViewModeDropdownOpen);
                  setIsMonthDropdownOpen(false);
                  setIsYearDropdownOpen(false);
                }}
                className="flex items-center gap-1 text-sm font-medium text-stone-700 hover:bg-stone-100 px-3 py-1.5 rounded border border-stone-200 transition-colors"
              >
                {VIEW_MODE_CONFIG[viewMode].label}
                <ChevronDown size={14} className={`text-stone-400 transition-transform ${isViewModeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isViewModeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsViewModeDropdownOpen(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 bg-stone-50 border border-stone-200 rounded-lg shadow-lg z-30 py-1 min-w-[100px]">
                    {(Object.keys(VIEW_MODE_CONFIG) as ViewMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setViewMode(mode);
                          setIsViewModeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          viewMode === mode
                            ? 'bg-accent/10 text-accent font-medium'
                            : 'text-stone-800 hover:bg-stone-100'
                        }`}
                      >
                        {VIEW_MODE_CONFIG[mode].label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => scrollByViewMode(-1)}
                className="p-1 hover:bg-stone-100 rounded transition-colors"
                title={`Go back 1 ${viewMode}`}
              >
                <ChevronLeft size={16} className="text-stone-400" />
              </button>
              <button
                onClick={scrollToToday}
                className="text-sm text-stone-800 hover:bg-stone-100 px-2 py-1 rounded transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => scrollByViewMode(1)}
                className="p-1 hover:bg-stone-100 rounded transition-colors"
                title={`Go forward 1 ${viewMode}`}
              >
                <ChevronRight size={16} className="text-stone-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Timeline grid with drag-to-scroll */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 relative overflow-auto ${isDraggingScroll ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Virtualized date header */}
          <div
            className="sticky top-0 z-10 bg-stone-50 border-b border-stone-200"
            style={{ width: totalWidth, minWidth: '100%' }}
          >
            <div className="relative h-12">
              {virtualizedColumns.map((column, index) => {
                // Check if the next column is also a weekend (Saturday followed by Sunday)
                const nextColumn = virtualizedColumns[index + 1];
                const isFollowedByWeekend = nextColumn?.isWeekend;
                
                // Extend width to include gap if followed by another weekend day
                const extendedWidth = column.isWeekend && isFollowedByWeekend 
                  ? column.width + COLUMN_GAP 
                  : column.width;

                return (
                  <div
                    key={`header-${column.date.getTime()}`}
                    className={`absolute text-center py-2 text-sm ${column.isWeekend ? 'bg-stone-100' : ''}`}
                    style={{
                      left: column.x,
                      width: extendedWidth
                    }}
                  >
                    <span className={`${column.isToday ? 'bg-accent text-white rounded-full px-2 py-1' : 'text-stone-400'}`}>
                      {column.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* React Flow canvas */}
          <div
            style={{
              height: Math.max(400, (nodes.length + 1) * ROW_HEIGHT + HEADER_HEIGHT),
              width: totalWidth,
              minWidth: '100%',
              position: 'relative'
            }}
          >
            {/* Virtualized column backgrounds (weekends) */}
            {virtualizedColumns.map((column, index) => {
              if (!column.isWeekend) return null;

              // Check if the next column is also a weekend (Saturday followed by Sunday)
              const nextColumn = virtualizedColumns[index + 1];
              const isFollowedByWeekend = nextColumn?.isWeekend;
              
              // Extend width to include gap if followed by another weekend day
              // This makes Saturday-Sunday appear as one solid block
              const extendedWidth = isFollowedByWeekend 
                ? column.width + COLUMN_GAP 
                : column.width;

              return (
                <div
                  key={`weekend-${column.date.getTime()}`}
                  className="absolute bg-stone-100"
                  style={{
                    left: column.x,
                    top: 0,
                    width: extendedWidth,
                    height: '100%',
                  }}
                />
              );
            })}

            {/* Today marker */}
            <div
              className="absolute bg-accent"
              style={{
                left: todayPosition,
                top: 0,
                width: 2,
                height: '100%',
                zIndex: 5,
              }}
            />

            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              fitView={false}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={false}
              selectNodesOnDrag={false}
              onNodeClick={handleNodeClick}
              onNodeDragStart={handleNodeDragStart}
              onNodeDragStop={handleNodeDragStop}
              minZoom={1}
              maxZoom={1}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              autoPanOnNodeDrag={false}
            >
              <Background color="#E6E4DD" gap={viewConfig.columnWidth + COLUMN_GAP} />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap with ReactFlowProvider for drag functionality
export function TimelineView(props: TimelineViewProps) {
  return (
    <ReactFlowProvider>
      <TimelineViewInner {...props} />
    </ReactFlowProvider>
  );
}
