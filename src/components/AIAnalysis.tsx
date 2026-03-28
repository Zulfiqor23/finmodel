'use client';

import { Bot } from 'lucide-react';
import type { FactoryInputs, FactoryOutputs } from '@/lib/types';
import type { ThemeClasses, AIAnalysisStrings } from '@/lib/i18n/types';

interface AIAnalysisProps {
  inputs: FactoryInputs;
  outputs: FactoryOutputs;
  themeClasses: ThemeClasses;
  t: AIAnalysisStrings;
}

export default function AIAnalysis({ inputs, outputs, themeClasses, t }: AIAnalysisProps) {
  // Simple heuristic insights engine mimicking an AI
  const insights: string[] = [];
  const roi = outputs.roi;
  const breakEvenStatus = outputs.breakeven.isSafe;
  const defectLoss = (outputs.revenue.total / (1 - inputs.defectRate)) * inputs.defectRate;

  if (roi > 40) {
    insights.push(t.exceptionalROI(roi.toFixed(1)));
  } else if (roi > 15) {
    insights.push(t.stableROI(roi.toFixed(1)));
  } else if (roi > 0) {
    insights.push(t.lowMargin(roi.toFixed(1)));
  } else {
    insights.push(t.criticalLoss(Math.abs(outputs.dailyProfit).toLocaleString()));
  }

  if (!breakEvenStatus) {
     insights.push(t.volumeWarning((outputs.breakeven.unitsFromBreakeven * -1).toString()));
  }

  if (inputs.defectRate > 0.05) {
     insights.push(t.qualityControl((inputs.defectRate * 100).toFixed(1), defectLoss.toFixed(0)));
  }

  if (outputs.unitCosts[2].grossMarginPct < 20) {
     insights.push(t.proMarginWarning);
  }

  return (
    <div className={`mt-5 rounded-xl border p-5 shadow-sm transition-all duration-300 ${themeClasses.card} ${themeClasses.cardBorder}`}>
      <div className={`flex items-center gap-2 mb-3 ${themeClasses.accent}`}>
        <Bot className={`h-6 w-6 animate-pulse`} />
        <h2 className={`text-lg font-bold ${themeClasses.text}`}>{t.heading}</h2>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <p key={i} className={`text-sm leading-relaxed ${themeClasses.text}`}>
            {insight}
          </p>
        ))}
        {insights.length === 0 && (
          <p className={`text-sm opacity-60 ${themeClasses.textDimmed}`}>
            {t.noAnomalies}
          </p>
        )}
      </div>
    </div>
  );
}
