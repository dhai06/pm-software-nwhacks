'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useProjectStore } from '@/lib/store';
import { ProjectHeader } from '@/components/ProjectHeader';
import { BoardView } from '@/components/BoardView';

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const { id } = use(params);
  const project = useProjectStore(state => state.getProject(id));
  const tasks = useProjectStore(state => state.getTasksByProject(id));

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProjectHeader project={project} />
      <BoardView projectId={id} tasks={tasks} />
    </div>
  );
}
