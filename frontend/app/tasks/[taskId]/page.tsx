'use client';

import { use, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useProjectStore } from '@/lib/store';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';

interface TaskPageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskPage({ params }: TaskPageProps) {
  const { taskId } = use(params);

  const allTasks = useProjectStore(state => state.tasks);
  const isLoading = useProjectStore(state => state.isLoading);
  const fetchAllData = useProjectStore(state => state.fetchAllData);

  // Fetch data on mount if not already loaded
  useEffect(() => {
    if (allTasks.length === 0) {
      fetchAllData();
    }
  }, [allTasks.length, fetchAllData]);

  // Derive values with useMemo to maintain referential stability
  const task = useMemo(
    () => allTasks.find(t => t.id === taskId),
    [allTasks, taskId]
  );

  // Get the last view (board or timeline) from localStorage, default to dashboard
  const backHref = useMemo(() => {
    if (typeof window === 'undefined') return '/dashboard';
    const lastView = localStorage.getItem('lastView');
    return lastView === 'board' ? '/board' : '/dashboard';
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-stone-500">Loading...</div>
      </div>
    );
  }

  if (!task) {
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
          Back to Tasks
        </Link>
      </div>

      {/* Task detail content */}
      <TaskDetailPanel task={task} />
    </div>
  );
}
