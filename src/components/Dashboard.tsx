'use client';

import { useState, useCallback } from 'react';
import { Factory } from 'lucide-react';
import { useFactoryCalculations } from '@/hooks/useFactoryCalculations';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import type { FactoryInputs } from '@/lib/types';
import InputPanel from './InputPanel';
import ProfitabilityHeatmap from './ProfitabilityHeatmap';
import SafetyZoneGauge from './SafetyZoneGauge';
import UnitCostDonut from './UnitCostDonut';
import GlobalMetrics from './GlobalMetrics';
import LaborProductivityCard from './LaborProductivityCard';
import MarketingAdvisory from './MarketingAdvisory';
import LanguageSwitcher from './LanguageSwitcher';

const INITIAL_INPUTS: FactoryInputs = {
  unitsPerDay: 50,
  baseMix: 0.4,
  liteMix: 0.35,
  proMix: 0.25,
  shiftHours: 8,
  efficiency: 0.85,
  workdaysPerMonth: 22,
  monthlyRent: 5000,
  baseMaterialCost: 200,
  liteMaterialCost: 280,
  proMaterialCost: 420,
  basePrice: 400,
  litePrice: 550,
  proPrice: 900,
  workerWage: 700,
  basePowerCost: 8,
  machinePowerCost: 45,
  burnRatePerHour: 25,
};

export default function Dashboard() {
  const [inputs, setInputs] = useState<FactoryInputs>(INITIAL_INPUTS);
  const outputs = useFactoryCalculations(inputs);
  const { locale, setLocale, t } = useLocale();
  const { themeClasses } = useTheme();

  const handleChange = useCallback(
    (key: keyof FactoryInputs, value: number) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg}`}>
      {/* Header */}
      <header className={`border-b ${themeClasses.headerBg} backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Factory className={`h-7 w-7 ${themeClasses.accent}`} />
            <div>
              <h1 className={`text-xl font-bold tracking-tight ${themeClasses.text}`}>
                {t.header.title}
              </h1>
              <p className={`text-xs ${themeClasses.textDimmed}`}>
                {t.header.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher
              locale={locale}
              setLocale={setLocale}
              themeClasses={themeClasses}
            />
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left sidebar: controls */}
          <div className="lg:col-span-3">
            <InputPanel
              inputs={inputs}
              onChange={handleChange}
              t={t.inputPanel}
              themeClasses={themeClasses}
            />
          </div>

          {/* Right area: dashboard cards */}
          <div className="lg:col-span-9 space-y-5">
            {/* Top global metrics */}
            <GlobalMetrics
              outputs={outputs}
              t={t.dashboard}
              themeClasses={themeClasses}
            />

            {/* Top row: Profit + Breakeven */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <ProfitabilityHeatmap
                outputs={outputs}
                workdaysPerMonth={inputs.workdaysPerMonth}
                t={t.profitability}
                themeClasses={themeClasses}
              />
              <SafetyZoneGauge
                breakeven={outputs.breakeven}
                t={t.breakeven}
                themeClasses={themeClasses}
              />
            </div>

            {/* Middle: Unit cost donuts */}
            <UnitCostDonut
              unitCosts={outputs.unitCosts}
              t={t.unitCost}
              themeClasses={themeClasses}
            />

            {/* Bottom row: Labor + Marketing */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <LaborProductivityCard
                labor={outputs.labor}
                unitsPerDay={inputs.unitsPerDay}
                efficiency={inputs.efficiency}
                t={t.laborCard}
                themeClasses={themeClasses}
              />
              <MarketingAdvisory
                marketing={outputs.marketing}
                t={t.marketing}
                themeClasses={themeClasses}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
