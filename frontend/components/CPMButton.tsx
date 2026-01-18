'use client';

import { useProjectStore } from '@/lib/store';

export function CPMButton() {
  const { autoScheduleTasks, isSchedulingCPM, tasks } = useProjectStore();

  const handleClick = async () => {
    try {
      await autoScheduleTasks();
    } catch (error) {
      console.error('Failed to auto-schedule tasks:', error);
    }
  };

  // Don't show button if there are no tasks
  if (tasks.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      disabled={isSchedulingCPM}
      className="fixed bottom-8 right-8 flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
      title="Calculate Critical Path and auto-schedule tasks"
    >
      {isSchedulingCPM ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Scheduling...</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          <span>Auto-Schedule (CPM)</span>
        </>
      )}
    </button>
  );
}
