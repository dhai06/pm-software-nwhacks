'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Project, Task } from '@/lib/types';
import { useProjectStore } from '@/lib/store';
import { useMemo } from 'react';
import { X } from 'lucide-react';

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
      <div className="bg-stone-100 border border-stone-200 rounded-lg p-4 h-40 hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer flex flex-col">
        <div className="flex-1">
          {/* Completion info at top */}
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>{completionPercentage}% complete</span>
            <span>{formatDate(completionDate)}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        <h3 className="text-sm font-medium text-stone-800">{project.name}</h3>
      </div>
    </Link>
  );
}

export function NewProjectCard() {
  const router = useRouter();
  const createProject = useProjectStore(state => state.createProject);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const newProjectId = createProject(projectName.trim(), projectDescription.trim());
    setProjectName('');
    setProjectDescription('');
    setIsModalOpen(false);
    router.push(`/projects/${newProjectId}`);
  };

  const handleCancel = () => {
    setProjectName('');
    setProjectDescription('');
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-stone-100 border border-stone-200 border-dashed rounded-lg p-4 h-40 hover:border-stone-300 hover:bg-stone-200 transition-all cursor-pointer flex items-center justify-center"
      >
        <span className="text-sm text-stone-400">+ New Project</span>
      </button>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-stone-50 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h2 className="text-lg font-semibold text-stone-900">Create New Project</h2>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-stone-200 rounded transition-colors"
              >
                <X size={20} className="text-stone-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-stone-700 mb-2">
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-800"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-stone-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-800 resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projectName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
