import { create } from 'zustand';
import type { ThemeMode } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';
import { readRaw, writeRaw } from '@/lib/storage';

/**
 * Theme is stored as a raw 'light' | 'dark' string (not JSON) so the tiny
 * inline boot script in index.html can read it and apply `.dark` before React
 * mounts, avoiding a flash of the wrong theme.
 */
function getInitialTheme(): ThemeMode {
  const stored = readRaw(STORAGE_KEYS.theme);
  if (stored === 'light' || stored === 'dark') return stored;
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

function applyTheme(theme: ThemeMode): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  writeRaw(STORAGE_KEYS.theme, theme);
}

interface ThemeState {
  theme: ThemeMode;
  toggle: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggle: () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
