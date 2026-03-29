'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import type { UnitCostBreakdown, ProductSku } from '@/lib/types';
import type { UnitCostStrings, ThemeClasses } from '@/lib/i18n';
import { formatMoney } from '@/lib/format';

interface UnitCostDonutProps {
  unitCosts: UnitCostBreakdown[];
  t: UnitCostStrings;
  themeClasses: ThemeClasses;
}

const SKU_COLORS: Record<ProductSku, string> = {
  base: '#0f766e', // teal-700
  lite: '#8b5cf6', // violet-500
  pro: '#f43f5e', // rose-500
};

// Classic Pastel colors for financial breakdown
const COST_COLORS = [
  '#cbd5e1', // slate-300 (Material)
  '#fcd34d', // amber-300 (Labor)
  '#7dd3fc', // sky-300 (Electricity)
  '#f9a8d4', // pink-300 (Overhead)
];

interface PayloadEntry {
  name: string;
  value: number;
  payload: { fill: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: PayloadEntry[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="text-slate-500 font-medium mb-1">{entry.name}</p>
      <p className="font-mono font-bold" style={{ color: entry.payload.fill }}>
        ${formatMoney(entry.value)}
      </p>
    </div>
  );
}

export default function UnitCostDonut({ unitCosts, t, themeClasses }: UnitCostDonutProps) {
  const legendItems = [
    { name: t.material, color: COST_COLORS[0] },
    { name: t.labor, color: COST_COLORS[1] },
    { name: t.electricity, color: COST_COLORS[2] },
    { name: t.overhead, color: COST_COLORS[3] },
  ];

  return (
    <div className={`rounded-xl border ${themeClasses.card} p-5 space-y-4 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out`}>
      <h2 className={`text-lg font-semibold ${themeClasses.text}`}>{t.heading}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {unitCosts.map((uc) => {
          const data = [
            { name: t.material, value: uc.material },
            { name: t.labor, value: uc.labor },
            { name: t.electricity, value: uc.electricity },
            { name: t.overhead, value: uc.overhead },
          ];

          return (
            <div key={uc.sku} className="text-center space-y-2">
              <p
                className="text-sm font-semibold"
                style={{ color: SKU_COLORS[uc.sku] }}
              >
                {uc.sku.charAt(0).toUpperCase() + uc.sku.slice(1)}
              </p>
                  <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={72}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={1}
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={COST_COLORS[i]} />
                    ))}
                    <LabelList 
                      dataKey="value" 
                      position="inside" 
                      fill="#fff" 
                      fontSize={10} 
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(val: any) => {
                        const total = data.reduce((acc, d) => acc + d.value, 0);
                        const numericVal = Number(val) || 0;
                        return total > 0 && numericVal > 0 ? `${((numericVal / total) * 100).toFixed(0)}%` : '';
                      }}
                    />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-0.5 text-sm">
                <p className={`font-bold ${themeClasses.textMuted}`}>
                  {t.cost}{' '}
                  <span className={`font-mono font-bold ${themeClasses.text}`}>
                    ${formatMoney(uc.totalCost)}
                  </span>
                </p>
                <p className={`font-bold ${themeClasses.textMuted}`}>
                  {t.margin}{' '}
                  <span
                    className={`font-mono font-bold ${
                      uc.grossMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {uc.grossMarginPct.toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={`flex flex-wrap justify-center gap-4 text-xs ${themeClasses.textDimmed}`}>
        {legendItems.map((item) => (
          <span key={item.name} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
