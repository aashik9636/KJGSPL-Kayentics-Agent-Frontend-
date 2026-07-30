import React, { useState, useEffect, useMemo } from 'react';

/**
 * Live Elapsed Timer Component (ticks client-side off started_at with 0 network traffic).
 */
function StepTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const calc = () => Math.max(0, Math.floor(Date.now() / 1000 - startedAt));
    setElapsed(calc());

    const interval = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <span className="font-mono text-[11px] text-slate-400 font-semibold bg-slate-100/90 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
      {formatted}
    </span>
  );
}

/**
 * Status Icon Component for Step States:
 * - pending: ghost row
 * - running: blue/purple spinner
 * - ok: emerald checkmark
 * - error: rose x
 * - retrying: amber spinner
 */
function StepStatusIcon({ state, kind, agentLabel, tool }) {
  const s = (state || 'pending').toLowerCase();
  
  if (s === 'running') {
    return (
      <div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
      </div>
    );
  }

  if (s === 'retrying') {
    return (
      <div className="w-4 h-4 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5" title="Recovering / Retrying">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-spin" />
      </div>
    );
  }

  if (s === 'ok' || s === 'completed') {
    return (
      <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 text-[10px] font-bold flex-shrink-0 mt-0.5">
        ✓
      </div>
    );
  }

  if (s === 'error' || s === 'failed') {
    return (
      <div className="w-4 h-4 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 text-[10px] font-bold flex-shrink-0 mt-0.5">
        ✕
      </div>
    );
  }

  // Pending ghost state icon
  const name = (agentLabel || tool || '').toLowerCase();
  let icon = '⚙️';
  if (name.includes('search')) icon = '🔍';
  else if (name.includes('browse') || name.includes('scrape') || name.includes('web')) icon = '🌐';
  else if (name.includes('plan')) icon = '📋';
  else if (name.includes('code') || name.includes('dev')) icon = '💻';

  return <span className="text-xs opacity-50 flex-shrink-0 mt-0.5">{icon}</span>;
}

/**
 * Format Tool Args cleanly (Pretty-printed key-value list).
 */
function FormattedArgs({ args }) {
  if (!args || typeof args !== 'object' || Object.keys(args).length === 0) return null;

  return (
    <div className="mt-1 bg-slate-900 text-slate-200 text-[11px] font-mono p-2.5 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider border-b border-slate-800 pb-1">
        Tool Parameters
      </div>
      <div className="space-y-0.5">
        {Object.entries(args).map(([key, val]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="text-purple-300 font-semibold">{key}:</span>
            <span className="text-slate-300 break-words flex-1">
              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Format Sparse Terminal Preview Mini-Table.
 */
function MiniPreviewTable({ preview }) {
  if (!Array.isArray(preview) || preview.length === 0) return null;

  // Extract sparse keys present across rows
  const allKeys = Array.from(new Set(preview.flatMap(row => Object.keys(row || {})))).slice(0, 5);
  if (allKeys.length === 0) return null;

  return (
    <div className="mt-2 overflow-x-auto max-w-full rounded-lg border border-slate-200/90 bg-white shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-[11px] font-sans">
        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
          <tr>
            {allKeys.map(k => (
              <th key={k} className="px-3 py-1.5 text-left">{k.replace(/_/g, ' ')}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {preview.slice(0, 5).map((row, idx) => (
            <tr key={idx} className="hover:bg-purple-50/30">
              {allKeys.map(k => (
                <td key={k} className="px-3 py-1.5 whitespace-nowrap truncate max-w-[160px]">
                  {row[k] !== undefined && row[k] !== null ? String(row[k]) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Individual Step Node Component implementing Claude expand/collapse rules:
 * - Independent local pin state (userPinned)
 * - Auto-expand while running/retrying
 * - Auto-collapse on settle to ok/error (unless user pinned open)
 * - Guideline line for nested children
 */
function StepNodeItem({ node, nodesMap, childrenMap, userPinned, onTogglePin, depth = 0 }) {
  const stepId = node.step_id;
  const children = childrenMap[stepId] || [];
  const stateStr = (node.state || 'pending').toLowerCase();

  const isPending = stateStr === 'pending';
  const isRunning = stateStr === 'running';
  const isRetrying = stateStr === 'retrying';
  const isOk = stateStr === 'ok' || stateStr === 'completed';
  const isError = stateStr === 'error' || stateStr === 'failed';

  // Manual pin state overrides auto-collapse
  const isPinned = userPinned.has(stepId);
  const isExpanded = isPending ? false : (isRunning || isRetrying ? true : isPinned);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isPending) return;
    onTogglePin(stepId);
  };

  return (
    <div key={stepId} className="flex flex-col gap-1 w-full">
      {/* Node Row (Anatomy: [status icon] [chevron] [agent_label] [elapsed timer] [summary]) */}
      <div
        onClick={handleToggle}
        className={`group flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg border text-[13px] transition-all cursor-pointer select-none ${
          isPending
            ? 'bg-slate-50/50 border-slate-200/60 text-slate-400 opacity-70 cursor-default'
            : isRunning
            ? 'bg-blue-50/50 border-blue-200/80 text-slate-800 shadow-2xs'
            : isRetrying
            ? 'bg-amber-50/60 border-amber-200 text-amber-900 shadow-2xs'
            : isError
            ? 'bg-rose-50/40 border-rose-200 text-slate-800'
            : 'bg-white/80 hover:bg-slate-50 border-slate-200/80 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Status Icon */}
          <StepStatusIcon state={node.state} kind={node.kind} agentLabel={node.agent_label} tool={node.tool} />

          {/* Chevron */}
          {!isPending && (
            <svg
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          )}

          {/* Agent Label / Action */}
          <span className="font-semibold tracking-tight text-slate-800 truncate">
            {node.agent_label || node.tool || 'Agent Action'}
          </span>

          {/* Kind Badge */}
          {node.kind && (
            <span className="text-[10px] font-mono uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.2 rounded flex-shrink-0">
              {node.kind}
            </span>
          )}

          {/* Retrying Warning Inline */}
          {isRetrying && (
            <span className="text-[11px] font-semibold text-amber-700 animate-pulse truncate">
              Recovering after backoff...
            </span>
          )}

          {/* Collapsed Trailing Summary */}
          {!isExpanded && node.summary && (
            <span className="text-[12px] text-slate-400 font-normal truncate hidden sm:inline ml-1">
              — {node.summary}
            </span>
          )}
        </div>

        {/* Live Elapsed Timer when Running / Retrying */}
        {(isRunning || isRetrying) && node.started_at && (
          <StepTimer startedAt={node.started_at} />
        )}
      </div>

      {/* Expanded Node Details */}
      {isExpanded && (
        <div className="ml-6 flex flex-col gap-1.5 text-[12px] text-slate-600 font-sans pb-1">
          {/* Detailed Summary */}
          {node.summary && (
            <p className="text-slate-600 leading-relaxed font-normal bg-slate-50/80 p-2 rounded-lg border border-slate-200/60">
              {node.summary}
            </p>
          )}

          {/* Formatted Args */}
          {node.args && <FormattedArgs args={node.args} />}

          {/* Sparse Mini Preview Table */}
          {node.preview && <MiniPreviewTable preview={node.preview} />}
        </div>
      )}

      {/* Nested Children Guidelines Container */}
      {children.length > 0 && (
        <div className="ml-3.5 border-l-2 border-slate-200/80 pl-3 flex flex-col gap-1.5 my-1">
          {children.map(child => (
            <StepNodeItem
              key={child.step_id}
              node={child}
              nodesMap={nodesMap}
              childrenMap={childrenMap}
              userPinned={userPinned}
              onTogglePin={onTogglePin}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Parallel Lanes Container Component (`lane` present)
 */
function ParallelLanesRow({ laneNodes, nodesMap, childrenMap, userPinned, onTogglePin }) {
  return (
    <div className="my-2 w-full">
      <div className="text-[11px] font-bold tracking-wider uppercase text-amber-700 mb-1.5 flex items-center gap-1">
        <span>⚡ Concurrent Parallel Processing</span>
        <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full">
          {laneNodes.length} lanes
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {laneNodes.map(node => (
          <div key={node.step_id} className="p-2 bg-white rounded-xl border border-amber-200/80 shadow-2xs">
            <div className="text-[11px] font-bold text-amber-800 mb-1 flex items-center justify-between">
              <span className="truncate">{node.lane}</span>
              <StepStatusIcon state={node.state} kind={node.kind} agentLabel={node.agent_label} />
            </div>
            <StepNodeItem
              node={node}
              nodesMap={nodesMap}
              childrenMap={childrenMap}
              userPinned={userPinned}
              onTogglePin={onTogglePin}
              depth={0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Stats / Metrics Card Component (driven by state.metrics).
 * Displays dashes for missing keys, never fake 0 or sums.
 */
function MetricsStatsCard({ metrics }) {
  if (!metrics || typeof metrics !== 'object' || Object.keys(metrics).length === 0) return null;

  const displayKeys = [
    { key: 'total_tokens', label: 'Tokens' },
    { key: 'total_cost', label: 'Est. Cost', format: (v) => `$${Number(v).toFixed(4)}` },
    { key: 'model', label: 'Model' },
    { key: 'companies_found', label: 'Companies' },
    { key: 'pages_read', label: 'Pages Read' },
  ];

  return (
    <div className="my-2 p-3 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
        <span>Run Execution Metrics</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {displayKeys.map(({ key, label, format }) => {
          const val = metrics[key];
          const displayVal = val !== undefined && val !== null ? (format ? format(val) : String(val)) : '—';
          return (
            <div key={key} className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">{label}</div>
              <div className="text-[13px] font-mono font-bold text-white truncate mt-0.5">{displayVal}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main StepTree Component implementing Claude UX Spec
 */
export default function StepTree({ nodes = {}, rootOrder = [], confidence = null, statusText = '', isStreaming = false, metrics = null }) {
  // Independent local user pin state, keyed by step_id
  const [userPinned, setUserPinned] = useState(new Set());
  const [isTreeOpen, setIsTreeOpen] = useState(isStreaming);

  useEffect(() => {
    if (isStreaming) setIsTreeOpen(true);
  }, [isStreaming]);

  const handleTogglePin = (stepId) => {
    setUserPinned(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  // Convert nodes map to array
  const allNodes = useMemo(() => Object.values(nodes || {}), [nodes]);

  if (allNodes.length === 0 && !statusText && !isStreaming) {
    return null;
  }

  // Children mapping: parent -> StepNode[]
  const childrenMap = {};
  allNodes.forEach(node => {
    if (node.parent) {
      if (!childrenMap[node.parent]) childrenMap[node.parent] = [];
      childrenMap[node.parent].push(node);
    }
  });

  // Top-level nodes in rootOrder
  const topLevelNodes = rootOrder.map(id => nodes[id]).filter(Boolean);
  const fallbackTopLevel = allNodes.filter(n => !n.parent);
  const displayRoots = topLevelNodes.length > 0 ? topLevelNodes : fallbackTopLevel;

  // Separate parallel lane nodes from vertical tree roots
  const laneRoots = displayRoots.filter(n => n.lane);
  const verticalRoots = displayRoots.filter(n => !n.lane);

  const stepCount = allNodes.length;
  const headerText = isStreaming
    ? (statusText || 'Thinking...')
    : (stepCount > 0 ? `Thought for a few seconds (${stepCount} ${stepCount === 1 ? 'step' : 'steps'})` : 'Thought process');

  return (
    <div className="my-2.5 w-full select-none font-sans">
      {/* Metrics Card if present */}
      {metrics && <MetricsStatsCard metrics={metrics} />}

      {/* Claude-style Accordion Header */}
      <button
        onClick={() => setIsTreeOpen(!isTreeOpen)}
        className="group flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-all cursor-pointer py-1 px-1 rounded-lg hover:bg-slate-100/60"
      >
        <div className="flex items-center justify-center">
          {isStreaming ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600" />
            </span>
          ) : (
            <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
        </div>

        <span className="font-sans italic text-slate-600 group-hover:text-slate-900 transition-colors truncate max-w-[320px]">
          {headerText}
        </span>

        {/* Confidence Pill */}
        {confidence !== null && confidence !== undefined && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full not-italic">
            {Math.round(confidence * 100)}% confidence
          </span>
        )}

        {/* Chevron Arrow */}
        <svg
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ml-0.5 ${isTreeOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Container */}
      {isTreeOpen && (
        <div className="mt-1.5 ml-1.5 border-l-2 border-purple-300/70 pl-3 py-1 flex flex-col gap-2 bg-slate-50/50 rounded-r-xl transition-all">
          {/* Active Live Status banner if streaming */}
          {isStreaming && statusText && (
            <div className="flex items-center gap-2 text-[12px] font-medium text-purple-700 animate-pulse py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
              <span>{statusText}</span>
            </div>
          )}

          {/* Render Parallel Lanes Row if present */}
          {laneRoots.length > 0 && (
            <ParallelLanesRow
              laneNodes={laneRoots}
              nodesMap={nodes}
              childrenMap={childrenMap}
              userPinned={userPinned}
              onTogglePin={handleTogglePin}
            />
          )}

          {/* Render Vertical Tree Nodes */}
          {verticalRoots.map(node => (
            <StepNodeItem
              key={node.step_id}
              node={node}
              nodesMap={nodes}
              childrenMap={childrenMap}
              userPinned={userPinned}
              onTogglePin={handleTogglePin}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
