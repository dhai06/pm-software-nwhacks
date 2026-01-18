'use client';

import { useMemo, useCallback } from 'react';
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
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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

  // Get date range for the timeline (January 2026) - use useMemo to ensure stable references
  const { baseDate, startDate, endDate } = useMemo(() => {
    const base = new Date(2026, 0, 1); // January 1, 2026
    const start = startOfMonth(base);
    const end = addDays(endOfMonth(addDays(base, 45)), 7); // Extended to early February
    return { baseDate: base, startDate: start, endDate: end };
  }, []);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const today = new Date(2026, 0, 17); // Current date as shown in the example

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

  const handleNewClick = useCallback(() => {
    alert('Feature coming soon');
  }, []);

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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Timeline header with date controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">&gt;&gt;</span>
          <span className="font-medium text-gray-900">
            {format(baseDate, 'MMMM yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Month</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft size={16} className="text-gray-500" />
            </button>
            <span className="text-sm text-gray-700">Today</span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline grid */}
      <div className="flex-1 relative overflow-auto">
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

        {/* New task button */}
        <button
          onClick={handleNewClick}
          className="absolute left-4 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          style={{ top: HEADER_HEIGHT + nodes.length * ROW_HEIGHT + 10 }}
        >
          <Plus size={14} />
          New
        </button>
      </div>
    </div>
  );
}
