import apiClient from './apiClient';

export const brandService = {
  getBrandGuidelines: async () => {
    const response = await apiClient.get('/brand-guidelines');
    return response.data;
  },

  upsertBrandGuidelines: async (data) => {
    const response = await apiClient.post('/brand-guidelines', data);
    return response.data;
  },

  updateBrandGuidelines: async (data) => {
    const response = await apiClient.put('/brand-guidelines', data);
    return response.data;
  },

  deleteBrandGuidelines: async () => {
    const response = await apiClient.delete('/brand-guidelines');
    return response.data;
  },

  createBuyerPersona: async (data) => {
    const response = await apiClient.post('/buyer-personas', data);
    return response.data;
  }
};
