import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const chatService = {
  // ─── AI Agent Endpoints ────────────────────────────────────────────────────
  createChatSession: async () => {
    const response = await apiClient.post('/api/chat/new', {});
    return response.data;
  },

  runBrainAgent: async (sessionId, userQuery, options = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/brain/run', {
      userQuery,
      sessionId,
      jobId: options?.jobId || options?.job_id || undefined,
      companyId: workspaceId || undefined,
      organizationId: organizationId || undefined,
    });
    return response.data;
  },

  replayBrainStream: async (sessionId, jobId) => {
    const query = jobId ? `?job_id=${encodeURIComponent(jobId)}` : '';
    const response = await apiClient.get(`/api/brain/replay/${sessionId}${query}`);
    return response.data;
  },

  replayOrchestratorStream: async (sessionId, jobId) => {
    const query = jobId ? `?job_id=${encodeURIComponent(jobId)}` : '';
    const response = await apiClient.get(`/chat/orchestrator/replay/${sessionId}${query}`);
    return response.data;
  },

  replaySubAgentStream: async (sessionId, jobId) => {
    const query = jobId ? `?job_id=${encodeURIComponent(jobId)}` : '';
    const response = await apiClient.get(`/chat/replay/${sessionId}${query}`);
    return response.data;
  },

  stopBrainSession: async (sessionId) => {
    const response = await apiClient.post(`/api/sessions/${sessionId}/stop`);
    return response.data;
  },

  getBrainModels: async (category = 'llm') => {
    const response = await apiClient.get('/api/brain/models', { params: { category } });
    return response.data;
  },

  getBrainModelPreference: async (category = 'llm') => {
    const response = await apiClient.get('/api/brain/model-preference', { params: { category } });
    return response.data;
  },

  setBrainModelPreference: async (preference) => {
    // Note: PUT /api/brain/model-preference is disabled (410 Gone).
    // Per-user model selection is controlled by super-admin category defaults and agent policies.
    console.warn('Per-user model preference setting is disabled (read-only/super-admin managed).');
    return { success: false, message: 'Model preferences are managed globally by administrators.' };
  },

  runOrchestrator: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/orchestrator/run', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  chatOrchestrator: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/chat/orchestrator', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  runSubAgentChat: async (agentSlug, data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const payload = typeof data === 'string' ? { userQuery: data } : (data || {});
    const query = payload.userQuery || payload.message || payload.query || '';
    const sid = payload.sessionId || payload.session_id;

    const response = await apiClient.post(`/api/chat/${agentSlug}`, {
      userQuery: query,
      message: query,
      sessionId: sid,
      session_id: sid,
      ...payload,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  runStockMarketAgent: async (data) => chatService.runSubAgentChat('stock-market', data),
  runResearchAgent: async (data) => chatService.runSubAgentChat('research', data),
  runMarketAgent: async (data) => chatService.runSubAgentChat('market', data),
  runLeadGenAgent: async (data) => chatService.runSubAgentChat('lead-generation', data),
  runRecruitmentAgent: async (data) => chatService.runSubAgentChat('recruitment', data),
  runSocialTrendsAgent: async (data) => chatService.runSubAgentChat('social-trends', data),
  runContentWriterAgent: async (data) => chatService.runSubAgentChat('content-writer', data),
  runImageQueryAgent: async (data) => chatService.runSubAgentChat('image-query', data),
  runCampaignPlannerAgent: async (data) => chatService.runSubAgentChat('campaign-planner', data),
  runPostSchedulerAgent: async (data) => chatService.runSubAgentChat('post-scheduler', data),
  runImageGenerationAgent: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const payload = typeof data === 'string' ? { prompt_text: data } : (data || {});
    const response = await apiClient.post('/api/chat/image-generation', {
      prompt_text: payload.prompt_text || payload.prompt || payload.userQuery || payload.message || '',
      platform: payload.platform || 'instagram',
      companyId: workspaceId || payload.companyId || undefined,
      organizationId: organizationId || payload.organizationId || undefined,
    });
    return response.data;
  },

  getBrainReplay: async (sessionId, jobId = '') => {
    const response = await apiClient.get(`/api/brain/replay/${sessionId}`, {
      params: { job_id: jobId || undefined }
    });
    return response.data;
  },

  getReplay: async (sessionId, jobId = '') => {
    const response = await apiClient.get(`/chat/replay/${sessionId}`, {
      params: { job_id: jobId || undefined }
    });
    return response.data;
  },

  searchTrends: async (data) => {
    const response = await apiClient.post('/api/trends/search', data);
    return response.data;
  },

  generateCampaign: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/campaign/generate', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  analyzeBusiness: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/business/analyze', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  generateContent: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/generate', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  generateCreative: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/creative/generate', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  generateImage: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/content/generate-image', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  generateImageFromQuery: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/image-query/generate', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  generateContentSimple: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/generate/simple', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  orchestratorAnswer: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/orchestrator/answer', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  getOrchestratorStatus: async (taskId) => {
    const response = await apiClient.get(`/api/orchestrator/status/${taskId}`);
    return response.data;
  },

  // ─── Conversations (REST) ─────────────────────────────────────────────────
  createConversation: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/conversations', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  getConversations: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/chat/sessions', { params });
      const sessions = response.data.sessions || response.data || [];
      // Map session_id to id for compatibility with UI components
      return sessions.map(s => ({
        ...s,
        id: s.id || s.session_id,
        title: s.title || 'Untitled Chat'
      }));
    } catch (err) {
      // Silently return empty list — conversation history is non-critical
      return [];
    }
  },

  getConversationDetails: async (id) => {
    const response = await apiClient.get(`/api/conversations/${id}`);
    return response.data;
  },

  updateConversation: async (id, data) => {
    const response = await apiClient.put(`/api/conversations/${id}`, data);
    return response.data;
  },

  deleteConversation: async (id) => {
    const response = await apiClient.delete(`/api/conversations/${id}`);
    return response.data;
  },

  exportConversation: async (id) => {
    const response = await apiClient.get(`/api/conversations/${id}/export`);
    return response.data;
  },

  // ─── Messages ─────────────────────────────────────────────────────────────
  sendMessage: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/messages', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  sendConversationMessage: async (conversationId, data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post(`/api/conversations/${conversationId}/messages`, {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await apiClient.get(`/api/chat/history/${conversationId}`);
    return response.data.conversation || response.data || [];
  },

  getMessagesByConversation: async (conversationId) => {
    const response = await apiClient.get(`/api/messages/${conversationId}`);
    return response.data;
  },

};
