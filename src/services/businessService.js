import apiClient from './apiClient';

export const businessService = {
  // 1. Business Profile
  getBusinessProfile: async () => {
    const response = await apiClient.get('/business-profile');
    return response.data;
  },
  createOrUpdateBusinessProfile: async (data) => {
    // Assuming backend handles POST or PUT appropriately based on existence
    // or just POST to create/update
    const response = await apiClient.post('/business-profile', data);
    return response.data;
  },

  // 2. Brand Guidelines
  getBrandGuidelines: async () => {
    const response = await apiClient.get('/brand-guidelines');
    return response.data;
  },
  createOrUpdateBrandGuidelines: async (data) => {
    const response = await apiClient.post('/brand-guidelines', data);
    return response.data;
  },

  // 3. Buyer Personas
  getBuyerPersonas: async () => {
    const response = await apiClient.get('/buyer-personas');
    return response.data;
  },
  createBuyerPersona: async (data) => {
    const response = await apiClient.post('/buyer-personas', data);
    return response.data;
  },

  // 4. Business Goals
  getBusinessGoals: async () => {
    const response = await apiClient.get('/business-goals');
    return response.data;
  },
  createBusinessGoal: async (data) => {
    const response = await apiClient.post('/business-goals', data);
    return response.data;
  },

  // 5. FAQs
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
