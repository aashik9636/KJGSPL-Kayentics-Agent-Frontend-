import apiClient from './apiClient';

export const businessService = {
  // ─── Business Profile ─────────────────────────────────────────────────────
  getIndustries: async () => {
    const response = await apiClient.get('/business-profile/industries');
    return response.data;
  },

  getBusinessProfile: async () => {
    const response = await apiClient.get('/business-profile');
    return response.data;
  },

  createBusinessProfile: async (data) => {
    const response = await apiClient.post('/business-profile', data);
    return response.data;
  },

  updateBusinessProfile: async (data) => {
    const response = await apiClient.put('/business-profile', data);
    return response.data;
  },

  deleteBusinessProfile: async () => {
    const response = await apiClient.delete('/business-profile');
    return response.data;
  },

  // ─── Brand Profile ────────────────────────────────────────────────────────
  getBrandProfile: async () => {
    const response = await apiClient.get('/brand-profile');
    return response.data;
  },

  createBrandProfile: async (data) => {
    const response = await apiClient.post('/brand-profile', data);
    return response.data;
  },

  updateBrandProfile: async (data) => {
    const response = await apiClient.put('/brand-profile', data);
    return response.data;
  },

  // ─── Social Profiles ──────────────────────────────────────────────────────
  getSocialProfile: async () => {
    const response = await apiClient.get('/social-profile');
    return response.data;
  },

  updateSocialProfile: async (data) => {
    const response = await apiClient.put('/social-profile', data);
    return response.data;
  },

  // ─── Buyer Personas ───────────────────────────────────────────────────────
  getBuyerPersonas: async () => {
    const response = await apiClient.get('/buyer-personas');
    return response.data;
  },

  createBuyerPersona: async (data) => {
    const response = await apiClient.post('/buyer-personas', data);
    return response.data;
  },

  updateBuyerPersona: async (id, data) => {
    const response = await apiClient.put(`/buyer-personas/${id}`, data);
    return response.data;
  },

  deleteBuyerPersona: async (id) => {
    const response = await apiClient.delete(`/buyer-personas/${id}`);
    return response.data;
  },

  // ─── Business Goals ───────────────────────────────────────────────────────
  getBusinessGoals: async () => {
    const response = await apiClient.get('/business-goals');
    return response.data;
  },

  createBusinessGoal: async (data) => {
    const response = await apiClient.post('/business-goals', data);
    return response.data;
  },

  deleteBusinessGoal: async (id) => {
    const response = await apiClient.delete(`/business-goals/${id}`);
    return response.data;
  },

  // ─── FAQs ─────────────────────────────────────────────────────────────────
  getFaqs: async () => {
    const response = await apiClient.get('/faqs');
    return response.data;
  },

  createFaq: async (data) => {
    const response = await apiClient.post('/faqs', data);
    return response.data;
  },

  updateFaq: async (id, data) => {
    const response = await apiClient.put(`/faqs/${id}`, data);
    return response.data;
  },

  deleteFaq: async (id) => {
    const response = await apiClient.delete(`/faqs/${id}`);
    return response.data;
  }
};
