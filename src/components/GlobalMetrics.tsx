'use client';

import { Activity, DollarSign, PieChart, TrendingUp } from 'lucide-react';
import type { FactoryOutputs } from '@/lib/types';
import type { DashboardStrings, ThemeClasses } from '@/lib/i18n';

interface GlobalMetricsProps {
  outputs: FactoryOutputs;
  t: DashboardStrings;
  themeClasses: ThemeClasses;
}

export default function GlobalMetrics({ outputs, t, themeClasses }: GlobalMetricsProps) {
  const metrics = [
    {
      id: 'cogs',
      label: t.cogs,
      title: t.cogsTitle,
      desc: t.cogsDesc,
      value: `$${outputs.cogs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      icon: PieChart,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
    },
    {
      id: 'opex',
      label: t.opex,
      title: t.opexTitle,
      desc: t.opexDesc,
      value: `$${outputs.opex.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      icon: Activity,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      id: 'ebitda',
      label: t.ebitda,
      title: t.ebitdaTitle,
      desc: t.ebitdaDesc,
      value: `$${outputs.ebitda.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      id: 'roi',
      label: t.roi,
      title: t.roiTitle,
      desc: t.roiDesc,
      value: `${outputs.roi.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      id: 'payback',
      label: t.payback,
      title: t.paybackTitle,
      desc: t.paybackDesc,
      value: outputs.paybackMonths > 120 ? '> 10 y' : `${outputs.paybackMonths.toFixed(1)} m`,
      icon: TrendingUp,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
    },
    {
      id: 'vat',
      label: t.vat,
      title: t.vat,
      desc: 'Estimated monthly VAT (QQS) payable.',
      value: `$${outputs.vatMonthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      icon: PieChart,
      color: 'text-cyan-500',
      bg: 'bg-cyan-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className={`group relative rounded-xl border ${themeClasses.card} p-4 shadow-sm transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${themeClasses.textMuted}`}>{m.label}</span>
              <div className={`rounded-full p-2 ${m.bg}`}>
                <Icon className={`h-4 w-4 ${m.color}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${themeClasses.text}`}>{m.value}</div>
            
            {/* Tooltip */}
            <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-48 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-50">
              <div className="bg-slate-800 text-white text-xs rounded-lg p-2 shadow-xl border border-slate-700">
                <p className="font-semibold mb-1 text-slate-100">{m.title}</p>
                <p className="text-slate-300">{m.desc}</p>
              </div>
              <div className="w-3 h-3 bg-slate-800 border-r border-b border-slate-700 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
