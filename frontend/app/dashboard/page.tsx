'use client';

import { useEffect } from 'react';
import { useProjectStore } from '@/lib/store';
import { AppHeader } from '@/components/AppHeader';
import { TimelineView } from '@/components/TimelineView';

export default function DashboardPage() {
  const tasks = useProjectStore(state => state.tasks);
  const dependencies = useProjectStore(state => state.dependencies);
  const isLoading = useProjectStore(state => state.isLoading);
  const error = useProjectStore(state => state.error);
  const fetchAllData = useProjectStore(state => state.fetchAllData);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-stone-500">Loading tasks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />
      <div className="flex-1">
        <TimelineView tasks={tasks} dependencies={dependencies} />
      </div>
    </div>
  );
}
