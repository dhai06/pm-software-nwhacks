'use client';

import { use, useMemo, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useProjectStore } from '@/lib/store';
import { ProjectHeader } from '@/components/ProjectHeader';
import { TimelineView } from '@/components/TimelineView';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);

  // Store that we're on timeline view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`project_${id}_lastView`, 'timeline');
    }
  }, [id]);
  
  // Select raw state to avoid creating new objects on each render
  const projects = useProjectStore(state => state.projects);
  const allTasks = useProjectStore(state => state.tasks);
  const allDependencies = useProjectStore(state => state.dependencies);
  
  // Derive values with useMemo to maintain referential stability
  const project = useMemo(
    () => projects.find(p => p.id === id),
    [projects, id]
  );
  
  const tasks = useMemo(
    () => allTasks.filter(t => t.projectId === id),
    [allTasks, id]
  );
  
  const dependencies = useMemo(() => {
    const taskIds = new Set(tasks.map(t => t.id));
    return allDependencies.filter(
      d => taskIds.has(d.taskId) || taskIds.has(d.dependsOnTaskId)
    );
  }, [allDependencies, tasks]);

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
