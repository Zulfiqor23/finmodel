'use client';

import { Megaphone } from 'lucide-react';
import type { MarketingAdvice, ProductSku } from '@/lib/types';

interface MarketingAdvisoryProps {
  marketing: MarketingAdvice;
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

export default function MarketingAdvisory({ marketing }: MarketingAdvisoryProps) {
  const { recommendedSku, scores, rationale } = marketing;
  const maxScore = Math.max(...Object.values(scores), 1);
  const skus: ProductSku[] = ['base', 'lite', 'pro'];

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4">
      <div className="flex items-center gap-2 text-gray-300">
        <Megaphone className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold">Marketing Advisory</h2>
      </div>

      {/* Recommendation */}
      <div className="rounded-xl bg-gray-800/60 p-4">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          Recommended Focus
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
                    isWinner ? SKU_TEXT[sku] + ' font-semibold' : 'text-gray-400'
                  }
                >
                  {SKU_LABELS[sku]}
                </span>
                <span className="font-mono text-gray-400">
                  ${scores[sku].toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-800">
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
      <p className="text-xs leading-relaxed text-gray-500">{rationale}</p>
    </div>
  );
}
