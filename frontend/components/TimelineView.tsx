'use client';

import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
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
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Task, TaskDependency, STATUS_COLORS } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/store';

interface TimelineViewProps {
  tasks: Task[];
  dependencies: TaskDependency[];
}

// Constants for timeline layout
const DAY_WIDTH = 52;
const DAY_GAP = 4;
const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 80;
const LEFT_MARGIN = 20;

// Available months for the dropdown
const AVAILABLE_MONTHS = [
  { year: 2025, month: 11, label: 'December 2025' },
  { year: 2026, month: 0, label: 'January 2026' },
  { year: 2026, month: 1, label: 'February 2026' },
  { year: 2026, month: 2, label: 'March 2026' },
];

// Custom task node component with status indicator and resize handles
function TaskNode({ data, selected }: {
  data: {
    task: Task;
    width: number;
    isInvalid?: boolean;
    onResizeStart?: (taskId: string, edge: 'left' | 'right', e: React.MouseEvent) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  };
  selected?: boolean;
}) {
  const statusColor = STATUS_COLORS[data.task.status];

  // Conditional styling for invalid tasks
  const baseClasses = data.isInvalid
    ? 'bg-red-100 border border-red-300'
    : 'bg-stone-100 border border-stone-200';

  // Floating effect when selected or being dragged
  const floatingClasses = selected
    ? 'z-50 scale-105 shadow-2xl'
    : 'shadow-sm hover:shadow-md';

  const handleLeftEdgeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onResizeStart?.(data.task.id, 'left', e);
  };

  const handleRightEdgeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onResizeStart?.(data.task.id, 'right', e);
  };

  return (
    <div
      className={`${baseClasses} ${floatingClasses} rounded-lg transition-all cursor-grab active:cursor-grabbing flex items-center relative group`}
      style={{ width: data.width, minWidth: 80, height: 36 }}
      onMouseEnter={data.onMouseEnter}
      onMouseLeave={data.onMouseLeave}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />

      {/* Error tooltip for dependency violation */}
      {data.isInvalid && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50">
          Dependency Violation
        </div>
      )}

      {/* Left resize handle - with nodrag class */}
      <div
        className="nodrag absolute left-0 top-0 bottom-0 w-[10px] cursor-ew-resize hover:bg-blue-400/30 rounded-l-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleLeftEdgeMouseDown}
      />

      {/* Task content - center area for moving */}
      <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-0">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor.dot}`}
          title={data.task.status}
        />
        <span className="text-sm font-medium text-stone-800 whitespace-nowrap overflow-hidden text-ellipsis">
          {data.task.name}
        </span>
      </div>

      {/* Right resize handle - with nodrag class */}
      <div
        className="nodrag absolute right-0 top-0 bottom-0 w-[10px] cursor-ew-resize hover:bg-blue-400/30 rounded-r-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleRightEdgeMouseDown}
      />

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}

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

  // Refs for node dragging
  const isDraggingNodeRef = useRef(false);
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const draggedTaskRef = useRef<Task | null>(null);

  // Refs for edge resizing
  const isResizingRef = useRef(false);
  const resizeEdgeRef = useRef<'left' | 'right' | null>(null);
  const resizeStartXRef = useRef(0);
  const resizeTaskRef = useRef<Task | null>(null);

  // State for UI
  const [visibleDate, setVisibleDate] = useState<Date | null>(null);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isDraggingScroll, setIsDraggingScroll] = useState(false);

  // State for resize preview
  const [resizePreview, setResizePreview] = useState<{
    taskId: string;
    newStartDate?: Date;
    newEndDate?: Date;
  } | null>(null);

  // Get date range for the timeline (January 2026) - use useMemo to ensure stable references
  const { startDate, endDate } = useMemo(() => {
    const base = new Date(2025, 11, 1); // December 1, 2025 (extended start)
    const start = startOfMonth(base);
    const end = addDays(endOfMonth(new Date(2026, 2, 1)), 7); // Extended to early April 2026
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
      const todayPosition = LEFT_MARGIN + todayOffset * DAY_WIDTH + DAY_WIDTH / 2;
      const centeredScrollLeft = todayPosition - containerWidth / 2;
      
      scrollContainerRef.current.scrollLeft = Math.max(0, centeredScrollLeft);
      hasCenteredRef.current = true;
      
      // Set initial visible date based on centered scroll position
      const dayIndex = Math.floor(centeredScrollLeft / DAY_WIDTH);
      setVisibleDate(addDays(startDate, Math.max(0, dayIndex)));
    } else if (visibleDate === null) {
      setVisibleDate(startDate);
    }
  }, [startDate, visibleDate]);

  // Handle scroll to update visible date
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const dayIndex = Math.floor(scrollLeft / DAY_WIDTH);
      const newVisibleDate = addDays(startDate, Math.max(0, dayIndex));
      setVisibleDate(newVisibleDate);
    }
  }, [startDate]);

  // Scroll by a number of days
  const scrollByDays = useCallback((days: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: days * DAY_WIDTH,
        behavior: 'smooth'
      });
    }
  }, []);

  // Scroll to a specific month
  const scrollToMonth = useCallback((year: number, month: number) => {
    if (scrollContainerRef.current) {
      const targetDate = new Date(year, month, 1);
      const dayOffset = differenceInDays(targetDate, startDate);
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, dayOffset * DAY_WIDTH),
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

    // Prevent text selection
    e.preventDefault();
  }, [tasks]);

  // Global mouse move for resize (attached to window)
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !resizeTaskRef.current || !resizeEdgeRef.current) return;

      const deltaX = e.clientX - resizeStartXRef.current;
      const dayOffset = Math.round(deltaX / (DAY_WIDTH + DAY_GAP));

      if (dayOffset === 0) {
        setResizePreview(null);
        return;
      }

      const task = resizeTaskRef.current;

      if (resizeEdgeRef.current === 'left') {
        const newStartDate = addDays(task.startDate, dayOffset);
        // Don't allow start date to go past end date
        if (newStartDate < task.targetCompletionDate) {
          setResizePreview({ taskId: task.id, newStartDate });
        }
      } else {
        const newEndDate = addDays(task.targetCompletionDate, dayOffset);
        // Don't allow end date to go before start date
        if (newEndDate > task.startDate) {
          setResizePreview({ taskId: task.id, newEndDate });
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isResizingRef.current && resizeTaskRef.current && resizePreview) {
        const task = resizeTaskRef.current;

        if (resizePreview.newStartDate) {
          const newDuration = differenceInDays(task.targetCompletionDate, resizePreview.newStartDate);
          updateTask(task.id, {
            startDate: resizePreview.newStartDate,
            duration: newDuration,
          });
        } else if (resizePreview.newEndDate) {
          const newDuration = differenceInDays(resizePreview.newEndDate, task.startDate);
          updateTask(task.id, {
            targetCompletionDate: resizePreview.newEndDate,
            duration: newDuration,
          });
        }
      }

      isResizingRef.current = false;
      resizeEdgeRef.current = null;
      resizeTaskRef.current = null;
      setResizePreview(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [resizePreview, updateTask]);

  // Node drag handlers for updating task dates
  const handleNodeDragStart: NodeDragHandler = useCallback((event, node) => {
    isDraggingNodeRef.current = true;
    dragStartPositionRef.current = { x: node.position.x, y: node.position.y };
    const task = tasks.find(t => t.id === node.id);
    draggedTaskRef.current = task || null;
  }, [tasks]);

  const handleNodeDragStop: NodeDragHandler = useCallback((event, node) => {
    if (!dragStartPositionRef.current || !draggedTaskRef.current) {
      isDraggingNodeRef.current = false;
      return;
    }

    const task = draggedTaskRef.current;
    const deltaX = node.position.x - dragStartPositionRef.current.x;
    const deltaY = node.position.y - dragStartPositionRef.current.y;

    // Convert pixel distance to days (DAY_WIDTH + DAY_GAP per day)
    const dayOffset = Math.round(deltaX / (DAY_WIDTH + DAY_GAP));

    // Calculate new orderIndex based on Y position
    const newOrderIndex = Math.round((node.position.y - HEADER_HEIGHT) / ROW_HEIGHT);

    // Prepare updates object
    const updates: Partial<Task> = {};
    let hasChanges = false;

    // Update dates if moved horizontally
    if (dayOffset !== 0) {
      updates.startDate = addDays(task.startDate, dayOffset);
      updates.targetCompletionDate = addDays(task.targetCompletionDate, dayOffset);
      hasChanges = true;

      // Check if new position creates a conflict
      const updatedTask = { ...task, ...updates };
      if (isTaskInvalid(updatedTask, tasks, dependencies)) {
        console.warn(`Task "${task.name}" now starts before a prerequisite finishes.`);
      }
    }

    // Update orderIndex if moved vertically
    if (Math.abs(deltaY) > ROW_HEIGHT / 4) { // Only update if moved significantly
      updates.orderIndex = Math.max(0, newOrderIndex);
      hasChanges = true;
    }

    // Apply updates if there are any changes
    if (hasChanges) {
      updateTask(task.id, updates);
    }

    // Reset drag state
    isDraggingNodeRef.current = false;
    dragStartPositionRef.current = null;
    draggedTaskRef.current = null;
  }, [updateTask, tasks, dependencies]);

  // State for hover-based dependency visualization
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  // Calculate node positions with orderIndex-based layout
  const nodes: Node[] = useMemo(() => {
    // Sort tasks by orderIndex first, then by start date as fallback
    const sortedTasks = [...tasks].sort((a, b) => {
      const orderA = a.orderIndex ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.orderIndex ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.startDate.getTime() - b.startDate.getTime();
    });

    // Assign default orderIndex to tasks that don't have one (based on sorted position)
    const tasksWithOrder = sortedTasks.map((task, index) => ({
      ...task,
      effectiveOrderIndex: task.orderIndex ?? index,
    }));

    return tasksWithOrder.map((task) => {
      // Check if this task has a resize preview
      const preview = resizePreview?.taskId === task.id ? resizePreview : null;
      const effectiveStartDate = preview?.newStartDate || task.startDate;
      const effectiveEndDate = preview?.newEndDate || task.targetCompletionDate;

      const dayOffset = differenceInDays(effectiveStartDate, startDate);
      // Calculate width based on duration from start to end date (exclusive of end date)
      const durationDays = differenceInDays(effectiveEndDate, effectiveStartDate);
      const width = Math.max(durationDays * (DAY_WIDTH + DAY_GAP) - DAY_GAP, 80);

      // Check if task violates dependency constraints
      const isInvalid = isTaskInvalid(task, tasks, dependencies);

      return {
        id: task.id,
        type: 'taskNode',
        position: {
          x: LEFT_MARGIN + dayOffset * (DAY_WIDTH + DAY_GAP),
          y: HEADER_HEIGHT + (task.effectiveOrderIndex * ROW_HEIGHT), // Use orderIndex for vertical position
        },
        data: {
          task,
          width,
          isInvalid,
          onResizeStart: handleResizeStart,
          onMouseEnter: () => setHoveredTaskId(task.id),
          onMouseLeave: () => setHoveredTaskId(null),
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [tasks, dependencies, startDate, resizePreview, handleResizeStart]);

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
  // Don't navigate if we just finished dragging
  const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
    // Prevent navigation right after drag ends
    if (isDraggingNodeRef.current) return;

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
          <div className="flex items-center gap-1">
            <button 
              onClick={() => scrollByDays(-10)}
              className="p-1 hover:bg-stone-100 rounded transition-colors"
              title="Go back 10 days"
            >
              <ChevronLeft size={16} className="text-stone-400" />
            </button>
            <span className="text-sm text-stone-800">Today</span>
            <button 
              onClick={() => scrollByDays(10)}
              className="p-1 hover:bg-stone-100 rounded transition-colors"
              title="Go forward 10 days"
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
            fitView={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            onNodeClick={handleNodeClick}
            onNodeDragStart={handleNodeDragStart}
            onNodeDragStop={handleNodeDragStop}
            minZoom={1}
            maxZoom={1}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
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
