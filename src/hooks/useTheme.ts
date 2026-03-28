'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Theme, ThemeClasses } from '@/lib/i18n';

const STORAGE_KEY = 'fm-theme';

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'cold') return stored;
  return 'light';
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
    bg: 'bg-[#fffff0] text-slate-800',
    text: 'text-slate-800',
    textMuted: 'text-slate-500',
    textDimmed: 'text-slate-400',
    card: 'bg-white border-slate-200 shadow-sm',
    cardBorder: 'border-slate-200',
    accent: 'text-teal-600',
    accentBg: 'bg-teal-50',
    accentMuted: 'bg-teal-50 text-teal-700',
    border: 'border-slate-200',
    input: 'accent-teal-500',
    headerBg: 'bg-[#fffff0]/90 border-slate-200',
    headerBorder: 'border-slate-200',
    kpiBlock: 'bg-slate-50',
    barBg: 'bg-slate-200',
    pillActive: 'bg-teal-500 text-white shadow-sm',
    pillInactive: 'text-slate-500 hover:text-slate-800 hover:bg-white border hover:border-slate-200 border-transparent',
  },
  cold: {
    bg: 'bg-slate-50 text-slate-800',
    text: 'text-slate-800',
    textMuted: 'text-slate-500',
    textDimmed: 'text-slate-400',
    card: 'bg-cyan-50 border-cyan-100 shadow-sm',
    cardBorder: 'border-cyan-100',
    accent: 'text-cyan-700',
    accentBg: 'bg-cyan-100',
    accentMuted: 'bg-orange-50 text-orange-600',
    border: 'border-slate-200',
    input: 'accent-green-500',
    headerBg: 'bg-cyan-50/90 border-cyan-100',
    headerBorder: 'border-cyan-100',
    kpiBlock: 'bg-white/60',
    barBg: 'bg-slate-200',
    pillActive: 'bg-blue-500 text-white shadow-sm',
    pillInactive: 'text-slate-500 hover:text-slate-800 hover:bg-white border hover:border-slate-200 border-transparent',
  },
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyThemeClass(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  if (typeof document !== 'undefined') {
    const el = document.documentElement;
    el.classList.remove('dark', 'light', 'cold');
    el.classList.add(theme);
    
    // Apply basic background to body to avoid flash on scrollbars
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#0a0a0a';
      document.body.style.color = '#ededed';
    } else if (theme === 'cold') {
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#1e293b';
    } else {
      document.body.style.backgroundColor = '#fffff0'; // Ivory
      document.body.style.color = '#1e293b';
    }
  }
}
