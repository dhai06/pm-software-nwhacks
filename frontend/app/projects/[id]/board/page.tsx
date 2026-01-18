'use client';

import { use, useMemo, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useProjectStore } from '@/lib/store';
import { ProjectHeader } from '@/components/ProjectHeader';
import { BoardView } from '@/components/BoardView';

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const { id } = use(params);

  // Store that we're on board view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`project_${id}_lastView`, 'board');
    }
  }, [id]);

  // Select raw state to avoid creating new objects on each render
  const projects = useProjectStore(state => state.projects);
  const allTasks = useProjectStore(state => state.tasks);

  // Derive values with useMemo to maintain referential stability
  const project = useMemo(
    () => projects.find(p => p.id === id),
    [projects, id]
  );

  const tasks = useMemo(
    () => allTasks.filter(t => t.projectId === id),
    [allTasks, id]
  );

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
