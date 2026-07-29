import { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';

/**
 * WebSocket streaming hook for direct Specialized Domain Sub-Agents.
 *
 * Connects to the Node.js proxy at `/conversations/:agentSlug/stream` which
 * forwards to Python's `/chat/:agentSlug/stream`. Handles streaming chunks
 * (status, token, done, error) in real-time.
 */
export const useSubAgentStream = () => {
  const [streamingText, setStreamingText] = useState('');
  const [status, setStatus] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPendingBackground, setIsPendingBackground] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [steps, setSteps] = useState([]);
  const [sources, setSources] = useState([]);

  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const startBackgroundExecution = useCallback(async (agentSlug, sessionId, message, jobId) => {
    setIsStreaming(false);
    setIsPendingBackground(true);
    setStatus(`Processing ${agentSlug} query...`);

    try {
      const { organizationId, workspaceId } = useWorkspaceStore.getState();
      const apiClient = (await import('../services/apiClient')).default;
      
      // Dispatch REST fallback run
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
      setStatus('');
      const answer = data?.response || data?.finalAnswer || data?.content || 'Task completed.';
      setStreamingText(answer);
      setSources(data?.sources || []);
      setMetadata(data?.metadata || data || null);
    } catch (err) {
      console.error(`Failed background execution for ${agentSlug}:`, err);
      setIsPendingBackground(false);
      setStatus('');
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
    setStatus(`Connecting to ${agentSlug} agent...`);
    setError(null);
    setStreamingText('');
    setMetadata(null);
    setMetrics(null);
    setArtifacts([]);
    setSteps([]);
    setSources([]);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const defaultWsUrl = apiBaseUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || defaultWsUrl;
    const socketUrl = `${wsBaseUrl}/conversations/${agentSlug}/stream?token=${accessToken}&session_id=${sessionId}&job_id=${encodeURIComponent(jobId)}&bypass-tunnel-reminder=true&ngrok-skip-browser-warning=true`;

    try {
      const socket = new WebSocket(socketUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStatus(`Running ${agentSlug} query...`);
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

          switch (chunk.type) {
            case 'status':
              setStatus(chunk.content);
              if (chunk.metadata) {
                if (chunk.metadata.artifact) {
                  setArtifacts(prev => [...prev, chunk.metadata.artifact]);
                }
                setSteps(prev => [
                  ...prev,
                  {
                    id: chunk.metadata.step || Date.now(),
                    label: chunk.metadata.agent_label || `${agentSlug} agent`,
                    summary: chunk.metadata.summary || chunk.content,
                    preview: chunk.metadata.preview || null,
                  },
                ]);
              }
              break;

            case 'metrics':
              if (chunk.metadata) {
                setMetrics(prev => ({ ...(prev || {}), ...chunk.metadata }));
              }
              break;

            case 'token':
              setStatus('');
              setStreamingText(prev => prev + chunk.content);
              break;

            case 'done':
              setIsStreaming(false);
              setStatus('');
              if (chunk.metadata?.sources) {
                setSources(chunk.metadata.sources);
              }
              if (chunk.metadata?.artifacts && Array.isArray(chunk.metadata.artifacts)) {
                setArtifacts(chunk.metadata.artifacts);
              }
              setMetadata(chunk.metadata || null);
              socket.close();
              break;

            case 'error':
              setError(chunk.content || 'An error occurred during generation.');
              setIsStreaming(false);
              setStatus('');
              socket.close();
              break;

            default:
              if (chunk.metadata || chunk.content) {
                setSteps(prev => [
                  ...prev,
                  {
                    id: Date.now(),
                    label: chunk.type ? chunk.type.toUpperCase() : 'AGENT EVENT',
                    summary: chunk.content || 'Processing stage',
                  },
                ]);
              }
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
    setStreamingText('');
    setStatus('');
    setError(null);
    setMetadata(null);
    setMetrics(null);
    setArtifacts([]);
    setSteps([]);
    setSources([]);
  }, [disconnect]);

  return {
    streamingText,
    status,
    isStreaming,
    isPendingBackground,
    error,
    metadata,
    metrics,
    artifacts,
    steps,
    sources,
    send,
    disconnect,
    reset,
  };
};
