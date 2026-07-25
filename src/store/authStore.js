import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      
      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
      
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      isSuperAdmin: () => {
        const user = useAuthStore.getState().user;
        return user?.role === 'SUPER_ADMIN';
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
