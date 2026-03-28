'use client';

import { Users } from 'lucide-react';
import type { LaborCostBreakdown } from '@/lib/types';
import type { LaborCardStrings, ThemeClasses } from '@/lib/i18n';

interface LaborProductivityCardProps {
  labor: LaborCostBreakdown;
  unitsPerDay: number;
  efficiency: number;
  t: LaborCardStrings;
  themeClasses: ThemeClasses;
}

export default function LaborProductivityCard({
  labor,
  unitsPerDay,
  efficiency,
  t,
  themeClasses,
}: LaborProductivityCardProps) {
  const unitsPerWorker = labor.workerCount > 0 ? unitsPerDay / labor.workerCount : 0;
  const effectiveUnitsPerWorker = unitsPerWorker * efficiency;
  const laborCostPerUnit =
    unitsPerDay > 0 ? labor.totalDailyCost / unitsPerDay : 0;

  return (
    <div className={`rounded-xl border ${themeClasses.card} p-5 space-y-4 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out`}>
      <div className={`flex items-center gap-2 ${themeClasses.text}`}>
        <Users className={`h-5 w-5 ${themeClasses.accent}`} />
        <h2 className="text-lg font-semibold">{t.heading}</h2>
      </div>

      {/* Tier badge */}
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${themeClasses.accentMuted}`}>
          {labor.workerCount} {t.workers}
        </span>
        {labor.tier.pieceRateApplies && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm border border-amber-200">
            {t.pieceRate}
          </span>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        <KPIBlock label={t.unitsPerWorker} value={unitsPerWorker.toFixed(1)} themeClasses={themeClasses} />
        <KPIBlock label={t.effectivePerWorker} value={effectiveUnitsPerWorker.toFixed(1)} themeClasses={themeClasses} />
        <KPIBlock label={t.dailyLaborCost} value={`$${labor.totalDailyCost.toFixed(0)}`} themeClasses={themeClasses} />
        <KPIBlock label={t.laborPerUnit} value={`$${laborCostPerUnit.toFixed(2)}`} themeClasses={themeClasses} />
        <KPIBlock label={t.dailyWage} value={`$${labor.dailyWageCost.toFixed(0)}`} themeClasses={themeClasses} />
        <KPIBlock label={t.pieceRateLabel} value={`$${labor.dailyPieceRateCost.toFixed(0)}`} themeClasses={themeClasses} />
      </div>

      <p className={`text-xs ${themeClasses.textDimmed}`}>
        {t.monthly}: ${labor.totalMonthlyCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}

function KPIBlock({ label, value, themeClasses }: { label: string; value: string; themeClasses: ThemeClasses }) {
  return (
    <div className={`rounded-lg ${themeClasses.kpiBlock} p-2.5 text-center`}>
      <p className={`text-[10px] uppercase tracking-wider ${themeClasses.textDimmed}`}>{label}</p>
      <p className={`font-mono text-lg font-bold ${themeClasses.text}`}>{value}</p>
    </div>
  );
}
