'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LayoutGrid, GanttChart } from 'lucide-react';
import { Project } from '@/lib/types';
import { ProjectIcon } from './ProjectIcon';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const pathname = usePathname();
  const isBoard = pathname.includes('/board');
  const isTimeline = !isBoard;

  const handleNewClick = () => {
    alert('Feature coming soon');
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-6 py-4">
        {/* Project title */}
        <div className="flex items-center gap-3 mb-1">
          <ProjectIcon size="md" />
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
        <p className="text-gray-500 text-sm ml-11">{project.description}</p>
      </div>

      {/* Navigation tabs */}
      <div className="px-6 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Link
            href={`/projects/${project.id}/board`}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              isBoard
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid size={16} />
            Board
          </Link>
          <Link
            href={`/projects/${project.id}`}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              isTimeline
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <GanttChart size={16} />
            Timeline
          </Link>
        </div>

        <button
          onClick={handleNewClick}
          className="flex items-center gap-1 px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors mb-2"
        >
          New
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}
