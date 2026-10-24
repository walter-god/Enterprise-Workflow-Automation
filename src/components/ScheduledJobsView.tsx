import React, { useState } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  RefreshCw,
  X
} from 'lucide-react';
import { ScheduledJob, Workflow, ActivityLog } from '../types';

interface ScheduledJobsViewProps {
  jobs: ScheduledJob[];
  workflows: Workflow[];
  onUpdateJob: (updated: ScheduledJob) => void;
  onCreateJob: (newJob: ScheduledJob) => void;
  onTriggerJobNow: (job: ScheduledJob) => void;
}

export const ScheduledJobsView: React.FC<ScheduledJobsViewProps> = ({
  jobs,
  workflows,
  onUpdateJob,
  onCreateJob,
  onTriggerJobNow,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [selectedWfId, setSelectedWfId] = useState(workflows[0]?.id || '');
  const [selectedCronPreset, setSelectedCronPreset] = useState('0 08 * * 1-5');
  const [customCron, setCustomCron] = useState('0 08 * * 1-5');
  const [targetTaskDesc, setTargetTaskDesc] = useState('');
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  const CRON_PRESETS = [
    { label: 'Every Weekday at 08:00 AM UTC', cron: '0 08 * * 1-5' },
    { label: 'Daily at Midnight (00:00 UTC)', cron: '0 0 * * *' },
    { label: 'Hourly on the hour', cron: '0 * * * *' },
    { label: 'Every 30 Minutes', cron: '*/30 * * * *' },
    { label: 'Monthly on 1st at 06:00 UTC', cron: '0 06 1 * *' },
  ];

  const handleToggleJobStatus = (job: ScheduledJob) => {
    onUpdateJob({
      ...job,
      status: job.status === 'active' ? 'paused' : 'active',
    });
  };

  const handleRunNow = async (job: ScheduledJob) => {
    setRunningJobId(job.id);
    await new Promise((res) => setTimeout(res, 600));
    onTriggerJobNow(job);
    setRunningJobId(null);
  };

  const handleCreateNewJob = (e: React.FormEvent) => {
    e.preventDefault();
    const wf = workflows.find((w) => w.id === selectedWfId) || workflows[0];
    const cronValue = selectedCronPreset === 'custom' ? customCron : selectedCronPreset;
    const presetLabel = CRON_PRESETS.find((p) => p.cron === cronValue)?.label || `Custom (${cronValue})`;

    const newJob: ScheduledJob = {
      id: `job-${Math.floor(100 + Math.random() * 900)}`,
      workflowId: wf.id,
      workflowName: wf.name,
      name: newJobName || `${wf.name} Scheduled Runner`,
      cronExpression: cronValue,
      cronHuman: presetLabel,
      targetTask: targetTaskDesc || `Automated cron execution for ${wf.name}`,
      timezone: 'UTC',
      nextRun: '2026-10-25 08:00:00 UTC',
      lastRun: 'Just created',
      status: 'active',
      successCount: 0,
      failureCount: 0,
      avgDurationMs: 240,
    };

    onCreateJob(newJob);
    setIsModalOpen(false);
    setNewJobName('');
    setTargetTaskDesc('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Scheduled Jobs & Batch Daemons
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Time-based triggers dispatching recurring audit sweeps, report generations, and sanctions checks.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-xs active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Scheduled Job</span>
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="p-8 max-w-6xl mx-auto w-full space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const isActive = job.status === 'active';
            const isCurrentlyRunning = runningJobId === job.id;

            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-300 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-slate-400">{job.id}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {job.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {job.targetTask}
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Cron Schedule:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {job.cronExpression}
                      </span>
                    </div>
                    <div className="text-[11px] text-indigo-600 font-medium">
                      {job.cronHuman}
                    </div>
                  </div>

                  {/* Telemetry Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-3">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">
                        Successes
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 tabular-nums">
                        {job.successCount}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">
                        Avg Latency
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 tabular-nums">
                        {job.avgDurationMs}ms
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">
                        Next Run
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 truncate block">
                        {job.nextRun.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Job Action Strip */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleToggleJobStatus(job)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isActive ? 'Pause Schedule' : 'Resume'}</span>
                  </button>

                  <button
                    onClick={() => handleRunNow(job)}
                    disabled={isCurrentlyRunning}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCurrentlyRunning ? 'animate-spin' : ''}`} />
                    <span>{isCurrentlyRunning ? 'Executing...' : 'Run Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Scheduled Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Create New Scheduled Job
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Vendor AP Aging Audit"
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Workflow to Execute
                </label>
                <select
                  value={selectedWfId}
                  onChange={(e) => setSelectedWfId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {workflows.map((wf) => (
                    <option key={wf.id} value={wf.id}>
                      {wf.name} ({wf.industry.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recurring Schedule Cadence
                </label>
                <select
                  value={selectedCronPreset}
                  onChange={(e) => setSelectedCronPreset(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer mb-2"
                >
                  {CRON_PRESETS.map((p) => (
                    <option key={p.cron} value={p.cron}>
                      {p.label} ({p.cron})
                    </option>
                  ))}
                  <option value="custom">Custom Cron Expression</option>
                </select>

                {selectedCronPreset === 'custom' && (
                  <input
                    type="text"
                    placeholder="* * * * *"
                    value={customCron}
                    onChange={(e) => setCustomCron(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Execution Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the batch action performed by the worker..."
                  value={targetTaskDesc}
                  onChange={(e) => setTargetTaskDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Schedule Daemon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
