# Architecture Decision Record — FinModel Dashboard

**Date:** 2026-03-28
**Status:** Accepted
**Project:** FinModel — Dynamic Factory OS Dashboard

---

## Context

FinModel is a real-time financial dashboard for a modular furniture factory. It
must handle interactive slider inputs and immediately recompute profitability,
breakeven analysis, labor costs, and marketing recommendations without page
reloads or server round-trips.

---

## Component Hierarchy

```
app/
└── page.tsx                        # Next.js App Router entry point
    └── <Dashboard />               # SINGLE STATE SOURCE (sliders → engine → UI)
        │
        ├── <SliderPanel />         # All input sliders (unitsPerDay, mix, shiftHours, …)
        │   ├── <SliderRow />       # Individual labeled slider + live value display
        │   └── <MixControl />      # Three-way product mix adjuster (base/lite/pro)
        │
        ├── <KpiBar />              # Top-row KPI cards (revenue, profit, margin %)
        │   └── <KpiCard />         # Single metric: label + value + trend indicator
        │
        ├── <RevenueChart />        # Recharts BarChart — revenue split by SKU
        ├── <CostWaterfallChart />   # Recharts — cost stack (material/labor/elec/overhead)
        ├── <BreakevenGauge />       # Recharts RadialBarChart — units vs. threshold (red/green)
        │
        ├── <LaborTierBadge />      # Shows active tier name + worker count
        ├── <UnitCostTable />       # Per-SKU cost breakdown table (all columns)
        │
        └── <MarketingAdviceCard /> # Recommended SKU + CM scores + rationale text
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  USER INTERACTION                                                       │
│                                                                         │
│  Slider drag → onChange → Dashboard.setState(inputs)                   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │  FactoryInputs
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  src/lib/engine.ts  ←  src/lib/constants.ts                            │
│                                                                         │
│  calculateAll(inputs: FactoryInputs): FactoryOutputs                   │
│                                                                         │
│  Internal pipeline:                                                     │
│    1. calculateUnitsPerProduct   → UnitsPerProduct                     │
│    2. calculateRevenue           → RevenueBreakdown                    │
│    3. calculateMaterialCost      → MaterialCostBreakdown               │
│    4. calculateLaborTier         → LaborTier (active tier)             │
│    5. calculateLaborCost         → LaborCostBreakdown                  │
│    6. calculateElectricity       → ElectricityCost                     │
│    7. calculateOverhead          → OverheadBreakdown                   │
│    8. calculateUnitCostBreakdown → UnitCostBreakdown[]                 │
│    9. calculateContributionMargins → ContributionMargins               │
│   10. calculateBreakeven         → BreakevenResult                     │
│   11. generateMarketingAdvice    → MarketingAdvice                     │
│   12. derive dailyProfit, monthlyProfit                                │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │  FactoryOutputs
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Dashboard.tsx  — passes slices of FactoryOutputs as props             │
│                                                                         │
│  outputs.revenue      → <RevenueChart />                               │
│  outputs.breakeven    → <BreakevenGauge />                             │
│  outputs.labor        → <LaborTierBadge />                             │
│  outputs.unitCosts    → <UnitCostTable />                              │
│  outputs.marketing    → <MarketingAdviceCard />                        │
│  outputs.dailyProfit  → <KpiBar />                                     │
│  …etc.                                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Decisions

### D1 — Engine as pure calculation module

**Decision:** All math lives in `src/lib/engine.ts`. Components are stateless
renderers that receive computed values via props.

**Rationale:** Separating concerns makes every calculation unit-testable in
isolation (no React/DOM needed). Components remain simple, predictable, and easy
to restyle without risking business logic regressions.

**Consequences:** Dashboard.tsx becomes the only stateful component; it is
responsible for calling `calculateAll()` on every slider change and fanning out
the resulting `FactoryOutputs` to child components.

---

### D2 — Single state source in Dashboard.tsx

**Decision:** Dashboard.tsx holds the complete `FactoryInputs` state object.
Child components never own input state; they only receive output props.

**Rationale:** A single `useState<FactoryInputs>` at the root guarantees a
unidirectional data flow (slider → state → engine → props → render), eliminating
sync bugs that arise when multiple components independently manage overlapping
state slices.

**Consequences:** All slider `onChange` handlers live in Dashboard.tsx (or are
passed down as callbacks). No context, no Zustand, no Redux needed at this scale.

---

### D3 — Step-fixed labor via LABOR_TIERS lookup table

**Decision:** Labor cost is modeled as a lookup table (`LABOR_TIERS` in
`constants.ts`) rather than a formula.

**Rationale:** Step-fixed cost structures are inherently discontinuous. A table
is easier to audit, update, and explain to business stakeholders than a
formula with nested conditionals. Adding a new tier requires one object literal,
not a rewrite of branching logic.

**Consequences:** `calculateLaborTier()` must throw a `RangeError` for inputs
outside [1, 100] so boundary violations surface loudly during development.

---

### D4 — Recharts for visualizations

**Decision:** Use Recharts (not Chart.js, Victory, or D3 directly).

**Rationale:** Recharts is React-native, ships with TypeScript types, integrates
cleanly with Tailwind's color tokens, and is tree-shakeable. It does not require
a canvas context, making it SSR-compatible with Next.js App Router.

**Consequences:** Chart components must be marked `"use client"` because Recharts
relies on DOM APIs. Data is formatted in Dashboard.tsx before being passed to
chart components so transformations remain testable.

---

### D5 — Dark-only theme via Tailwind

**Decision:** No light mode. Base background is `bg-gray-950`; accents use the
emerald / amber / red semantic palette.

**Rationale:** Factory dashboards are typically wall-mounted on dark screens.
Supporting two themes adds maintenance overhead with no clear user benefit.

**Consequences:** All Tailwind classes must use dark-appropriate values. No
`dark:` variant prefix is needed since there is only one theme.

---

## File Map

```
src/
├── app/
│   ├── layout.tsx            # Root layout (fonts, dark body class)
│   └── page.tsx              # Renders <Dashboard />
├── components/
│   ├── Dashboard.tsx         # State owner — single source of truth
│   ├── SliderPanel.tsx
│   ├── SliderRow.tsx
│   ├── MixControl.tsx
│   ├── KpiBar.tsx
│   ├── KpiCard.tsx
│   ├── RevenueChart.tsx
│   ├── CostWaterfallChart.tsx
│   ├── BreakevenGauge.tsx
│   ├── LaborTierBadge.tsx
│   ├── UnitCostTable.tsx
│   └── MarketingAdviceCard.tsx
└── lib/
    ├── constants.ts          # All business constants (prices, tiers, thresholds)
    ├── engine.ts             # All calculation logic
    └── types.ts              # FactoryInputs / FactoryOutputs interfaces

docs/
└── architecture-decision.md  # This file

__tests__/
└── engine.test.ts            # Unit tests — one describe block per engine function
```

---

## Testing Strategy

Each function exported from `engine.ts` must have corresponding tests in
`__tests__/engine.test.ts` covering:

- Nominal cases (typical slider values)
- Boundary conditions (e.g., exactly 15, 16, 40, 41, 80, 81 units/day)
- Edge cases (minimum/maximum slider values, 100% mix to one SKU)
- Error cases (out-of-range inputs, mismatched mix ratios)

Run `npm run build && npm test` before every commit (see CLAUDE.md).
