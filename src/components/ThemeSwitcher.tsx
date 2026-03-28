'use client';

import { Moon, Sun, Snowflake } from 'lucide-react';
import type { Theme, ThemeSwitcherStrings } from '@/lib/i18n';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  t: ThemeSwitcherStrings;
}

const THEMES: { key: Theme; Icon: typeof Moon; tooltip: keyof ThemeSwitcherStrings }[] = [
  { key: 'dark', Icon: Moon, tooltip: 'dark' },
  { key: 'light', Icon: Sun, tooltip: 'light' },
  { key: 'cold', Icon: Snowflake, tooltip: 'cold' },
];

export default function ThemeSwitcher({ theme, setTheme, t }: ThemeSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-current/10 p-0.5">
      {THEMES.map(({ key, Icon, tooltip }) => {
        const isActive = theme === key;
        return (
          <button
            key={key}
            onClick={() => setTheme(key)}
            title={t[tooltip]}
            className={`group relative rounded-full p-2 transition-all duration-300 ease-in-out ${
              isActive
                ? key === 'dark'
                  ? 'bg-gray-700 text-amber-300'
                  : key === 'light'
                    ? 'bg-blue-100 text-amber-500'
                    : 'bg-slate-700 text-cyan-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
