'use client';

import { useState, useCallback } from 'react';
import { Factory } from 'lucide-react';
import { useFactoryCalculations } from '@/hooks/useFactoryCalculations';
import type { FactoryInputs } from '@/lib/types';
import InputPanel from './InputPanel';
import ProfitabilityHeatmap from './ProfitabilityHeatmap';
import SafetyZoneGauge from './SafetyZoneGauge';
import UnitCostDonut from './UnitCostDonut';
import LaborProductivityCard from './LaborProductivityCard';
import MarketingAdvisory from './MarketingAdvisory';

const INITIAL_INPUTS: FactoryInputs = {
  unitsPerDay: 50,
  baseMix: 0.4,
  liteMix: 0.35,
  proMix: 0.25,
  shiftHours: 8,
  efficiency: 0.85,
  workdaysPerMonth: 22,
  monthlyRent: 5000,
};

export default function Dashboard() {
  const [inputs, setInputs] = useState<FactoryInputs>(INITIAL_INPUTS);
  const outputs = useFactoryCalculations(inputs);

  const handleChange = useCallback(
    (key: keyof FactoryInputs, value: number) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Factory className="h-7 w-7 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">FinModel</h1>
            <p className="text-xs text-gray-500">
              Dynamic Factory OS Dashboard
            </p>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left sidebar: controls */}
          <div className="lg:col-span-3">
            <InputPanel inputs={inputs} onChange={handleChange} />
          </div>

          {/* Right area: dashboard cards */}
          <div className="lg:col-span-9 space-y-5">
            {/* Top row: Profit + Breakeven */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <ProfitabilityHeatmap
                outputs={outputs}
                workdaysPerMonth={inputs.workdaysPerMonth}
              />
              <SafetyZoneGauge breakeven={outputs.breakeven} />
            </div>

            {/* Middle: Unit cost donuts */}
            <UnitCostDonut unitCosts={outputs.unitCosts} />

            {/* Bottom row: Labor + Marketing */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <LaborProductivityCard
                labor={outputs.labor}
                unitsPerDay={inputs.unitsPerDay}
                efficiency={inputs.efficiency}
              />
              <MarketingAdvisory marketing={outputs.marketing} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
