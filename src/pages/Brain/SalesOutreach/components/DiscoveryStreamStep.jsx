import React, { useEffect, useRef, useState } from 'react';
import { Zap, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';

export default function DiscoveryStreamStep({ product, config, onDone, onBack }) {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({ leads_found: 0, enriched: 0 });
  const [status, setStatus] = useState('connecting');
  const [sessionId, setSessionId] = useState(null);
  const wsRef = useRef(null);
  const logEndRef = useRef(null);
  const statusRef = useRef('connecting');
  const reconnectAttempts = useRef(0);
  const isStoppedByUser = useRef(false);

  const setStatusBoth = (val) => {
    statusRef.current = val;
    setStatus(val);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    let shouldRun = true;
    const timer = setTimeout(() => {
      if (shouldRun) startStream();
    }, 0);
    return () => {
      shouldRun = false;
      clearTimeout(timer);
      wsRef.current?.close();
    };
  }, []);

  const startStream = () => {
    const { accessToken } = useAuthStore.getState();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const wsBase = baseUrl.replace(/^http/, 'ws');
    const url = `${wsBase}/api/sales/products/${product.id}/enrich/stream?token=${accessToken}`;

    setStatusBoth('connecting');
    addLog('system', 'Initializing discovery process...');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    let pingInterval;

    ws.onopen = () => {
      setStatusBoth('running');
      addLog('system', 'Connection established. Sending parameters...');
      ws.send(JSON.stringify({
        intent: config.intent,
        count: config.count,
        location: config.location,
      }));

      // Start heartbeat to prevent proxy timeouts (e.g. 120s Dev Tunnel disconnects)
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const text = msg.content || msg.message || '';

        if (msg.type === 'status') {
          addLog('status', typeof text === 'string' ? text : JSON.stringify(text));
        } else if (msg.type === 'partial_result') {
          const lead = typeof msg.content === 'object' ? msg.content : {};
          const name = lead.company_name || lead.companyName || lead.contact_name || lead.contactName || 'a new lead';
          addLog('status', `Found and enriched: ${name}`);
          setMetrics(prev => ({ 
            ...prev,
            leads_found: prev.leads_found + 1,
            enriched: prev.enriched + 1 
          }));
        } else if (msg.type === 'metrics') {
          setMetrics(prev => ({ ...prev, ...(msg.running_totals || {}) }));
        } else if (msg.type === 'done') {
          const sid = msg.metadata?.session_id || msg.session_id;
          setSessionId(sid);
          setStatusBoth('done');
          setMetrics(prev => {
            const finalCount = msg.metadata?.leads_count || prev.leads_found;
            addLog('done', `Discovery complete. Found ${finalCount} leads.`);
            return prev;
          });
        } else if (msg.type === 'error') {
          setStatusBoth('error');
          addLog('error', typeof text === 'string' ? text : 'An error occurred during discovery.');
        }
      } catch {
        addLog('status', event.data);
      }
    };

    ws.onerror = () => {
      setStatusBoth('error');
      addLog('error', 'WebSocket connection failed.');
    };

    ws.onclose = (ev) => {
      if (pingInterval) clearInterval(pingInterval);
      if (statusRef.current !== 'done') {
        if (isStoppedByUser.current) return;
        
        reconnectAttempts.current += 1;
        addLog('system', `Connection dropped (code ${ev.code}). Reconnecting in 5 seconds... (Attempt ${reconnectAttempts.current})`);
        setTimeout(() => {
          if (statusRef.current !== 'done') {
            startStream();
          }
        }, 5000);
      }
    };
  };

  const addLog = (type, message) => {
    setLogs(prev => [...prev, { type, message, time: new Date().toLocaleTimeString('en', { hour12: false }) }]);
  };

  const handleRetry = () => {
    isStoppedByUser.current = false;
    reconnectAttempts.current = 0;
    setLogs([]);
    setMetrics({ leads_found: 0, enriched: 0 });
    setSessionId(null);
    startStream();
  };

  const handleStop = () => {
    isStoppedByUser.current = true;
    if (wsRef.current) {
      wsRef.current.close(1000, "Stopped by user");
    }
    setStatusBoth('error');
    addLog('error', 'Discovery stopped by user.');
  };

  return (
    <div className="flex flex-col h-full animate-fade-in w-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-[#1a1a1a] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#6c48ff]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Lead Discovery</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {config?.intent} · {config?.location} · {config?.count} leads
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Leads Found</span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{metrics.leads_found}</span>
          </div>
          <div className="w-px h-10 bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Enriched</span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{metrics.enriched}</span>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[#0d1117] mb-5">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a2a] bg-[#161b22] shrink-0">
          <div className="text-xs font-mono text-neutral-400">discovery.log</div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {status === 'connecting' && <span className="text-amber-500 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Connecting</span>}
            {status === 'running' && <span className="text-emerald-500 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Running</span>}
            {status === 'done' && <span className="text-neutral-400 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-neutral-400" /> Complete</span>}
            {status === 'error' && <span className="text-red-500 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Error</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
          <div className="space-y-1.5">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-neutral-500 shrink-0 select-none">{log.time}</span>
                <span className={
                  log.type === 'done' ? 'text-emerald-400' :
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'system' ? 'text-blue-400' :
                  'text-neutral-300'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center shrink-0">
        <button
          onClick={onBack}
          disabled={status === 'running' || status === 'connecting'}
          className="px-5 py-2.5 rounded-lg text-neutral-500 dark:text-neutral-400 font-medium text-sm hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] transition-colors disabled:opacity-30"
        >
          Back
        </button>

        {status === 'error' && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        )}

        {status === 'done' && sessionId && (
          <button
            onClick={() => onDone(sessionId)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6c48ff] hover:bg-[#5b3df5] text-white font-medium text-sm rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> View Discovered Leads
          </button>
        )}

        {(status === 'connecting' || status === 'running') && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleStop}
              className="px-5 py-2.5 rounded-lg border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Stop
            </button>
            <div className="px-5 py-2.5 rounded-lg bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-600 dark:text-neutral-300 font-medium text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
              Discovering...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
