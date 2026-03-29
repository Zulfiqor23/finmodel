'use client';

import { TrendingUp, Droplets, Shield, Activity, RefreshCw } from 'lucide-react';
import type { FactoryOutputs } from '@/lib/types';
import type { FinancialHealthStrings, ThemeClasses } from '@/lib/i18n/types';
import { formatCurrency } from '@/lib/format';

interface FinancialHealthCardProps {
  outputs: FactoryOutputs;
  t: FinancialHealthStrings;
  themeClasses: ThemeClasses;
}

interface MetricRowProps {
  label: string;
  value: string;
  norm: string;
  status: 'good' | 'warn' | 'bad' | 'neutral';
  themeClasses: ThemeClasses;
}

function MetricRow({ label, value, norm, status, themeClasses }: MetricRowProps) {
  const statusColor =
    status === 'good' ? 'text-emerald-600' :
    status === 'warn' ? 'text-amber-500' :
    status === 'bad' ? 'text-rose-600' :
    themeClasses.textMuted;

  const dot =
    status === 'good' ? 'bg-emerald-500' :
    status === 'warn' ? 'bg-amber-400' :
    status === 'bad' ? 'bg-rose-500' :
    'bg-slate-300';

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-dashed last:border-0 border-black/[0.06]">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${dot}`} />
        <span className={`text-xs ${themeClasses.textMuted} truncate`}>{label}</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
        <span className={`font-mono text-sm font-bold ${statusColor}`}>{value}</span>
        <span className={`text-[10px] ${themeClasses.textDimmed} hidden sm:block`}>{norm}</span>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  themeClasses: ThemeClasses;
  children: React.ReactNode;
}

function Section({ title, icon: Icon, iconColor, themeClasses, children }: SectionProps) {
  return (
    <div className={`rounded-lg border ${themeClasses.cardBorder} p-3`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${themeClasses.textDimmed}`}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function getStatus(value: number, norm: number, direction: 'gte' | 'lte'): 'good' | 'warn' | 'bad' {
  if (direction === 'gte') {
    if (value >= norm) return 'good';
    if (value >= norm * 0.7) return 'warn';
    return 'bad';
  } else {
    if (value <= norm) return 'good';
    if (value <= norm * 1.3) return 'warn';
    return 'bad';
  }
}

export default function FinancialHealthCard({ outputs, t, themeClasses }: FinancialHealthCardProps) {
  return (
    <div className={`rounded-xl border ${themeClasses.card} p-5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out`}>
      <h2 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>{t.heading}</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

        {/* 1. Profit Waterfall */}
        <div className="lg:col-span-2">
          <Section title={t.profitWaterfall} icon={TrendingUp} iconColor="text-violet-500" themeClasses={themeClasses}>
            <MetricRow
              label={t.grossProfit}
              value={formatCurrency(outputs.grossProfitMonthly)}
              norm="≥30%"
              status={getStatus(outputs.grossMarginPct, 30, 'gte')}
              themeClasses={themeClasses}
            />
            <MetricRow
              label={`${t.grossMargin} %`}
              value={`${outputs.grossMarginPct.toFixed(1)}%`}
              norm="≥30%"
              status={getStatus(outputs.grossMarginPct, 30, 'gte')}
              themeClasses={themeClasses}
            />
            <MetricRow
              label={t.ebit}
              value={formatCurrency(outputs.ebitMonthly)}
              norm="≥15%"
              status={getStatus(outputs.operatingMarginPct, 15, 'gte')}
              themeClasses={themeClasses}
            />
            <MetricRow
              label={`${t.operatingMargin} %`}
              value={`${outputs.operatingMarginPct.toFixed(1)}%`}
              norm="≥15%"
              status={getStatus(outputs.operatingMarginPct, 15, 'gte')}
              themeClasses={themeClasses}
            />
            <MetricRow
              label={`${t.netMargin} %`}
              value={`${outputs.netMarginPct.toFixed(1)}%`}
              norm="≥10%"
              status={getStatus(outputs.netMarginPct, 10, 'gte')}
              themeClasses={themeClasses}
            />
          </Section>
        </div>

        {/* 2. Liquidity + Stability */}
        <div className="lg:col-span-1">
          <Section title={t.liquidity} icon={Droplets} iconColor="text-sky-500" themeClasses={themeClasses}>
            <MetricRow
              label={t.currentRatio}
              value={outputs.currentRatio.toFixed(2)}
              norm="≥2.0"
              status={getStatus(outputs.currentRatio, 2.0, 'gte')}
              themeClasses={themeClasses}
            />
            <MetricRow
              label={t.quickRatio}
              value={outputs.quickRatio.toFixed(2)}
              norm="≥1.0"
              status={getStatus(outputs.quickRatio, 1.0, 'gte')}
              themeClasses={themeClasses}
            />
          </Section>

          <div className="mt-3">
            <Section title={t.stability} icon={Shield} iconColor="text-emerald-600" themeClasses={themeClasses}>
              <MetricRow
                label={t.solvencyRatio}
                value={outputs.solvencyRatio.toFixed(2)}
                norm="≥0.8"
                status={getStatus(outputs.solvencyRatio, 0.8, 'gte')}
                themeClasses={themeClasses}
              />
              <MetricRow
                label={t.equityRatio}
                value={outputs.equityRatio.toFixed(2)}
                norm="≥0.5"
                status={getStatus(outputs.equityRatio, 0.5, 'gte')}
                themeClasses={themeClasses}
              />
            </Section>
          </div>
        </div>

        {/* 3. Profitability */}
        <div className="lg:col-span-1">
          <Section title={t.profitability} icon={Activity} iconColor="text-amber-500" themeClasses={themeClasses}>
            <MetricRow
              label={t.roe}
              value={`${outputs.roe.toFixed(1)}%`}
              norm="≥20%"
              status={getStatus(outputs.roe, 20, 'gte')}
              themeClasses={themeClasses}
            />
            <MetricRow
              label={t.roa}
              value={`${outputs.roa.toFixed(1)}%`}
              norm="≥10%"
              status={getStatus(outputs.roa, 10, 'gte')}
              themeClasses={themeClasses}
            />
          </Section>
        </div>

        {/* 4. Activity */}
        <div className="lg:col-span-1">
          <Section title={t.activity} icon={RefreshCw} iconColor="text-teal-500" themeClasses={themeClasses}>
            <MetricRow
              label={t.arTurnover}
              value={outputs.arTurnover > 0 ? `${outputs.arTurnover.toFixed(1)}x` : '—'}
              norm="≥5.0x"
              status={outputs.arTurnover > 0 ? getStatus(outputs.arTurnover, 5.0, 'gte') : 'neutral'}
              themeClasses={themeClasses}
            />
            <MetricRow
              label={t.dso}
              value={outputs.dso > 0 ? `${outputs.dso.toFixed(0)} ${t.days}` : '—'}
              norm={`≤60 ${t.days}`}
              status={outputs.dso > 0 ? getStatus(outputs.dso, 60, 'lte') : 'neutral'}
              themeClasses={themeClasses}
            />
          </Section>
        </div>

      </div>
    </div>
  );
}
