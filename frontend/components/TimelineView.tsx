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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Task, TaskDependency } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface TimelineViewProps {
  projectId: string;
  tasks: Task[];
  dependencies: TaskDependency[];
}

// Constants for timeline layout
const DAY_WIDTH = 40;
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

// Custom task node component
function TaskNode({ data }: { data: { task: Task; projectId: string; width: number } }) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center"
      style={{ width: data.width, minWidth: 80 }}
    >
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
        {data.task.name}
      </span>
    </div>
  );
}

const nodeTypes = {
  taskNode: TaskNode,
};

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    setIsDropdownOpen(false);
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

  // Calculate node positions based on task dates
  const nodes: Node[] = useMemo(() => {
    // Sort tasks by start date to assign rows
    const sortedTasks = [...tasks].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );

    // Row assignment - avoid overlapping tasks (tasks cannot share the same day)
    const rowEndDates: Date[] = [];
    const taskRows: Map<string, number> = new Map();

    sortedTasks.forEach(task => {
      let assignedRow = -1;
      // Find the first row where the task can fit (start date must be after end date, not same day)
      for (let i = 0; i < rowEndDates.length; i++) {
        if (task.startDate > rowEndDates[i]) {
          assignedRow = i;
          break;
        }
      }
      // If no existing row works, create a new row
      if (assignedRow === -1) {
        assignedRow = rowEndDates.length;
      }
      taskRows.set(task.id, assignedRow);
      rowEndDates[assignedRow] = task.targetCompletionDate;
    });

    return tasks.map(task => {
      const dayOffset = differenceInDays(task.startDate, startDate);
      const row = taskRows.get(task.id) || 0;
      // Calculate width based on duration from start to end date
      const durationDays = differenceInDays(task.targetCompletionDate, task.startDate) + 1;
      const width = durationDays * DAY_WIDTH;

      return {
        id: task.id,
        type: 'taskNode',
        position: {
          x: LEFT_MARGIN + dayOffset * DAY_WIDTH,
          y: HEADER_HEIGHT + row * ROW_HEIGHT,
        },
        data: { task, projectId, width },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [tasks, startDate, projectId]);

  // Create edges for dependencies
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
        type: 'smoothstep',
        style: { stroke: '#dc7462', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#dc7462',
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
  const displayedMonthYear = visibleDate ? format(visibleDate, 'MMMM yyyy') : format(startDate, 'MMMM yyyy');

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Timeline header with date controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="relative flex items-center gap-2">
          <span className="text-gray-400">&gt;&gt;</span>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 font-medium text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
          >
            {displayedMonthYear}
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Month selector dropdown */}
          {isDropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 min-w-[160px]">
                {AVAILABLE_MONTHS.map(({ year, month, label }) => (
                  <button
                    key={`${year}-${month}`}
                    onClick={() => scrollToMonth(year, month)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {label}
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
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Go back 10 days"
            >
              <ChevronLeft size={16} className="text-gray-500" />
            </button>
            <span className="text-sm text-gray-700">Today</span>
            <button 
              onClick={() => scrollByDays(10)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Go forward 10 days"
            >
              <ChevronRight size={16} className="text-gray-500" />
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
          className="sticky top-0 z-10 bg-white border-b border-gray-200 flex"
          style={{ minWidth: days.length * DAY_WIDTH + LEFT_MARGIN }}
        >
          <div style={{ width: LEFT_MARGIN }} />
          {days.map((day, index) => {
            const isToday = differenceInDays(day, today) === 0;
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div
                key={index}
                className={`flex-shrink-0 text-center py-2 text-sm ${isWeekend ? 'bg-gray-50' : ''
                  }`}
                style={{ width: DAY_WIDTH }}
              >
                <span className={`${isToday ? 'bg-blue-500 text-white rounded-full px-2 py-1' : 'text-gray-500'}`}>
                  {format(day, 'd')}
                </span>
              </div>
            );
          })}
        </div>

        {/* React Flow canvas */}
        <div
          style={{
            height: Math.max(400, (nodes.length + 1) * ROW_HEIGHT + HEADER_HEIGHT),
            minWidth: days.length * DAY_WIDTH + LEFT_MARGIN,
            position: 'relative'
          }}
        >
          {/* Weekend backgrounds */}
          {days.map((day, index) => {
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            if (!isWeekend) return null;

            return (
              <div
                key={`weekend-${index}`}
                className="absolute bg-gray-50"
                style={{
                  left: LEFT_MARGIN + index * DAY_WIDTH,
                  top: 0,
                  width: DAY_WIDTH,
                  height: '100%',
                }}
              />
            );
          })}

          {/* Today marker */}
          <div
            className="absolute bg-red-400"
            style={{
              left: LEFT_MARGIN + todayOffset * DAY_WIDTH + DAY_WIDTH / 2 - 1,
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
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            onNodeClick={handleNodeClick}
            minZoom={1}
            maxZoom={1}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Background color="#f3f4f6" gap={DAY_WIDTH} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
