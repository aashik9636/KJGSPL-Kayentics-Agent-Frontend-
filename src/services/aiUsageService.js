import apiClient from './apiClient';

export const aiUsageService = {
  /**
   * Get AI Usage Dashboard Summary (Total tokens, costs, request count, latency)
   */
  async getDashboardSummary(organizationId, workspaceId, filters = {}) {
    const response = await apiClient.get('/ai-usage/dashboard', {
      params: { organizationId, workspaceId, ...filters },
    });
    return response.data;
  },

  /**
   * Get Daily Usage aggregated logs
   */
  async getDailyUsage(organizationId, workspaceId, filters = {}) {
    const response = await apiClient.get('/ai-usage/daily', {
      params: { organizationId, workspaceId, ...filters },
    });
    return response.data;
  },

  /**
   * Get Monthly Usage aggregated logs
   */
  async getMonthlyUsage(organizationId, workspaceId, filters = {}) {
    const response = await apiClient.get('/ai-usage/monthly', {
      params: { organizationId, workspaceId, ...filters },
    });
    return response.data;
  },

  /**
   * Get Cost Breakdown Reports (by Provider, Model, Agent, User)
   */
  async getCostReport(organizationId, workspaceId, filters = {}) {
    const response = await apiClient.get('/ai-usage/reports/cost', {
      params: { organizationId, workspaceId, ...filters },
    });
    return response.data;
  },
};
