import { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { initStreamState, applyChunk } from '../utils/streamReducer';

/**
 * WebSocket streaming hook for the Main Brain Agent.
 *
 * Connects to `/conversations/brain/stream` (or `/api/brain/stream`).
 * Uses streamReducer for in-place Step Tree merging, cumulative metrics,
 * artifact de-duplication, and live Markdown token accumulation.
 */
export const useBrainStream = () => {
  const [streamState, setStreamState] = useState(initStreamState());
  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const currentJobIdRef = useRef(null);

  const startBackgroundExecution = useCallback(async (sessionId, userQuery, jobId) => {
    setStreamState(prev => ({
      ...prev,
      isStreaming: false,
      isPendingBackground: true,
      statusText: 'Processing in background...',
    }));

    try {
      const { organizationId, workspaceId } = useWorkspaceStore.getState();
      const apiClient = (await import('../services/apiClient')).default;
      
      await apiClient.post('/api/brain/run', {
        sessionId,
        userQuery,
        jobId: jobId || undefined,
        job_id: jobId || undefined,
        companyId: workspaceId || undefined,
        organizationId: organizationId || undefined,
      });

      pollIntervalRef.current = setInterval(async () => {
        try {
          const historyRes = await apiClient.get(`/conversations/${sessionId}/messages`);
          const messages = historyRes.data || [];
          const lastMsg = messages[messages.length - 1];

          if (lastMsg && (lastMsg.role === 'ASSISTANT' || lastMsg.role === 'assistant')) {
            clearInterval(pollIntervalRef.current);
            setStreamState(prev => ({
              ...prev,
              isPendingBackground: false,
              statusText: '',
              answer: lastMsg.content || lastMsg.text || '',
              metadata: lastMsg.metadata || null,
            }));
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 3000);

    } catch (err) {
      console.error('Failed to start background execution:', err);
      setStreamState(prev => ({
        ...prev,
        isPendingBackground: false,
        statusText: '',
        error: 'Failed to start background task.',
      }));
    }
  }, []);

  const send = useCallback((sessionId, userQuery, options = {}) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      setStreamState(prev => ({ ...prev, error: 'Not authenticated' }));
      return;
    }

    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const jobId = options.jobId || options.job_id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    currentJobIdRef.current = jobId;

    // Reset stream state and set connecting
    setStreamState({
      ...initStreamState(),
      isStreaming: true,
      statusText: 'Connecting to Brain Agent...',
    });

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const defaultWsUrl = apiBaseUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || defaultWsUrl;
    const socketUrl = `${wsBaseUrl}/conversations/brain/stream?token=${accessToken}&session_id=${sessionId}&job_id=${encodeURIComponent(jobId)}&bypass-tunnel-reminder=true&ngrok-skip-browser-warning=true`;
    
    try {
      const socket = new WebSocket(socketUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStreamState(prev => ({ ...prev, statusText: 'Analyzing query intent...' }));
        socket.send(JSON.stringify({
          user_query: userQuery,
          message: userQuery,
          session_id: sessionId,
          job_id: jobId,
          task_id: jobId,
          token: accessToken,
          company_id: workspaceId || undefined,
          organization_id: organizationId || undefined,
        }));
      };

      socket.onmessage = (event) => {
        try {
          const chunk = JSON.parse(event.data);
          setStreamState(prev => applyChunk(prev, chunk));
        } catch (err) {
          console.error('Failed to parse Brain Stream message', err);
        }
      };

      socket.onerror = () => {
        setStreamState(prev => ({
          ...prev,
          error: 'Connection error — falling back to background processing.',
          isStreaming: false,
        }));
        startBackgroundExecution(sessionId, userQuery, jobId);
      };

      socket.onclose = () => {
        setStreamState(prev => ({ ...prev, isStreaming: false }));
      };
    } catch (wsErr) {
      console.error('Failed to initialize WebSocket:', wsErr);
      startBackgroundExecution(sessionId, userQuery, jobId);
    }
  }, [startBackgroundExecution]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setStreamState(prev => ({ ...prev, isStreaming: false, isPendingBackground: false }));
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setStreamState(initStreamState());
  }, [disconnect]);

  // Derived compatibility fields for existing UI
  const stepsList = Object.values(streamState.nodes).length > 0
    ? Object.values(streamState.nodes)
    : [];

  return {
    streamState,
    streamingText: streamState.answer,
    status: streamState.statusText,
    isStreaming: streamState.isStreaming,
    isPendingBackground: streamState.isPendingBackground,
    error: streamState.error,
    metadata: streamState.metadata,
    metrics: streamState.metrics,
    artifacts: streamState.artifacts,
    steps: stepsList,
    nodes: streamState.nodes,
    rootOrder: streamState.rootOrder,
    confidence: streamState.confidence,
    send,
    disconnect,
    reset,
    startBackgroundExecution
  };
};
