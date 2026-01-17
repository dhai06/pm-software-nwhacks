'use client';

import { useProjectStore } from '@/lib/store';
import { ProjectCard, NewProjectCard } from './ProjectCard';

export function Dashboard() {
  const projects = useProjectStore(state => state.projects);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Projects</h1>
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
