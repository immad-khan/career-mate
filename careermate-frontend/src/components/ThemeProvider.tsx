'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('default', 'futuristic');
    if (theme === 'futuristic') {
        root.classList.add('futuristic');
        root.classList.add('dark'); // Futuristic is a dark theme
    } else {
        root.classList.add('default');
        root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
