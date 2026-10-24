import React from 'react';

interface TopBarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenSimulator: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeView, onNavigate, onOpenSimulator }) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => onNavigate('workflows')}
        className="cursor-pointer text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors"
      >
        Operon Flow
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onNavigate('workflows')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'workflows' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Workflows
        </button>
        <button
          onClick={() => onNavigate('approvals')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'approvals' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Approvals
        </button>
        <button
          onClick={() => onNavigate('jobs')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'jobs' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Scheduled Jobs
        </button>
        <button
          onClick={() => onNavigate('reports')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'reports' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => onNavigate('logs')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'logs' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Activity Logs
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenSimulator}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs active:scale-[0.98]"
        >
          Run Workflow Simulator
        </button>
      </div>
    </header>
  );
};
