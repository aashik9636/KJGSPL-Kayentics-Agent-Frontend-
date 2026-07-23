import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const dashboardService = {
  getDashboardSummary: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/dashboard', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  // ─── AI Usage Reports ─────────────────────────────────────────────────────
  getCostReports: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/ai-usage/reports/cost', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getUsageDashboard: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/ai-usage/dashboard', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getDailyUsage: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/ai-usage/daily', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getMonthlyUsage: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/ai-usage/monthly', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  }
};
