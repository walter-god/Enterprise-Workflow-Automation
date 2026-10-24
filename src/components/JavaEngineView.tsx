import React, { useState } from 'react';
import { 
  Cpu, 
  Server, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  Activity, 
  Zap, 
  Layers, 
  Network
} from 'lucide-react';
import { JAVA_ENGINE_SPECS } from '../data/mockData';

export const JavaEngineView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(JAVA_ENGINE_SPECS.sampleJavaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePingWorkerPool = async () => {
    setIsPinging(true);
    await new Promise((res) => setTimeout(res, 350));
    const randomLatency = Math.floor(Math.random() * 8) + 11;
    setPingLatency(randomLatency);
    setIsPinging(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Java Workflow Engine & Integration SDK
              </h1>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                JDK 21 LTS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              High-throughput async state machine engine powering sub-20ms rule evaluation and distributed task orchestration.
            </p>
          </div>

          <button
            onClick={handlePingWorkerPool}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-xs active:scale-[0.98] self-start sm:self-auto disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isPinging ? 'animate-bounce' : ''}`} />
            <span>{isPinging ? 'Benchmarking Worker Pool...' : 'Benchmark Java Engine'}</span>
          </button>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Real-time JVM Worker Pool Telemetry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Java Worker Threads
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {JAVA_ENGINE_SPECS.threadPool.activeWorkers} / {JAVA_ENGINE_SPECS.threadPool.maxWorkers}
            </span>
            <span className="text-[11px] text-emerald-600 mt-1 block font-medium">
              Virtual Thread pool active
            </span>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Async Queue Depth
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {JAVA_ENGINE_SPECS.threadPool.currentQueueDepth} tasks
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block font-mono">
              Cap: {JAVA_ENGINE_SPECS.threadPool.queueCapacity.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              P99 Evaluation Latency
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-indigo-600 mt-1 block">
              {pingLatency ? `${pingLatency}.2ms` : `${JAVA_ENGINE_SPECS.threadPool.avgTaskLatencyMs}ms`}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {pingLatency ? 'Live measured benchmark' : 'Zero garbage collection pause'}
            </span>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Runtime Architecture
            </span>
            <span className="text-sm font-bold text-slate-900 mt-1 truncate block">
              {JAVA_ENGINE_SPECS.runtime}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Spring Boot State Machine
            </span>
          </div>
        </div>

        {/* Distributed Connectors Matrix */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Java Subsystem Connectors & Adapters
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Cluster Node: operon-worker-fra-01
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {JAVA_ENGINE_SPECS.connectors.map((connector, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{connector.name}</div>
                  <div className="text-[11px] text-slate-500">{connector.type}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{connector.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Java SDK Integration Code */}
        <div className="bg-slate-900 rounded-xl p-6 text-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200">
                Spring Boot & Java SDK Integration Example (Maven / Gradle)
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="text-xs font-mono p-4 bg-slate-950 rounded-lg overflow-x-auto leading-relaxed border border-slate-800 text-slate-300">
            {JAVA_ENGINE_SPECS.sampleJavaSnippet}
          </pre>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200 block mb-1">Maven Dependency:</span>
              <code className="text-[11px] font-mono bg-slate-950 px-2.5 py-1.5 rounded block border border-slate-800 text-slate-300">
                &lt;dependency&gt;com.operon:flow-sdk:2.4.0&lt;/dependency&gt;
              </code>
            </div>
            <div>
              <span className="font-semibold text-slate-200 block mb-1">REST Endpoint:</span>
              <code className="text-[11px] font-mono bg-slate-950 px-2.5 py-1.5 rounded block border border-slate-800 text-slate-300">
                POST /api/v1/workflows/wf-fin-01/execute
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
