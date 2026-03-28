// ─────────────────────────────────────────────────────────────────────────────
// FinModel — Type Definitions
// All interfaces that flow between sliders → engine → UI
// ─────────────────────────────────────────────────────────────────────────────

/** Supported SKU identifiers */
export type ProductSku = 'base' | 'lite' | 'pro';

/** A single product definition loaded from constants */
export interface Product {
  sku: ProductSku;
  label: string;
  /** Selling price per unit (USD) */
  price: number;
  /** Raw material cost per unit (USD) */
  materialCost: number;
  /** Base labor cost per unit (USD) */
  laborPerUnit: number;
  /** Standard machine-hours required per unit */
  stdHours: number;
  /** Contribution margin: price − materialCost − laborPerUnit (USD) */
  contributionMargin: number;
}

/** One tier in the step-fixed labor schedule */
export interface LaborTier {
  /** Minimum daily units for this tier to apply (inclusive) */
  minUnits: number;
  /** Maximum daily units for this tier to apply (inclusive) */
  maxUnits: number;
  /** Number of workers required at this tier */
  workerCount: number;
  /** Monthly wage per worker (USD) */
  wagePerWorker: number;
  /** Whether piece-rate surcharge applies at this tier */
  pieceRateApplies: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUTS — driven by the dashboard sliders
// ─────────────────────────────────────────────────────────────────────────────

export interface FactoryInputs {
  /** Total units produced per day (1–100) */
  unitsPerDay: number;
  /** Fraction of daily production allocated to Base SKU (0–1) */
  baseMix: number;
  /** Fraction of daily production allocated to Lite SKU (0–1) */
  liteMix: number;
  /** Fraction of daily production allocated to Pro SKU (0–1) */
  proMix: number;
  /** Active shift length in hours (1–10) */
  shiftHours: number;
  /** Worker efficiency ratio (0.5–1.0) */
  efficiency: number;
  /** Number of working days in the current month (18–23) */
  workdaysPerMonth: number;
  /** Monthly rent / fixed overhead in USD */
  monthlyRent: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUTS — computed by engine.ts and rendered by components
// ─────────────────────────────────────────────────────────────────────────────

/** Units produced per SKU per day */
export interface UnitsPerProduct {
  base: number;
  lite: number;
  pro: number;
}

/** Daily revenue figures */
export interface RevenueBreakdown {
  base: number;
  lite: number;
  pro: number;
  total: number;
}

/** Daily material cost figures */
export interface MaterialCostBreakdown {
  base: number;
  lite: number;
  pro: number;
  total: number;
}

/** Which labor tier is active and what the daily/monthly wages cost */
export interface LaborCostBreakdown {
  tier: LaborTier;
  workerCount: number;
  dailyWageCost: number;
  dailyPieceRateCost: number;
  totalDailyCost: number;
  totalMonthlyCost: number;
}

/** Electricity cost for the day */
export interface ElectricityCost {
  basePower: number;
  machinePower: number;
  totalDaily: number;
}

/** Factory burn rate and resulting overhead per unit */
export interface OverheadBreakdown {
  dailyBurnRate: number;
  dailyRentAllocation: number;
  totalDailyFixed: number;
  overheadPerUnit: number;
}

/** Full unit cost breakdown for a single SKU */
export interface UnitCostBreakdown {
  sku: ProductSku;
  material: number;
  labor: number;
  electricity: number;
  overhead: number;
  totalCost: number;
  sellingPrice: number;
  grossMargin: number;
  grossMarginPct: number;
}

/** Contribution margins per SKU */
export interface ContributionMargins {
  base: number;
  lite: number;
  pro: number;
}

/** Breakeven analysis result */
export interface BreakevenResult {
  /** Breakeven unit threshold (42 per CLAUDE.md) */
  threshold: number;
  /** Daily units currently produced */
  currentUnits: number;
  /** Whether the factory is above breakeven */
  isSafe: boolean;
  /** Units above (+) or below (−) the threshold */
  unitsFromBreakeven: number;
}

/** Marketing segment recommendation */
export interface MarketingAdvice {
  /** The SKU the engine recommends focusing on */
  recommendedSku: ProductSku;
  /** CM × volume_share scores per SKU */
  scores: Record<ProductSku, number>;
  /** Human-readable reasoning string */
  rationale: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AGGREGATE OUTPUT — returned by calculateAll()
// ─────────────────────────────────────────────────────────────────────────────

export interface FactoryOutputs {
  units: UnitsPerProduct;
  revenue: RevenueBreakdown;
  materials: MaterialCostBreakdown;
  labor: LaborCostBreakdown;
  electricity: ElectricityCost;
  overhead: OverheadBreakdown;
  unitCosts: UnitCostBreakdown[];
  contributionMargins: ContributionMargins;
  breakeven: BreakevenResult;
  marketing: MarketingAdvice;
  /** Net daily profit: revenue.total − all daily costs */
  dailyProfit: number;
  /** Net monthly profit */
  monthlyProfit: number;
}
