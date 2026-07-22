import apiClient from './apiClient';

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  verifyEmail: async (data) => {
    const response = await apiClient.post('/auth/verify-email', data);
    return response.data;
  },

  /**
   * Step 1 of password reset flow.
   * Sends a reset link to the user's email.
   * Backend needs: POST /auth/forgot-password  { email }
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Step 2 of password reset flow.
   * Called from the /reset-password?token=... page.
   * Backend needs: POST /auth/reset-password  { token, password }
   */
  resetPassword: async (token, password) => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  },

  /**
   * Manually refresh the access token using the stored refresh token.
   * Also called automatically inside apiClient on 401 errors.
   * Backend needs: POST /auth/refresh  { refreshToken }
   */
  refresh: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  logoutAll: async () => {
    const response = await apiClient.post('/auth/logout-all');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  }
};
