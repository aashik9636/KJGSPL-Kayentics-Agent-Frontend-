import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  const { organizationId, workspaceId } = useWorkspaceStore.getState();

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (organizationId) {
    config.headers['x-organization-id'] = organizationId;
  }

  if (workspaceId) {
    config.headers['x-workspace-id'] = workspaceId;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor for handling 401 Unauthorized and global errors
apiClient.interceptors.response.use(
  (response) => {
    // Globally unwrap the backend { success, message, data } envelope
    if (response.data && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');

    // Check if error is 401, not a retry, not the refresh endpoint itself, and not an auth request
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const { refreshToken, setTokens, logout } = useAuthStore.getState();

        if (!refreshToken) {
          logout();
          toast.error("Session expired. Please log in again.");
          return Promise.reject(error);
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await axios.post(`${baseUrl}/auth/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        setTokens(accessToken, newRefreshToken || refreshToken);

        // Update original request header
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed, clear session
        useAuthStore.getState().logout();
        toast.error("Session expired. Please log in again.");
        return Promise.reject(refreshError);
      }
    }

    // Global Error Toasting
    // We avoid toasting on 401s if we are currently refreshing the token
    if (!originalRequest._retry || error.response?.status !== 401) {
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors && data.errors.length > 0) {
          toast.error(data.errors[0].message);
        } else if (data.error?.details && data.error.details.length > 0) {
          toast.error(data.error.details[0].message);
        } else if (data.message) {
          toast.error(data.message);
        } else if (data.error?.message) {
          toast.error(data.error.message);
        }
      } else if (!error.response && error.message) {
        toast.error(error.message);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
