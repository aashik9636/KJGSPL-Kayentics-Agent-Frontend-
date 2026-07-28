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

  stopBrainSession: async (sessionId) => {
    const response = await apiClient.post(`/api/brain/stop/${sessionId}`);
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
    const response = await apiClient.put('/api/brain/model-preference', preference);
    return response.data;
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
    const response = await apiClient.post(`/api/chat/${agentSlug}`, {
      ...data,
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
    const response = await apiClient.post('/conversations', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  getConversations: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    try {
      const response = await apiClient.get('/conversations', {
        params: { 
          ...(organizationId ? { organizationId } : {}),
          ...(workspaceId ? { workspaceId } : {}),
          ...params 
        }
      });
      return response.data;
    } catch (err) {
      // Silently return empty list — conversation history is non-critical
      return [];
    }
  },

  getConversationDetails: async (id) => {
    const response = await apiClient.get(`/conversations/${id}`);
    return response.data;
  },

  updateConversation: async (id, data) => {
    const response = await apiClient.put(`/conversations/${id}`, data);
    return response.data;
  },

  deleteConversation: async (id) => {
    const response = await apiClient.delete(`/conversations/${id}`);
    return response.data;
  },

  exportConversation: async (id) => {
    const response = await apiClient.get(`/conversations/${id}/export`);
    return response.data;
  },

  // ─── Messages ─────────────────────────────────────────────────────────────
  sendMessage: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/messages', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  sendConversationMessage: async (conversationId, data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  getMessagesByConversation: async (conversationId) => {
    const response = await apiClient.get(`/messages/${conversationId}`);
    return response.data;
  },

};
