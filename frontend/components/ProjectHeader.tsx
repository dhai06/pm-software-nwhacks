'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LayoutGrid, GanttChart, Home } from 'lucide-react';
import { Project } from '@/lib/types';
import { AccountMenu } from './AccountMenu';

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
    <div className="border-b border-stone-200 bg-stone-50">
      <div className="px-6 py-4">
        {/* Project title */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
            >
              <Home className="text-stone-400" size={18} />
            </Link>
            <h1 className="text-2xl font-bold text-stone-900">{project.name}</h1>
          </div>
          <AccountMenu />
        </div>
        <p className="text-stone-400 text-sm ml-11">{project.description}</p>
      </div>

      {/* Navigation tabs */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Link
            href={`/projects/${project.id}/board`}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isBoard
                ? 'bg-stone-100 text-stone-900'
                : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <LayoutGrid size={16} />
            Board
          </Link>
          <Link
            href={`/projects/${project.id}`}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isTimeline
                ? 'bg-stone-100 text-stone-900'
                : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <GanttChart size={16} />
            Timeline
          </Link>
        </div>

        <button
          onClick={handleNewClick}
          className="flex items-center gap-1 px-4 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          New
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}
