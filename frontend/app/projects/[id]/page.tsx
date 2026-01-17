'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useProjectStore } from '@/lib/store';
import { ProjectHeader } from '@/components/ProjectHeader';
import { TimelineView } from '@/components/TimelineView';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const project = useProjectStore(state => state.getProject(id));
  const tasks = useProjectStore(state => state.getTasksByProject(id));
  const dependencies = useProjectStore(state =>
    state.dependencies.filter(d =>
      tasks.some(t => t.id === d.taskId) || tasks.some(t => t.id === d.dependsOnTaskId)
    )
  );

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProjectHeader project={project} />
      <div className="flex-1">
        <TimelineView projectId={id} tasks={tasks} dependencies={dependencies} />
      </div>
    </div>
  );
}
