'use client';

import { useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useState } from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { useProjectStore } from '@/lib/store';
import { BoardColumn } from './BoardColumn';

interface BoardViewProps {
  projectId: string;
  tasks: Task[];
}

const COLUMNS: TaskStatus[] = ['not-started', 'in-progress', 'done'];

export function BoardView({ projectId, tasks }: BoardViewProps) {
  const updateTaskStatus = useProjectStore(state => state.updateTaskStatus);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => {
      return tasks.filter(task => task.status === status);
    },
    [tasks]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find(t => t.id === event.active.id);
      if (task) {
        setActiveTask(task);
      }
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const taskId = active.id as string;
      const overId = over.id as string;

      // Check if dropped on a column
      if (COLUMNS.includes(overId as TaskStatus)) {
        const newStatus = overId as TaskStatus;
        const task = tasks.find(t => t.id === taskId);

        if (task && task.status !== newStatus) {
          updateTaskStatus(taskId, newStatus);
        }
      } else {
        // Dropped on another task - get the column of that task
        const overTask = tasks.find(t => t.id === overId);
        if (overTask) {
          const task = tasks.find(t => t.id === taskId);
          if (task && task.status !== overTask.status) {
            updateTaskStatus(taskId, overTask.status);
          }
        }
      }
    },
    [tasks, updateTaskStatus]
  );

  return (
    <div className="flex-1 overflow-auto p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6">
          {COLUMNS.map(status => (
            <BoardColumn
              key={status}
              status={status}
              tasks={getTasksByStatus(status)}
              projectId={projectId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-white border border-stone-300 rounded-lg px-3 py-3 shadow-lg w-[280px]">
              <span className="text-sm font-medium text-stone-800">
                {activeTask.name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
