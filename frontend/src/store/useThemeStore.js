import { create } from 'zustand';

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('dashboard-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage not available
  }
  return 'dark';
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('dashboard-theme', next); } catch { /* ignore */ }
      return { theme: next };
    }),
  setTheme: (theme) => {
    try { localStorage.setItem('dashboard-theme', theme); } catch { /* ignore */ }
    set({ theme });
  },
}));