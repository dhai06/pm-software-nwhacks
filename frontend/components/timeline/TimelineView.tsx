'use client';

import React from 'react';

export function TimelineView() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-background-dark border-r border-border-dark flex flex-col shrink-0 z-20">
        {/* App Logo Area */}
        <div className="p-4 flex items-center gap-3">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">network_node</span>
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">PathFinder</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Project Context */}
          <div className="flex flex-col gap-1">
            <div className="px-3 py-2">
              <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Project Nav
              </h2>
              <p className="text-white text-sm font-medium mt-1 truncate">
                Infrastructure Overhaul
              </p>
            </div>

            <nav className="space-y-1">
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-surface-dark hover:text-white transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-sm font-medium">Dashboard</span>
              </a>

              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20 text-primary transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined">account_tree</span>
                <span className="text-sm font-medium">Timeline View</span>
              </a>

              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-surface-dark hover:text-white transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined">splitscreen</span>
                <span className="text-sm font-medium">WBS Structure</span>
              </a>

              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-surface-dark hover:text-white transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined">group</span>
                <span className="text-sm font-medium">Resource Map</span>
              </a>

              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-surface-dark hover:text-white transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined">bar_chart</span>
                <span className="text-sm font-medium">Reports</span>
              </a>
            </nav>
          </div>

          {/* Project Health Widget */}
          <div className="bg-surface-dark rounded-xl p-4 border border-border-dark shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase">
              Project Health
            </h3>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Critical Tasks</span>
              <span className="text-sm font-bold text-red-400">5 Active</span>
            </div>

            <div className="w-full bg-gray-700 h-1.5 rounded-full mb-4">
              <div className="bg-red-500 h-1.5 rounded-full w-[35%]" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Completion</span>
              <span className="text-sm font-bold text-primary">42%</span>
            </div>

            <div className="w-full bg-gray-700 h-1.5 rounded-full">
              <div className="bg-primary h-1.5 rounded-full w-[42%]" />
            </div>
          </div>
        </div>

        {/* Footer / Settings */}
        <div className="p-4 border-t border-border-dark">
          <a
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-surface-dark hover:text-white transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f151b]">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-border-dark flex items-center justify-between px-6 bg-background-dark z-10">
          <div className="flex items-center text-sm">
            <span className="text-gray-500 hover:text-gray-300 cursor-pointer">
              Projects
            </span>
            <span className="material-symbols-outlined text-gray-600 text-sm mx-2">
              chevron_right
            </span>
            <span className="text-white font-medium">Infrastructure Overhaul</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-[20px] group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                className="bg-surface-dark border-none rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-primary w-64 placeholder-gray-500 transition-all"
                placeholder="Search tasks..."
                type="text"
              />
            </div>

            <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-surface-dark">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border border-background-dark" />
            </button>

            <div
              className="size-8 rounded-full bg-cover bg-center border border-gray-600 cursor-pointer"
              aria-label="User avatar"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDFMW6Eq0u-MUdkPu1QjpOmfCjwxnzVRU96pQzv67OtktHhlOIzSlfJAV5U2fyahoLMgWVupSEaIj8zAI9MDmEdhw0IqbtsWXL_SGHsoxvkVQZzFLSNZoQBSgv6UFaqvKtran_ir0X10O0s2_F17MkjOifRlkcu45wxWlc109l_XoWMDWEqJkihh0qIig5LiuNA4u9yBAHsd7eajtm1rAZf9uMxZTjN-Z7t1P8nhu5raUlO3yAX_dltj4NUZtwVYcnglO9CoAFsZcMC')",
              }}
            />
          </div>
        </header>

        {/* Dashboard Control Bar */}
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark bg-background-dark">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Timeline</h2>

            <div className="flex items-center gap-3 pl-6 border-l border-border-dark">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Scenario
              </label>
              <div className="relative">
                <select className="appearance-none bg-surface-dark border border-gray-700 hover:border-gray-600 rounded-md py-1.5 pl-3 pr-8 text-sm text-white font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors">
                  <option>Current Plan (Live)</option>
                  <option>Best Case Analysis</option>
                  <option>Worst Case Analysis</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-surface-dark p-1 rounded-lg border border-border-dark">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-white text-sm font-medium shadow-sm transition-all">
                <span className="material-symbols-outlined text-[18px]">
                  calendar_month
                </span>
                Timeline
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-400 hover:text-white text-sm font-medium transition-colors hover:bg-background-dark">
                <span className="material-symbols-outlined text-[18px]">
                  dashboard
                </span>
                Board
              </button>
            </div>

            <div className="h-6 w-px bg-border-dark mx-2" />

            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Task
            </button>
          </div>
        </div>

        {/* Time Scale Controls */}
        <div className="h-12 border-b border-border-dark flex items-center justify-between px-6 bg-[#161e27]">
          <div className="flex gap-1">
            <button className="px-3 py-1 text-xs font-medium text-white bg-surface-dark border border-gray-700 rounded-l hover:bg-gray-700 transition-colors">
              Day
            </button>
            <button className="px-3 py-1 text-xs font-medium text-white bg-primary border border-primary z-10">
              Week
            </button>
            <button className="px-3 py-1 text-xs font-medium text-white bg-surface-dark border border-gray-700 rounded-r hover:bg-gray-700 transition-colors">
              Month
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-white transition-colors p-1">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="text-sm text-white font-medium w-32 text-center">
              Aug 2024
            </span>
            <button className="text-gray-400 hover:text-white transition-colors p-1">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">
                filter_list
              </span>
              Filter
            </button>
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">
                settings
              </span>
              Settings
            </button>
          </div>
        </div>

        {/* Gantt Chart Canvas */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Sticky Task List Column */}
          <div className="w-80 flex-shrink-0 bg-background-dark border-r border-border-dark z-10 flex flex-col shadow-xl">
            <div className="h-10 border-b border-border-dark flex items-center px-4 bg-[#161e27]">
              <span className="text-xs font-bold text-gray-400 uppercase w-full">
                Task Name
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase w-20 text-right">
                Dur.
              </span>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-12 border-b border-border-dark flex items-center px-4 hover:bg-surface-dark group cursor-pointer transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="size-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-300 group-hover:text-white font-medium truncate">
                    1. Site Preparation
                  </span>
                </div>
                <span className="text-xs text-gray-500 w-20 text-right">5d</span>
              </div>

              <div className="h-12 border-b border-border-dark flex items-center px-4 hover:bg-surface-dark group cursor-pointer bg-primary/5 border-l-2 border-l-primary transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="size-2 rounded-full bg-primary" />
                  <span className="text-sm text-white font-medium truncate">
                    2. Foundation Pouring
                  </span>
                </div>
                <span className="text-xs text-gray-400 w-20 text-right">8d</span>
              </div>

              <div className="h-12 border-b border-border-dark flex items-center px-4 hover:bg-surface-dark group cursor-pointer bg-red-500/10 border-l-2 border-l-red-500 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="material-symbols-outlined text-red-500 text-[16px]">
                    priority_high
                  </span>
                  <span className="text-sm text-red-200 font-medium truncate">
                    3. Structural Steel
                  </span>
                </div>
                <span className="text-xs text-red-400 w-20 text-right">12d</span>
              </div>

              <div className="h-12 border-b border-border-dark flex items-center px-4 hover:bg-surface-dark group cursor-pointer transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="size-2 rounded-full bg-orange-500" />
                  <span className="text-sm text-gray-300 group-hover:text-white font-medium truncate">
                    4. Electrical Grid
                  </span>
                </div>
                <span className="text-xs text-orange-400 font-bold w-20 text-right">
                  BLOCKED
                </span>
              </div>

              <div className="h-12 border-b border-border-dark flex items-center px-4 hover:bg-surface-dark group cursor-pointer transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="size-2 rounded-full bg-gray-500" />
                  <span className="text-sm text-gray-300 group-hover:text-white font-medium truncate">
                    5. Plumbing
                  </span>
                </div>
                <span className="text-xs text-gray-500 w-20 text-right">6d</span>
              </div>

              <div className="h-12 border-b border-border-dark flex items-center px-4 hover:bg-surface-dark group cursor-pointer transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="size-2 rounded-full bg-gray-500" />
                  <span className="text-sm text-gray-300 group-hover:text-white font-medium truncate">
                    6. Inspection
                  </span>
                </div>
                <span className="text-xs text-gray-500 w-20 text-right">2d</span>
              </div>
            </div>
          </div>

          {/* Timeline & Visualization Area */}
          <div className="flex-1 overflow-auto bg-[#0f151b] relative custom-scrollbar">
            <div className="h-10 flex border-b border-border-dark min-w-[1200px] sticky top-0 bg-[#161e27] z-20 shadow-md">
              <div className="flex">
                <div className="w-[280px] border-r border-border-dark flex flex-col justify-center px-2">
                  <span className="text-xs font-bold text-gray-400">Week 31</span>
                  <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                    <span>01</span>
                    <span>02</span>
                    <span>03</span>
                    <span>04</span>
                    <span>05</span>
                    <span>06</span>
                    <span>07</span>
                  </div>
                </div>

                <div className="w-[280px] border-r border-border-dark flex flex-col justify-center px-2 bg-primary/5">
                  <span className="text-xs font-bold text-white">Week 32</span>
                  <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                    <span>08</span>
                    <span>09</span>
                    <span>10</span>
                    <span>11</span>
                    <span>12</span>
                    <span>13</span>
                    <span>14</span>
                  </div>
                </div>

                <div className="w-[280px] border-r border-border-dark flex flex-col justify-center px-2">
                  <span className="text-xs font-bold text-gray-400">Week 33</span>
                  <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                    <span>15</span>
                    <span>16</span>
                    <span>17</span>
                    <span>18</span>
                    <span>19</span>
                    <span>20</span>
                    <span>21</span>
                  </div>
                </div>

                <div className="w-[280px] border-r border-border-dark flex flex-col justify-center px-2">
                  <span className="text-xs font-bold text-gray-400">Week 34</span>
                  <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                    <span>22</span>
                    <span>23</span>
                    <span>24</span>
                    <span>25</span>
                    <span>26</span>
                    <span>27</span>
                    <span>28</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-[1200px] relative h-[calc(100%-40px)]">
              <div className="absolute inset-0 gantt-grid opacity-20 pointer-events-none" />

              <div className="absolute top-0 bottom-0 left-[380px] w-px bg-red-500 z-0 opacity-70">
                <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm absolute -top-0 -translate-x-1/2 shadow-sm">
                  TODAY
                </div>
              </div>

              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <marker
                    id="arrowhead-gray"
                    markerHeight="4"
                    markerWidth="6"
                    orient="auto"
                    refX="5"
                    refY="2"
                  >
                    <polygon fill="#64748b" points="0 0, 6 2, 0 4" />
                  </marker>

                  <marker
                    id="arrowhead-red"
                    markerHeight="4"
                    markerWidth="6"
                    orient="auto"
                    refX="5"
                    refY="2"
                  >
                    <polygon fill="#ef4444" points="0 0, 6 2, 0 4" />
                  </marker>
                </defs>

                <path
                  d="M 220 24 L 230 24 L 230 72 L 240 72"
                  fill="none"
                  markerEnd="url(#arrowhead-gray)"
                  stroke="#64748b"
                  strokeDasharray="4"
                  strokeWidth="1.5"
                />

                <path
                  className="drop-shadow-md shadow-red-500"
                  d="M 500 72 L 510 72 L 510 120 L 520 120"
                  fill="none"
                  markerEnd="url(#arrowhead-red)"
                  stroke="#ef4444"
                  strokeWidth="2"
                />

                <path
                  d="M 880 120 L 890 120 L 890 168 L 900 168"
                  fill="none"
                  markerEnd="url(#arrowhead-red)"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
              </svg>

              <div className="flex flex-col pt-[1px]">
                <div className="h-12 w-full relative">
                  <div className="absolute top-3 left-[20px] w-[200px] h-6 bg-gray-600 rounded-md border border-gray-500 flex items-center px-2 shadow-sm cursor-pointer hover:bg-gray-500 transition-colors">
                    <span className="text-[10px] text-white font-medium">
                      100%
                    </span>
                  </div>
                </div>

                <div className="h-12 w-full relative">
                  <div className="absolute top-3 left-[240px] w-[260px] h-6 bg-primary rounded-md border border-blue-400 shadow-[0_4px_10px_rgba(25,127,230,0.3)] flex items-center px-2 group cursor-pointer hover:brightness-110 transition-all">
                    <span className="text-[10px] text-white font-bold">50%</span>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 size-2 bg-white rounded-full border border-primary hidden group-hover:block shadow-sm" />
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 size-2 bg-white rounded-full border border-primary hidden group-hover:block shadow-sm" />
                  </div>
                </div>

                <div className="h-12 w-full relative">
                  <div className="absolute top-3 left-[520px] w-[360px] h-6 bg-red-600 rounded-md border border-red-400 glow-red flex items-center justify-between px-2 z-10 cursor-pointer hover:brightness-110 transition-all">
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                      Critical Path
                    </span>
                    <span className="material-symbols-outlined text-white text-[14px]">
                      bolt
                    </span>
                  </div>
                </div>

                <div className="h-12 w-full relative">
                  <div className="absolute top-3 left-[900px] w-[200px] h-6 bg-[#161e27] rounded-md border-2 border-orange-500 flex items-center px-2 shadow-sm relative overflow-hidden cursor-help">
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, #f97316 0, #f97316 1px, transparent 0, transparent 50%)',
                        backgroundSize: '10px 10px',
                      }}
                    />
                    <span className="material-symbols-outlined text-orange-500 text-[14px] mr-1 z-10">
                      block
                    </span>
                    <span className="text-[10px] text-orange-400 font-bold z-10">
                      Waiting on Permit
                    </span>
                  </div>
                </div>

                <div className="h-12 w-full relative">
                  <div className="absolute top-3 left-[940px] w-[180px] h-6 bg-[#2a3441] rounded-md border border-gray-600 flex items-center px-2 hover:bg-gray-700 transition-colors">
                    <span className="text-[10px] text-gray-300">Scheduled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
