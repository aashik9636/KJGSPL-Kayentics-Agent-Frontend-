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
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [sources, setSources] = useState([]);

  const wsRef = useRef(null);

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
    setStatus(`Connecting to ${agentSlug} agent...`);
    setError(null);
    setStreamingText('');
    setMetadata(null);
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
              console.warn(`Unknown ${agentSlug} stream chunk type:`, chunk.type);
          }
        } catch (err) {
          console.error(`Failed to parse ${agentSlug} WebSocket message`, err);
        }
      };

      socket.onerror = (event) => {
        console.error(`${agentSlug} WebSocket Error`, event);
        setError('Connection error occurred.');
        setIsStreaming(false);
        setStatus('');
      };

      socket.onclose = () => {
        setIsStreaming(false);
      };
    } catch (wsErr) {
      console.error(`Failed to initialize ${agentSlug} WebSocket:`, wsErr);
      setIsStreaming(false);
      setError('Failed to establish WebSocket connection.');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setStreamingText('');
    setStatus('');
    setError(null);
    setMetadata(null);
    setSources([]);
  }, [disconnect]);

  return {
    streamingText,
    status,
    isStreaming,
    error,
    metadata,
    sources,
    send,
    disconnect,
    reset,
  };
};
