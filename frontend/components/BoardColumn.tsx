'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus, STATUS_LABELS, STATUS_COLORS } from '@/lib/types';
import { TaskCard } from './TaskCard';

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  projectId: string;
}

export function BoardColumn({ status, tasks, projectId }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const statusConfig = STATUS_COLORS[status];

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] bg-stone-100 rounded-2xl p-4 border border-stone-200">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
        <span className={`text-sm font-sans font-medium ${statusConfig.text}`}>
          {STATUS_LABELS[status]}
        </span>
        <span className="text-sm text-stone-400">{tasks.length}</span>
      </div>

      {/* Column content */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 rounded-lg transition-colors min-h-[100px] ${
          isOver ? 'bg-stone-200/50' : ''
        }`}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} projectId={projectId} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
