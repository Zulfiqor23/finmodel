'use client';

import { ShieldCheck, ShieldAlert } from 'lucide-react';
import type { BreakevenResult } from '@/lib/types';
import type { BreakevenStrings, ThemeClasses } from '@/lib/i18n';

interface SafetyZoneGaugeProps {
  breakeven: BreakevenResult;
  t: BreakevenStrings;
  themeClasses: ThemeClasses;
}

export default function SafetyZoneGauge({ breakeven, t, themeClasses }: SafetyZoneGaugeProps) {
  const { threshold, currentUnits, isSafe, unitsFromBreakeven } = breakeven;
  const pct = Math.min((currentUnits / 100) * 100, 100);
  const thresholdPct = (threshold / 100) * 100;

  return (
    <div className={`rounded-xl border ${themeClasses.card} p-5 space-y-4 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out`}>
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${themeClasses.text}`}>{t.heading}</h2>
        {isSafe ? (
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
        ) : (
          <ShieldAlert className="h-6 w-6 text-rose-600" />
        )}
      </div>

      {/* Gauge bar */}
      <div className="relative">
        <div className={`h-6 w-full rounded-full ${themeClasses.barBg} overflow-hidden`}>
          {/* Danger zone background */}
          <div
            className="absolute inset-y-0 left-0 bg-rose-100"
            style={{ width: `${thresholdPct}%` }}
          />
          {/* Safe zone background */}
          <div
            className="absolute inset-y-0 right-0 bg-emerald-50"
            style={{ left: `${thresholdPct}%` }}
          />
          {/* Current position */}
          <div
            className={`h-6 rounded-full transition-all duration-500 ${
              isSafe ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Threshold marker */}
        <div
          className="absolute top-0 h-6 w-0.5 bg-amber-500"
          style={{ left: `${thresholdPct}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs">
        <span className={themeClasses.textDimmed}>0</span>
        <span className="font-mono font-medium text-amber-600">{threshold} ({t.breakeven})</span>
        <span className={themeClasses.textDimmed}>100</span>
      </div>

      {/* Status */}
      <div className="text-center">
        <p
          className={`font-mono text-2xl font-bold ${
            isSafe ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {currentUnits} {t.unitsPerDay}
        </p>
        <p className={`text-sm ${themeClasses.textDimmed}`}>
          {unitsFromBreakeven >= 0
            ? `${unitsFromBreakeven} ${t.aboveBreakeven}`
            : `${Math.abs(unitsFromBreakeven)} ${t.belowBreakeven}`}
        </p>
      </div>

      {/* Breakdown explanation */}
      <div className={`mt-2 p-3 rounded-lg border leading-tight ${themeClasses.cardBorder} bg-opacity-30`}>
        <p className={`text-[11px] italic ${themeClasses.textDimmed}`}>
          {t.breakevenDesc}
        </p>
      </div>
    </div>
  );
}
