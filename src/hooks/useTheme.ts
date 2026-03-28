'use client';

import type { Theme, ThemeClasses } from '@/lib/i18n';

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
  const themeClasses: ThemeClasses = THEME_CLASS_MAP.light;
  return { theme: 'light' as Theme, setTheme: () => {}, themeClasses } as const;
}
