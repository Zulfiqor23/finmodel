'use client';

import { Sliders } from 'lucide-react';
import type { FactoryInputs } from '@/lib/types';

interface InputPanelProps {
  inputs: FactoryInputs;
  onChange: (key: keyof FactoryInputs, value: number) => void;
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
}

function SliderRow({ label, value, min, max, step, unit, format, onChange }: SliderRowProps) {
  const displayValue = format ? format(value) : `${value}${unit ?? ''}`;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="font-mono text-sm font-semibold text-emerald-400">
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
        className="w-full accent-emerald-500 cursor-pointer"
      />
    </div>
  );
}

export default function InputPanel({ inputs, onChange }: InputPanelProps) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-5">
      <div className="flex items-center gap-2 text-gray-300">
        <Sliders className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold">Factory Controls</h2>
      </div>

      <SliderRow
        label="Units / Day"
        value={inputs.unitsPerDay}
        min={1}
        max={100}
        step={1}
        onChange={(v) => onChange('unitsPerDay', v)}
      />

      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Product Mix
        </p>
        <SliderRow
          label="Base %"
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
        />
        <SliderRow
          label="Lite %"
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
        />
        <SliderRow
          label="Pro %"
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
        />
      </div>

      <SliderRow
        label="Shift Hours"
        value={inputs.shiftHours}
        min={1}
        max={10}
        step={1}
        unit="h"
        onChange={(v) => onChange('shiftHours', v)}
      />

      <SliderRow
        label="Efficiency"
        value={inputs.efficiency}
        min={0.5}
        max={1}
        step={0.05}
        format={(v) => `${(v * 100).toFixed(0)}%`}
        onChange={(v) => onChange('efficiency', v)}
      />

      <SliderRow
        label="Workdays / Month"
        value={inputs.workdaysPerMonth}
        min={18}
        max={23}
        step={1}
        onChange={(v) => onChange('workdaysPerMonth', v)}
      />

      <SliderRow
        label="Monthly Rent"
        value={inputs.monthlyRent}
        min={1000}
        max={15000}
        step={500}
        format={(v) => `$${v.toLocaleString()}`}
        onChange={(v) => onChange('monthlyRent', v)}
      />
    </div>
  );
}
