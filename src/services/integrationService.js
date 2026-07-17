import apiClient from './apiClient';

export const integrationService = {
  connectIntegration: async (data) => {
    // data: { provider, accessToken, refreshToken, scopes, expiresAt }
    const response = await apiClient.post('/integrations/connect', data);
    return response.data;
  },

  disconnectIntegration: async (integrationId) => {
    const response = await apiClient.post(`/integrations/${integrationId}/disconnect`);
    return response.data;
  }
};
