'use client';

import { Sliders } from 'lucide-react';
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
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full ${themeClasses.input} cursor-pointer`}
      />
    </div>
  );
}

export default function InputPanel({ inputs, onChange, t, themeClasses }: InputPanelProps) {
  return (
    <div className={`rounded-xl border ${themeClasses.card} p-5 space-y-5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out`}>
      <div className={`flex items-center gap-2 ${themeClasses.text}`}>
        <Sliders className={`h-5 w-5 ${themeClasses.accent}`} />
        <h2 className="text-lg font-semibold">{t.heading}</h2>
      </div>

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
        <p className={`text-xs font-medium uppercase tracking-wider ${themeClasses.textDimmed}`}>
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
            const liteRatio =
              inputs.liteMix + inputs.proMix > 0
                ? inputs.liteMix / (inputs.liteMix + inputs.proMix)
                : 0.5;
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
            const baseRatio =
              inputs.baseMix + inputs.proMix > 0
                ? inputs.baseMix / (inputs.baseMix + inputs.proMix)
                : 0.5;
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
            const baseRatio =
              inputs.baseMix + inputs.liteMix > 0
                ? inputs.baseMix / (inputs.baseMix + inputs.liteMix)
                : 0.5;
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

      <SliderRow
        label={t.monthlyRent}
        value={inputs.monthlyRent}
        min={1000}
        max={15000}
        step={500}
        format={(v) => `$${v.toLocaleString()}`}
        onChange={(v) => onChange('monthlyRent', v)}
        themeClasses={themeClasses}
      />
    </div>
  );
}
