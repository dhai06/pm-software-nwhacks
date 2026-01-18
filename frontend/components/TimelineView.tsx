'use client';

import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Position,
  MarkerType,
  NodeMouseHandler,
  Handle,
  BezierEdge,
  EdgeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Task, TaskDependency, STATUS_COLORS } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface TimelineViewProps {
  projectId: string;
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

// Custom task node component with status indicator
function TaskNode({ data }: { data: { task: Task; projectId: string; width: number } }) {
  const statusColor = STATUS_COLORS[data.task.status];

  return (
    <div
      className="bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-2"
      style={{ width: data.width, minWidth: 80 }}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      {/* Status indicator dot */}
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor.dot}`}
        title={data.task.status}
      />
      <span className="text-sm font-medium text-stone-800 whitespace-nowrap overflow-hidden text-ellipsis">
        {data.task.name}
      </span>
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}

const nodeTypes = {
  taskNode: TaskNode,
};

// Custom edge component with aggressive curvature
function CustomBezierEdge(props: EdgeProps) {
  return <BezierEdge {...props} pathOptions={{ curvature: 3 }} />;
}

const edgeTypes = {
  customBezier: CustomBezierEdge,
};

// Accent blue color for edges
const EDGE_COLOR = '#3B82F6';

export function TimelineView({ projectId, tasks, dependencies }: TimelineViewProps) {
  const router = useRouter();
  
  // Refs for drag-to-scroll and initial centering
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasCenteredRef = useRef(false);
  
  // State for UI
  const [visibleDate, setVisibleDate] = useState<Date | null>(null);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    if (!scrollContainerRef.current) return;
    
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    
    // Prevent text selection during drag
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (startXRef.current - x) * 1.5; // Multiply for faster scroll
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current + walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Calculate node positions based on task dates with dependency-aware layout
  const nodes: Node[] = useMemo(() => {
    // Build dependency graph for topological sorting
    const dependencyMap = new Map<string, string[]>(); // taskId -> tasks that depend on it
    const prerequisiteMap = new Map<string, string[]>(); // taskId -> tasks it depends on
    
    tasks.forEach(task => {
      dependencyMap.set(task.id, []);
      prerequisiteMap.set(task.id, []);
    });
    
    dependencies.forEach(dep => {
      const sourceTask = tasks.find(t => t.id === dep.dependsOnTaskId);
      const targetTask = tasks.find(t => t.id === dep.taskId);
      if (sourceTask && targetTask) {
        dependencyMap.get(dep.dependsOnTaskId)?.push(dep.taskId);
        prerequisiteMap.get(dep.taskId)?.push(dep.dependsOnTaskId);
      }
    });

    // Topological sort using Kahn's algorithm
    const inDegree = new Map<string, number>();
    tasks.forEach(task => {
      inDegree.set(task.id, prerequisiteMap.get(task.id)?.length || 0);
    });

    const queue: Task[] = [];
    const sortedTasks: Task[] = [];

    // Start with tasks that have no prerequisites
    tasks.forEach(task => {
      if (inDegree.get(task.id) === 0) {
        queue.push(task);
      }
    });

    // Sort initial queue by start date for consistent ordering
    queue.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    while (queue.length > 0) {
      // Sort queue by start date to prioritize earlier tasks
      queue.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      const task = queue.shift()!;
      sortedTasks.push(task);

      // Reduce in-degree for dependent tasks
      const dependents = dependencyMap.get(task.id) || [];
      dependents.forEach(depId => {
        const newDegree = (inDegree.get(depId) || 1) - 1;
        inDegree.set(depId, newDegree);
        if (newDegree === 0) {
          const depTask = tasks.find(t => t.id === depId);
          if (depTask) queue.push(depTask);
        }
      });
    }

    // Add any remaining tasks (in case of cycles or disconnected tasks)
    tasks.forEach(task => {
      if (!sortedTasks.includes(task)) {
        sortedTasks.push(task);
      }
    });

    // Row assignment with dependency-aware collision avoidance
    const taskRows: Map<string, number> = new Map();
    const rowEndDates: Date[] = [];
    
    // Track placed tasks with their time windows for vertical shadow checking
    const placedTasks: Array<{ id: string; row: number; startDate: Date; endDate: Date }> = [];

    // Helper: Check if placing a task at a row would intersect with any edge's vertical shadow
    const wouldIntersectEdge = (taskStartDate: Date, taskEndDate: Date, targetRow: number, taskId: string): boolean => {
      // Check all edges that might cross through this row
      for (const dep of dependencies) {
        const sourceTask = tasks.find(t => t.id === dep.dependsOnTaskId);
        const targetTask = tasks.find(t => t.id === dep.taskId);
        
        if (!sourceTask || !targetTask) continue;
        // Skip if this edge involves the task we're placing
        if (dep.dependsOnTaskId === taskId || dep.taskId === taskId) continue;
        
        const sourceRow = taskRows.get(sourceTask.id);
        const targetRowNum = taskRows.get(targetTask.id);
        
        // Both source and target must be already placed to check shadow
        if (sourceRow === undefined || targetRowNum === undefined) continue;
        
        const minRow = Math.min(sourceRow, targetRowNum);
        const maxRow = Math.max(sourceRow, targetRowNum);
        
        // Check if target row is between the edge's rows (exclusive)
        if (targetRow <= minRow || targetRow >= maxRow) continue;
        
        // Calculate the time window where the edge exists
        // Edge goes from source's end (right side) to target's start (left side)
        const edgeStartX = sourceTask.targetCompletionDate;
        const edgeEndX = targetTask.startDate;
        
        // If the edge time window overlaps with task time window, it's a collision
        // Using a slightly expanded window for safety
        const taskStart = taskStartDate.getTime();
        const taskEnd = taskEndDate.getTime();
        const edgeStart = Math.min(edgeStartX.getTime(), edgeEndX.getTime());
        const edgeEnd = Math.max(edgeStartX.getTime(), edgeEndX.getTime());
        
        // Check for overlap
        if (taskStart < edgeEnd && taskEnd > edgeStart) {
          return true;
        }
      }
      return false;
    };

    sortedTasks.forEach(task => {
      let assignedRow = -1;
      
      // Find the first row where:
      // 1. The task doesn't overlap time-wise with other tasks in that row
      // 2. The task doesn't intersect any edge's vertical shadow
      for (let row = 0; row <= rowEndDates.length; row++) {
        // Check time overlap with existing tasks in this row
        const timeConflict = row < rowEndDates.length && task.startDate < rowEndDates[row];
        
        if (!timeConflict) {
          // Check vertical shadow intersection
          if (!wouldIntersectEdge(task.startDate, task.targetCompletionDate, row, task.id)) {
            assignedRow = row;
            break;
          }
        }
      }
      
      // If no suitable row found, create a new one
      if (assignedRow === -1) {
        assignedRow = rowEndDates.length;
      }
      
      taskRows.set(task.id, assignedRow);
      
      // Update row end date (extend if necessary)
      if (assignedRow >= rowEndDates.length) {
        rowEndDates.push(task.targetCompletionDate);
      } else if (task.targetCompletionDate > rowEndDates[assignedRow]) {
        rowEndDates[assignedRow] = task.targetCompletionDate;
      }
      
      placedTasks.push({
        id: task.id,
        row: assignedRow,
        startDate: task.startDate,
        endDate: task.targetCompletionDate,
      });
    });

    return tasks.map(task => {
      const dayOffset = differenceInDays(task.startDate, startDate);
      const row = taskRows.get(task.id) || 0;
      // Calculate width based on duration from start to end date (exclusive of end date)
      const durationDays = differenceInDays(task.targetCompletionDate, task.startDate);
      const width = durationDays * (DAY_WIDTH + DAY_GAP) - DAY_GAP;

      return {
        id: task.id,
        type: 'taskNode',
        position: {
          x: LEFT_MARGIN + dayOffset * (DAY_WIDTH + DAY_GAP),
          y: HEADER_HEIGHT + row * ROW_HEIGHT,
        },
        data: { task, projectId, width },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [tasks, dependencies, startDate, projectId]);

  // Create edges for dependencies with aggressive Bezier curves and open arrow markers
  const edges: Edge[] = useMemo(() => {
    return dependencies
      .filter(dep => {
        const sourceTask = tasks.find(t => t.id === dep.dependsOnTaskId);
        const targetTask = tasks.find(t => t.id === dep.taskId);
        return sourceTask && targetTask;
      })
      .map(dep => ({
        id: `${dep.dependsOnTaskId}-${dep.taskId}`,
        source: dep.dependsOnTaskId,
        target: dep.taskId,
        type: 'customBezier',
        style: { stroke: EDGE_COLOR, strokeWidth: 2 , strokeLinecap: 'round'},
        markerEnd: {
          type: MarkerType.Arrow,
          color: EDGE_COLOR,
          width: 20,
          height: 20,
        },
      }));
  }, [dependencies, tasks]);

  // Handle node clicks - navigate to task page and store current view
  const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
    // Store that we're coming from timeline view
    if (typeof window !== 'undefined') {
      localStorage.setItem(`project_${projectId}_lastView`, 'timeline');
    }
    router.push(`/projects/${projectId}/tasks/${node.id}`);
  }, [projectId, router]);

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
        className={`flex-1 relative overflow-auto ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
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
            edgeTypes={edgeTypes}
            fitView={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            onNodeClick={handleNodeClick}
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
