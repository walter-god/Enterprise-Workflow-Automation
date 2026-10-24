import React, { useState } from 'react';
import { 
  ListFilter, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  Code,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending_approval' | 'failed' | 'warning'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(logs[0]?.id || null);

  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesSearch =
      log.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.executionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.initiatedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `activity_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Execution ID', 'Workflow', 'Trigger Source', 'Status', 'Duration (ms)', 'Initiated By', 'Summary'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.executionId}"`,
      `"${l.workflowName}"`,
      `"${l.triggerSource}"`,
      `"${l.status}"`,
      l.durationMs,
      `"${l.initiatedBy}"`,
      `"${l.summary.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Activity & Audit Logs
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Immutable execution trace recording trigger sources, evaluated rules, and approval outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'success'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setStatusFilter('pending_approval')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'pending_approval'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waiting Approval
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'failed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Failed
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search execution ID, payload..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-8 max-w-6xl mx-auto w-full">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="w-8 px-4 py-3"></th>
                  <th className="px-4 py-3 font-semibold">Timestamp (UTC)</th>
                  <th className="px-4 py-3 font-semibold">Workflow</th>
                  <th className="px-4 py-3 font-semibold">Trigger Source</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Duration</th>
                  <th className="px-4 py-3 font-semibold text-right">Steps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-400 text-center">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-600 inline" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 inline" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {log.workflowName}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500 truncate max-w-xs">
                          {log.triggerSource}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              log.status === 'success'
                                ? 'bg-emerald-50 text-emerald-700'
                                : log.status === 'pending_approval'
                                ? 'bg-amber-50 text-amber-800'
                                : log.status === 'failed'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {log.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                          {log.durationMs}ms
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                          {log.stepsExecuted}/{log.totalSteps}
                        </td>
                      </tr>

                      {/* Expanded Trace Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-slate-50/70 border-b border-slate-200">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-800">
                                  Summary: {log.summary}
                                </span>
                                <span className="text-slate-400 font-mono">
                                  ID: {log.executionId} · Initiator: {log.initiatedBy}
                                </span>
                              </div>

                              {/* Rule Evaluations Trace */}
                              {log.ruleEvaluations && log.ruleEvaluations.length > 0 && (
                                <div>
                                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                    Evaluated Business Rules:
                                  </span>
                                  <div className="space-y-1.5">
                                    {log.ruleEvaluations.map((ruleItem, rIdx) => (
                                      <div
                                        key={rIdx}
                                        className="flex items-center justify-between text-xs font-mono bg-white p-2 rounded border border-slate-200"
                                      >
                                        <div className="flex items-center gap-2">
                                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                          <span className="text-slate-800 font-semibold">{ruleItem.rule}</span>
                                          <span className="text-slate-400">→ evaluated with:</span>
                                          <span className="text-slate-600 font-medium">{String(ruleItem.evaluatedValue)}</span>
                                        </div>
                                        <span
                                          className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                            ruleItem.result
                                              ? 'bg-emerald-50 text-emerald-700'
                                              : 'bg-slate-100 text-slate-600'
                                          }`}
                                        >
                                          {ruleItem.result ? 'Evaluated True' : 'Evaluated False'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Input Payload JSON View */}
                              <div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                  Trigger Payload Context:
                                </span>
                                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
