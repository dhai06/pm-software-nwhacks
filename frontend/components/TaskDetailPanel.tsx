'use client';

import { format } from 'date-fns';
import { Calendar, CircleDot, Hash, List, Clock, FileText } from 'lucide-react';
import { Task, STATUS_LABELS, STATUS_COLORS } from '@/lib/types';
import { useProjectStore } from '@/lib/store';

interface TaskDetailPanelProps {
  task: Task;
}

export function TaskDetailPanel({ task }: TaskDetailPanelProps) {
  const dependentTask = useProjectStore(state => state.getDependentTask(task.id));
  const statusConfig = STATUS_COLORS[task.status];

  const formatDateRange = (start: Date, end: Date) => {
    return `${format(start, 'MM/dd/yyyy')} → ${format(end, 'MM/dd/yyyy')}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{task.name}</h1>
      </div>

      {/* Properties list */}
      <div className="space-y-4">
        {/* Timeline */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <Calendar size={16} />
            <span className="text-sm">Timeline</span>
          </div>
          <span className="text-sm text-gray-700">
            {formatDateRange(task.startDate, task.targetCompletionDate)}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <CircleDot size={16} />
            <span className="text-sm">Status</span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-sm ${statusConfig.bg} ${statusConfig.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {STATUS_LABELS[task.status]}
          </span>
        </div>

        {/* Buffer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <Hash size={16} />
            <span className="text-sm">Buffer</span>
          </div>
          <span className="text-sm text-gray-400">
            {task.bufferTime > 0 ? `${task.bufferTime} days` : 'Empty'}
          </span>
        </div>

        {/* Depends On */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <List size={16} />
            <span className="text-sm">Depends On</span>
          </div>
          <span className="text-sm text-gray-400">
            {dependentTask ? dependentTask.name : 'Empty'}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <Clock size={16} />
            <span className="text-sm">Duration</span>
          </div>
          <span className="text-sm text-gray-400">
            {task.duration > 0 ? `${task.duration} days` : 'Empty'}
          </span>
        </div>

        {/* Task ID */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <FileText size={16} />
            <span className="text-sm">Task ID</span>
          </div>
          <span className="text-sm text-gray-400">
            {task.id.replace('task-', '')}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8" />

      {/* Description */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">Task Description</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
      </div>
    </div>
  );
}
