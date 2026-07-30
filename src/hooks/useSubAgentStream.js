import { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { initStreamState, applyChunk } from '../services/streamReducer';

/**
 * WebSocket streaming hook for direct Specialized Domain Sub-Agents.
 *
 * Implements the exact Claude-style streaming specification:
 * - Uses streamReducer's initStreamState() and applyChunk(state, chunk)
 * - Map<step_id, StepNode> step tree in-place merging
 * - Absolute cumulative metrics merging
 * - Mid-run & terminal artifact de-duplication by url
 */
export const useSubAgentStream = () => {
  const [streamState, setStreamState] = useState(initStreamState());
  const [statusText, setStatusText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPendingBackground, setIsPendingBackground] = useState(false);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);

  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const startBackgroundExecution = useCallback(async (agentSlug, sessionId, message, jobId) => {
    setIsStreaming(false);
    setIsPendingBackground(true);
    setStatusText(`Processing ${agentSlug} query...`);

    try {
      const { organizationId, workspaceId } = useWorkspaceStore.getState();
      const apiClient = (await import('../services/apiClient')).default;
      
      const res = await apiClient.post(`/api/chat/${agentSlug}`, {
        message,
        userQuery: message,
        sessionId,
        jobId: jobId || undefined,
        organizationId,
        workspaceId,
      });

      const data = res.data;
      setIsPendingBackground(false);
      setStatusText('');
      const answer = data?.response || data?.finalAnswer || data?.content || 'Task completed.';
      
      setSources(data?.sources || []);
      setStreamState(prev => ({
        ...prev,
        answer,
        done: true,
      }));
    } catch (err) {
      console.error(`Failed background execution for ${agentSlug}:`, err);
      setIsPendingBackground(false);
      setStatusText('');
      setError('Failed to complete request.');
    }
  }, []);

  const send = useCallback((agentSlug, sessionId, message, options = {}) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      setError('Not authenticated');
      return;
    }

    if (!agentSlug || agentSlug === 'brain') {
      return;
    }

    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const jobId = options.jobId || options.job_id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    setIsStreaming(true);
    setIsPendingBackground(false);
    setStatusText(`Connecting to ${agentSlug} agent...`);
    setError(null);
    setSources([]);
    setStreamState(initStreamState());

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const defaultWsUrl = apiBaseUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || defaultWsUrl;
    const socketUrl = `${wsBaseUrl}/conversations/${agentSlug}/stream?token=${accessToken}&session_id=${sessionId}&job_id=${encodeURIComponent(jobId)}&bypass-tunnel-reminder=true&ngrok-skip-browser-warning=true`;

    try {
      const socket = new WebSocket(socketUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStatusText(`Running ${agentSlug} query...`);
        socket.send(JSON.stringify({
          message: message,
          user_query: message,
          session_id: sessionId,
          job_id: jobId,
          company_id: workspaceId || undefined,
          organization_id: organizationId || undefined,
        }));
      };

      socket.onmessage = (event) => {
        try {
          const chunk = JSON.parse(event.data);

          if (chunk.type === 'status' && chunk.content) {
            setStatusText(chunk.content);
          } else if (chunk.type === 'token') {
            setStatusText('');
          }

          if (chunk.type === 'done' && chunk.metadata?.sources) {
            setSources(chunk.metadata.sources);
          }

          setStreamState(prev => applyChunk(prev, chunk));

          if (chunk.type === 'done') {
            setIsStreaming(false);
            setStatusText('');
            socket.close();
          } else if (chunk.type === 'error') {
            setError(chunk.content || 'An error occurred');
            setIsStreaming(false);
            setStatusText('');
            socket.close();
          }
        } catch (err) {
          console.error(`Failed to parse ${agentSlug} WebSocket message`, err);
        }
      };

      socket.onerror = (event) => {
        console.warn(`${agentSlug} WebSocket Error, triggering background execution fallback`, event);
        startBackgroundExecution(agentSlug, sessionId, message, jobId);
      };

      socket.onclose = () => {
        setIsStreaming(false);
      };
    } catch (wsErr) {
      console.warn(`Failed to initialize ${agentSlug} WebSocket, running background fallback:`, wsErr);
      startBackgroundExecution(agentSlug, sessionId, message, jobId);
    }
  }, [startBackgroundExecution]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setIsStreaming(false);
    setIsPendingBackground(false);
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setStreamState(initStreamState());
    setStatusText('');
    setError(null);
    setSources([]);
  }, [disconnect]);

  return {
    streamState,
    streamingText: streamState.answer,
    status: statusText,
    isStreaming,
    isPendingBackground,
    error,
    metadata: {
      confidence: streamState.confidence,
    },
    metrics: streamState.metrics,
    artifacts: streamState.artifacts,
    nodes: streamState.nodes,
    rootOrder: streamState.rootOrder,
    steps: Object.values(streamState.nodes),
    sources,
    send,
    disconnect,
    reset,
  };
};
