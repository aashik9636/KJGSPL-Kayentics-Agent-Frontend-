import apiClient from './apiClient';

export const superAdminService = {
  // 1. Overview & Stats
  async getStats() {
    const response = await apiClient.get('/api/v1/superadmin/stats');
    return response.data;
  },

  // 2. Organizations
  async getOrganizations(params = {}) {
    const response = await apiClient.get('/api/v1/superadmin/organizations', { params });
    return response.data;
  },

  async getOrganizationDetail(id) {
    const response = await apiClient.get(`/api/v1/superadmin/organizations/${id}`);
    return response.data;
  },

  async updateOrganizationStatus(id, status) {
    const response = await apiClient.patch(`/api/v1/superadmin/organizations/${id}/status`, { status });
    return response.data;
  },

  async overrideSubscription(id, data) {
    const response = await apiClient.patch(`/api/v1/superadmin/organizations/${id}/subscription`, data);
    return response.data;
  },

  async grantCreditTopUp(id, amount, description) {
    const response = await apiClient.post(`/api/v1/superadmin/organizations/${id}/credits`, { amount, description });
    return response.data;
  },

  async addAddOnToOrg(id, addOnCode, quantity = 1) {
    const response = await apiClient.post(`/api/v1/superadmin/organizations/${id}/addons`, { addOnCode, quantity });
    return response.data;
  },

  // 3. Users
  async getUsers(params = {}) {
    const response = await apiClient.get('/api/v1/superadmin/users', { params });
    return response.data;
  },

  async updateUserStatus(id, status) {
    const response = await apiClient.patch(`/api/v1/superadmin/users/${id}/status`, { status });
    return response.data;
  },

  async promoteUserRole(id, role) {
    const response = await apiClient.patch(`/api/v1/superadmin/users/${id}/role`, { role });
    return response.data;
  },

  // 4. AI Usage Analytics
  async getAiUsage(params = {}) {
    const response = await apiClient.get('/api/v1/superadmin/ai-usage', { params });
    return response.data;
  },

  // 5. Audit Logs
  async getAuditLogs(params = {}) {
    const response = await apiClient.get('/api/v1/superadmin/audit-logs', { params });
    return response.data;
  },

  // 6. Settings
  async getSettings() {
    const response = await apiClient.get('/api/v1/superadmin/settings');
    return response.data;
  },

  async upsertSetting(key, category, value) {
    const response = await apiClient.put(`/api/v1/superadmin/settings/${key}`, { category, value });
    return response.data;
  },

  // 7. Subscription Plans Management
  async getPlans() {
    const response = await apiClient.get('/api/v1/superadmin/plans');
    return response.data;
  },

  async upsertEntitlement(planId, key, value, unit, isFeature) {
    const response = await apiClient.patch(`/api/v1/superadmin/plans/${planId}/entitlements`, {
      key,
      value,
      unit,
      isFeature
    });
    return response.data;
  },

  async upsertPrice(planId, region, billingCycle, price) {
    const response = await apiClient.patch(`/api/v1/superadmin/plans/${planId}/prices`, {
      region,
      billingCycle,
      price
    });
    return response.data;
  },

  async getAddOns() {
    const response = await apiClient.get('/api/v1/superadmin/addons');
    return response.data;
  },

  async upsertAddOn(code, data) {
    const response = await apiClient.put(`/api/v1/superadmin/addons/${code}`, data);
    return response.data;
  },

  async getTaskRules() {
    const response = await apiClient.get('/api/v1/superadmin/task-rules');
    return response.data;
  },

  async upsertTaskRule(activityType, taskUnits, customerExplanation) {
    const response = await apiClient.put(`/api/v1/superadmin/task-rules/${activityType}`, {
      taskUnits,
      customerExplanation
    });
    return response.data;
  }
};
