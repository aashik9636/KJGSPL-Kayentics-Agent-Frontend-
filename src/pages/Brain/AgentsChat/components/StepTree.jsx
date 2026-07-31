import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  X,
  Loader2,
  Search,
  Globe,
  Terminal,
  Gauge,
} from 'lucide-react';

/* ---------------------------------------------------------------------
   DESIGN TOKENS — exact reference from agent-console-chat.jsx
--------------------------------------------------------------------- */
const T = {
  paper: '#FAFAFA',
  paperEdge: '#EAEAEA',
  ink: '#1A1A1A',
  inkSoft: '#767676',
  console: '#FFFFFF',
  consoleEdge: '#EAEAEA',
  consoleEdgeSoft: '#F4F4F4',
  consoleText: '#1A1A1A',
  consoleTextSoft: '#8A8A8A',
  running: '#D97706',
  runningSoft: '#FEF3E2',
  ok: '#1F9D5A',
  okSoft: '#E8F7EE',
  error: '#DC4C3E',
  errorSoft: '#FDECEA',
  signal: '#5B57D6',
  signalSoft: '#EFEEFC',
};

const fontStack = {
  display: "'Space Grotesk', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'IBM Plex Mono', 'SF Mono', ui-monospace, monospace",
};

function stateVisual(state) {
  const s = (state || 'running').toLowerCase();
  if (s === 'ok' || s === 'completed') return { color: T.ok, bg: T.okSoft, Icon: Check };
  if (s === 'error' || s === 'failed') return { color: T.error, bg: T.errorSoft, Icon: X };
  return { color: T.running, bg: T.runningSoft, Icon: Loader2 };
}

function PulseDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function StepRow({ step, depth, isLast, childMap }) {
  const [open, setOpen] = useState(false);
  const { color, bg, Icon } = stateVisual(step.state);
  const hasDetail = (step.args && Object.keys(step.args).length > 0) || (step.preview && step.preview.length > 0);
  const ToolIcon = step.tool === 'web_search' || step.tool === 'search' ? Search : step.tool ? Globe : Terminal;

  const children = childMap[step.id] || [];

  return (
    <div className="relative" style={{ paddingLeft: depth ? 22 : 0 }}>
      {/* Connecting Tree Guidelines */}
      {depth > 0 && (
        <span
          aria-hidden
          className="absolute left-2 top-0"
          style={{
            bottom: isLast ? 'auto' : 0,
            height: isLast ? 18 : '100%',
            width: 1,
            background: T.consoleEdge,
          }}
        />
      )}
      {depth > 0 && (
        <span
          aria-hidden
          className="absolute left-2 top-4"
          style={{ width: 12, height: 1, background: T.consoleEdge }}
        />
      )}

      {/* Row Item */}
      <div
        onClick={() => hasDetail && setOpen((o) => !o)}
        className={`flex items-start gap-2.5 p-2 rounded-lg transition-colors duration-120 ${
          hasDetail ? 'cursor-pointer hover:bg-[#F4F4F4]' : 'cursor-default'
        }`}
      >
        {/* Status Circle */}
        <span
          className="shrink-0 w-4.5 h-4.5 rounded-full flex items-center justify-center mt-0.5"
          style={{ background: bg }}
        >
          <Icon
            size={11}
            color={color}
            strokeWidth={3}
            className={step.state === 'running' ? 'animate-spin' : undefined}
          />
        </span>

        {/* Content & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              style={{ fontFamily: fontStack.body, fontSize: 13, fontWeight: 550, color: T.consoleText }}
              className="truncate"
            >
              {step.summary || step.agent_label || step.tool || 'Agent Step'}
            </span>

            {step.tool && (
              <span
                style={{
                  fontFamily: fontStack.mono,
                  fontSize: 10.5,
                  letterSpacing: 0.3,
                  color: T.consoleTextSoft,
                  background: T.paper,
                  border: `1px solid ${T.consoleEdge}`,
                }}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5"
              >
                <ToolIcon size={10} /> {step.tool}
              </span>
            )}

            {step.agent_label && step.agent_label !== step.summary && (
              <span
                style={{ fontFamily: fontStack.mono, fontSize: 10.5, color: T.signal, opacity: 0.85 }}
                className="truncate max-w-[160px]"
              >
                {step.agent_label}
              </span>
            )}
          </div>

          {/* Expandable Detail Drawer (Args & Preview) */}
          {open && hasDetail && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 10px',
                background: T.paper,
                border: `1px solid ${T.consoleEdge}`,
                borderRadius: 6,
                fontFamily: fontStack.mono,
                fontSize: 11.5,
                color: T.consoleTextSoft,
              }}
              className="overflow-x-auto"
            >
              {step.args && Object.keys(step.args).length > 0 && (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(step.args, null, 2)}</pre>
              )}

              {step.preview && Array.isArray(step.preview) && step.preview.length > 0 && (
                <div style={{ marginTop: step.args ? 8 : 0 }}>
                  {step.preview.map((row, i) => (
                    <div
                      key={i}
                      style={{ padding: '3px 0', borderTop: i ? `1px solid ${T.consoleEdge}` : 'none' }}
                      className="flex items-center flex-wrap gap-3"
                    >
                      {Object.entries(row || {}).map(([k, v]) => (
                        <span key={k}>
                          <span style={{ color: T.consoleTextSoft }}>{k}:</span>{' '}
                          <span style={{ color: T.consoleText }}>{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {hasDetail && (
          <ChevronDown
            size={13}
            color={T.consoleTextSoft}
            className="mt-1 transition-transform duration-150 shrink-0"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          />
        )}
      </div>

      {/* Render Child Steps */}
      {children.length > 0 && (
        <div>
          {children.map((childId, i) => (
            <StepRow
              key={childId}
              step={childMap.__all[childId]}
              depth={depth + 1}
              isLast={i === children.length - 1}
              childMap={childMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StepTree({ steps = [], nodes = {}, confidence = null, statusText = '', isStreaming = false, metrics = null }) {
  const [expanded, setExpanded] = useState(isStreaming);

  useEffect(() => {
    setExpanded(isStreaming);
  }, [isStreaming]);

  // Combine nodes or fallback steps array into unified steps object
  const allNodes = { ...nodes };
  if (Object.keys(allNodes).length === 0 && Array.isArray(steps) && steps.length > 0) {
    steps.forEach((s, idx) => {
      const id = s.id || s.step_id || `step_${idx}`;
      allNodes[id] = { ...s, id, step_id: id };
    });
  }

  const nodeEntries = Object.values(allNodes);
  if (nodeEntries.length === 0 && !statusText && !isStreaming) {
    return null;
  }

  // Build parent-child map
  const childMap = { __root: [], __all: allNodes };
  nodeEntries.forEach(n => {
    const parentKey = n.parent || '__root';
    if (!childMap[parentKey]) childMap[parentKey] = [];
    childMap[parentKey].push(n.id || n.step_id);
  });

  const rootIds = childMap.__root || [];
  const displayMetrics = metrics || {};

  return (
    <div
      style={{
        background: T.console,
        border: `1px solid ${T.consoleEdge}`,
        borderRadius: 12,
        boxShadow: '0 1px 2px rgba(16,20,26,0.04)',
      }}
      className="my-3 w-full overflow-hidden font-sans"
    >
      {/* Header Bar */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          borderBottom: expanded ? `1px solid ${T.consoleEdge}` : 'none',
        }}
        className="flex items-center justify-between px-3.5 py-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <span
            style={{ background: T.signalSoft }}
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          >
            <Terminal size={13} color={T.signal} />
          </span>

          <span style={{ fontFamily: fontStack.display, fontSize: 13.5, fontWeight: 600, color: T.ink }}>
            {isStreaming ? (statusText || 'Thinking...') : 'Execution trace'}
          </span>

          <span
            style={{
              fontFamily: fontStack.mono,
              fontSize: 10.5,
              color: T.signal,
              background: T.signalSoft,
            }}
            className="rounded-full px-2 py-0.5 font-medium"
          >
            {nodeEntries.length} step{nodeEntries.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {confidence !== null && confidence !== undefined && (
            <span style={{ fontFamily: fontStack.mono, fontSize: 10.5, color: T.ok, background: T.okSoft }} className="px-2 py-0.5 rounded-md font-semibold">
              {Math.round(confidence * 100)}% confidence
            </span>
          )}

          <ChevronDown
            size={15}
            color={T.consoleTextSoft}
            className="transition-transform duration-150"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
          />
        </div>
      </div>

      {/* Expanded Console Panel */}
      {expanded && (
        <>
          {/* Metrics Row */}
          {Object.keys(displayMetrics).length > 0 && (
            <div
              style={{ borderBottom: `1px solid ${T.consoleEdge}` }}
              className="flex items-center gap-2 flex-wrap px-3.5 py-2.5"
            >
              {Object.entries(displayMetrics).map(([k, v]) => (
                <span
                  key={k}
                  style={{
                    fontFamily: fontStack.mono,
                    fontSize: 11,
                    color: T.consoleText,
                    background: T.paper,
                    border: `1px solid ${T.consoleEdge}`,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
                >
                  <Gauge size={11} color={T.signal} />
                  {v} <span style={{ color: T.consoleTextSoft }}>{k.replace(/_/g, ' ')}</span>
                </span>
              ))}
            </div>
          )}

          {/* Tree Rows (Completed Steps at the Top) */}
          <div className="p-2 space-y-1">
            {rootIds.map((id, i) => (
              <StepRow
                key={id}
                step={allNodes[id]}
                depth={0}
                isLast={i === rootIds.length - 1 && (!statusText || !isStreaming || nodeEntries.some(n => n.state === 'running'))}
                childMap={childMap}
              />
            ))}

            {/* Active Live Message Banner at the BOTTOM of the steps list (Claude-style) */}
            {statusText && isStreaming && !nodeEntries.some(n => n.state === 'running') && (
              <div className="flex items-center gap-2 px-2 py-1.5 mt-1 rounded-lg">
                <PulseDots />
                <span style={{ fontFamily: fontStack.body, fontSize: 12.5, color: T.consoleTextSoft }}>
                  {statusText}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
