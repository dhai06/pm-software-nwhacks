'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LayoutGrid, GanttChart, Home, X, Plus, ListTodo } from 'lucide-react';
import { Project, TaskStatus, STATUS_LABELS } from '@/lib/types';
import { AccountMenu } from './AccountMenu';
import { useProjectStore } from '@/lib/store';
import { format, addDays } from 'date-fns';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isBoard = pathname.includes('/board');
  const isTimeline = !isBoard;

  const createTask = useProjectStore(state => state.createTask);
  const createDependency = useProjectStore(state => state.createDependency);
  const allTasks = useProjectStore(state => state.tasks);

  // Get tasks for this project (for dependency dropdown)
  const projectTasks = useMemo(
    () => allTasks.filter(t => t.projectId === project.id),
    [allTasks, project.id]
  );

  // Modal state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('not-started');
  const [taskStartDate, setTaskStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [taskDuration, setTaskDuration] = useState<string>('7');
  const [taskBufferTime, setTaskBufferTime] = useState<string>('');
  const [taskDependency, setTaskDependency] = useState<string>('');

  // Parse duration as number, default to 1 if empty or invalid
  const durationValue = parseInt(taskDuration) || 1;

  // Calculate end date from start date + duration
  const calculatedEndDate = useMemo(() => {
    const start = new Date(taskStartDate);
    return addDays(start, durationValue);
  }, [taskStartDate, durationValue]);

  const handleNewTask = () => {
    setIsDropdownOpen(false);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    // If bufferTime is empty, default to 1
    const finalBufferTime = taskBufferTime === '' ? 1 : parseInt(taskBufferTime);
    // Ensure duration is at least 1
    const finalDuration = Math.max(1, durationValue);

    const newTaskId = createTask(project.id, {
      name: taskName.trim(),
      description: taskDescription.trim(),
      status: taskStatus,
      startDate: new Date(taskStartDate),
      targetCompletionDate: calculatedEndDate,
      duration: finalDuration,
      bufferTime: finalBufferTime,
    });

    // Create dependency if one was selected
    if (taskDependency) {
      createDependency(newTaskId, taskDependency);
    }

    // Reset form
    setTaskName('');
    setTaskDescription('');
    setTaskStatus('not-started');
    setTaskStartDate(format(new Date(), 'yyyy-MM-dd'));
    setTaskDuration('7');
    setTaskBufferTime('');
    setTaskDependency('');
    setIsTaskModalOpen(false);

    // Navigate to the new task
    router.push(`/projects/${project.id}/tasks/${newTaskId}`);
  };

  const handleTaskCancel = () => {
    setTaskName('');
    setTaskDescription('');
    setTaskStatus('not-started');
    setTaskStartDate(format(new Date(), 'yyyy-MM-dd'));
    setTaskDuration('7');
    setTaskBufferTime('');
    setTaskDependency('');
    setIsTaskModalOpen(false);
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

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            New
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-stone-50 border border-stone-200 rounded-lg shadow-lg z-30 py-1 min-w-[160px]">
                <button
                  onClick={handleNewTask}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-800 hover:bg-stone-100 transition-colors text-left"
                >
                  <ListTodo size={16} className="text-stone-400" />
                  New Task
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-stone-50 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h2 className="text-lg font-semibold text-stone-900">Create New Task</h2>
              <button
                onClick={handleTaskCancel}
                className="p-1 hover:bg-stone-200 rounded transition-colors"
              >
                <X size={20} className="text-stone-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleTaskSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="task-name" className="block text-sm font-medium text-stone-700 mb-2">
                  Task Name
                </label>
                <input
                  id="task-name"
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Enter task name"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-800"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="task-description" className="block text-sm font-medium text-stone-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-start" className="block text-sm font-medium text-stone-700 mb-2">
                    Start Date
                  </label>
                  <input
                    id="task-start"
                    type="date"
                    value={taskStartDate}
                    onChange={(e) => setTaskStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-800"
                  />
                </div>
                <div>
                  <label htmlFor="task-duration" className="block text-sm font-medium text-stone-700 mb-2">
                    Duration (days)
                  </label>
                  <input
                    id="task-duration"
                    type="number"
                    min={1}
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                    onBlur={() => {
                      const val = parseInt(taskDuration);
                      if (!val || val < 1) setTaskDuration('1');
                    }}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-end" className="block text-sm font-medium text-stone-700 mb-2">
                    End Date
                  </label>
                  <input
                    id="task-end"
                    type="date"
                    value={format(calculatedEndDate, 'yyyy-MM-dd')}
                    disabled
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-100 text-stone-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-stone-400 mt-1">Auto-calculated from start date + duration</p>
                </div>
                <div>
                  <label htmlFor="task-buffer" className="block text-sm font-medium text-stone-700 mb-2">
                    Buffer Time (days)
                  </label>
                  <input
                    id="task-buffer"
                    type="number"
                    min={0}
                    value={taskBufferTime}
                    onChange={(e) => setTaskBufferTime(e.target.value)}
                    placeholder="Leave empty for auto"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-800"
                  />
                  <p className="text-xs text-stone-400 mt-1">Empty = defaults to 1</p>
                </div>
              </div>

              <div>
                <label htmlFor="task-dependency" className="block text-sm font-medium text-stone-700 mb-2">
                  Depends On (optional)
                </label>
                <select
                  id="task-dependency"
                  value={taskDependency}
                  onChange={(e) => setTaskDependency(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-800"
                >
                  <option value="">No dependency</option>
                  {projectTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="task-status" className="block text-sm font-medium text-stone-700 mb-2">
                  Status
                </label>
                <select
                  id="task-status"
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-800"
                >
                  {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTaskCancel}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!taskName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
