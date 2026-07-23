import apiClient from './apiClient';

export const promptAdminService = {
  getAgentPrompts: async () => {
    const response = await apiClient.get('/api/admin/prompts/agents');
    return response.data;
  },

  getPromptsList: async () => {
    const response = await apiClient.get('/api/admin/prompts/list');
    return response.data;
  },

  createPrompt: async (data) => {
    const response = await apiClient.post('/api/admin/prompts/new', data);
    return response.data;
  },

  activatePrompt: async (data) => {
    const response = await apiClient.post('/api/admin/prompts/activate', data);
    return response.data;
  },

  deletePrompt: async ({ agentId, promptKey, version }) => {
    const response = await apiClient.delete('/api/admin/prompts/delete', { params: { agentId, promptKey, version } });
    return response.data;
  }
};
