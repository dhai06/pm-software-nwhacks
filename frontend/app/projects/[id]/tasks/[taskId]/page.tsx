'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useProjectStore } from '@/lib/store';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';

interface TaskPageProps {
  params: Promise<{ id: string; taskId: string }>;
}

export default function TaskPage({ params }: TaskPageProps) {
  const { id, taskId } = use(params);

  // Select raw state to avoid creating new objects on each render
  const projects = useProjectStore(state => state.projects);
  const allTasks = useProjectStore(state => state.tasks);

  // Derive values with useMemo to maintain referential stability
  const project = useMemo(
    () => projects.find(p => p.id === id),
    [projects, id]
  );

  const task = useMemo(
    () => allTasks.find(t => t.id === taskId),
    [allTasks, taskId]
  );

  // Get the last view (board or timeline) from localStorage, default to timeline
  const backHref = useMemo(() => {
    if (typeof window === 'undefined') return `/projects/${id}`;
    const lastView = localStorage.getItem(`project_${id}_lastView`);
    return lastView === 'board' 
      ? `/projects/${id}/board` 
      : `/projects/${id}`;
  }, [id]);

  if (!task || !project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back navigation */}
      <div className="border-b border-gray-200 px-6 py-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {project.name}
        </Link>
      </div>

      {/* Task detail content */}
      <TaskDetailPanel task={task} />
    </div>
  );
}
