'use client';

import { use } from 'react';
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
  const task = useProjectStore(state => state.getTask(taskId));
  const project = useProjectStore(state => state.getProject(id));

  if (!task || !project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back navigation */}
      <div className="border-b border-gray-200 px-6 py-4">
        <Link
          href={`/projects/${id}`}
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
