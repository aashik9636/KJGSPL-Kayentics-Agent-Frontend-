import { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';

/**
 * WebSocket streaming hook for the Main Brain Agent.
 *
 * Connects to the Node.js proxy at `/conversations/brain/stream` which
 * forwards to Python's `/api/brain/stream`. Streams token-by-token progress
 * for real-time UX instead of waiting for the full REST response.
 *
 * Stream protocol (from Python → Node proxy → frontend):
 *   { type: "status",  content: "Analyzing query intent..." }
 *   { type: "token",   content: "partial " }
 *   { type: "token",   content: "answer text" }
 *   { type: "done",    metadata: { in_scope, target_orchestrators } }
 *   { type: "error",   content: "error message" }
 */
export const useBrainStream = () => {
  const [streamingText, setStreamingText] = useState('');
  const [status, setStatus] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const wsRef = useRef(null);

  const send = useCallback((sessionId, userQuery) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      setError('Not authenticated');
      return;
    }

    const { organizationId, workspaceId } = useWorkspaceStore.getState();

    setIsStreaming(true);
    setStatus('Connecting to Brain Agent...');
    setError(null);
    setStreamingText('');
    setMetadata(null);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const defaultWsUrl = apiBaseUrl.replace(/^http/, 'ws');
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || defaultWsUrl;
    const socketUrl = `${wsBaseUrl}/conversations/brain/stream?token=${accessToken}`;
    const socket = new WebSocket(socketUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setStatus('Analyzing query intent...');
      socket.send(JSON.stringify({
        user_query: userQuery,
        session_id: sessionId,
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
            console.warn('Unknown Brain Stream chunk type:', chunk.type);
        }
      } catch (err) {
        console.error('Failed to parse Brain Stream message', err);
      }
    };

    socket.onerror = () => {
      setError('Connection error — falling back to REST.');
      setIsStreaming(false);
      setStatus('');
    };

    socket.onclose = () => {
      setIsStreaming(false);
    };
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
  }, [disconnect]);

  return {
    streamingText,
    status,
    isStreaming,
    error,
    metadata,
    send,
    disconnect,
    reset,
  };
};
