import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const chatService = {
  createConversation: async (data) => {
    // data: { title, agentId, description }
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
    const response = await apiClient.get('/conversations', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getConversationDetails: async (id) => {
    const response = await apiClient.get(`/conversations/${id}`);
    return response.data;
  },

  updateConversation: async (id, data) => {
    // data: { title, description, pinned, archived, status }
    const response = await apiClient.put(`/conversations/${id}`, data);
    return response.data;
  },

  deleteConversation: async (id) => {
    const response = await apiClient.delete(`/conversations/${id}`);
    return response.data;
  },

  runMainBrainApi: async (userQuery, sessionId) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/brain/run', {
      userQuery,
      sessionId,
      companyId: workspaceId,
      organizationId
    });
    return response.data; // Expects JSON { success, data: { finalAnswer, targetOrchestrators, ... } }
  }
};
