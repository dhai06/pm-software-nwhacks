'use client';

import Link from 'next/link';
import { Project, Task } from '@/lib/types';
import { useProjectStore } from '@/lib/store';
import { useMemo } from 'react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const allTasks = useProjectStore(state => state.tasks);
  
  const { completionPercentage, completionDate } = useMemo(() => {
    const projectTasks = allTasks.filter(t => t.projectId === project.id);
    
    if (projectTasks.length === 0) {
      return { completionPercentage: 0, completionDate: null };
    }
    
    // Calculate completion percentage
    const doneTasks = projectTasks.filter(t => t.status === 'done').length;
    const percentage = Math.round((doneTasks / projectTasks.length) * 100);
    
    // Find the final completion date (last day of last task)
    const lastDate = projectTasks.reduce((latest: Date | null, task: Task) => {
      const taskEnd = new Date(task.targetCompletionDate);
      if (!latest || taskEnd > latest) {
        return taskEnd;
      }
      return latest;
    }, null);
    
    return { completionPercentage: percentage, completionDate: lastDate };
  }, [allTasks, project.id]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'No tasks';
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-40 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer flex flex-col">
        <div className="flex-1">
          {/* Completion info at top */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{completionPercentage}% complete</span>
            <span>{formatDate(completionDate)}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
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
