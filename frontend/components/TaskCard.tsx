'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TaskCardProps {
  task: Task;
  projectId: string;
}

export function TaskCard({ task, projectId }: TaskCardProps) {
  const router = useRouter();
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

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Store that we're coming from board view
    if (typeof window !== 'undefined') {
      localStorage.setItem(`project_${projectId}_lastView`, 'board');
    }
    router.push(`/projects/${projectId}/tasks/${task.id}`);
  }, [projectId, task.id, router]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <div 
        onClick={handleClick}
        className="bg-white border border-gray-200 rounded-lg px-3 py-3 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      >
        <span className="text-sm font-medium text-gray-700">{task.name}</span>
      </div>
    </div>
  );
}
