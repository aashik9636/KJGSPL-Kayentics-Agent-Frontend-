import apiClient from './apiClient';

const cleanParams = (params = {}) => {
  const cleaned = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      cleaned[key] = params[key];
    }
  });
  return cleaned;
};

export const aiUsageService = {
  /**
   * Get AI Usage Dashboard Summary (Total tokens, costs, request count, latency)
   */
  async getDashboardSummary(organizationId, workspaceId, filters = {}) {
    const params = cleanParams({ organizationId, workspaceId, ...filters });
    const response = await apiClient.get('/ai-usage/dashboard', { params });
    return response.data;
  },

  /**
   * Get Daily Usage aggregated logs
   */
  async getDailyUsage(organizationId, workspaceId, filters = {}) {
    const params = cleanParams({ organizationId, workspaceId, ...filters });
    const response = await apiClient.get('/ai-usage/daily', { params });
    return response.data;
  },

  /**
   * Get Monthly Usage aggregated logs
   */
  async getMonthlyUsage(organizationId, workspaceId, filters = {}) {
    const params = cleanParams({ organizationId, workspaceId, ...filters });
    const response = await apiClient.get('/ai-usage/monthly', { params });
    return response.data;
  },

  /**
   * Get Cost Breakdown Reports (by Provider, Model, Agent, User)
   */
  async getCostReport(organizationId, workspaceId, filters = {}) {
    const params = cleanParams({ organizationId, workspaceId, ...filters });
    const response = await apiClient.get('/ai-usage/reports/cost', { params });
    return response.data;
  },

  /**
   * Get cumulative token usage for current authenticated user
   */
  async getMyTokenUsage() {
    const response = await apiClient.get('/ai-usage/user-tokens/me');
    return response.data;
  },

  /**
   * Get cumulative token usage list for company/organization members
   */
  async getUserTokenUsages(organizationId, workspaceId, filters = {}) {
    const params = cleanParams({ organizationId, workspaceId, ...filters });
    const response = await apiClient.get('/ai-usage/user-tokens', { params });
    return response.data;
  },

  /**
   * Get cumulative token usage for a specific user ID
   */
  async getUserTokenUsage(userId) {
    const response = await apiClient.get(`/ai-usage/user-tokens/${userId}`);
    return response.data;
  },
};
