import { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';

/**
 * WebSocket streaming hook for the Main Brain Agent.
 *
 * Connects to the Node.js proxy at `/conversations/brain/stream` which
 * forwards to Python's `/api/brain/stream`. Streams token-by-token progress,
 * live metrics snapshots, step status, and artifacts for real-time UX.
 */
export const useBrainStream = () => {
  const [streamingText, setStreamingText] = useState('');
  const [status, setStatus] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPendingBackground, setIsPendingBackground] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [steps, setSteps] = useState([]);

  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const currentJobIdRef = useRef(null);

  const startBackgroundExecution = useCallback(async (sessionId, userQuery, jobId) => {
    setIsStreaming(false);
    setIsPendingBackground(true);
    setStatus('Processing in background...');

    try {
      const { organizationId, workspaceId } = useWorkspaceStore.getState();
      
      // Dispatch REST background run
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

          // When ASSISTANT reply appears in DB, background task is finished!
          if (lastMsg && (lastMsg.role === 'ASSISTANT' || lastMsg.role === 'assistant')) {
            clearInterval(pollIntervalRef.current);
            setIsPendingBackground(false);
            setStatus('');
            setStreamingText(lastMsg.content || lastMsg.text || '');
            setMetadata(lastMsg.metadata || null);
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 3000);

    } catch (err) {
      console.error('Failed to start background execution:', err);
      setIsPendingBackground(false);
      setStatus('');
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
    setStatus('Connecting to Brain Agent...');
    setError(null);
    setStreamingText('');
    setMetadata(null);
    setMetrics(null);
    setArtifacts([]);
    setSteps([]);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const defaultWsUrl = apiBaseUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || defaultWsUrl;
    const socketUrl = `${wsBaseUrl}/conversations/brain/stream?token=${accessToken}&job_id=${encodeURIComponent(jobId)}&bypass-tunnel-reminder=true&ngrok-skip-browser-warning=true`;
    
    try {
      const socket = new WebSocket(socketUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStatus('Analyzing query intent...');
        socket.send(JSON.stringify({
          user_query: userQuery,
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

          switch (chunk.type) {
            case 'status':
              setStatus(chunk.content);
              if (chunk.metadata) {
                if (chunk.metadata.artifact) {
                  setArtifacts(prev => [...prev, chunk.metadata.artifact]);
                }
                const stepId = chunk.metadata.step_id || chunk.metadata.step || `step_${Date.now()}_${Math.random()}`;
                const stepLabel = chunk.metadata.label || chunk.metadata.agent_label || 'Brain Agent';
                const stepSummary = chunk.metadata.summary || chunk.content;
                const stepState = chunk.metadata.state || 'running';
                const stepKind = chunk.metadata.kind || 'step';

                setSteps(prev => {
                  const idx = prev.findIndex(s => s.id === stepId);
                  if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = {
                      ...updated[idx],
                      state: stepState,
                      summary: stepSummary,
                      label: stepLabel,
                      preview: chunk.metadata.preview || updated[idx].preview,
                    };
                    return updated;
                  }
                  return [
                    ...prev,
                    {
                      id: stepId,
                      parent: chunk.metadata.parent || null,
                      kind: stepKind,
                      state: stepState,
                      label: stepLabel,
                      summary: stepSummary,
                      preview: chunk.metadata.preview || null,
                    },
                  ];
                });
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

            case 'image_result':
              if (chunk.metadata) {
                if (chunk.metadata.image_url) {
                  setArtifacts(prev => [...prev, { type: 'image', url: chunk.metadata.image_url, ...chunk.metadata }]);
                }
                setSteps(prev => [
                  ...prev,
                  {
                    id: Date.now(),
                    label: 'Image Generator',
                    summary: chunk.metadata.status === 'ready' ? 'Generated visual asset' : 'Generating image...',
                    preview: chunk.metadata.image_url || null,
                  },
                ]);
              }
              break;

            case 'campaign_section':
              if (chunk.metadata) {
                setSteps(prev => [
                  ...prev,
                  {
                    id: Date.now(),
                    label: 'Campaign Planner',
                    summary: `Generated section: ${chunk.metadata.section || 'Campaign Strategy'}`,
                    data: chunk.metadata.data,
                  },
                ]);
              }
              break;

            case 'post_scheduled':
              if (chunk.metadata) {
                setSteps(prev => [
                  ...prev,
                  {
                    id: Date.now(),
                    label: 'Post Scheduler',
                    summary: `Scheduled ${chunk.metadata.platform || 'Social'} post: ${chunk.metadata.topic || ''}`,
                    preview: chunk.metadata.image_url || null,
                  },
                ]);
              }
              break;

            case 'trend_result':
              if (chunk.metadata) {
                setSteps(prev => [
                  ...prev,
                  {
                    id: Date.now(),
                    label: 'Trend Scout',
                    summary: `Found trend: ${chunk.metadata.trend_name || 'Market Insight'}`,
                    preview: chunk.metadata.why_trending || null,
                  },
                ]);
              }
              break;

            case 'business_profile_result':
            case 'content_result':
            case 'creative_result':
              if (chunk.metadata) {
                setSteps(prev => [
                  ...prev,
                  {
                    id: Date.now(),
                    label: chunk.type.replace('_result', '').replace(/_/g, ' ').toUpperCase(),
                    summary: chunk.metadata.status || 'Completed stage',
                    data: chunk.metadata.distilled_company_info || chunk.metadata.final_content || chunk.metadata.data,
                  },
                ]);
              }
              break;

            default:
              if (chunk.metadata || chunk.content) {
                setSteps(prev => [
                  ...prev,
                  {
                    id: Date.now(),
                    label: chunk.type ? chunk.type.toUpperCase() : 'AGENT EVENT',
                    summary: chunk.content || (typeof chunk.metadata === 'string' ? chunk.metadata : 'Processing stage'),
                  },
                ]);
              }
              break;
          }
        } catch (err) {
          console.error('Failed to parse Brain Stream message', err);
        }
      };

      socket.onerror = () => {
        // Fallback to Background Async Mode if socket fails
        setError('Connection error — falling back to background processing.');
        setIsStreaming(false);
        setStatus('');
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
    setStreamingText('');
    setStatus('');
    setError(null);
    setMetadata(null);
    setMetrics(null);
    setArtifacts([]);
    setSteps([]);
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
    send,
    disconnect,
    reset,
    startBackgroundExecution
  };
};
