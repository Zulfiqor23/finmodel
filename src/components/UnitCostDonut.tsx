'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { UnitCostBreakdown, ProductSku } from '@/lib/types';
import type { UnitCostStrings, ThemeClasses } from '@/lib/i18n';

interface UnitCostDonutProps {
  unitCosts: UnitCostBreakdown[];
  t: UnitCostStrings;
  themeClasses: ThemeClasses;
}

const SKU_COLORS: Record<ProductSku, string> = {
  base: '#10b981', // emerald-500
  lite: '#f59e0b', // amber-500
  pro: '#6366f1', // indigo-500
};

const COST_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

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
    <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs shadow-lg">
      <p className="text-gray-300">{entry.name}</p>
      <p className="font-mono font-semibold" style={{ color: entry.payload.fill }}>
        ${entry.value.toFixed(2)}
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
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={COST_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-0.5 text-xs">
                <p className={themeClasses.textMuted}>
                  {t.cost}{' '}
                  <span className={`font-mono ${themeClasses.text}`}>
                    ${uc.totalCost.toFixed(2)}
                  </span>
                </p>
                <p className={themeClasses.textMuted}>
                  {t.margin}{' '}
                  <span
                    className={`font-mono ${
                      uc.grossMargin >= 0 ? 'text-emerald-400' : 'text-red-400'
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
