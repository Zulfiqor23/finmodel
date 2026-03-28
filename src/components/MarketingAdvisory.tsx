'use client';

import { Megaphone } from 'lucide-react';
import type { MarketingAdvice, ProductSku } from '@/lib/types';
import type { MarketingStrings, ThemeClasses } from '@/lib/i18n';

interface MarketingAdvisoryProps {
  marketing: MarketingAdvice;
  t: MarketingStrings;
  themeClasses: ThemeClasses;
}

const SKU_LABELS: Record<ProductSku, string> = {
  base: 'Base',
  lite: 'Lite',
  pro: 'Pro',
};

const SKU_COLORS: Record<ProductSku, string> = {
  base: 'bg-emerald-500',
  lite: 'bg-amber-500',
  pro: 'bg-indigo-500',
};

const SKU_TEXT: Record<ProductSku, string> = {
  base: 'text-emerald-400',
  lite: 'text-amber-400',
  pro: 'text-indigo-400',
};

export default function MarketingAdvisory({ marketing, t, themeClasses }: MarketingAdvisoryProps) {
  const { recommendedSku, scores, rationale } = marketing;
  const maxScore = Math.max(...Object.values(scores), 1);
  const skus: ProductSku[] = ['base', 'lite', 'pro'];

  return (
    <div className={`rounded-xl border ${themeClasses.card} p-5 space-y-4 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out`}>
      <div className={`flex items-center gap-2 ${themeClasses.text}`}>
        <Megaphone className={`h-5 w-5 ${themeClasses.accent}`} />
        <h2 className="text-lg font-semibold">{t.heading}</h2>
      </div>

      {/* Recommendation */}
      <div className={`rounded-xl ${themeClasses.kpiBlock} p-4`}>
        <p className={`text-xs uppercase tracking-wider ${themeClasses.textDimmed}`}>
          {t.recommendedFocus}
        </p>
        <p className={`text-2xl font-bold ${SKU_TEXT[recommendedSku]}`}>
          {SKU_LABELS[recommendedSku]}
        </p>
      </div>

      {/* Score bars */}
      <div className="space-y-2">
        {skus.map((sku) => {
          const pct = maxScore > 0 ? (scores[sku] / maxScore) * 100 : 0;
          const isWinner = sku === recommendedSku;
          return (
            <div key={sku} className="space-y-0.5">
              <div className="flex justify-between text-xs">
                <span
                  className={
                    isWinner ? SKU_TEXT[sku] + ' font-semibold' : themeClasses.textMuted
                  }
                >
                  {SKU_LABELS[sku]}
                </span>
                <span className={`font-mono ${themeClasses.textMuted}`}>
                  ${scores[sku].toFixed(2)}
                </span>
              </div>
              <div className={`h-2 w-full rounded-full ${themeClasses.barBg}`}>
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isWinner ? SKU_COLORS[sku] : 'bg-gray-600'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Rationale */}
      <p className={`text-xs leading-relaxed ${themeClasses.textDimmed}`}>{rationale}</p>
    </div>
  );
}
