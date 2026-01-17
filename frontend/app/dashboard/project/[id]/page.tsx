/**
 * Project Detail Page
 * Main view with Timeline/Board switcher
 */

'use client';

import React from 'react';
import { TimelineView } from '@/components/timeline/TimelineView';
import { KanbanView } from '@/components/kanban/KanbanView';
import { useUIStore } from '@/lib/stores/uiStore';

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { currentView, setCurrentView } = useUIStore();

  return (
    <div className="h-screen flex flex-col p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Project View</h1>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setCurrentView('timeline')}
            className={`px-4 py-2 rounded ${
              currentView === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setCurrentView('kanban')}
            className={`px-4 py-2 rounded ${
              currentView === 'kanban' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Board
          </button>
        </div>
      </header>

      <main className="flex-1">
        {currentView === 'timeline' ? <TimelineView /> : <KanbanView />}
      </main>
    </div>
  );
}
