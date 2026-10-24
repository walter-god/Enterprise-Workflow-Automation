import React from 'react';
import { 
  GitBranch, 
  CheckSquare, 
  Clock, 
  FileText, 
  ListFilter, 
  Cpu, 
  CreditCard,
  Building2,
  Stethoscope,
  Kanban
} from 'lucide-react';
import { Industry } from '../types';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  pendingApprovalsCount: number;
  selectedIndustry: Industry | 'all';
  onSelectIndustry: (ind: Industry | 'all') => void;
  activePlanName: string;
  executionsUsed: number;
  executionsLimit: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  pendingApprovalsCount,
  selectedIndustry,
  onSelectIndustry,
  activePlanName,
  executionsUsed,
  executionsLimit,
}) => {
  const usagePercentage = Math.min(100, Math.round((executionsUsed / executionsLimit) * 100));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-57px)]">
      {/* Industry Vertical Specialization Filter */}
      <div className="p-4 border-b border-slate-100">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Industry Vertical Focus
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onSelectIndustry('finops')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors text-left cursor-pointer ${
              selectedIndustry === 'finops'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">FinOps & Procurement</span>
            </span>
            <span className="text-[10px] opacity-75 font-mono">Flagship</span>
          </button>

          <button
            onClick={() => onSelectIndustry('healthcare')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors text-left cursor-pointer ${
              selectedIndustry === 'healthcare'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Stethoscope className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Healthcare Intake</span>
            </span>
          </button>

          <button
            onClick={() => onSelectIndustry('tech_delivery')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors text-left cursor-pointer ${
              selectedIndustry === 'tech_delivery'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Kanban className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Project Delivery SLA</span>
            </span>
          </button>

          <button
            onClick={() => onSelectIndustry('all')}
            className={`w-full flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors text-left cursor-pointer ${
              selectedIndustry === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            All Workflows
          </button>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Operations Platform
        </div>

        <button
          onClick={() => onNavigate('workflows')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeView === 'workflows'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Workflows & Rules</span>
        </button>

        <button
          onClick={() => onNavigate('approvals')}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeView === 'approvals'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Approvals Inbox</span>
          </span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 font-mono">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate('jobs')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeView === 'jobs'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Scheduled Jobs</span>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeView === 'reports'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Automated Reports</span>
        </button>

        <button
          onClick={() => onNavigate('logs')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeView === 'logs'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ListFilter className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Activity & Audit Logs</span>
        </button>

        <div className="pt-4 px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Architecture & SaaS
        </div>

        <button
          onClick={() => onNavigate('java-engine')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeView === 'java-engine'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Java Engine & SDK</span>
        </button>

        <button
          onClick={() => onNavigate('billing')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeView === 'billing'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Plans & Usage</span>
        </button>
      </nav>

      {/* Monthly Usage & Plan Summary Widget */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-800">{activePlanName}</span>
          <button 
            onClick={() => onNavigate('billing')} 
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            Upgrade
          </button>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1.5">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
          <span>{executionsUsed.toLocaleString()} execs</span>
          <span>{executionsLimit.toLocaleString()} limit</span>
        </div>
      </div>
    </aside>
  );
};
