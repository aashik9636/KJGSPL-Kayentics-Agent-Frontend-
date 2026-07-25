import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

const getStoreParams = () => {
  const { organizationId, workspaceId } = useWorkspaceStore.getState();
  const params = {};
  if (organizationId) params.organizationId = organizationId;
  if (workspaceId) params.workspaceId = workspaceId;
  return params;
};

export const dashboardService = {
  // Main Consolidated Dashboard (GET /dashboard)
  getDashboardSummary: async (params = {}) => {
    const storeParams = getStoreParams();
    const response = await apiClient.get('/dashboard', {
      params: { ...storeParams, ...params }
    });
    return response.data;
  },

  // ─── AI Usage Reports ─────────────────────────────────────────────────────
  // Cost Reports (GET /ai-usage/reports/cost)
  getCostReports: async (params = {}) => {
    const storeParams = getStoreParams();
    const response = await apiClient.get('/ai-usage/reports/cost', {
      params: { ...storeParams, ...params }
    });
    return response.data;
  },

  // AI Usage Overview (GET /ai-usage/dashboard)
  getUsageDashboard: async (params = {}) => {
    const storeParams = getStoreParams();
    const response = await apiClient.get('/ai-usage/dashboard', {
      params: { ...storeParams, ...params }
    });
    return response.data;
  },

  // Daily Usage Aggregation (GET /ai-usage/daily)
  getDailyUsage: async (params = {}) => {
    const storeParams = getStoreParams();
    const response = await apiClient.get('/ai-usage/daily', {
      params: { ...storeParams, ...params }
    });
    return response.data;
  },

  // Monthly Usage Aggregation (GET /ai-usage/monthly)
  getMonthlyUsage: async (params = {}) => {
    const storeParams = getStoreParams();
    const response = await apiClient.get('/ai-usage/monthly', {
      params: { ...storeParams, ...params }
    });
    return response.data;
  }
};
