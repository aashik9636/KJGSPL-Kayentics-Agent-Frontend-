import { create } from 'zustand';

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  const isDark = theme === 'dark';
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }
};

const initialTheme = localStorage.getItem('app-theme') || 'dark';
// Immediately apply on script load
applyTheme(initialTheme);

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,

  initTheme: () => {
    const current = get().theme;
    applyTheme(current);
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('app-theme', next);
    applyTheme(next);
    set({ theme: next });
  },

  setTheme: (theme) => {
    localStorage.setItem('app-theme', theme);
    applyTheme(theme);
    set({ theme });
  },
}));
