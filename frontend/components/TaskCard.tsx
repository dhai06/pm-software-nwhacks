'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
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
      localStorage.setItem('lastView', 'board');
    }
    router.push(`/tasks/${task.id}`);
  }, [task.id, router]);

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
        className="bg-white border border-stone-200 rounded-lg px-3 py-3 shadow-sm hover:border-stone-300 hover:shadow-md transition-all cursor-pointer"
      >
        <span className="text-sm font-medium text-stone-800">{task.name}</span>
      </div>
    </div>
  );
}
