'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LayoutGrid, GanttChart, Home } from 'lucide-react';
import { Project } from '@/lib/types';

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
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Home className="text-gray-600" size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
        <p className="text-gray-500 text-sm ml-11">{project.description}</p>
      </div>

      {/* Navigation tabs */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Link
            href={`/projects/${project.id}/board`}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
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
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
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
          className="flex items-center gap-1 px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          New
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}
