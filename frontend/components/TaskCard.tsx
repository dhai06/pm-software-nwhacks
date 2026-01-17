'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Task } from '@/lib/types';
import { ProjectIcon } from './ProjectIcon';

interface TaskCardProps {
  task: Task;
  projectId: string;
}

export function TaskCard({ task, projectId }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <Link href={`/projects/${projectId}/tasks/${task.id}`}>
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-3 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-2">
          <ProjectIcon size="sm" />
          <span className="text-sm font-medium text-gray-700">{task.name}</span>
        </div>
      </Link>
    </div>
  );
}
