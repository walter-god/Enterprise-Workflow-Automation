import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Plus, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowUpRight, 
  Building,
  X
} from 'lucide-react';
import { GeneratedReport, Workflow } from '../types';

interface ReportsViewProps {
  reports: GeneratedReport[];
  workflows: Workflow[];
  onCreateReport: (newReport: GeneratedReport) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  workflows,
  onCreateReport,
}) => {
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<'spend_variance' | 'approval_audit' | 'project_velocity'>('spend_variance');
  const [dateRange, setDateRange] = useState('Oct 1, 2026 – Oct 24, 2026');
  const [reportFormat, setReportFormat] = useState<'PDF' | 'CSV'>('PDF');

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleDownloadCSV = (report: GeneratedReport) => {
    if (!report.tableData || report.tableData.length === 0) return;
    const headers = Object.keys(report.tableData[0]).join(',');
    const rows = report.tableData.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateOnDemand = (e: React.FormEvent) => {
    e.preventDefault();
    const newRep: GeneratedReport = {
      id: `rep-${Math.floor(100 + Math.random() * 900)}`,
      title: reportTitle || `${reportType.replace('_', ' ').toUpperCase()} Audit Summary`,
      type: reportType,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      dateRange: dateRange,
      generatedByWorkflow: 'Invoice PO Variance & CFO Approval',
      format: reportFormat,
      metrics: [
        { label: 'Total Analyzed Volume', value: '$1,420,800', subtext: '142 line items audited' },
        { label: 'Average Variance', value: '+2.1%', subtext: 'Below alert threshold' },
        { label: 'Compliant Invoices', value: '98.6%', subtext: 'Auto-verified with PO' },
        { label: 'Audit Sign-offs', value: '18', subtext: 'Completed in SLA' },
      ],
      tableData: [
        { vendor: 'Amazon Web Services', poAmount: '$38,450', invoiced: '$38,450', variance: '$0', status: 'Approved' },
        { vendor: 'Snowflake Computing', poAmount: '$74,200', invoiced: '$74,200', variance: '$0', status: 'Approved' },
        { vendor: 'Datadog Monitoring', poAmount: '$12,000', invoiced: '$12,450', variance: '+$450', status: 'Auto-Cleared' },
        { vendor: 'CrowdStrike Falcon', poAmount: '$50,000', invoiced: '$50,000', variance: '$0', status: 'Approved' },
      ],
    };

    onCreateReport(newRep);
    setSelectedReportId(newRep.id);
    setIsModalOpen(false);
    setReportTitle('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Automated Reports & Compliance Ledgers
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              SOX-compliant spend audit ledgers, bottleneck analyses, and vendor SLA reporting.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-xs active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate New Report</span>
          </button>
        </div>

        {/* Report Selector Pills */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReportId(r.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeReport?.id === r.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content View */}
      {activeReport ? (
        <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Active Report Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-mono text-slate-400">{activeReport.id}</span>
                  <span aria-hidden="true">·</span>
                  <span>Generated via: {activeReport.generatedByWorkflow}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{activeReport.generatedAt}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeReport.title}
                </h2>
                <div className="text-xs text-indigo-600 font-medium mt-1">
                  Period Covered: {activeReport.dateRange}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadCSV(activeReport)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>

            {/* KPI Metric Summary Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              {activeReport.metrics.map((metric, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {metric.label}
                  </span>
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                    {metric.value}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {metric.subtext}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Audited Item Breakdown ({activeReport.tableData.length} records)
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Cryptographically Stamped SOX Ledger
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    {Object.keys(activeReport.tableData[0] || {}).map((col) => (
                      <th key={col} className="px-6 py-3 font-semibold">
                        {col.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReport.tableData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
                      {Object.entries(row).map(([key, val], valIdx) => (
                        <td key={valIdx} className="px-6 py-3.5 text-slate-800 font-mono tabular-nums">
                          {key.toLowerCase().includes('status') ? (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                String(val).toLowerCase().includes('approved')
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : String(val).toLowerCase().includes('pending')
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}
                            >
                              {String(val)}
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs">
          No reports available.
        </div>
      )}

      {/* On-Demand Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Generate On-Demand Compliance Report
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateOnDemand} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. October ERP Spend Variance & Line Audit"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Type & Template
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="spend_variance">Financial Spend Variance & PO Reconciliation</option>
                  <option value="approval_audit">Vendor Sanctions & Approval Bottleneck Audit</option>
                  <option value="project_velocity">Project Milestone Health & SLA Burndown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date Range
                </label>
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Output Format
                </label>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={reportFormat === 'PDF'}
                      onChange={() => setReportFormat('PDF')}
                    />
                    <span>Audit PDF Print Format</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={reportFormat === 'CSV'}
                      onChange={() => setReportFormat('CSV')}
                    />
                    <span>Raw CSV Ledger Export</span>
                  </label>
                </div>
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
                  Generate & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
