import apiClient from './apiClient';

export const brandService = {
  upsertBrandGuidelines: async (data) => {
    const response = await apiClient.post('/brand-guidelines', data);
    return response.data;
  },

  createBuyerPersona: async (data) => {
    const response = await apiClient.post('/buyer-personas', data);
    return response.data;
  }
};
