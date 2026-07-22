import apiClient from './apiClient';

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data; // Relying on the global unwrapper in apiClient
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  }
};
