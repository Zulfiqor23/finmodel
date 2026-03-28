'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Locale, Dictionary } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

const STORAGE_KEY = 'fm-locale';

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'ru' || stored === 'uz') return stored;
  return 'en';
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Hydrate from localStorage after mount
  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  }, []);

  const t: Dictionary = translations[locale];

  return { locale, setLocale, t } as const;
}
