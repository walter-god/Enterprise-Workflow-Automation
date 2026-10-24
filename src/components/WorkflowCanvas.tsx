import React, { useState } from 'react';
import { 
  GitBranch, 
  Play, 
  Settings2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Bell, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Workflow, WorkflowStep, WorkflowRule, Industry } from '../types';

interface WorkflowCanvasProps {
  workflows: Workflow[];
  selectedWorkflowId: string;
  onSelectWorkflow: (id: string) => void;
  onUpdateWorkflow: (updated: Workflow) => void;
  onRunSimulator: (workflow: Workflow) => void;
  selectedIndustry: Industry | 'all';
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflows,
  selectedWorkflowId,
  onSelectWorkflow,
  onUpdateWorkflow,
  onRunSimulator,
  selectedIndustry,
}) => {
  const filteredWorkflows = workflows.filter(
    (w) => selectedIndustry === 'all' || w.industry === selectedIndustry
  );

  const currentWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || filteredWorkflows[0] || workflows[0];
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    currentWorkflow?.steps[0]?.id || null
  );
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [nameInput, setNameInput] = useState(currentWorkflow?.name || '');
  const [descInput, setDescInput] = useState(currentWorkflow?.description || '');

  const activeStep = currentWorkflow?.steps.find((s) => s.id === selectedStepId) || currentWorkflow?.steps[0];

  const handleToggleStatus = () => {
    if (!currentWorkflow) return;
    const nextStatus = currentWorkflow.status === 'active' ? 'paused' : 'active';
    onUpdateWorkflow({
      ...currentWorkflow,
      status: nextStatus,
    });
  };

  const handleUpdateStepRule = (field: string, operator: WorkflowRule['operator'], value: string | number) => {
    if (!currentWorkflow || !activeStep) return;
    const updatedSteps = currentWorkflow.steps.map((step) => {
      if (step.id === activeStep.id) {
        return {
          ...step,
          config: {
            ...step.config,
            rule: {
              id: step.config.rule?.id || `rule-${Date.now()}`,
              field,
              operator,
              value,
              label: `${field} ${operator} ${value}`,
            },
          },
        };
      }
      return step;
    });

    onUpdateWorkflow({
      ...currentWorkflow,
      steps: updatedSteps,
    });
  };

  const handleUpdateApprover = (email: string, role: string) => {
    if (!currentWorkflow || !activeStep) return;
    const updatedSteps = currentWorkflow.steps.map((step) => {
      if (step.id === activeStep.id) {
        return {
          ...step,
          config: {
            ...step.config,
            approverEmail: email,
            approverRole: role,
          },
        };
      }
      return step;
    });

    onUpdateWorkflow({
      ...currentWorkflow,
      steps: updatedSteps,
    });
  };

  const handleUpdateNotification = (channel: 'slack' | 'email' | 'webhook', recipient: string) => {
    if (!currentWorkflow || !activeStep) return;
    const updatedSteps = currentWorkflow.steps.map((step) => {
      if (step.id === activeStep.id) {
        return {
          ...step,
          config: {
            ...step.config,
            notificationChannel: channel,
            notificationRecipient: recipient,
          },
        };
      }
      return step;
    });

    onUpdateWorkflow({
      ...currentWorkflow,
      steps: updatedSteps,
    });
  };

  const handleAddStep = () => {
    if (!currentWorkflow) return;
    const newStepNumber = currentWorkflow.steps.length + 1;
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: `Step ${newStepNumber}: Notification Alert`,
      type: 'notification',
      description: 'Dispatches custom alert or audit hook upon workflow progression.',
      order: newStepNumber,
      config: {
        notificationChannel: 'slack',
        notificationRecipient: '#finance-alerts',
      },
    };
    onUpdateWorkflow({
      ...currentWorkflow,
      steps: [...currentWorkflow.steps, newStep],
    });
    setSelectedStepId(newStep.id);
  };

  const handleDeleteStep = (stepId: string) => {
    if (!currentWorkflow || currentWorkflow.steps.length <= 1) return;
    const updatedSteps = currentWorkflow.steps.filter((s) => s.id !== stepId);
    onUpdateWorkflow({
      ...currentWorkflow,
      steps: updatedSteps,
    });
    if (selectedStepId === stepId) {
      setSelectedStepId(updatedSteps[0]?.id || null);
    }
  };

  const handleSaveMetadata = () => {
    if (!currentWorkflow) return;
    onUpdateWorkflow({
      ...currentWorkflow,
      name: nameInput,
      description: descInput,
    });
    setIsEditingMetadata(false);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger':
        return <Play className="w-4 h-4 text-emerald-600" />;
      case 'rule':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case 'approval':
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      case 'report_gen':
        return <FileSpreadsheet className="w-4 h-4 text-purple-600" />;
      case 'notification':
        return <Bell className="w-4 h-4 text-blue-600" />;
      default:
        return <GitBranch className="w-4 h-4 text-slate-600" />;
    }
  };

  if (!currentWorkflow) {
    return (
      <div className="p-8 text-center text-slate-500">
        No workflows found matching the current filter.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-y-auto">
      {/* Top Workflow Switcher Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Selected Workflow:
            </span>
            <div className="flex items-center gap-2">
              <select
                value={currentWorkflow.id}
                onChange={(e) => onSelectWorkflow(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {filteredWorkflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name} ({wf.industry.toUpperCase()})
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setNameInput(currentWorkflow.name);
                  setDescInput(currentWorkflow.description);
                  setIsEditingMetadata(!isEditingMetadata);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                title="Edit workflow details"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleStatus}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                currentWorkflow.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Status: {currentWorkflow.status === 'active' ? 'Active & Listening' : 'Paused'}
            </button>

            <button
              onClick={() => onRunSimulator(currentWorkflow)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Execution</span>
            </button>
          </div>
        </div>

        {/* Workflow Metadata or Inline Edit */}
        {isEditingMetadata ? (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Workflow Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description & Objective</label>
              <textarea
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                rows={2}
                className="w-full text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingMetadata(false)}
                className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMetadata}
                className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-500">
            <p className="max-w-3xl leading-relaxed text-slate-600">
              {currentWorkflow.description}
            </p>
            <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums text-slate-500">
              <span>{currentWorkflow.totalRuns.toLocaleString()} runs</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 font-semibold">{currentWorkflow.successRate}% pass</span>
              <span aria-hidden="true">·</span>
              <span>Trigger: {currentWorkflow.triggerType}</span>
            </div>
          </div>
        )}
      </div>

      {/* Industry Specialized Advantage Banner */}
      <div className="px-8 pt-6">
        <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                Specialized Vertical Engine
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-300">
                {currentWorkflow.industry === 'finops' ? 'FinOps & Invoice Operations' : currentWorkflow.industry === 'healthcare' ? 'HIPAA Prior-Auth & Intake' : 'Client Delivery SLA'}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Generic automation tools lack domain-aware rule evaluation, hierarchical multi-tier financial sign-offs, and automated reconciliation sheets. Operon provides built-in PO variance logic and audit-ready SOX compliance out of the box.
            </p>
          </div>
          <button
            onClick={() => onRunSimulator(currentWorkflow)}
            className="px-4 py-2 text-xs font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            Test Live Scenario
          </button>
        </div>
      </div>

      {/* Canvas Workspace: Flowchart Steps + Step Inspector */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Workflow Flowchart */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Execution Sequence ({currentWorkflow.steps.length} Steps)
            </h2>
            <button
              onClick={handleAddStep}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Action Step</span>
            </button>
          </div>

          <div className="space-y-3 relative">
            {currentWorkflow.steps.map((step, idx) => {
              const isSelected = selectedStepId === step.id;
              return (
                <div key={step.id} className="relative">
                  {/* Step Card */}
                  <div
                    onClick={() => setSelectedStepId(step.id)}
                    className={`p-4 bg-white border rounded-xl transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          {getStepIcon(step.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium text-slate-400">
                              0{idx + 1}
                            </span>
                            <h3 className="text-sm font-semibold text-slate-900">
                              {step.name}
                            </h3>
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                              {step.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {step.description}
                          </p>

                          {/* Inline Configuration Highlights */}
                          {step.config.rule && (
                            <div className="mt-2 text-xs font-mono bg-amber-50 text-amber-900 px-2.5 py-1 rounded border border-amber-200/60 inline-flex items-center gap-1.5">
                              <span className="font-semibold">Rule:</span>
                              <span>{step.config.rule.label}</span>
                            </div>
                          )}

                          {step.config.approverRole && (
                            <div className="mt-2 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                              <span className="text-slate-400">Assigned Reviewer:</span>
                              <span className="font-semibold text-slate-800">{step.config.approverRole}</span>
                              <span className="text-slate-400">({step.config.approverEmail})</span>
                            </div>
                          )}

                          {step.config.notificationRecipient && (
                            <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5">
                              <span className="text-slate-400">Dispatches to:</span>
                              <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                {step.config.notificationRecipient}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {currentWorkflow.steps.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStep(step.id);
                          }}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-md transition-colors cursor-pointer shrink-0"
                          title="Remove step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Flow connector line */}
                  {idx < currentWorkflow.steps.length - 1 && (
                    <div className="flex justify-center my-1.5">
                      <div className="w-0.5 h-3 bg-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Step Inspector & Rule Configuration Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sticky top-20">
          {activeStep ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    Step Inspector
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeStep.name}
                  </h3>
                </div>
                <div className="p-2 bg-slate-100 rounded-lg">
                  {getStepIcon(activeStep.type)}
                </div>
              </div>

              {/* Conditional Rule Editor */}
              {activeStep.type === 'rule' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500 leading-relaxed">
                    Configure the logical decision gate evaluated by the Java rule engine. If the payload meets this condition, execution branches to approval or report generation.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Data Field to Evaluate
                    </label>
                    <input
                      type="text"
                      defaultValue={activeStep.config.rule?.field || 'invoice_amount'}
                      onChange={(e) => {
                        handleUpdateStepRule(
                          e.target.value,
                          activeStep.config.rule?.operator || '>',
                          activeStep.config.rule?.value ?? 10000
                        );
                      }}
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Comparison Operator
                      </label>
                      <select
                        defaultValue={activeStep.config.rule?.operator || '>'}
                        onChange={(e) => {
                          handleUpdateStepRule(
                            activeStep.config.rule?.field || 'invoice_amount',
                            e.target.value as WorkflowRule['operator'],
                            activeStep.config.rule?.value ?? 10000
                          );
                        }}
                        className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value=">">Greater than (&gt;)</option>
                        <option value="<">Less than (&lt;)</option>
                        <option value="==">Exact Match (==)</option>
                        <option value="!=">Not Equal (!=)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Threshold / Value
                      </label>
                      <input
                        type="text"
                        defaultValue={String(activeStep.config.rule?.value ?? '10000')}
                        onChange={(e) => {
                          const val = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                          handleUpdateStepRule(
                            activeStep.config.rule?.field || 'invoice_amount',
                            activeStep.config.rule?.operator || '>',
                            val
                          );
                        }}
                        className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <span className="font-semibold text-slate-700">Active Rule Preview:</span>
                    <p className="font-mono text-indigo-700 font-medium">
                      payload.{activeStep.config.rule?.field || 'invoice_amount'} {activeStep.config.rule?.operator || '>'} {String(activeStep.config.rule?.value ?? '10000')}
                    </p>
                  </div>
                </div>
              )}

              {/* Approval Step Config */}
              {activeStep.type === 'approval' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500 leading-relaxed">
                    Dispatches a signature task to the specified managerial role with audit log recording and reminder escalation.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Approver Role Title
                    </label>
                    <input
                      type="text"
                      defaultValue={activeStep.config.approverRole || 'VP Financial Operations'}
                      onChange={(e) =>
                        handleUpdateApprover(
                          activeStep.config.approverEmail || 'e.vance@enterprise-ops.internal',
                          e.target.value
                        )
                      }
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Reviewer Enterprise Email
                    </label>
                    <input
                      type="email"
                      defaultValue={activeStep.config.approverEmail || 'e.vance@enterprise-ops.internal'}
                      onChange={(e) =>
                        handleUpdateApprover(
                          e.target.value,
                          activeStep.config.approverRole || 'VP Financial Operations'
                        )
                      }
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 leading-relaxed">
                    <strong>Audit Guarantee:</strong> Every decision is stamped with user signature, IP address, and cryptographic SHA-256 hash for SOX & HIPAA compliance.
                  </div>
                </div>
              )}

              {/* Notification Step Config */}
              {activeStep.type === 'notification' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Notification Delivery Channel
                    </label>
                    <select
                      defaultValue={activeStep.config.notificationChannel || 'slack'}
                      onChange={(e) =>
                        handleUpdateNotification(
                          e.target.value as 'slack' | 'email' | 'webhook',
                          activeStep.config.notificationRecipient || '#finance-alerts'
                        )
                      }
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="slack">Slack Incoming Webhook</option>
                      <option value="email">Enterprise SMTP / SendGrid</option>
                      <option value="webhook">Custom REST Webhook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Recipient / Target Channel
                    </label>
                    <input
                      type="text"
                      defaultValue={activeStep.config.notificationRecipient || '#finance-alerts'}
                      onChange={(e) =>
                        handleUpdateNotification(
                          activeStep.config.notificationChannel || 'slack',
                          e.target.value
                        )
                      }
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Report Generation Step Config */}
              {activeStep.type === 'report_gen' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500 leading-relaxed">
                    Automatically computes budget variance and compiles a timestamped report saved to the internal document repository.
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg text-xs text-purple-900 space-y-1">
                    <span className="font-semibold">Selected Template:</span>
                    <p className="font-medium">
                      {activeStep.config.reportTemplate === 'spend_variance'
                        ? 'SOX Financial Spend Variance Ledger'
                        : activeStep.config.reportTemplate === 'vendor_sla'
                        ? 'Vendor Compliance & Sanctions Certification'
                        : 'Sprint Milestone Velocity Audit'}
                    </p>
                  </div>
                </div>
              )}

              {/* Trigger Step Config */}
              {activeStep.type === 'trigger' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500 leading-relaxed">
                    Trigger entry point. Receives incoming JSON payloads or cron ticks and initializes the execution thread context.
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
                    <div className="text-slate-400 font-sans font-medium">Listening Endpoint:</div>
                    <div className="text-indigo-600 font-semibold">{currentWorkflow.triggerConfig}</div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">ID: {activeStep.id}</span>
                <button
                  onClick={() => onRunSimulator(currentWorkflow)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Test Step Execution
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a step in the workflow to inspect its configuration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
