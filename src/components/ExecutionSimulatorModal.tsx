import React, { useState } from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Bell, 
  ShieldCheck, 
  ArrowRight,
  Code
} from 'lucide-react';
import { Workflow, ApprovalRequest, ActivityLog } from '../types';
import { AVATARS } from '../data/mockData';

interface ExecutionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow;
  onExecutionComplete: (newLog: ActivityLog, newApproval?: ApprovalRequest) => void;
}

const PRESET_PAYLOADS = [
  {
    name: 'AWS Cloud Compute Invoice ($38,450.00 - Exceeds Cap)',
    description: 'Requires Eleanor Vance (CFO/VP Finance) approval due to exceeding the $10,000 cap.',
    data: {
      vendor: 'Amazon Web Services Inc.',
      invoice_amount: 38450.00,
      currency: 'USD',
      department: 'Cloud Infrastructure / SRE',
      po_number: 'PO-2026-9902',
      risk_score: 12,
      procedure_tier: 'Standard',
      hours_overdue: 0,
    },
  },
  {
    name: 'Figma Enterprise Subscription ($4,200.00 - Under Cap)',
    description: 'Under the $10k threshold; auto-clears without requiring executive manual review.',
    data: {
      vendor: 'Figma Inc.',
      invoice_amount: 4200.00,
      currency: 'USD',
      department: 'Product Design',
      po_number: 'PO-2026-8814',
      risk_score: 8,
      procedure_tier: 'Standard',
      hours_overdue: 0,
    },
  },
  {
    name: 'Apex Freight Supplier Credit Risk Shift (Risk Index: 78)',
    description: 'High risk rating trigger; routes to Marcus Thorne for sanctions compliance.',
    data: {
      vendor: 'Apex Logistics Global LLC',
      invoice_amount: 14200.00,
      currency: 'USD',
      department: 'Global Supply Chain',
      po_number: 'PO-2026-6641',
      risk_score: 78,
      procedure_tier: 'Tier-3',
      hours_overdue: 54,
    },
  },
];

export const ExecutionSimulatorModal: React.FC<ExecutionSimulatorModalProps> = ({
  isOpen,
  onClose,
  workflow,
  onExecutionComplete,
}) => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(PRESET_PAYLOADS[0].data, null, 2)
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [stepLogs, setStepLogs] = useState<
    Array<{ stepName: string; status: 'completed' | 'running' | 'waiting_approval' | 'skipped'; message: string; durationMs: number }>
  >([]);
  const [executionFinished, setExecutionFinished] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    setJsonInput(JSON.stringify(PRESET_PAYLOADS[idx].data, null, 2));
    setStepLogs([]);
    setCurrentStepIndex(-1);
    setExecutionFinished(false);
  };

  const handleRunExecution = async () => {
    let parsedPayload: Record<string, any> = {};
    try {
      parsedPayload = JSON.parse(jsonInput);
    } catch (e) {
      alert('Invalid JSON in payload. Please check formatting.');
      return;
    }

    setIsExecuting(true);
    setExecutionFinished(false);
    setStepLogs([]);
    setCurrentStepIndex(0);

    const logs: Array<{ stepName: string; status: 'completed' | 'running' | 'waiting_approval' | 'skipped'; message: string; durationMs: number }> = [];
    let requiresApproval = false;
    let approvalCreated: ApprovalRequest | undefined = undefined;
    const ruleEvals: Array<{ rule: string; result: boolean; evaluatedValue: string | number }> = [];

    // Step-by-step execution simulation
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      setCurrentStepIndex(i);

      // artificial microsecond step delay to simulate Java async worker pool execution
      await new Promise((res) => setTimeout(res, 500));

      const stepDuration = Math.floor(Math.random() * 45) + 15;

      if (step.type === 'trigger') {
        logs.push({
          stepName: step.name,
          status: 'completed',
          message: `Ingested payload for vendor: ${parsedPayload.vendor || 'Unknown'} (Amount: $${Number(parsedPayload.invoice_amount || 0).toLocaleString()})`,
          durationMs: stepDuration,
        });
      } else if (step.type === 'rule') {
        const rule = step.config.rule;
        let rulePassed = true;
        let evalVal: string | number = '';

        if (rule) {
          const val = parsedPayload[rule.field];
          evalVal = val !== undefined ? val : 'undefined';
          if (rule.operator === '>') {
            rulePassed = Number(val) > Number(rule.value);
          } else if (rule.operator === '<') {
            rulePassed = Number(val) < Number(rule.value);
          } else if (rule.operator === '==') {
            rulePassed = String(val) === String(rule.value);
          } else if (rule.operator === '!=') {
            rulePassed = String(val) !== String(rule.value);
          }

          ruleEvals.push({
            rule: `${rule.field} ${rule.operator} ${rule.value}`,
            result: rulePassed,
            evaluatedValue: evalVal,
          });
        }

        if (rulePassed) {
          requiresApproval = true;
          logs.push({
            stepName: step.name,
            status: 'completed',
            message: `Rule triggered: ${rule?.label || 'Condition evaluated true'}. Evaluation value: ${evalVal}. Escalation required.`,
            durationMs: stepDuration,
          });
        } else {
          requiresApproval = false;
          logs.push({
            stepName: step.name,
            status: 'completed',
            message: `Rule condition not met (Value: ${evalVal} did not trigger threshold). Auto-clear flow applied.`,
            durationMs: stepDuration,
          });
        }
      } else if (step.type === 'approval') {
        if (requiresApproval) {
          logs.push({
            stepName: step.name,
            status: 'waiting_approval',
            message: `Dispatched approval signature task to ${step.config.approverRole || 'Manager'} (${step.config.approverEmail || 'ops@internal'}). Pending reviewer sign-off.`,
            durationMs: stepDuration,
          });

          // Generate actual Approval object
          approvalCreated = {
            id: `appr-${Math.floor(1000 + Math.random() * 9000)}`,
            workflowId: workflow.id,
            workflowName: workflow.name,
            title: `${parsedPayload.vendor || 'Vendor'} Invoiced Item ($${Number(parsedPayload.invoice_amount || 0).toLocaleString()})`,
            requesterName: 'ERP Ingestion Daemon',
            requesterRole: 'Financial Operations Engine',
            requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
            amount: Number(parsedPayload.invoice_amount || 0),
            vendor: parsedPayload.vendor || 'Unknown Vendor',
            department: parsedPayload.department || 'Procurement',
            priority: Number(parsedPayload.invoice_amount || 0) > 30000 ? 'urgent' : 'high',
            status: 'pending',
            assignedTo: {
              name: 'Eleanor Vance',
              role: step.config.approverRole || 'VP Financial Operations',
              email: step.config.approverEmail || 'e.vance@enterprise-ops.internal',
              avatarUrl: AVATARS.financeLead,
            },
            ruleTriggered: `Amount $${Number(parsedPayload.invoice_amount || 0).toLocaleString()} exceeded approval rule threshold`,
            details: {
              'Vendor': parsedPayload.vendor || 'N/A',
              'PO #': parsedPayload.po_number || 'PO-2026-AUTO',
              'Department': parsedPayload.department || 'Finance',
              'Evaluated At': new Date().toLocaleTimeString(),
            },
            notes: 'Created via interactive workflow execution simulator.',
          };
        } else {
          logs.push({
            stepName: step.name,
            status: 'skipped',
            message: 'Manual review bypassed: spend amount did not exceed authorization ceiling.',
            durationMs: 2,
          });
        }
      } else if (step.type === 'report_gen') {
        logs.push({
          stepName: step.name,
          status: 'completed',
          message: `Generated SOX compliance summary ledger #${Math.floor(10000 + Math.random() * 90000)}. Exported to encrypted blob store.`,
          durationMs: stepDuration + 30,
        });
      } else if (step.type === 'notification') {
        logs.push({
          stepName: step.name,
          status: 'completed',
          message: `Dispatched alert to ${step.config.notificationRecipient || '#general'} via ${step.config.notificationChannel || 'Slack'}.`,
          durationMs: stepDuration,
        });
      }

      setStepLogs([...logs]);
    }

    setIsExecuting(false);
    setExecutionFinished(true);

    const totalDuration = logs.reduce((acc, curr) => acc + curr.durationMs, 0);

    const newActivityLog: ActivityLog = {
      id: `log-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      workflowId: workflow.id,
      workflowName: workflow.name,
      executionId: `exec-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString().slice(-4)}`,
      triggerSource: `Simulator: ${workflow.triggerConfig}`,
      status: requiresApproval ? 'pending_approval' : 'success',
      durationMs: totalDuration,
      initiatedBy: 'Workflow Simulation Engine',
      stepsExecuted: logs.filter((l) => l.status !== 'skipped').length,
      totalSteps: workflow.steps.length,
      summary: requiresApproval
        ? `Rule evaluated TRUE. Approval task created for ${parsedPayload.vendor} ($${Number(parsedPayload.invoice_amount || 0).toLocaleString()}).`
        : `Auto-cleared successfully in ${totalDuration}ms. No manual review threshold reached.`,
      payload: parsedPayload,
      ruleEvaluations: ruleEvals,
    };

    onExecutionComplete(newActivityLog, approvalCreated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Live Workflow Execution Sandbox
              </h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                Java Worker Pool
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Testing: <span className="font-semibold text-slate-700">{workflow.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Payload Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Sample Simulation Payload:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_PAYLOADS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                    selectedPresetIdx === idx
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-normal">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* JSON Payload Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">
                Incoming Trigger Payload (JSON):
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Editable before running
              </span>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={6}
              disabled={isExecuting}
              className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Execution Progression Log */}
          {stepLogs.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Engine Execution Trace
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {stepLogs.reduce((acc, l) => acc + l.durationMs, 0)}ms total
                </span>
              </div>

              <div className="space-y-2">
                {stepLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-start gap-2.5">
                      {log.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {log.status === 'waiting_approval' && (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      {log.status === 'skipped' && (
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{log.stepName}</span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                              log.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : log.status === 'waiting_approval'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {log.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-0.5">{log.message}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {log.durationMs}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {executionFinished && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    Workflow Simulation Completed Successfully
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    An audit entry has been posted to Activity Logs, and state is preserved.
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Thread: worker-pool-async-04 · Spring Boot 3.3
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isExecuting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleRunExecution}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecuting ? 'Executing Steps...' : 'Run Simulation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
