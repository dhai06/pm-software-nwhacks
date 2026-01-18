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
import { format, addDays, differenceInDays, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Task, TaskDependency, STATUS_COLORS } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/store';

interface TimelineViewProps {
  tasks: Task[];
  dependencies: TaskDependency[];
}

// View mode types for timeline zoom levels
type ViewMode = 'day' | 'week' | 'month' | 'year';

// Configuration for each view mode
const VIEW_MODE_CONFIG: Record<ViewMode, { label: string; scrollDays: number }> = {
  day: { label: 'Day', scrollDays: 1 },
  week: { label: 'Week', scrollDays: 7 },
  month: { label: 'Month', scrollDays: 30 },
  year: { label: 'Year', scrollDays: 365 },
};

// Constants for timeline layout
const DAY_WIDTH = 52;
const DAY_GAP = 4;
const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 80;
const LEFT_MARGIN = 20;

// Custom task node component with status indicator and resize handles
// Memoized to prevent unnecessary re-renders during drag
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

  // Conditional styling for invalid tasks
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
      style={{ width: data.width, minWidth: 80, height: 36 }}
      onMouseEnter={data.onMouseEnter}
      onMouseLeave={data.onMouseLeave}
    >
      {/* Dependency Violation Tooltip */}
      {data.isInvalid && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Dependency Violation
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600" />
        </div>
      )}

      <Handle type="target" position={Position.Left} className="opacity-0" />

      {/* Left resize handle - nodrag class prevents React Flow from interpreting as node movement */}
      <div
        className="nodrag absolute left-0 top-0 bottom-0 w-[10px] cursor-ew-resize hover:bg-blue-400/30 rounded-l-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleLeftEdgeMouseDown}
      />

      {/* Task content - Center zone for moving */}
      <div className="flex items-center gap-2 px-4 py-2 flex-1 min-w-0">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor.dot}`}
          title={data.task.status}
        />
        <span className="text-sm font-medium text-stone-800 whitespace-nowrap overflow-hidden text-ellipsis">
          {data.task.name}
        </span>
      </div>

      {/* Right resize handle - nodrag class prevents React Flow from interpreting as node movement */}
      <div
        className="nodrag absolute right-0 top-0 bottom-0 w-[10px] cursor-ew-resize hover:bg-blue-400/30 rounded-r-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleRightEdgeMouseDown}
      />

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
});

// Define nodeTypes outside component to prevent re-registration
const nodeTypes = {
  taskNode: TaskNode,
};

// No custom edge needed - using built-in smoothstep for predictable paths

// Accent blue color for edges
const EDGE_COLOR = '#3B82F6';

// Helper function to check if a task violates dependency constraints
function isTaskInvalid(
  task: Task,
  allTasks: Task[],
  allDependencies: TaskDependency[]
): boolean {
  // Find all dependencies where this task depends on another
  const prerequisites = allDependencies.filter(dep => dep.taskId === task.id);

  for (const dep of prerequisites) {
    const prerequisiteTask = allTasks.find(t => t.id === dep.dependsOnTaskId);
    if (prerequisiteTask && task.startDate < prerequisiteTask.targetCompletionDate) {
      return true; // Task starts before prerequisite finishes
    }
  }
  return false;
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

  // Refs for node dragging - use refs instead of state to avoid re-renders during drag
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
  const [visibleDate, setVisibleDate] = useState<Date | null>(null);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isDraggingScroll, setIsDraggingScroll] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isViewModeDropdownOpen, setIsViewModeDropdownOpen] = useState(false);

  // State for edge resizing - this is the key state that controls resize behavior
  const [isEdgeResizing, setIsEdgeResizing] = useState(false);

  // State for resize preview (pixel-based for smooth following)
  const [resizePreview, setResizePreview] = useState<{
    taskId: string;
    edge: 'left' | 'right';
    deltaX: number; // Raw pixel delta for smooth cursor following
  } | null>(null);

  // Frozen nodes snapshot taken when resize starts - prevents recalculation during drag
  const frozenNodesRef = useRef<Node[] | null>(null);

  // Use ReactFlow's useNodesState for controlled dragging - declared early for use in handlers
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  
  // Ref to access current nodes without causing dependency cycles
  const nodesRef = useRef<Node[]>([]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Get date range for the timeline - reasonable window around current year
  // Supports 2 years before and after current focus for smooth navigation
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(2025, 0, 1); // January 1, 2025
    const end = new Date(2027, 11, 31); // December 31, 2027
    return { startDate: start, endDate: end };
  }, []);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const today = new Date(2026, 0, 17); // Current date as shown in the example

  // Initialize visibleDate and center on "today" after mount
  useEffect(() => {
    // Center "today" in the viewport on initial load (only once)
    if (scrollContainerRef.current && !hasCenteredRef.current) {
      const todayOffset = differenceInDays(today, startDate);
      const containerWidth = scrollContainerRef.current.clientWidth;
      // Account for DAY_GAP in position calculation
      const todayPosition = LEFT_MARGIN + todayOffset * (DAY_WIDTH + DAY_GAP) + DAY_WIDTH / 2;
      const centeredScrollLeft = todayPosition - containerWidth / 2;

      scrollContainerRef.current.scrollLeft = Math.max(0, centeredScrollLeft);
      hasCenteredRef.current = true;

      // Set initial visible date based on centered scroll position
      const dayIndex = Math.floor(Math.max(0, centeredScrollLeft - LEFT_MARGIN) / (DAY_WIDTH + DAY_GAP));
      setVisibleDate(addDays(startDate, Math.max(0, dayIndex)));
    } else if (visibleDate === null) {
      setVisibleDate(startDate);
    }
  }, [startDate, visibleDate]);

  // Handle scroll to update visible date
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      // Account for LEFT_MARGIN and DAY_GAP in the calculation
      const dayIndex = Math.floor(Math.max(0, scrollLeft - LEFT_MARGIN) / (DAY_WIDTH + DAY_GAP));
      const newVisibleDate = addDays(startDate, Math.max(0, dayIndex));
      setVisibleDate(newVisibleDate);
    }
  }, [startDate]);

  // Scroll by a number of days
  const scrollByDays = useCallback((numDays: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: numDays * (DAY_WIDTH + DAY_GAP),
        behavior: 'smooth'
      });
    }
  }, []);

  // Scroll based on current view mode (uses configured scroll amount)
  const scrollByViewMode = useCallback((direction: 1 | -1) => {
    const scrollDays = VIEW_MODE_CONFIG[viewMode].scrollDays;
    scrollByDays(direction * scrollDays);
  }, [viewMode, scrollByDays]);

  // Scroll to a specific month
  const scrollToMonth = useCallback((year: number, month: number) => {
    if (scrollContainerRef.current) {
      const targetDate = new Date(year, month, 1);
      const dayOffset = differenceInDays(targetDate, startDate);
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, LEFT_MARGIN + dayOffset * (DAY_WIDTH + DAY_GAP)),
        behavior: 'smooth'
      });
    }
    setIsMonthDropdownOpen(false);
    setIsYearDropdownOpen(false);
  }, [startDate]);

  // Drag-to-scroll handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start scroll drag if we're dragging a node or resizing
    if (!scrollContainerRef.current || isDraggingNodeRef.current || isResizingRef.current) return;

    isDraggingScrollRef.current = true;
    setIsDraggingScroll(true);
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;

    // Prevent text selection during drag
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingScrollRef.current || !scrollContainerRef.current || isDraggingNodeRef.current || isResizingRef.current) return;

    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (startXRef.current - x) * 1.5; // Multiply for faster scroll
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

    // Freeze the current nodes - this prevents recalculation during drag
    // Use nodesRef to avoid including nodes in dependencies (which would cause infinite loop)
    frozenNodesRef.current = nodesRef.current;
    setIsEdgeResizing(true);

    // Prevent text selection
    e.preventDefault();
  }, [tasks]);

  // Global mouse move for resize (attached to window)
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !resizeTaskRef.current || !resizeEdgeRef.current) return;

      const deltaX = e.clientX - resizeStartXRef.current;
      const task = resizeTaskRef.current;
      const edge = resizeEdgeRef.current;

      // Calculate the minimum width to prevent the task from becoming too small
      const minWidth = 80;
      const currentDurationDays = differenceInDays(task.targetCompletionDate, task.startDate);
      const currentWidth = Math.max(currentDurationDays * (DAY_WIDTH + DAY_GAP) - DAY_GAP, minWidth);

      if (edge === 'left') {
        // When dragging left edge, the width decreases as we move right
        const newWidth = currentWidth - deltaX;
        if (newWidth >= minWidth) {
          setResizePreview({ taskId: task.id, edge, deltaX });
        }
      } else {
        // When dragging right edge, the width increases as we move right
        const newWidth = currentWidth + deltaX;
        if (newWidth >= minWidth) {
          setResizePreview({ taskId: task.id, edge, deltaX });
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isResizingRef.current && resizeTaskRef.current) {
        // Set flag to prevent click from opening the task
        justFinishedResizingRef.current = true;
        setTimeout(() => {
          justFinishedResizingRef.current = false;
        }, 100);

        // Update task properties based on the final resize preview
        if (resizePreview) {
          const task = resizeTaskRef.current;
          const dayOffset = Math.round(resizePreview.deltaX / (DAY_WIDTH + DAY_GAP));

          if (dayOffset !== 0) {
            if (resizePreview.edge === 'left') {
              const newStartDate = addDays(task.startDate, dayOffset);
              // Don't allow start date to go past end date
              if (newStartDate < task.targetCompletionDate) {
                const newDuration = differenceInDays(task.targetCompletionDate, newStartDate);
                updateTask(task.id, {
                  startDate: newStartDate,
                  duration: newDuration,
                });
              }
            } else {
              const newEndDate = addDays(task.targetCompletionDate, dayOffset);
              // Don't allow end date to go before start date
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

      // Clear all resize state - this triggers the main useEffect to recalculate nodes
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
  }, [resizePreview, updateTask]);

  // Node drag handlers for updating task dates and order
  // Use refs only during drag to avoid any state updates/re-renders
  const handleNodeDragStart: NodeDragHandler = useCallback((event, node) => {
    isDraggingNodeRef.current = true;
    draggingNodeIdRef.current = node.id;
    dragStartPositionRef.current = { x: node.position.x, y: node.position.y };
    const task = tasks.find(t => t.id === node.id);
    draggedTaskRef.current = task || null;
    // No state updates here - pure ref updates for zero re-renders
  }, [tasks]);

  const handleNodeDragStop: NodeDragHandler = useCallback((event, node) => {
    if (!dragStartPositionRef.current || !draggedTaskRef.current) {
      isDraggingNodeRef.current = false;
      draggingNodeIdRef.current = null;
      return;
    }

    const task = draggedTaskRef.current;
    const deltaX = node.position.x - dragStartPositionRef.current.x;

    // Convert pixel distance to days (DAY_WIDTH + DAY_GAP per day)
    const dayOffset = Math.round(deltaX / (DAY_WIDTH + DAY_GAP));

    // Calculate new orderIndex based on Y position
    const newOrderIndex = Math.max(0, Math.round((node.position.y - HEADER_HEIGHT) / ROW_HEIGHT));

    // Determine if there are actual changes
    const hasDateChange = dayOffset !== 0;
    const hasOrderChange = newOrderIndex !== (task.orderIndex ?? 0);

    // Reset drag state BEFORE any state updates
    isDraggingNodeRef.current = false;
    draggingNodeIdRef.current = null;
    dragStartPositionRef.current = null;
    draggedTaskRef.current = null;

    if (hasDateChange || hasOrderChange) {
      // Calculate new dates
      const newStartDate = hasDateChange ? addDays(task.startDate, dayOffset) : task.startDate;
      const newEndDate = hasDateChange ? addDays(task.targetCompletionDate, dayOffset) : task.targetCompletionDate;

      // Check if new position creates a conflict
      const updatedTask = { ...task, startDate: newStartDate, targetCompletionDate: newEndDate };
      if (isTaskInvalid(updatedTask, tasks, dependencies)) {
        console.warn(`Task "${task.name}" now starts before a prerequisite finishes.`);
      }

      // Build update object with only changed fields
      const updates: Partial<Task> = {};
      if (hasDateChange) {
        updates.startDate = newStartDate;
        updates.targetCompletionDate = newEndDate;
      }
      if (hasOrderChange) {
        updates.orderIndex = newOrderIndex;
      }

      // Update the task in the store (soft constraint - always allow the drop)
      updateTask(task.id, updates);
    }
  }, [updateTask, tasks, dependencies]);

  // State for hover-based dependency visualization
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  // Create stable hover handlers using refs to avoid recreating on every render
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

  // Topological sort using Kahn's algorithm with cycle detection
  // Returns tasks sorted so prerequisites appear before dependent tasks
  const topologicalSort = useCallback((
    taskList: Task[],
    deps: TaskDependency[]
  ): Task[] => {
    const taskMap = new Map(taskList.map(t => [t.id, t]));
    const inDegree = new Map<string, number>();
    const adjacencyList = new Map<string, string[]>();

    // Initialize in-degree and adjacency list for all tasks
    for (const task of taskList) {
      inDegree.set(task.id, 0);
      adjacencyList.set(task.id, []);
    }

    // Build the graph from dependencies
    // dep.dependsOnTaskId -> dep.taskId (prerequisite points to dependent)
    for (const dep of deps) {
      const source = dep.dependsOnTaskId;
      const target = dep.taskId;

      // Only process if both tasks exist in our task list
      if (taskMap.has(source) && taskMap.has(target)) {
        adjacencyList.get(source)!.push(target);
        inDegree.set(target, (inDegree.get(target) || 0) + 1);
      }
    }

    // Find all tasks with no prerequisites (in-degree = 0)
    // Sort by startDate for tie-breaking at each level
    const queue: Task[] = taskList
      .filter(t => inDegree.get(t.id) === 0)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const sorted: Task[] = [];
    let processedCount = 0;

    while (queue.length > 0) {
      // Take the first task (earliest start date among available)
      const current = queue.shift()!;
      sorted.push(current);
      processedCount++;

      // Get all dependent tasks and reduce their in-degree
      const dependents = adjacencyList.get(current.id) || [];
      const newlyAvailable: Task[] = [];

      for (const dependentId of dependents) {
        const newInDegree = (inDegree.get(dependentId) || 0) - 1;
        inDegree.set(dependentId, newInDegree);

        // If all prerequisites are processed, this task is now available
        if (newInDegree === 0) {
          const dependentTask = taskMap.get(dependentId);
          if (dependentTask) {
            newlyAvailable.push(dependentTask);
          }
        }
      }

      // Sort newly available tasks by startDate and merge into queue
      // This maintains the invariant that queue is sorted by startDate
      if (newlyAvailable.length > 0) {
        newlyAvailable.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        // Merge sorted newlyAvailable into sorted queue
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

    // Cycle detection: if we didn't process all tasks, there's a cycle
    if (processedCount < taskList.length) {
      console.warn('Circular dependency detected, falling back to startDate sorting');
      return [...taskList].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }

    return sorted;
  }, []);

  // Helper function to calculate nodes from tasks
  const calculateNodes = useCallback((
    taskList: Task[],
    deps: TaskDependency[],
    baseStartDate: Date,
    preview: typeof resizePreview
  ): Node[] => {
    // Use topological sort to order tasks so prerequisites appear above dependents
    const sortedTasks = topologicalSort(taskList, deps);

    return sortedTasks.map((task, rowIndex) => {
      // Check if this task has a resize preview (pixel-based for smooth following)
      const taskPreview = preview?.taskId === task.id ? preview : null;

      // Calculate base position and width with validation
      const baseDayOffset = differenceInDays(task.startDate, baseStartDate);
      const baseDurationDays = differenceInDays(task.targetCompletionDate, task.startDate);

      // Validate that we have valid numbers (protect against NaN from invalid dates)
      const validDayOffset = Number.isFinite(baseDayOffset) ? baseDayOffset : 0;
      const validDurationDays = Number.isFinite(baseDurationDays) && baseDurationDays > 0 ? baseDurationDays : 1;

      let baseX = LEFT_MARGIN + validDayOffset * (DAY_WIDTH + DAY_GAP);
      let width = Math.max(validDurationDays * (DAY_WIDTH + DAY_GAP) - DAY_GAP, 80);

      // Apply pixel-level adjustments for smooth cursor following during resize
      if (taskPreview && Number.isFinite(taskPreview.deltaX)) {
        if (taskPreview.edge === 'left') {
          // Moving left edge: adjust x position and width
          baseX += taskPreview.deltaX;
          width -= taskPreview.deltaX;
        } else {
          // Moving right edge: adjust width only
          width += taskPreview.deltaX;
        }
      }

      // Ensure width is always a valid positive number
      width = Math.max(Number.isFinite(width) ? width : 80, 80);

      // Check if task violates dependency constraints
      const isInvalid = isTaskInvalid(task, taskList, deps);

      // Get stable hover handlers
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

  // Update nodes when tasks, dependencies change (NOT during resize)
  // This effect handles the base node calculation
  useEffect(() => {
    // Skip recalculation during node dragging or edge resizing
    if (!isDraggingNodeRef.current && !isEdgeResizing) {
      const calculatedNodes = calculateNodes(tasks, dependencies, startDate, null);
      setNodes(calculatedNodes);
    }
  }, [tasks, dependencies, startDate, calculateNodes, setNodes, isEdgeResizing]);

  // Separate effect for resize preview - updates only the resized node from frozen snapshot
  useEffect(() => {
    if (isEdgeResizing && resizePreview && frozenNodesRef.current) {
      const { taskId, edge, deltaX } = resizePreview;

      // Apply the resize preview only to the specific node being dragged
      const updatedNodes = frozenNodesRef.current.map(node => {
        if (node.id !== taskId) return node;

        // Calculate new position and width based on the edge being dragged
        const currentWidth = node.data.width as number;
        let newX = node.position.x;
        let newWidth = currentWidth;

        if (edge === 'left') {
          // Moving left edge: adjust x position and width
          newX = node.position.x + deltaX;
          newWidth = currentWidth - deltaX;
        } else {
          // Moving right edge: adjust width only
          newWidth = currentWidth + deltaX;
        }

        // Ensure minimum width
        newWidth = Math.max(newWidth, 80);

        return {
          ...node,
          position: { ...node.position, x: newX },
          data: { ...node.data, width: newWidth },
        };
      });

      setNodes(updatedNodes);
    }
  }, [isEdgeResizing, resizePreview, setNodes]);

  // Create edges for dependencies - only show when a task is hovered
  const edges: Edge[] = useMemo(() => {
    if (!hoveredTaskId) return [];

    return dependencies
      .filter(dep => {
        // Show edges connected to hovered task (incoming or outgoing)
        return dep.taskId === hoveredTaskId || dep.dependsOnTaskId === hoveredTaskId;
      })
      .filter(dep => {
        const sourceTask = tasks.find(t => t.id === dep.dependsOnTaskId);
        const targetTask = tasks.find(t => t.id === dep.taskId);
        return sourceTask && targetTask;
      })
      .map(dep => ({
        id: `${dep.dependsOnTaskId}-${dep.taskId}`,
        source: dep.dependsOnTaskId,
        target: dep.taskId,
        type: 'bezier',
        animated: true,
        style: { stroke: EDGE_COLOR, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.Arrow,
          color: EDGE_COLOR,
          width: 20,
          height: 20,
        },
      }));
  }, [dependencies, tasks, hoveredTaskId]);

  // Handle node clicks - navigate to task page and store current view
  // Don't navigate if we just finished dragging or resizing
  const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
    // Prevent navigation right after drag or resize ends
    if (isDraggingNodeRef.current || isResizingRef.current || justFinishedResizingRef.current) return;

    // Store that we're coming from timeline view
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastView', 'timeline');
    }
    router.push(`/tasks/${node.id}`);
  }, [router]);

  // Calculate today marker position
  const todayOffset = differenceInDays(today, startDate);

  // Format the visible date for display
  const displayedMonth = visibleDate ? format(visibleDate, 'MMMM') : format(startDate, 'MMMM');
  const displayedYear = visibleDate ? format(visibleDate, 'yyyy') : format(startDate, 'yyyy');

  // Available months and years for dropdowns
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
          
          {/* Month selector dropdown */}
          {isMonthDropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
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
          
          {/* Year selector dropdown */}
          {isYearDropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
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
            <span className="text-sm text-stone-800">Today</span>
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
        {/* Date header */}
        <div
          className="sticky top-0 z-10 bg-stone-50 border-b border-stone-200 flex"
          style={{ minWidth: days.length * (DAY_WIDTH + DAY_GAP) + LEFT_MARGIN }}
        >
          <div style={{ width: LEFT_MARGIN }} />
          {days.map((day, index) => {
            const isToday = differenceInDays(day, today) === 0;
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const isSaturday = day.getDay() === 6;

            return (
              <div key={index} className="flex-shrink-0 flex">
                <div
                  className={`text-center py-2 text-sm rounded ${isWeekend ? 'bg-stone-100' : ''}`}
                  style={{ width: DAY_WIDTH }}
                >
                  <span className={`${isToday ? 'bg-accent text-white rounded-full px-2 py-1' : 'text-stone-400'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                {/* Gap - filled with grey if Saturday */}
                <div
                  className={isSaturday ? 'bg-stone-100' : ''}
                  style={{ width: DAY_GAP }}
                />
              </div>
            );
          })}
        </div>

        {/* React Flow canvas */}
        <div
          style={{
            height: Math.max(400, (nodes.length + 1) * ROW_HEIGHT + HEADER_HEIGHT),
            minWidth: days.length * (DAY_WIDTH + DAY_GAP) + LEFT_MARGIN,
            position: 'relative'
          }}
        >
          {/* Weekend backgrounds */}
          {days.map((day, index) => {
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            if (!isWeekend) return null;

            const isSaturday = day.getDay() === 6;

            return (
              <div key={`weekend-${index}`}>
                {/* Weekend day background */}
                <div
                  className="absolute bg-stone-100 rounded"
                  style={{
                    left: LEFT_MARGIN + index * (DAY_WIDTH + DAY_GAP),
                    top: 0,
                    width: DAY_WIDTH,
                    height: '100%',
                  }}
                />
                {/* Gap filler between Saturday and Sunday */}
                {isSaturday && (
                  <div
                    className="absolute bg-stone-100"
                    style={{
                      left: LEFT_MARGIN + index * (DAY_WIDTH + DAY_GAP) + DAY_WIDTH,
                      top: 0,
                      width: DAY_GAP,
                      height: '100%',
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Today marker */}
          <div
            className="absolute bg-accent"
            style={{
              left: LEFT_MARGIN + todayOffset * (DAY_WIDTH + DAY_GAP) + DAY_WIDTH / 2 - 1,
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
            <Background color="#E6E4DD" gap={DAY_WIDTH + DAY_GAP} />
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
