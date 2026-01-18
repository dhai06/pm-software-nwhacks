'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import { Calendar, CircleDot, Hash, List, Clock, FileText, Save, Check, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Task, TaskStatus, STATUS_LABELS, STATUS_COLORS } from '@/lib/types';
import { useProjectStore } from '@/lib/store';

interface TaskDetailPanelProps {
  task: Task;
}

export function TaskDetailPanel({ task }: TaskDetailPanelProps) {
  const router = useRouter();
  const dependentTask = useProjectStore(state => state.getDependentTask(task.id));
  const updateTask = useProjectStore(state => state.updateTask);
  const deleteTask = useProjectStore(state => state.deleteTask);

  // Local state for form fields
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [startDate, setStartDate] = useState(format(task.startDate, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(task.targetCompletionDate, 'yyyy-MM-dd'));
  const [buffer, setBuffer] = useState(task.bufferTime.toString());
  const [duration, setDuration] = useState(task.duration.toString());
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Ref to track if duration was manually changed (to prevent useEffect from overwriting)
  const isManualDurationChange = useRef(false);

  // Sync local state when task prop changes
  useEffect(() => {
    setName(task.name);
    setDescription(task.description);
    setStatus(task.status);
    setStartDate(format(task.startDate, 'yyyy-MM-dd'));
    setEndDate(format(task.targetCompletionDate, 'yyyy-MM-dd'));
    setBuffer(task.bufferTime.toString());
    setDuration(task.duration.toString());
    setHasChanges(false);
  }, [task]);

  // Calculate duration when dates change (but not when duration was manually changed)
  useEffect(() => {
    if (isManualDurationChange.current) {
      isManualDurationChange.current = false;
      return;
    }
    // Parse as local time to avoid timezone issues
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const days = differenceInDays(end, start);
      if (days >= 0) {
        setDuration(days.toString());
      }
    }
  }, [startDate, endDate]);

  // Update end date when duration changes manually
  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration);
    setHasChanges(true);
    const days = parseInt(newDuration);
    if (!isNaN(days) && days >= 0) {
      // Mark as manual change so useEffect doesn't overwrite duration
      isManualDurationChange.current = true;
      // Parse as local time to avoid timezone issues
      const start = new Date(startDate + 'T00:00:00');
      const newEnd = addDays(start, days);
      setEndDate(format(newEnd, 'yyyy-MM-dd'));
    }
  };

  // Mark changes for all field updates
  const markChanged = useCallback(() => {
    setHasChanges(true);
    setSaveStatus('idle');
  }, []);

  // Save handler
  const handleSave = useCallback(() => {
    setSaveStatus('saving');

    // Parse dates as local time (not UTC) by appending time component
    const parsedStartDate = new Date(startDate + 'T00:00:00');
    const parsedEndDate = new Date(endDate + 'T00:00:00');

    // Validation: ensure end date is not before start date
    if (parsedEndDate < parsedStartDate) {
      alert('End date cannot be before start date');
      setSaveStatus('idle');
      return;
    }

    updateTask(task.id, {
      name,
      description,
      status,
      startDate: parsedStartDate,
      targetCompletionDate: parsedEndDate,
      bufferTime: parseInt(buffer) || 0,
      duration: parseInt(duration) || 0,
    });

    setHasChanges(false);
    setSaveStatus('saved');

    // Reset save status after 2 seconds
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [task.id, name, description, status, startDate, endDate, buffer, duration, updateTask]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      await deleteTask(task.id);
      router.push('/dashboard');
    }
  }, [task.id, deleteTask, router]);

  const statusConfig = STATUS_COLORS[status];

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Header with editable name */}
      <div className="mb-8">
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); markChanged(); }}
          className="text-3xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1 w-full"
          placeholder="Task name"
        />
      </div>

      {/* Properties list */}
      <div className="space-y-4">
        {/* Timeline - Start Date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <Calendar size={16} />
            <span className="text-sm">Start Date</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); markChanged(); }}
            className="text-sm text-gray-700 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Timeline - End Date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <Calendar size={16} />
            <span className="text-sm">End Date</span>
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); markChanged(); }}
            min={startDate}
            className="text-sm text-gray-700 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <CircleDot size={16} />
            <span className="text-sm">Status</span>
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as TaskStatus); markChanged(); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusConfig.bg} ${statusConfig.text} border-stone-200`}
          >
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Buffer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <Hash size={16} />
            <span className="text-sm">Buffer</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={buffer}
              onChange={(e) => { setBuffer(e.target.value); markChanged(); }}
              min="0"
              className="w-20 text-sm text-gray-700 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-400">days</span>
          </div>
        </div>

        {/* Depends On (read-only for now) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <List size={16} />
            <span className="text-sm">Depends On</span>
          </div>
          <span className="text-sm text-gray-400 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5">
            {dependentTask ? dependentTask.name : 'None'}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <Clock size={16} />
            <span className="text-sm">Duration</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={duration}
              onChange={(e) => handleDurationChange(e.target.value)}
              min="0"
              className="w-20 text-sm text-gray-700 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-400">days</span>
          </div>
        </div>

        {/* Task ID (read-only) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-gray-500">
            <FileText size={16} />
            <span className="text-sm">Task ID</span>
          </div>
          <span className="text-sm text-gray-400">
            {task.id}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8" />

      {/* Description */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">Task Description</h2>
        <textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); markChanged(); }}
          rows={4}
          className="w-full text-sm text-gray-700 leading-relaxed bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Add a description..."
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between items-center">
        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <Trash2 size={16} />
          Delete Task
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges || saveStatus === 'saving'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            hasChanges
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : saveStatus === 'saved'
              ? 'bg-green-500 text-white'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {saveStatus === 'saved' ? (
            <>
              <Check size={16} />
              Saved
            </>
          ) : (
            <>
              <Save size={16} />
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
