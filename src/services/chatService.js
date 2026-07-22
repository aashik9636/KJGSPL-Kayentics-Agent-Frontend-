import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const chatService = {
  // ─── AI Agent Endpoints ────────────────────────────────────────────────────

  /**
   * Create (or reuse) a chat session with the AI agent.
   * Calls POST /api/chat/new
   * Returns: { session_id, user_id, agent_id }
   */
  createChatSession: async () => {
    const response = await apiClient.post('/api/chat/new');
    // apiClient interceptor unwraps { data: { session_id, ... } } → response.data
    return response.data;
  },

  /**
   * Run the Main Brain Meta-Orchestrator for a user query.
   * Calls POST /api/brain/run
   * Request:  { userQuery, sessionId, companyId, organizationId }  ← camelCase (Node validates these)
   * Response: { sessionId, inScope, targetOrchestrators, finalAnswer, executionResults }
   */
  runBrainAgent: async (sessionId, userQuery) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/brain/run', {
      userQuery,                              // ✅ camelCase — required by Node backend
      sessionId,                             // ✅ camelCase
      companyId:      workspaceId || undefined,
      organizationId: organizationId || undefined,
    });
    return response.data;
  },

  // ─── Conversation History (Sidebar) ───────────────────────────────────────

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
};
