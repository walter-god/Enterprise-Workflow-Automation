import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { ApprovalsView } from './components/ApprovalsView';
import { ScheduledJobsView } from './components/ScheduledJobsView';
import { ReportsView } from './components/ReportsView';
import { ActivityLogsView } from './components/ActivityLogsView';
import { JavaEngineView } from './components/JavaEngineView';
import { BillingPlansView } from './components/BillingPlansView';
import { ExecutionSimulatorModal } from './components/ExecutionSimulatorModal';
import { 
  INITIAL_WORKFLOWS, 
  INITIAL_APPROVALS, 
  INITIAL_SCHEDULED_JOBS, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_REPORTS, 
  SAAS_PLANS 
} from './data/mockData';
import { 
  Workflow, 
  ApprovalRequest, 
  ScheduledJob, 
  ActivityLog, 
  GeneratedReport, 
  SaaSPlan, 
  Industry 
} from './types';

export default function App() {
  // Navigation & Filter States
  const [activeView, setActiveView] = useState<string>('workflows');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | 'all'>('finops');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(INITIAL_WORKFLOWS[0].id);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Core Data States with localStorage persistence
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('operon_workflows');
    return saved ? JSON.parse(saved) : INITIAL_WORKFLOWS;
  });

  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => {
    const saved = localStorage.getItem('operon_approvals');
    return saved ? JSON.parse(saved) : INITIAL_APPROVALS;
  });

  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>(() => {
    const saved = localStorage.getItem('operon_jobs');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULED_JOBS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('operon_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [reports, setReports] = useState<GeneratedReport[]>(() => {
    const saved = localStorage.getItem('operon_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  // SaaS Billing State
  const [activePlanId, setActivePlanId] = useState<string>('growth');
  const [executionsUsed, setExecutionsUsed] = useState<number>(8420);

  const activePlan = SAAS_PLANS.find((p) => p.id === activePlanId) || SAAS_PLANS[1];

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem('operon_workflows', JSON.stringify(workflows));
  }, [workflows]);

  useEffect(() => {
    localStorage.setItem('operon_approvals', JSON.stringify(approvals));
  }, [approvals]);

  useEffect(() => {
    localStorage.setItem('operon_jobs', JSON.stringify(scheduledJobs));
  }, [scheduledJobs]);

  useEffect(() => {
    localStorage.setItem('operon_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('operon_reports', JSON.stringify(reports));
  }, [reports]);

  // Handlers
  const handleUpdateWorkflow = (updated: Workflow) => {
    setWorkflows((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleUpdateApproval = (updated: ApprovalRequest, auditNote?: string) => {
    setApprovals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

    // Emit Activity Log for the decision
    const newLog: ActivityLog = {
      id: `log-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      workflowId: updated.workflowId,
      workflowName: updated.workflowName,
      executionId: `exec-appr-${updated.id}`,
      triggerSource: 'Manual Sign-off Portal',
      status: updated.status === 'approved' ? 'success' : 'failed',
      durationMs: 84,
      initiatedBy: `${updated.assignedTo.name} (${updated.assignedTo.role})`,
      stepsExecuted: 4,
      totalSteps: 5,
      summary: `Signer ${updated.assignedTo.name} marked ${updated.title} as ${updated.status.toUpperCase()}. Note: ${auditNote || 'Decision confirmed'}`,
      payload: {
        approvalId: updated.id,
        decision: updated.status,
        signer: updated.assignedTo.name,
        amount: updated.amount,
        auditNote: auditNote,
      },
      ruleEvaluations: [
        { rule: 'Manager Authorization Granted', result: updated.status === 'approved', evaluatedValue: updated.status },
      ],
    };

    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateScheduledJob = (updated: ScheduledJob) => {
    setScheduledJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  };

  const handleCreateScheduledJob = (newJob: ScheduledJob) => {
    setScheduledJobs((prev) => [newJob, ...prev]);
  };

  const handleTriggerJobNow = (job: ScheduledJob) => {
    setExecutionsUsed((prev) => prev + 1);

    // Update job metrics
    const updatedJob: ScheduledJob = {
      ...job,
      lastRun: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      successCount: job.successCount + 1,
    };
    handleUpdateScheduledJob(updatedJob);

    // Create Activity Log
    const newLog: ActivityLog = {
      id: `log-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      workflowId: job.workflowId,
      workflowName: job.workflowName,
      executionId: `exec-cron-${job.id}-${Date.now().toString().slice(-4)}`,
      triggerSource: `Scheduled Runner: ${job.name} (${job.cronExpression})`,
      status: 'success',
      durationMs: job.avgDurationMs + Math.floor(Math.random() * 20),
      initiatedBy: 'Cron Daemon (Java 21 Scheduler)',
      stepsExecuted: 4,
      totalSteps: 4,
      summary: `Manual cron trigger: ${job.targetTask}. Completed with 0 exceptions.`,
      payload: {
        jobId: job.id,
        cron: job.cronExpression,
        runType: 'On-Demand Manual Trigger',
      },
      ruleEvaluations: [
        { rule: 'Cron Trigger Tick', result: true, evaluatedValue: job.cronExpression },
      ],
    };

    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const handleCreateReport = (newReport: GeneratedReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  const handleSelectPlan = (plan: SaaSPlan) => {
    setActivePlanId(plan.id);
  };

  const handleExecutionComplete = (newLog: ActivityLog, newApproval?: ApprovalRequest) => {
    setExecutionsUsed((prev) => prev + 1);
    setActivityLogs((prev) => [newLog, ...prev]);
    if (newApproval) {
      setApprovals((prev) => [newApproval, ...prev]);
    }
  };

  const currentWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Strict 3-Zone Top Navigation Bar */}
      <TopBar
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Workspace Sidebar Navigation */}
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          pendingApprovalsCount={pendingApprovalsCount}
          selectedIndustry={selectedIndustry}
          onSelectIndustry={(ind) => setSelectedIndustry(ind)}
          activePlanName={activePlan.name}
          executionsUsed={executionsUsed}
          executionsLimit={activePlan.monthlyExecutionsIncluded}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {activeView === 'workflows' && (
            <WorkflowCanvas
              workflows={workflows}
              selectedWorkflowId={selectedWorkflowId}
              onSelectWorkflow={(id) => setSelectedWorkflowId(id)}
              onUpdateWorkflow={handleUpdateWorkflow}
              onRunSimulator={(wf) => {
                setSelectedWorkflowId(wf.id);
                setIsSimulatorOpen(true);
              }}
              selectedIndustry={selectedIndustry}
            />
          )}

          {activeView === 'approvals' && (
            <ApprovalsView
              approvals={approvals}
              onUpdateApproval={handleUpdateApproval}
            />
          )}

          {activeView === 'jobs' && (
            <ScheduledJobsView
              jobs={scheduledJobs}
              workflows={workflows}
              onUpdateJob={handleUpdateScheduledJob}
              onCreateJob={handleCreateScheduledJob}
              onTriggerJobNow={handleTriggerJobNow}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView
              reports={reports}
              workflows={workflows}
              onCreateReport={handleCreateReport}
            />
          )}

          {activeView === 'logs' && (
            <ActivityLogsView logs={activityLogs} />
          )}

          {activeView === 'java-engine' && (
            <JavaEngineView />
          )}

          {activeView === 'billing' && (
            <BillingPlansView
              currentPlanId={activePlanId}
              onSelectPlan={handleSelectPlan}
              executionsUsed={executionsUsed}
            />
          )}
        </main>
      </div>

      {/* Execution Simulator Modal */}
      {isSimulatorOpen && (
        <ExecutionSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          workflow={currentWorkflow}
          onExecutionComplete={handleExecutionComplete}
        />
      )}
    </div>
  );
}
