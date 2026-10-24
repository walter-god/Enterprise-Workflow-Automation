import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  FileText,
  DollarSign,
  UserCheck,
  Check
} from 'lucide-react';
import { ApprovalRequest } from '../types';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  onUpdateApproval: (updated: ApprovalRequest, auditNote?: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  onUpdateApproval,
}) => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalApproval, setActiveModalApproval] = useState<ApprovalRequest | null>(null);
  const [decisionAction, setDecisionAction] = useState<'approve' | 'reject' | 'clarify' | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  const filteredApprovals = approvals.filter((appr) => {
    const matchesFilter = filter === 'all' || appr.status === filter;
    const matchesSearch =
      appr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appr.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appr.vendor && appr.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      appr.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const pendingTotalAmount = approvals
    .filter((a) => a.status === 'pending' && a.amount)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleOpenDecision = (appr: ApprovalRequest, action: 'approve' | 'reject' | 'clarify') => {
    setActiveModalApproval(appr);
    setDecisionAction(action);
    setDecisionNote(
      action === 'approve'
        ? 'Verified against Q3 budget allocation. Compliant with SOX authorization schedule.'
        : action === 'reject'
        ? 'Invoice line items exceed agreed PO pricing schedule. Requested revised credit note.'
        : 'Please attach the signed statement of work from the vendor.'
    );
  };

  const handleConfirmDecision = () => {
    if (!activeModalApproval || !decisionAction) return;

    let updatedStatus: 'approved' | 'rejected' | 'clarification' = 'approved';
    if (decisionAction === 'reject') updatedStatus = 'rejected';
    if (decisionAction === 'clarify') updatedStatus = 'clarification';

    const updated: ApprovalRequest = {
      ...activeModalApproval,
      status: updatedStatus,
      decisionTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      decisionBy: activeModalApproval.assignedTo.name,
      notes: decisionNote,
    };

    onUpdateApproval(updated, decisionNote);
    setActiveModalApproval(null);
    setDecisionAction(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-y-auto">
      {/* Top Header & Metrics Strip */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Approvals Management Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Multi-tier governance inbox for spend threshold authorization and compliance sign-offs.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Pending Decisions
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {pendingCount} tasks
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Pending Value
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-indigo-600">
                ${pendingTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === 'approved'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === 'rejected'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({approvals.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vendor, title, or reviewer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="p-8 max-w-6xl mx-auto w-full space-y-4">
        {filteredApprovals.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              No Approvals Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no approvals matching this filter. New trigger events will appear here automatically.
            </p>
          </div>
        ) : (
          filteredApprovals.map((appr) => {
            const isPending = appr.status === 'pending';
            return (
              <div
                key={appr.id}
                className="bg-white border border-slate-200 rounded-xl p-6 transition-all shadow-xs hover:border-slate-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left Column: Metadata & Details */}
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-mono text-slate-400">{appr.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-slate-700">{appr.workflowName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{appr.priority} Priority</span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 leading-snug">
                        {appr.title}
                      </h2>
                    </div>

                    {/* Trigger Rule Warning */}
                    <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-lg text-xs text-amber-900">
                      <span className="font-semibold">Authorization Rule: </span>
                      <span>{appr.ruleTriggered}</span>
                    </div>

                    {/* Detailed Key-Value Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                      {Object.entries(appr.details).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-slate-400 block text-[11px]">{key}</span>
                          <span className="font-semibold font-mono text-slate-800">{String(value)}</span>
                        </div>
                      ))}
                    </div>

                    {appr.notes && (
                      <div className="text-xs text-slate-600 bg-slate-100/70 p-2.5 rounded-lg">
                        <span className="font-semibold text-slate-700">Audit Notes: </span>
                        <span>{appr.notes}</span>
                        {appr.decisionTimestamp && (
                          <span className="block mt-1 text-[11px] text-slate-400 font-mono">
                            Decided by {appr.decisionBy} at {appr.decisionTimestamp}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Assigned Reviewer & Action Buttons */}
                  <div className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l lg:pl-6 border-slate-100 flex flex-col justify-between space-y-4">
                    {/* Reviewer Profile */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Assigned Signer
                      </span>
                      <div className="flex items-center gap-3">
                        <img
                          src={appr.assignedTo.avatarUrl}
                          alt={appr.assignedTo.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-slate-900">{appr.assignedTo.name}</div>
                          <div className="text-slate-500 text-[11px]">{appr.assignedTo.role}</div>
                          <div className="text-slate-400 text-[10px] font-mono">{appr.assignedTo.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status or Action Buttons */}
                    <div>
                      {isPending ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenDecision(appr, 'approve')}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Authorize</span>
                            </button>
                            <button
                              onClick={() => handleOpenDecision(appr, 'reject')}
                              className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                          <button
                            onClick={() => handleOpenDecision(appr, 'clarify')}
                            className="w-full text-center py-1 text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                          >
                            Request Vendor Clarification
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-100 rounded-lg text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            {appr.status === 'approved' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600" />
                            )}
                            <span className="capitalize text-slate-800">
                              Status: {appr.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Immutable audit ledger record locked.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Decision Confirmation Modal */}
      {activeModalApproval && decisionAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Confirm {decisionAction === 'approve' ? 'Spend Authorization' : decisionAction === 'reject' ? 'Rejection' : 'Clarification Request'}
            </h3>
            <p className="text-xs text-slate-500">
              {activeModalApproval.title} · Signer: {activeModalApproval.assignedTo.name}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Audit Trail Statement & Justification
              </label>
              <textarea
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setActiveModalApproval(null);
                  setDecisionAction(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer ${
                  decisionAction === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : decisionAction === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
