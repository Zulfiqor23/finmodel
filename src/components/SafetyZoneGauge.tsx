'use client';

import { ShieldCheck, ShieldAlert } from 'lucide-react';
import type { BreakevenResult } from '@/lib/types';

interface SafetyZoneGaugeProps {
  breakeven: BreakevenResult;
}

export default function SafetyZoneGauge({ breakeven }: SafetyZoneGaugeProps) {
  const { threshold, currentUnits, isSafe, unitsFromBreakeven } = breakeven;
  const pct = Math.min((currentUnits / 100) * 100, 100);
  const thresholdPct = (threshold / 100) * 100;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-300">Breakeven Zone</h2>
        {isSafe ? (
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
        ) : (
          <ShieldAlert className="h-6 w-6 text-red-400" />
        )}
      </div>

      {/* Gauge bar */}
      <div className="relative">
        <div className="h-6 w-full rounded-full bg-gray-800 overflow-hidden">
          {/* Danger zone background */}
          <div
            className="absolute inset-y-0 left-0 bg-red-900/30"
            style={{ width: `${thresholdPct}%` }}
          />
          {/* Safe zone background */}
          <div
            className="absolute inset-y-0 right-0 bg-emerald-900/20"
            style={{ left: `${thresholdPct}%` }}
          />
          {/* Current position */}
          <div
            className={`h-6 rounded-full transition-all duration-500 ${
              isSafe ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Threshold marker */}
        <div
          className="absolute top-0 h-6 w-0.5 bg-amber-400"
          style={{ left: `${thresholdPct}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">0</span>
        <span className="font-mono text-amber-400">{threshold} (breakeven)</span>
        <span className="text-gray-500">100</span>
      </div>

      {/* Status */}
      <div className="text-center">
        <p
          className={`font-mono text-2xl font-bold ${
            isSafe ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {currentUnits} units/day
        </p>
        <p className="text-sm text-gray-500">
          {unitsFromBreakeven >= 0
            ? `${unitsFromBreakeven} units above breakeven`
            : `${Math.abs(unitsFromBreakeven)} units below breakeven`}
        </p>
      </div>
    </div>
  );
}
