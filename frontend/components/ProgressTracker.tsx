'use client';

import { Task, TaskStatus, STATUS_LABELS, STATUS_COLORS } from '@/lib/types';

interface ProgressTrackerProps {
  tasks: Task[];
}

const STATUS_ORDER: TaskStatus[] = ['done', 'in-progress', 'not-started'];

// Map tailwind classes to actual hex colors for SVG
const STATUS_HEX_COLORS: Record<TaskStatus, string> = {
  'not-started': '#9ca3af', // gray-400
  'in-progress': '#3b82f6', // blue-500
  'done': '#22c55e', // green-500
};

export function ProgressTracker({ tasks }: ProgressTrackerProps) {
  const total = tasks.length;
  
  const statusCounts: Record<TaskStatus, number> = {
    'not-started': tasks.filter(t => t.status === 'not-started').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    'done': tasks.filter(t => t.status === 'done').length,
  };

  // Calculate percentages for the donut chart
  const getPercentage = (status: TaskStatus) => {
    if (total === 0) return 0;
    return (statusCounts[status] / total) * 100;
  };

  // SVG donut chart parameters
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate stroke offsets for each segment
  const getSegmentProps = () => {
    const segments: { status: TaskStatus; offset: number; length: number }[] = [];
    let cumulativeOffset = 0;

    STATUS_ORDER.forEach(status => {
      const percentage = getPercentage(status);
      const length = (percentage / 100) * circumference;
      
      if (percentage > 0) {
        segments.push({
          status,
          offset: cumulativeOffset,
          length,
        });
      }
      
      cumulativeOffset += length;
    });

    return segments;
  };

  const segments = getSegmentProps();

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 min-w-[220px] flex flex-col items-center">
      {/* Donut Chart */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={strokeWidth}
          />
          
          {/* Segment circles - rendered in reverse order so first segment overlaps on top */}
          {[...segments].reverse().map(({ status, offset, length }) => (
            <circle
              key={status}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={STATUS_HEX_COLORS[status]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              className="transition-all duration-500"
            />
          ))}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-stone-800">{total}</span>
          <span className="text-sm text-stone-500">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 w-full space-y-2">
        {STATUS_ORDER.map(status => {
          const count = statusCounts[status];
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
          
          return (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STATUS_HEX_COLORS[status] }}
                />
                <span className="text-sm text-stone-600">{STATUS_LABELS[status]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-stone-800">{count}</span>
                <span className="text-xs text-stone-400">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
