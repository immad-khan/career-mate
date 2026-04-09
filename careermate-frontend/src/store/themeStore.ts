import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'default' | 'futuristic';
  setTheme: (theme: 'default' | 'futuristic') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'default',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'default' ? 'futuristic' : 'default' 
      })),
    }),
    {
      name: 'theme-storage',
    }
  )
);
