import apiClient from './apiClient';

export const brandService = {
  // GET /brand-guidelines (with fallback to /brand-profile)
  getBrandGuidelines: async () => {
    let response = await apiClient.get('/brand-guidelines').catch(() => null);
    if (!response?.data) {
      response = await apiClient.get('/brand-profile').catch(() => null);
    }
    return response?.data || null;
  },

  // Alias for backward compatibility
  getBrandProfile: async () => {
    let response = await apiClient.get('/brand-guidelines').catch(() => null);
    if (!response?.data) {
      response = await apiClient.get('/brand-profile').catch(() => null);
    }
    return response?.data || null;
  },

  // POST /brand-guidelines
  createBrandGuidelines: async (data) => {
    const response = await apiClient.post('/brand-guidelines', data);
    return response.data;
  },

  // PUT /brand-guidelines
  updateBrandGuidelines: async (data) => {
    const response = await apiClient.put('/brand-guidelines', data);
    return response.data;
  },

  // DELETE /brand-guidelines
  resetBrandGuidelines: async () => {
    const response = await apiClient.delete('/brand-guidelines');
    return response.data;
  },

  // Smart upsert: tries PUT /brand-guidelines first, falls back to POST /brand-guidelines
  upsertBrandGuidelines: async (data) => {
    try {
      const existing = await apiClient.get('/brand-guidelines').catch(() => null);
      if (existing?.data) {
        const response = await apiClient.put('/brand-guidelines', data);
        return response.data;
      }
    } catch (_) {}
    const response = await apiClient.post('/brand-guidelines', data);
    return response.data;
  },
};
