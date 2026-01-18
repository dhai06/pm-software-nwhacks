'use client';

import Link from 'next/link';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-40 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer flex flex-col">
        <div className="flex-1" />
        <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
      </div>
    </Link>
  );
}

export function NewProjectCard() {
  const handleClick = () => {
    alert('Feature coming soon');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-4 h-40 hover:border-gray-300 hover:bg-gray-100 transition-all cursor-pointer flex items-center justify-center"
    >
      <span className="text-sm text-gray-500">+ New page</span>
    </button>
  );
}
