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
import AIAnalysis from './AIAnalysis';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { supabase } from '@/lib/supabase';
import { Cloud, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

const INITIAL_INPUTS: FactoryInputs = {
  unitsPerDay: 50,
  baseMix: 0.4,
  liteMix: 0.35,
  proMix: 0.25,
  shiftHours: 8,
  efficiency: 0.85,
  workdaysPerMonth: 22,
  defectRate: 0.05,
  monthlyRent: 5000,
  baseMaterialCost: 200,
  liteMaterialCost: 280,
  proMaterialCost: 420,
  basePrice: 400,
  litePrice: 550,
  proPrice: 900,
  salesLabor: { workerCount: 2, wageType: 'kpi', fixedWage: 300, kpiCapacity: 50, kpiRate: 2 },
  techLabor: { workerCount: 1, wageType: 'fixed', fixedWage: 1200, kpiCapacity: 0, kpiRate: 0 },
  prodLabor: { workerCount: 5, wageType: 'fixed', fixedWage: 700, kpiCapacity: 10, kpiRate: 0 },
  logisticsLabor: { workerCount: 2, wageType: 'fixed', fixedWage: 500, kpiCapacity: 0, kpiRate: 0 },
  lightingPowerPerHour: 2,
  equipmentPowerPerHour: 8,
  burnRatePerHour: 25,
  initialInvestment: 50000,
  vatRate: 0.12,
};

export default function Dashboard() {
  const [inputs, setInputs] = useState<FactoryInputs>(INITIAL_INPUTS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const outputs = useFactoryCalculations(inputs);
  const { locale, setLocale, t } = useLocale();
  const { theme, setTheme, themeClasses } = useTheme();

  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from('finmodel_scenarios')
          .select('inputs')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (data && !error && data.inputs) {
          // Merge to ensure no missing keys from old saves
          setInputs(prev => ({ ...prev, ...data.inputs }));
        }
      } catch (e) {
        console.error("Failed to load cloud data", e);
      }
    }
    loadData();
  }, []);

  const saveToCloud = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await supabase.from('finmodel_scenarios').insert([{ inputs }]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to save to cloud", e);
    }
    setIsSaving(false);
  };

  const handleChange = useCallback(
    (key: keyof FactoryInputs, value: number | any) => {
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
            <ThemeSwitcher
              theme={theme}
              setTheme={setTheme}
              t={t.themeSwitcher}
            />
            <button
              onClick={saveToCloud}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-300 ${saveSuccess ? 'bg-emerald-500 text-white hover:bg-emerald-600' : themeClasses.pillActive}`}
            >
              {isSaving ? (
                <Cloud className="h-4 w-4 animate-pulse" />
              ) : saveSuccess ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              {saveSuccess ? 'Saved' : 'Cloud Sync'}
            </button>
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
                t={t.laborCard}
                themeClasses={themeClasses}
              />
              <MarketingAdvisory
                marketing={outputs.marketing}
                t={t.marketing}
                themeClasses={themeClasses}
              />
            </div>

            {/* AI Analysis Row */}
            <div className="grid grid-cols-1">
               <AIAnalysis
                  inputs={inputs}
                  outputs={outputs}
                  themeClasses={themeClasses}
                  t={t.aiAnalysis}
               />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
