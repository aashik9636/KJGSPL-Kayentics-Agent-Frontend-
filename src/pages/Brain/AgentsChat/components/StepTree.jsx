import React, { useState, useEffect } from 'react';

function StepKindBadge({ kind }) {
  const k = (kind || 'step').toLowerCase();
  let bgClass = 'bg-slate-100 text-slate-600 border-slate-200';
  if (k === 'plan' || k === 'plan_item') {
    bgClass = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (k === 'tool') {
    bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (k === 'agent' || k === 'node') {
    bgClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  return (
    <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${bgClass}`}>
      {kind || 'step'}
    </span>
  );
}

function StepStateIcon({ state }) {
  const s = (state || 'running').toLowerCase();
  if (s === 'ok' || s === 'completed') {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 flex-shrink-0">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (s === 'error' || s === 'failed') {
    return (
      <div className="w-5 h-5 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 flex-shrink-0">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  if (s === 'retrying') {
    return (
      <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 flex-shrink-0">
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    );
  }
  if (s === 'pending') {
    return (
      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      </div>
    );
  }
  // Default: running
  return (
    <div className="w-5 h-5 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center flex-shrink-0">
      <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
    </div>
  );
}

// Live ticking elapsed timer for running steps
function LiveTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => {
      const sec = Math.max(0, Math.floor(Date.now() / 1000 - startedAt));
      setElapsed(sec);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <span className="font-mono text-[11px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
}

// Mini preview table for preview data
function PreviewTable({ preview }) {
  if (!preview || !Array.isArray(preview) || preview.length === 0) return null;

  // Extract keys present across preview rows
  const keys = Array.from(new Set(preview.flatMap(row => Object.keys(row || {}))));
  if (keys.length === 0) return null;

  return (
    <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/70 p-2">
      <table className="w-full text-left text-[11px] font-sans">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
            {keys.map(k => (
              <th key={k} className="pb-1 px-1.5">{k.replace(/_/g, ' ')}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {preview.slice(0, 5).map((row, idx) => (
            <tr key={idx} className="hover:bg-purple-50/40">
              {keys.map(k => (
                <td key={k} className="py-1 px-1.5 max-w-[140px] truncate" title={String(row[k] ?? '')}>
                  {String(row[k] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StepTree({ steps = [], nodes = {}, rootOrder = [], confidence = null, statusText = '', isStreaming = false, metrics = null }) {
  const [pinnedOpen, setPinnedOpen] = useState(new Set());
  const [overallOpen, setOverallOpen] = useState(true);

  // Build nodes map and children map
  const allNodes = { ...nodes };
  if (Object.keys(allNodes).length === 0 && Array.isArray(steps) && steps.length > 0) {
    steps.forEach((s, idx) => {
      const id = s.id || `step_${idx}`;
      allNodes[id] = { ...s, id, children: [] };
    });
  }

  const nodeEntries = Object.values(allNodes);
  if (nodeEntries.length === 0 && !statusText && !isStreaming) {
    return null;
  }

  const childMap = {};
  nodeEntries.forEach(n => {
    if (n.parent) {
      if (!childMap[n.parent]) childMap[n.parent] = [];
      childMap[n.parent].push(n);
    }
  });

  const rootNodes = nodeEntries.filter(n => !n.parent);

  const togglePinNode = (nodeId, e) => {
    e.stopPropagation();
    setPinnedOpen(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderSingleNode = (node, depth = 0) => {
    const isPinned = pinnedOpen.has(node.id);
    const s = (node.state || 'running').toLowerCase();
    const isRunning = s === 'running' || s === 'retrying';
    const isPending = s === 'pending';
    
    // Auto rule: running/retrying auto-expands; ok/error auto-collapses unless user pinned it open
    const isExpanded = isPinned || isRunning;
    const children = childMap[node.id] || [];

    // Group parallel lane children if present
    const laneChildren = children.filter(c => c.lane);
    const standardChildren = children.filter(c => !c.lane);

    return (
      <div key={node.id} className="flex flex-col gap-1 w-full" style={{ marginLeft: depth > 0 ? `${depth * 14}px` : 0 }}>
        {/* Node Card Row */}
        <div 
          onClick={(e) => togglePinNode(node.id, e)}
          className={`group flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
            isPending
              ? 'bg-slate-50/50 border-slate-200 opacity-60'
              : isRunning
                ? 'bg-purple-50/50 border-purple-300 shadow-sm'
                : 'bg-white border-slate-200/90 hover:border-purple-300 hover:shadow-sm'
          }`}
        >
          {/* Main Top Header Line */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <StepStateIcon state={node.state} />
              
              <span className={`text-[12.5px] font-semibold truncate ${isRunning ? 'text-purple-900' : 'text-slate-800'}`}>
                {node.agent_label || node.label || node.tool || 'Agent Step'}
              </span>

              {isRunning && node.started_at && (
                <LiveTimer startedAt={node.started_at} />
              )}

              {node.kind && <StepKindBadge kind={node.kind} />}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {node.summary && !isExpanded && (
                <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                  {node.summary}
                </span>
              )}

              <button className="p-0.5 text-slate-400 hover:text-purple-600 transition-colors">
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Expanded Content (Args, Summary, Retrying details, Preview table) */}
          {isExpanded && (
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11.5px] text-slate-600 space-y-1.5">
              {s === 'retrying' && (
                <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                  ⚠️ Retrying step... {node.summary || ''}
                </div>
              )}

              {node.summary && (
                <p className="text-[12px] text-slate-700 leading-relaxed font-sans">
                  {node.summary}
                </p>
              )}

              {/* Arguments JSON formatted */}
              {node.args && Object.keys(node.args).length > 0 && (
                <div className="text-[11px] font-mono bg-slate-900 text-purple-200 p-2 rounded-lg overflow-x-auto">
                  <span className="text-slate-400 font-bold block mb-1">ARGS:</span>
                  <pre className="whitespace-pre-wrap font-mono">{JSON.stringify(node.args, null, 2)}</pre>
                </div>
              )}

              {/* Mini Table Preview */}
              <PreviewTable preview={node.preview} />
            </div>
          )}
        </div>

        {/* Parallel Lanes Layout (e.g. per-company enrichment fan-out) */}
        {laneChildren.length > 0 && (
          <div className="my-1.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 border-l-2 border-purple-300/70 pl-2">
            {laneChildren.map(lc => (
              <div key={lc.id} className="bg-purple-50/60 border border-purple-200 rounded-lg p-2 text-[11px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-purple-900 truncate">{lc.lane || lc.agent_label || 'Lane task'}</span>
                  <StepStateIcon state={lc.state} />
                </div>
                {lc.summary && <p className="text-[10.5px] text-slate-600 truncate">{lc.summary}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Sequential Child Steps with Thread Line */}
        {standardChildren.length > 0 && (
          <div className="flex flex-col gap-1.5 border-l-2 border-purple-300/70 pl-3 my-1">
            {standardChildren.map(child => renderSingleNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="my-3 w-full rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/40 to-slate-50/80 shadow-sm overflow-hidden transition-all">
      {/* Header Accordion Bar */}
      <button
        onClick={() => setOverallOpen(!overallOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-purple-100 hover:bg-purple-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-slate-800 tracking-tight truncate">
            Execution Step Tree
          </span>
          <span className="text-[11px] font-semibold text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded-full">
            {nodeEntries.length} {nodeEntries.length === 1 ? 'step' : 'steps'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {confidence !== null && confidence !== undefined && (
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] font-bold text-emerald-700">
                {Math.round(confidence * 100)}% Confidence
              </span>
            </div>
          )}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${overallOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Accordion Content */}
      {overallOpen && (
        <div className="p-3 flex flex-col gap-2 max-h-[420px] overflow-y-auto custom-scrollbar">
          {/* Active Live Status Row */}
          {statusText && isStreaming && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/80 border border-purple-200/80 text-purple-900 shadow-sm mb-1">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping flex-shrink-0" />
              <span className="text-[12px] font-semibold truncate flex-1">{statusText}</span>
            </div>
          )}

          {/* Render Step Nodes */}
          {rootNodes.length > 0 ? (
            rootNodes.map(node => renderSingleNode(node))
          ) : (
            nodeEntries.map(node => renderSingleNode(node))
          )}
        </div>
      )}
    </div>
  );
}
