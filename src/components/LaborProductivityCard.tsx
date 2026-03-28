'use client';

import { Users } from 'lucide-react';
import type { LaborCostBreakdown } from '@/lib/types';
import type { LaborCardStrings, ThemeClasses } from '@/lib/i18n/types';

interface LaborProductivityCardProps {
  labor: LaborCostBreakdown;
  unitsPerDay: number;
  t: LaborCardStrings;
  themeClasses: ThemeClasses;
}

export default function LaborProductivityCard({
  labor,
  unitsPerDay,
  t,
  themeClasses,
}: LaborProductivityCardProps) {
  const laborCostPerUnit =
    unitsPerDay > 0 ? labor.totalDailyCost / unitsPerDay : 0;

  return (
    <div className={`rounded-xl border ${themeClasses.card} p-5 space-y-4 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out`}>
      <div className={`flex items-center gap-2 ${themeClasses.text}`}>
        <Users className={`h-5 w-5 ${themeClasses.accent}`} />
        <h2 className="text-lg font-semibold">{t.heading}</h2>
      </div>

      <p className={`text-xs ${themeClasses.textMuted} mb-2`}>{t.totalLaborDesc}</p>

      {/* KPI grid for 4 departments + totals */}
      <div className="grid grid-cols-2 gap-3">
        <KPIBlock label={t.salesDept} value={`$${labor.sales.dailyCost.toFixed(0)}/d`} themeClasses={themeClasses} />
        <KPIBlock label={t.techDept} value={`$${labor.tech.dailyCost.toFixed(0)}/d`} themeClasses={themeClasses} />
        <KPIBlock label={t.prodDept} value={`$${labor.prod.dailyCost.toFixed(0)}/d`} themeClasses={themeClasses} />
        <KPIBlock label={t.logisticsDept} value={`$${labor.logistics.dailyCost.toFixed(0)}/d`} themeClasses={themeClasses} />
      </div>

      <div className={`my-2 border-t ${themeClasses.cardBorder}`} />

      <div className="grid grid-cols-2 gap-3">
        <KPIBlock label={t.dailyLaborCost} value={`$${labor.totalDailyCost.toFixed(0)}`} themeClasses={themeClasses} />
        <KPIBlock label={t.laborPerUnit} value={`$${laborCostPerUnit.toFixed(2)}`} themeClasses={themeClasses} />
      </div>

      <p className={`text-xs ${themeClasses.textDimmed} text-right`}>
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
