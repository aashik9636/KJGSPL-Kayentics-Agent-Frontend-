import { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { initStreamState, applyChunk } from '../services/streamReducer';

/**
 * WebSocket streaming hook for the Main Brain Agent.
 *
 * Implements the exact Claude-style streaming specification:
 * - Uses streamReducer's initStreamState() and applyChunk(state, chunk)
 * - Map<step_id, StepNode> step tree in-place merging
 * - Absolute cumulative metrics merging
 * - Mid-run & terminal artifact de-duplication by url
 */
export const useBrainStream = () => {
  const [streamState, setStreamState] = useState(initStreamState());
  const [statusText, setStatusText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPendingBackground, setIsPendingBackground] = useState(false);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const currentJobIdRef = useRef(null);

  const startBackgroundExecution = useCallback(async (sessionId, userQuery, jobId) => {
    setIsStreaming(false);
    setIsPendingBackground(true);
    setStatusText('Processing in background...');

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

      // Poll for completion every 3 seconds
      pollIntervalRef.current = setInterval(async () => {
        try {
          const historyRes = await apiClient.get(`/conversations/${sessionId}/messages`);
          const messages = historyRes.data || [];
          const lastMsg = messages[messages.length - 1];

          if (lastMsg && (lastMsg.role === 'ASSISTANT' || lastMsg.role === 'assistant')) {
            clearInterval(pollIntervalRef.current);
            setIsPendingBackground(false);
            setStatusText('');
            setStreamState(prev => ({
              ...prev,
              answer: lastMsg.content || lastMsg.text || '',
              done: true,
            }));
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 3000);

    } catch (err) {
      console.error('Failed to start background execution:', err);
      setIsPendingBackground(false);
      setStatusText('');
      setError('Failed to start background task.');
    }
  }, []);

  const send = useCallback((sessionId, userQuery, options = {}) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      setError('Not authenticated');
      return;
    }

    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const jobId = options.jobId || options.job_id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    currentJobIdRef.current = jobId;

    setIsStreaming(true);
    setIsPendingBackground(false);
    setStatusText('Connecting to Brain Agent...');
    setError(null);
    setStreamState(initStreamState());

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const defaultWsUrl = apiBaseUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || defaultWsUrl;
    const socketUrl = `${wsBaseUrl}/conversations/brain/stream?token=${accessToken}&job_id=${encodeURIComponent(jobId)}&bypass-tunnel-reminder=true&ngrok-skip-browser-warning=true`;

    try {
      const socket = new WebSocket(socketUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStatusText('Analyzing query intent...');
        socket.send(JSON.stringify({
          user_query: userQuery,
          message: userQuery,
          session_id: sessionId,
          job_id: jobId,
          task_id: jobId,
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
          console.error('Failed to parse Brain Stream message', err);
        }
      };

      socket.onerror = () => {
        setError('Connection error — falling back to background processing.');
        setIsStreaming(false);
        setStatusText('');
        startBackgroundExecution(sessionId, userQuery, jobId);
      };

      socket.onclose = () => {
        setIsStreaming(false);
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
    setIsStreaming(false);
    setIsPendingBackground(false);
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setStreamState(initStreamState());
    setStatusText('');
    setError(null);
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
      targetOrchestrators: streamState.targetOrchestrators,
      inScope: streamState.inScope,
    },
    metrics: streamState.metrics,
    artifacts: streamState.artifacts,
    nodes: streamState.nodes,
    rootOrder: streamState.rootOrder,
    steps: Object.values(streamState.nodes),
    send,
    disconnect,
    reset,
    startBackgroundExecution,
  };
};
