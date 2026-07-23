import apiClient from './apiClient';

export const brandService = {
  getBrandProfile: async () => {
    const response = await apiClient.get('/brand-profile').catch(() => null);
    return response?.data || null;
  },

  createBrandProfile: async (data) => {
    const response = await apiClient.post('/brand-profile', data);
    return response.data;
  },

  updateBrandProfile: async (data) => {
    const response = await apiClient.put('/brand-profile', data);
    return response.data;
  },

  // Smart upsert: creates if not exists, updates if exists
  upsertBrandGuidelines: async (data) => {
    try {
      const existing = await apiClient.get('/brand-profile').catch(() => null);
      if (existing?.data) {
        const response = await apiClient.put('/brand-profile', data);
        return response.data;
      }
    } catch (_) {
      // fall through to create
    }
    const response = await apiClient.post('/brand-profile', data);
    return response.data;
  },
};
