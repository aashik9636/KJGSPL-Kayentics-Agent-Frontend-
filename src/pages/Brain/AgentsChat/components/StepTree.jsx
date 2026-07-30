import React, { useState } from 'react';

function StepKindBadge({ kind }) {
  const k = (kind || 'step').toLowerCase();
  let bgClass = 'bg-slate-100 text-slate-600 border-slate-200';
  if (k === 'plan' || k === 'plan_item') {
    bgClass = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (k === 'tool') {
    bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (k === 'agent') {
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
  if (s === 'completed') {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 flex-shrink-0">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (s === 'failed') {
    return (
      <div className="w-5 h-5 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 flex-shrink-0">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center flex-shrink-0">
      <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
    </div>
  );
}

export default function StepTree({ steps = [], confidence = null, statusText = '', isStreaming = false }) {
  const [isOpen, setIsOpen] = useState(true);

  if ((!steps || steps.length === 0) && !statusText && !isStreaming) {
    return null;
  }

  // Organize steps into root and children
  const rootSteps = steps.filter(s => !s.parent);
  const childStepsMap = {};
  steps.forEach(s => {
    if (s.parent) {
      if (!childStepsMap[s.parent]) childStepsMap[s.parent] = [];
      childStepsMap[s.parent].push(s);
    }
  });

  const renderStepNode = (node, depth = 0) => {
    const children = childStepsMap[node.id] || [];

    return (
      <div key={node.id} className="flex flex-col gap-1" style={{ marginLeft: depth > 0 ? `${depth * 16}px` : 0 }}>
        <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/80 shadow-sm hover:border-purple-200 transition-all">
          <StepStateIcon state={node.state} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[12px] font-semibold text-slate-800 truncate">
                {node.label || 'Agent Action'}
              </span>
              <StepKindBadge kind={node.kind} />
            </div>
            {node.summary && (
              <p className="text-[11px] text-slate-600 leading-snug break-words">
                {node.summary}
              </p>
            )}
            {node.preview && (
              <div className="mt-1 text-[11px] font-mono text-purple-700 bg-purple-50/80 border border-purple-100 px-2 py-1 rounded-md">
                {node.preview}
              </div>
            )}
          </div>
        </div>

        {/* Child Steps Recursive */}
        {children.length > 0 && (
          <div className="flex flex-col gap-1 border-l-2 border-purple-200/60 pl-2 my-0.5">
            {children.map(child => renderStepNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="my-3 w-full rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/40 to-slate-50/80 shadow-sm overflow-hidden transition-all">
      {/* Header Accordion Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
            {steps.length} {steps.length === 1 ? 'step' : 'steps'}
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
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-3 flex flex-col gap-2 max-h-[380px] overflow-y-auto custom-scrollbar">
          {/* Active Live Status Banner */}
          {statusText && isStreaming && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-600 text-white shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="text-[12px] font-medium truncate">{statusText}</span>
            </div>
          )}

          {/* Render Step Nodes */}
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
