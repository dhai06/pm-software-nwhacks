'use client';

import { useProjectStore } from '@/lib/store';
import { ProjectCard, NewProjectCard } from './ProjectCard';
import { AccountMenu } from './AccountMenu';

export function Dashboard() {
  const projects = useProjectStore(state => state.projects);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Projects</h1>
          <AccountMenu />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <NewProjectCard />
        </div>
      </div>
    </div>
  );
}
