# FinModel — Factory OS Dashboard

React financial dashboard (furniture factory): profitability, breakeven, labor, marketing via sliders.

## Stack
Next.js 15 App Router · TypeScript strict · Tailwind dark-only · Recharts · Lucide · Vercel

## Rules
1. Math → `src/lib/engine.ts` only. Components: props-in, UI-out.
2. `Dashboard.tsx` = single state source (sliders → engine → UI)
3. Every `engine.ts` fn → unit test. No `any`. No inline styles/CSS modules.
4. Theme: `bg-gray-950` base · emerald/amber/red accents

## Products
| SKU  | Price | Material | Labor  | Hours |
|------|-------|----------|--------|-------|
| Base | $400  | $200     | $23.50 | 1.5h  |
| Lite | $550  | $280     | $35.00 | 2.0h  |
| Pro  | $900  | $420     | $60.00 | 3.5h  |

## Labor (step-fixed, $700/mo/worker)
- 1–15 u/day → 2 workers
- 16–40 → 5 workers
- 41–80 → 10 workers + $23.50 piece-rate
- 81–100 → 15 workers + $23.50 piece-rate

## Costs
- Power: `$8 + $45 × (hours/10)` /day
- Burn: `$25/hr × shift_hrs` → `overhead/unit = burn / (N × eff)`
- Breakeven: N < 42 = RED, N ≥ 42 = GREEN

## Marketing (CM × volume_share → highest = recommend)
CM: Base $176.50 · Lite $235.00 · Pro $420.00

## Git
Conventional commits. `npm run build && npm test` before every commit.
