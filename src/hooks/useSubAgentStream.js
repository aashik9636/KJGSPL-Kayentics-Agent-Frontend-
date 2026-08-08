import { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { initStreamState, applyChunk } from '../utils/streamReducer';

/**
 * WebSocket streaming hook for direct Specialized Domain Sub-Agents.
 *
 * Connects to `/conversations/:agentSlug/stream` (or `/chat/:agentSlug/stream`).
 * Uses streamReducer for in-place Step Tree merging, cumulative metrics,
 * artifact de-duplication, and live Markdown token accumulation.
 */
export const useSubAgentStream = () => {
  const [streamState, setStreamState] = useState(initStreamState());
  const [sources, setSources] = useState([]);
  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const startBackgroundExecution = useCallback(async (agentSlug, sessionId, message, jobId, options = {}) => {
    setStreamState({
      ...initStreamState(),
      isStreaming: false,
      isPendingBackground: true,
      statusText: `Processing ${agentSlug} query...`,
    });
    setSources([]);

    try {
      const { organizationId, workspaceId } = useWorkspaceStore.getState();
      const apiClient = (await import('../services/apiClient')).default;
      
      const endpoint = agentSlug === 'image-generation' ? '/api/chat/image-generation' : `/api/chat/${agentSlug}`;
      const payload = agentSlug === 'image-generation' ? {
        prompt_text: message,
        prompt: message,
        userQuery: message,
        user_query: message,
        message,
        platform: options?.platform || 'instagram',
        companyId: workspaceId || undefined,
        company_id: workspaceId || undefined,
        organizationId: organizationId || undefined,
        sessionId,
        session_id: sessionId,
        jobId: jobId || undefined,
        job_id: jobId || undefined,
      } : {
        message,
        userQuery: message,
        user_query: message,
        query: message,
        prompt: message,
        request: message,
        goal: message,
        sessionId,
        session_id: sessionId,
        jobId: jobId || undefined,
        job_id: jobId || undefined,
        organizationId,
        workspaceId,
        companyId: workspaceId || undefined,
        company_id: workspaceId || undefined,
      };

      const res = await apiClient.post(endpoint, payload);

      const data = res.data?.data || res.data || {};
      const answer = data?.response || data?.finalAnswer || data?.content || data?.summary || ((data?.image_generated && data?.image_url) ? 'Generated visual asset.' : 'Task completed.');
      const extractedArtifacts = Array.isArray(data?.artifacts) ? data.artifacts : ((data?.image_generated && data?.image_url) ? [{ type: 'image', url: data.image_url }] : []);

      setSources(data?.sources || []);
      setStreamState(prev => ({
        ...prev,
        isPendingBackground: false,
        statusText: '',
        answer: answer,
        metadata: data?.metadata || data || null,
        artifacts: extractedArtifacts.length > 0 ? extractedArtifacts : prev.artifacts,
      }));
    } catch (err) {
      console.error(`Failed execution for ${agentSlug}:`, err);
      setStreamState(prev => ({
        ...prev,
        isPendingBackground: false,
        statusText: '',
        error: 'Failed to complete request.',
      }));
    }
  }, []);

  const send = useCallback((agentSlug, sessionId, message, options = {}) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      setStreamState(prev => ({ ...prev, error: 'Not authenticated' }));
      return;
    }

    if (!agentSlug || agentSlug === 'brain') {
      return;
    }

    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const jobId = options.jobId || options.job_id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const queryText = (message || options.query || options.user_query || options.prompt || '').toString().trim();

    // All subagents currently use REST direct dispatch
    startBackgroundExecution(agentSlug, sessionId, queryText, jobId, options);
    return;

    setStreamState({
      ...initStreamState(),
      isStreaming: true,
      statusText: `Connecting to ${agentSlug} agent...`,
    });
    setSources([]);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const defaultWsUrl = apiBaseUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || defaultWsUrl;
    const socketUrl = `${wsBaseUrl}/conversations/${agentSlug}/stream?token=${accessToken}&session_id=${sessionId}&job_id=${encodeURIComponent(jobId)}&query=${encodeURIComponent(queryText)}&user_query=${encodeURIComponent(queryText)}&message=${encodeURIComponent(queryText)}&prompt=${encodeURIComponent(queryText)}&request=${encodeURIComponent(queryText)}&goal=${encodeURIComponent(queryText)}&bypass-tunnel-reminder=true&ngrok-skip-browser-warning=true`;

    try {
      const socket = new WebSocket(socketUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStreamState(prev => ({ ...prev, statusText: `Running ${agentSlug} query...` }));
        const queryStr = String(queryText || message || '').trim();
        const payload = {
          query: queryStr,
          user_query: queryStr,
          message: queryStr,
          request: queryStr,
          prompt: queryStr,
          goal: queryStr,
          session_id: String(sessionId || ''),
          job_id: String(jobId || ''),
          token: String(accessToken || ''),
          company_id: workspaceId || undefined,
          organization_id: organizationId || undefined,
        };
        socket.send(JSON.stringify(payload));
      };

      socket.onmessage = (event) => {
        try {
          const chunk = JSON.parse(event.data);
          if (chunk.metadata?.sources) {
            setSources(chunk.metadata.sources);
          }
          setStreamState(prev => applyChunk(prev, chunk));
        } catch (err) {
          console.error(`Failed to parse ${agentSlug} WebSocket message`, err);
        }
      };

      socket.onerror = (event) => {
        console.warn(`${agentSlug} WebSocket Error, triggering background execution fallback`, event);
        startBackgroundExecution(agentSlug, sessionId, message, jobId);
      };

      socket.onclose = () => {
        setStreamState(prev => ({ ...prev, isStreaming: false }));
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
    setStreamState(prev => ({ ...prev, isStreaming: false, isPendingBackground: false }));
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setStreamState(initStreamState());
    setSources([]);
  }, [disconnect]);

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
    sources,
    send,
    disconnect,
    reset,
    startBackgroundExecution
  };
};
