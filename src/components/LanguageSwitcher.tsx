'use client';

import { Globe } from 'lucide-react';
import type { Locale, ThemeClasses } from '@/lib/i18n';

interface LanguageSwitcherProps {
  locale: Locale;
  setLocale: (l: Locale) => void;
  themeClasses: ThemeClasses;
}

const LOCALES: { key: Locale; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'ru', label: 'RU' },
  { key: 'uz', label: 'UZ' },
];

export default function LanguageSwitcher({
  locale,
  setLocale,
  themeClasses,
}: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Globe className={`h-4 w-4 ${themeClasses.textMuted}`} />
      <div className="flex items-center rounded-full border border-current/10 p-0.5 gap-0.5">
        {LOCALES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLocale(key)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-300 ease-in-out ${
              locale === key
                ? themeClasses.pillActive
                : themeClasses.pillInactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
