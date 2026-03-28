'use client';

import { Users } from 'lucide-react';
import type { LaborCostBreakdown } from '@/lib/types';

interface LaborProductivityCardProps {
  labor: LaborCostBreakdown;
  unitsPerDay: number;
  efficiency: number;
}

export default function LaborProductivityCard({
  labor,
  unitsPerDay,
  efficiency,
}: LaborProductivityCardProps) {
  const unitsPerWorker = labor.workerCount > 0 ? unitsPerDay / labor.workerCount : 0;
  const effectiveUnitsPerWorker = unitsPerWorker * efficiency;
  const laborCostPerUnit =
    unitsPerDay > 0 ? labor.totalDailyCost / unitsPerDay : 0;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4">
      <div className="flex items-center gap-2 text-gray-300">
        <Users className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold">Labor &amp; Productivity</h2>
      </div>

      {/* Tier badge */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
          {labor.workerCount} Workers
        </span>
        {labor.tier.pieceRateApplies && (
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
            + Piece Rate
          </span>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        <KPIBlock
          label="Units / Worker"
          value={unitsPerWorker.toFixed(1)}
        />
        <KPIBlock
          label="Effective / Worker"
          value={effectiveUnitsPerWorker.toFixed(1)}
        />
        <KPIBlock
          label="Daily Labor Cost"
          value={`$${labor.totalDailyCost.toFixed(0)}`}
        />
        <KPIBlock
          label="Labor / Unit"
          value={`$${laborCostPerUnit.toFixed(2)}`}
        />
        <KPIBlock
          label="Daily Wage"
          value={`$${labor.dailyWageCost.toFixed(0)}`}
        />
        <KPIBlock
          label="Piece Rate"
          value={`$${labor.dailyPieceRateCost.toFixed(0)}`}
        />
      </div>

      <p className="text-xs text-gray-600">
        Monthly: ${labor.totalMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}

function KPIBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-800/60 p-2.5 text-center">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className="font-mono text-lg font-bold text-gray-200">{value}</p>
    </div>
  );
}
