'use client';

import { Bot } from 'lucide-react';
import type { FactoryInputs, FactoryOutputs } from '@/lib/types';
import type { ThemeClasses } from '@/lib/i18n/types';

interface AIAnalysisProps {
  inputs: FactoryInputs;
  outputs: FactoryOutputs;
  themeClasses: ThemeClasses;
}

export default function AIAnalysis({ inputs, outputs, themeClasses }: AIAnalysisProps) {
  // Simple heuristic insights engine mimicking an AI
  const insights: string[] = [];
  const roi = outputs.roi;
  const breakEvenStatus = outputs.breakeven.isSafe;
  const defectLoss = (outputs.revenue.total / (1 - inputs.defectRate)) * inputs.defectRate;

  if (roi > 40) {
    insights.push(`⭐ Exceptional Profitability: High Return on Investment (${roi.toFixed(1)}%). Your current margin structure and labor combination are highly efficient.`);
  } else if (roi > 15) {
    insights.push(`✅ Stable Operations: Moderate return (${roi.toFixed(1)}%). Continuing exactly like this maintains steady cash flow.`);
  } else if (roi > 0) {
    insights.push(`⚠️ Low Margin Alert: Business is profitable but ROI is only ${roi.toFixed(1)}%. Consider reducing defect rates or negotiating material discounts.`);
  } else {
    insights.push(`🚨 Critical Loss: Factory is operating at a daily loss of $${Math.abs(outputs.dailyProfit).toLocaleString()}. Immediate cost reduction or price increases required.`);
  }

  if (!breakEvenStatus) {
     insights.push(`📉 Volume Warning: You are ${outputs.breakeven.unitsFromBreakeven * -1} units below the safe breakeven threshold. Fixed costs are burning profits.`);
  }

  if (inputs.defectRate > 0.05) {
     insights.push(`🔍 Quality Control: defect rate is high (${(inputs.defectRate * 100).toFixed(1)}%), effectively wasting $${defectLoss.toFixed(0)} of potential daily revenue.`);
  }

  if (outputs.unitCosts[2].grossMarginPct < 20) {
     insights.push(`💼 Pro Series Margin: The 'Pro' SKU is generating less than 20% gross margin. Check 'Pro Material Cost' vs 'Pro Price'.`);
  }

  return (
    <div className={`mt-5 rounded-xl border p-5 shadow-sm transition-all duration-300 ${themeClasses.card} ${themeClasses.cardBorder}`}>
      <div className={`flex items-center gap-2 mb-3 ${themeClasses.accent}`}>
        <Bot className={`h-6 w-6 animate-pulse`} />
        <h2 className={`text-lg font-bold ${themeClasses.text}`}>AI Business Intelligence</h2>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <p key={i} className={`text-sm leading-relaxed ${themeClasses.text}`}>
            {insight}
          </p>
        ))}
        {insights.length === 0 && (
          <p className={`text-sm opacity-60 ${themeClasses.textDimmed}`}>
            No severe anomalies detected. Factory is operating within expected parameters.
          </p>
        )}
      </div>
    </div>
  );
}
