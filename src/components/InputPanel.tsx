'use client';

import { useState } from 'react';
import { Sliders, Settings2, PackageCheck, Zap, ChevronDown } from 'lucide-react';
import type { FactoryInputs } from '@/lib/types';
import type { InputPanelStrings, ThemeClasses } from '@/lib/i18n';

interface InputPanelProps {
  inputs: FactoryInputs;
  onChange: (key: keyof FactoryInputs, value: number) => void;
  t: InputPanelStrings;
  themeClasses: ThemeClasses;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  format?: (v: number) => string;
  onChange: (value: number) => void;
  themeClasses: ThemeClasses;
}

function SliderRow({ label, value, min, max, step, unit, format, onChange, themeClasses }: SliderRowProps) {
  const displayValue = format ? format(value) : `${value}${unit ?? ''}`;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={`text-sm ${themeClasses.textMuted}`}>{label}</span>
        <span className={`font-mono text-sm font-semibold ${themeClasses.accent}`}>
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full ${themeClasses.input} cursor-pointer`}
      />
    </div>
  );
}

interface AccordionGroupProps {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  themeClasses: ThemeClasses;
  children: React.ReactNode;
}

function AccordionGroup({ title, icon: Icon, defaultOpen = false, themeClasses, children }: AccordionGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`overflow-hidden rounded-xl border ${themeClasses.cardBorder}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:${themeClasses.accentBg}`}
      >
        <div className={`flex items-center gap-2 ${themeClasses.text}`}>
          <Icon className={`h-4 w-4 ${themeClasses.accent}`} />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 ${themeClasses.textMuted} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="p-4 pt-0 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InputPanel({ inputs, onChange, t, themeClasses }: InputPanelProps) {
  return (
    <div className={`rounded-xl border ${themeClasses.card} p-5 space-y-5 shadow-sm transition-all duration-300 ease-in-out`}>
      <div className={`flex items-center gap-2 ${themeClasses.text}`}>
        <Sliders className={`h-5 w-5 ${themeClasses.accent}`} />
        <h2 className="text-lg font-semibold">{t.heading}</h2>
      </div>

      <div className="space-y-3">
        {/* GROUP 1: Production Volume */}
        <AccordionGroup title={t.groupProduction} icon={Settings2} defaultOpen={true} themeClasses={themeClasses}>
          <SliderRow
            label={t.unitsPerDay}
            value={inputs.unitsPerDay}
            min={1}
            max={100}
            step={1}
            onChange={(v) => onChange('unitsPerDay', v)}
            themeClasses={themeClasses}
          />
          <div className="space-y-1">
            <p className={`text-xs font-medium uppercase tracking-wider ${themeClasses.textDimmed} mt-2`}>
              {t.productMix}
            </p>
            <SliderRow
              label={t.basePercent}
              value={inputs.baseMix}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${(v * 100).toFixed(0)}%`}
              onChange={(v) => {
                const remaining = 1 - v;
                const liteRatio = inputs.liteMix + inputs.proMix > 0 ? inputs.liteMix / (inputs.liteMix + inputs.proMix) : 0.5;
                const newLite = Math.round(remaining * liteRatio * 100) / 100;
                const newPro = Math.round((remaining - newLite) * 100) / 100;
                onChange('baseMix', v);
                onChange('liteMix', Math.max(0, newLite));
                onChange('proMix', Math.max(0, newPro));
              }}
              themeClasses={themeClasses}
            />
            <SliderRow
              label={t.litePercent}
              value={inputs.liteMix}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${(v * 100).toFixed(0)}%`}
              onChange={(v) => {
                const remaining = 1 - v;
                const baseRatio = inputs.baseMix + inputs.proMix > 0 ? inputs.baseMix / (inputs.baseMix + inputs.proMix) : 0.5;
                const newBase = Math.round(remaining * baseRatio * 100) / 100;
                const newPro = Math.round((remaining - newBase) * 100) / 100;
                onChange('liteMix', v);
                onChange('baseMix', Math.max(0, newBase));
                onChange('proMix', Math.max(0, newPro));
              }}
              themeClasses={themeClasses}
            />
            <SliderRow
              label={t.proPercent}
              value={inputs.proMix}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${(v * 100).toFixed(0)}%`}
              onChange={(v) => {
                const remaining = 1 - v;
                const baseRatio = inputs.baseMix + inputs.liteMix > 0 ? inputs.baseMix / (inputs.baseMix + inputs.liteMix) : 0.5;
                const newBase = Math.round(remaining * baseRatio * 100) / 100;
                const newLite = Math.round((remaining - newBase) * 100) / 100;
                onChange('proMix', v);
                onChange('baseMix', Math.max(0, newBase));
                onChange('liteMix', Math.max(0, newLite));
              }}
              themeClasses={themeClasses}
            />
          </div>
          <SliderRow
            label={t.shiftHours}
            value={inputs.shiftHours}
            min={1}
            max={10}
            step={1}
            unit="h"
            onChange={(v) => onChange('shiftHours', v)}
            themeClasses={themeClasses}
          />
          <SliderRow
            label={t.efficiency}
            value={inputs.efficiency}
            min={0.5}
            max={1}
            step={0.05}
            format={(v) => `${(v * 100).toFixed(0)}%`}
            onChange={(v) => onChange('efficiency', v)}
            themeClasses={themeClasses}
          />
          <SliderRow
            label={t.workdaysPerMonth}
            value={inputs.workdaysPerMonth}
            min={18}
            max={23}
            step={1}
            onChange={(v) => onChange('workdaysPerMonth', v)}
            themeClasses={themeClasses}
          />
        </AccordionGroup>

        {/* GROUP 2: Prices & Materials */}
        <AccordionGroup title={t.groupMaterials} icon={PackageCheck} defaultOpen={false} themeClasses={themeClasses}>
          <SliderRow label={t.basePrice} value={inputs.basePrice} min={100} max={1000} step={10} format={(v) => `$${v}`} onChange={(v) => onChange('basePrice', v)} themeClasses={themeClasses} />
          <SliderRow label={t.baseMaterialCost} value={inputs.baseMaterialCost} min={50} max={500} step={10} format={(v) => `$${v}`} onChange={(v) => onChange('baseMaterialCost', v)} themeClasses={themeClasses} />
          
          <div className={`my-2 border-t ${themeClasses.cardBorder}`} />
          <SliderRow label={t.litePrice} value={inputs.litePrice} min={200} max={1500} step={10} format={(v) => `$${v}`} onChange={(v) => onChange('litePrice', v)} themeClasses={themeClasses} />
          <SliderRow label={t.liteMaterialCost} value={inputs.liteMaterialCost} min={100} max={800} step={10} format={(v) => `$${v}`} onChange={(v) => onChange('liteMaterialCost', v)} themeClasses={themeClasses} />
          
          <div className={`my-2 border-t ${themeClasses.cardBorder}`} />
          <SliderRow label={t.proPrice} value={inputs.proPrice} min={300} max={3000} step={50} format={(v) => `$${v}`} onChange={(v) => onChange('proPrice', v)} themeClasses={themeClasses} />
          <SliderRow label={t.proMaterialCost} value={inputs.proMaterialCost} min={150} max={1500} step={10} format={(v) => `$${v}`} onChange={(v) => onChange('proMaterialCost', v)} themeClasses={themeClasses} />
        </AccordionGroup>

        {/* GROUP 3: Operations & Utilities */}
        <AccordionGroup title={t.groupOverhead} icon={Zap} defaultOpen={false} themeClasses={themeClasses}>
          <SliderRow label={t.workerWage} value={inputs.workerWage} min={300} max={2000} step={50} format={(v) => `$${v.toLocaleString('en-US')}`} onChange={(v) => onChange('workerWage', v)} themeClasses={themeClasses} />
          <SliderRow label={t.monthlyRent} value={inputs.monthlyRent} min={1000} max={15000} step={500} format={(v) => `$${v.toLocaleString('en-US')}`} onChange={(v) => onChange('monthlyRent', v)} themeClasses={themeClasses} />
          <SliderRow label={t.basePowerCost} value={inputs.basePowerCost} min={0} max={50} step={1} format={(v) => `$${v}`} onChange={(v) => onChange('basePowerCost', v)} themeClasses={themeClasses} />
          <SliderRow label={t.machinePowerCost} value={inputs.machinePowerCost} min={10} max={200} step={5} format={(v) => `$${v}`} onChange={(v) => onChange('machinePowerCost', v)} themeClasses={themeClasses} />
          <SliderRow label={t.burnRatePerHour} value={inputs.burnRatePerHour} min={5} max={100} step={1} format={(v) => `$${v}`} onChange={(v) => onChange('burnRatePerHour', v)} themeClasses={themeClasses} />
        </AccordionGroup>
      </div>
    </div>
  );
}
