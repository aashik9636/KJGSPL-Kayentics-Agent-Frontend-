import React, { useState, useEffect } from 'react';

/**
 * Claude-style Thinking / Execution Step Tree Accordion Component.
 *
 * Features:
 * - Auto-expands while streaming, auto-collapses when run finishes (exact Claude 3.5/3.7 behavior).
 * - Displays "Thinking..." with live pulse while running, and "Thought for a few seconds" / "Thinking process (N steps)" when done.
 * - Left vertical accent line with clean typography and tool/plan pills.
 * - Displays confidence score badge (e.g. 85% Confidence) when available.
 */
export default function StepTree({ steps = [], confidence = null, statusText = '', isStreaming = false }) {
  // Default: Open while streaming, collapsed when finished
  const [isOpen, setIsOpen] = useState(isStreaming);

  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    }
  }, [isStreaming]);

  if ((!steps || steps.length === 0) && !statusText && !isStreaming) {
    return null;
  }

  // Organize steps into root and child tree nodes
  const rootSteps = steps.filter(s => !s.parent);
  const childStepsMap = {};
  steps.forEach(s => {
    if (s.parent) {
      if (!childStepsMap[s.parent]) childStepsMap[s.parent] = [];
      childStepsMap[s.parent].push(s);
    }
  });

  const renderKindIcon = (kind) => {
    const k = (kind || 'step').toLowerCase();
    if (k === 'tool') return '🛠️';
    if (k === 'plan' || k === 'plan_item') return '📋';
    if (k === 'agent') return '🧠';
    return '💭';
  };

  const renderStepNode = (node, depth = 0) => {
    const children = childStepsMap[node.id] || [];
    const isCompleted = (node.state || '').toLowerCase() === 'completed';
    const isRunning = (node.state || '').toLowerCase() === 'running';

    return (
      <div key={node.id} className="flex flex-col gap-1" style={{ marginLeft: depth > 0 ? `${depth * 14}px` : 0 }}>
        <div className="flex items-start gap-2 text-[13px] text-slate-600 leading-relaxed font-sans group">
          {/* Status Indicator */}
          <span className="flex-shrink-0 mt-0.5 text-xs">
            {isRunning ? (
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            ) : isCompleted ? (
              <span className="text-emerald-500 font-bold">✓</span>
            ) : (
              <span className="opacity-60">{renderKindIcon(node.kind)}</span>
            )}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                {node.label || 'Thinking step'}
              </span>

              {node.kind && (
                <span className="text-[10px] font-mono uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.2 rounded-md">
                  {node.kind}
                </span>
              )}
            </div>

            {node.summary && (
              <p className="text-[12px] text-slate-500 mt-0.5 leading-normal break-words">
                {node.summary}
              </p>
            )}

            {node.preview && (
              <div className="mt-1 text-[11px] font-mono text-purple-700 bg-purple-50/70 border border-purple-100/80 px-2.5 py-1 rounded-lg inline-block max-w-full truncate">
                {node.preview}
              </div>
            )}
          </div>
        </div>

        {/* Recursive Child Steps */}
        {children.length > 0 && (
          <div className="flex flex-col gap-1 border-l border-slate-200/80 pl-2.5 my-1">
            {children.map(child => renderStepNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const stepCount = steps.length;
  const headerText = isStreaming
    ? (statusText || 'Thinking...')
    : (stepCount > 0 ? `Thought for a few seconds (${stepCount} ${stepCount === 1 ? 'step' : 'steps'})` : 'Thought process');

  return (
    <div className="my-2.5 w-full select-none">
      {/* Claude-style Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-all cursor-pointer py-1 px-1 rounded-lg hover:bg-slate-100/60"
      >
        {/* Animated brain/sparkle icon */}
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

        {/* Confidence Score Pill */}
        {confidence !== null && confidence !== undefined && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full not-italic">
            {Math.round(confidence * 100)}% confidence
          </span>
        )}

        {/* Chevron Arrow */}
        <svg
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ml-0.5 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Claude-style Expanded Vertical Accent Container */}
      {isOpen && (
        <div className="mt-1.5 ml-1.5 border-l-2 border-purple-300/70 pl-3 py-1 flex flex-col gap-2 bg-slate-50/50 rounded-r-xl transition-all">
          {/* Active Live Status line if streaming and statusText present */}
          {isStreaming && statusText && (
            <div className="flex items-center gap-2 text-[12px] font-medium text-purple-700 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
              <span>{statusText}</span>
            </div>
          )}

          {/* Render Step Tree Nodes */}
          {rootSteps.length > 0 ? (
            rootSteps.map(step => renderStepNode(step))
          ) : (
            steps.map(step => renderStepNode(step))
          )}
        </div>
      )}
    </div>
  );
}
