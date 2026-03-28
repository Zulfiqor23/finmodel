'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { FactoryOutputs } from '@/lib/types';
import type { ProfitabilityStrings, ThemeClasses } from '@/lib/i18n';

interface ProfitabilityHeatmapProps {
  outputs: FactoryOutputs;
  workdaysPerMonth: number;
  t: ProfitabilityStrings;
  themeClasses: ThemeClasses;
}

export default function ProfitabilityHeatmap({
  outputs,
  workdaysPerMonth,
  t,
  themeClasses,
}: ProfitabilityHeatmapProps) {
  const { dailyProfit, monthlyProfit, revenue, materials, labor, electricity, overhead } =
    outputs;
  const isPositive = dailyProfit >= 0;

  const rows = [
    { label: t.revenue, daily: revenue.total, color: 'text-emerald-400' },
    { label: t.materials, daily: -materials.total, color: 'text-red-400' },
    { label: t.labor, daily: -labor.totalDailyCost, color: 'text-red-400' },
    { label: t.electricity, daily: -electricity.totalDaily, color: 'text-amber-400' },
    { label: t.overhead, daily: -overhead.totalDailyFixed, color: 'text-amber-400' },
  ];

  return (
    <div className={`rounded-xl border ${themeClasses.card} p-5 space-y-4 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out`}>
      <h2 className={`text-lg font-semibold ${themeClasses.text}`}>{t.heading}</h2>

      {/* Hero profit number */}
      <div className="flex items-center gap-3">
        {isPositive ? (
          <TrendingUp className="h-8 w-8 text-emerald-400" />
        ) : (
          <TrendingDown className="h-8 w-8 text-red-400" />
        )}
        <div>
          <p
            className={`font-mono text-3xl font-bold ${
              isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            ${Math.abs(dailyProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            <span className={`text-base font-normal ${themeClasses.textDimmed}`}>{t.perDay}</span>
          </p>
          <p className={`font-mono text-sm ${themeClasses.textDimmed}`}>
            ${Math.abs(monthlyProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            {t.perMonth} ({workdaysPerMonth}d)
          </p>
        </div>
      </div>

      {/* Cost breakdown rows */}
      <div className="space-y-2">
        {rows.map((row) => {
          const maxAbs = Math.max(...rows.map((r) => Math.abs(r.daily)), 1);
          const pct = (Math.abs(row.daily) / maxAbs) * 100;
          return (
            <div key={row.label} className="space-y-0.5">
              <div className="flex justify-between text-xs">
                <span className={themeClasses.textMuted}>{row.label}</span>
                <span className={`font-mono ${row.color}`}>
                  {row.daily >= 0 ? '+' : ''}
                  ${row.daily.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className={`h-2 w-full rounded-full ${themeClasses.barBg}`}>
                <div
                  className={`h-2 rounded-full ${
                    row.daily >= 0 ? 'bg-emerald-500' : 'bg-red-500/60'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
