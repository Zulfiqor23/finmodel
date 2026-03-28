'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Theme, ThemeClasses } from '@/lib/i18n';

const STORAGE_KEY = 'fm-theme';

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'cold') return stored;
  return 'dark';
}

const THEME_CLASS_MAP: Record<Theme, ThemeClasses> = {
  dark: {
    bg: 'bg-gray-950 text-gray-100',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    textDimmed: 'text-gray-500',
    card: 'bg-gray-900 border-gray-800',
    cardBorder: 'border-gray-800',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500',
    accentMuted: 'bg-emerald-500/20 text-emerald-400',
    border: 'border-gray-800',
    input: 'accent-emerald-500',
    headerBg: 'bg-gray-950/80 border-gray-800',
    headerBorder: 'border-gray-800',
    kpiBlock: 'bg-gray-800/60',
    barBg: 'bg-gray-800',
    pillActive: 'bg-emerald-500 text-white',
    pillInactive: 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
  },
  light: {
    bg: 'bg-gray-50 text-gray-900',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    textDimmed: 'text-gray-500',
    card: 'bg-white border-gray-200',
    cardBorder: 'border-gray-200',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-600',
    accentMuted: 'bg-blue-100 text-blue-700',
    border: 'border-gray-200',
    input: 'accent-blue-600',
    headerBg: 'bg-white/80 border-gray-200',
    headerBorder: 'border-gray-200',
    kpiBlock: 'bg-gray-100',
    barBg: 'bg-gray-200',
    pillActive: 'bg-blue-600 text-white',
    pillInactive: 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
  },
  cold: {
    bg: 'bg-slate-950 text-cyan-50',
    text: 'text-cyan-50',
    textMuted: 'text-slate-400',
    textDimmed: 'text-slate-500',
    card: 'bg-slate-900 border-slate-700',
    cardBorder: 'border-slate-700',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-500',
    accentMuted: 'bg-cyan-500/20 text-cyan-400',
    border: 'border-slate-700',
    input: 'accent-cyan-500',
    headerBg: 'bg-slate-950/80 border-slate-700',
    headerBorder: 'border-slate-700',
    kpiBlock: 'bg-slate-800/60',
    barBg: 'bg-slate-800',
    pillActive: 'bg-cyan-500 text-slate-950',
    pillInactive: 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800',
  },
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Hydrate from localStorage after mount
  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyThemeClass(stored);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
    applyThemeClass(t);
  }, []);

  const themeClasses: ThemeClasses = THEME_CLASS_MAP[theme];

  return { theme, setTheme, themeClasses } as const;
}

function applyThemeClass(theme: Theme) {
  const el = document.documentElement;
  el.classList.remove('dark', 'light', 'cold');
  el.classList.add(theme);
}
