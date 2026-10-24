export type Industry = 'finops' | 'healthcare' | 'tech_delivery';

export type TriggerType = 'webhook' | 'schedule' | 'threshold_rule' | 'form_submission';

export type StepType = 'trigger' | 'rule' | 'approval' | 'notification' | 'report_gen' | 'integration';

export interface WorkflowRule {
  id: string;
  field: string;
  operator: '>' | '<' | '==' | '!=' | 'contains' | 'in_range';
  value: string | number;
  label: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  description: string;
  config: {
    rule?: WorkflowRule;
    approverRole?: string;
    approverEmail?: string;
    notificationChannel?: 'slack' | 'email' | 'webhook';
    notificationRecipient?: string;
    reportTemplate?: 'spend_variance' | 'vendor_sla' | 'project_milestone';
    integrationEndpoint?: string;
  };
  order: number;
}

export interface Workflow {
  id: string;
  name: string;
  industry: Industry;
  description: string;
  triggerType: TriggerType;
  triggerConfig: string;
  status: 'active' | 'paused' | 'draft';
  steps: WorkflowStep[];
  totalRuns: number;
  successRate: number;
  lastRunAt: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  workflowId: string;
  workflowName: string;
  title: string;
  requesterName: string;
  requesterRole: string;
  requestedAt: string;
  amount?: number;
  vendor?: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'clarification';
  assignedTo: {
    name: string;
    role: string;
    email: string;
    avatarUrl: string;
  };
  ruleTriggered: string;
  details: Record<string, string | number>;
  notes?: string;
  decisionTimestamp?: string;
  decisionBy?: string;
}

export interface ScheduledJob {
  id: string;
  workflowId: string;
  workflowName: string;
  name: string;
  cronExpression: string;
  cronHuman: string;
  targetTask: string;
  timezone: string;
  nextRun: string;
  lastRun: string;
  status: 'active' | 'paused';
  successCount: number;
  failureCount: number;
  avgDurationMs: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  workflowId: string;
  workflowName: string;
  executionId: string;
  triggerSource: string;
  status: 'success' | 'failed' | 'pending_approval' | 'warning';
  durationMs: number;
  initiatedBy: string;
  stepsExecuted: number;
  totalSteps: number;
  summary: string;
  payload: Record<string, unknown>;
  ruleEvaluations: {
    rule: string;
    result: boolean;
    evaluatedValue: string | number;
  }[];
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: 'spend_variance' | 'approval_audit' | 'project_velocity';
  generatedAt: string;
  dateRange: string;
  generatedByWorkflow: string;
  format: 'PDF' | 'CSV';
  metrics: {
    label: string;
    value: string | number;
    subtext: string;
  }[];
  tableData: Array<Record<string, string | number>>;
}

export interface SaaSPlan {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  targetAudience: string;
  monthlyBasePrice: number;
  includedSeats: number;
  additionalSeatPrice: number;
  monthlyExecutionsIncluded: number;
  additionalExecutionPricePer1k: number;
  features: string[];
  maxScheduledJobs: number | 'Unlimited';
  supportTier: string;
}
