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

/** Configurations for a specific labor department */
export interface DepartmentInput {
  workerCount: number;
  /** 'fixed' means a fixed monthly salary (oklad), 'kpi' means piece-rate (by produced module) */
  wageType: 'fixed' | 'kpi';
  /** Fixed monthly salary per worker (if wageType is 'fixed') */
  fixedWage: number;
  /** Units per day capacity for ONE worker (for UI tracking/KPI, if applicable) */
  kpiCapacity: number;
  /** Pay per unit produced (if wageType is 'kpi') */
  kpiRate: number;
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
  /** Number of working days in the current month (18–26) */
  workdaysPerMonth: number;
  /** Defect rate representing wasted materials / lost revenue (0.0 - 0.15) */
  defectRate: number;
  /** Monthly rent / fixed overhead in USD */
  monthlyRent: number;

  // New cost parameters
  baseMaterialCost: number;
  liteMaterialCost: number;
  proMaterialCost: number;
  basePrice: number;
  litePrice: number;
  proPrice: number;
  // Labor Departments
  salesLabor: DepartmentInput;
  techLabor: DepartmentInput;
  prodLabor: DepartmentInput;
  logisticsLabor: DepartmentInput;

  // Electricity explicitly per hour
  lightingPowerPerHour: number;
  equipmentPowerPerHour: number;
  burnRatePerHour: number;
  /** Capital Expenditure (CAPEX) - initial cost for machines, facility setup, etc. */
  initialInvestment: number;
  /** Value Added Tax (VAT / QQS) rate (0 - 0.20) */
  vatRate: number;
  // Balance sheet inputs
  /** Owner's equity / own capital (USD) */
  ownEquity: number;
  /** Short-term current liabilities / debts (USD) */
  currentLiabilities: number;
  /** Long-term debt (USD) */
  longTermDebt: number;
  /** Accounts receivable - money owed by customers (USD) */
  accountsReceivable: number;
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

/** Breakdown of labor cost per department */
export interface DepartmentCost {
  dailyCost: number;
  monthlyCost: number;
}

export interface LaborCostBreakdown {
  sales: DepartmentCost;
  tech: DepartmentCost;
  prod: DepartmentCost;
  logistics: DepartmentCost;
  totalDailyCost: number;
  totalMonthlyCost: number;
}

/** Electricity cost for the day */
export interface ElectricityCost {
  lightingPower: number;
  equipmentPower: number;
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

  // Advanced Financial Metrics
  /** Cost of Goods Sold (Materials + Labor + Machine Electricity) */
  cogs: number;
  /** Operational Expenses (Rent + Base Electricity + Burn rate) */
  opex: number;
  /** Earnings Before Interest, Taxes, Depreciation, and Amortization */
  ebitda: number;
  /** Return on Investment (%) */
  roi: number;
  /** Number of months to recover the initial investment */
  paybackMonths: number;
  /** Calculated monthly VAT payable (Output VAT - Input VAT) */
  vatMonthly: number;
  /** Monthly adjusted metrics */
  cogsMonthly: number;
  opexMonthly: number;
  ebitdaMonthly: number;

  // ─── Profit Waterfall ───
  /** Monthly Gross Profit = Revenue - COGS */
  grossProfitMonthly: number;
  /** Gross Margin % = Gross Profit / Revenue × 100 */
  grossMarginPct: number;
  /** Monthly EBIT = Gross Profit - OPEX (Operating Profit) */
  ebitMonthly: number;
  /** Operating Margin % = EBIT / Revenue × 100 */
  operatingMarginPct: number;
  /** Net Margin % = Net Profit / Revenue × 100 */
  netMarginPct: number;

  // ─── Balance Sheet ───
  /** Approximate total current assets (cash + inventory + AR) */
  currentAssets: number;
  /** Approximate total assets (initialInvestment + currentAssets) */
  totalAssets: number;

  // ─── Liquidity Ratios ───
  /** Current Ratio = currentAssets / currentLiabilities (norm ≥ 2.0) */
  currentRatio: number;
  /** Quick Ratio = (cash + AR) / currentLiabilities (norm ≥ 1.0) */
  quickRatio: number;

  // ─── Leverage / Stability Ratios ───
  /** Solvency Ratio = (ownEquity + longTermDebt) / totalAssets (norm ≥ 0.8) */
  solvencyRatio: number;
  /** Equity Ratio = ownEquity / totalAssets (norm ≥ 0.5) */
  equityRatio: number;

  // ─── Profitability Ratios ───
  /** ROE = (Annual Net Profit / ownEquity) × 100 (norm ≥ 20%) */
  roe: number;
  /** ROA = (Annual Net Profit / totalAssets) × 100 (norm ≥ 10%) */
  roa: number;

  // ─── Activity Ratios ───
  /** AR Turnover = Annual Revenue / accountsReceivable (norm ≥ 5.0) */
  arTurnover: number;
  /** DSO = 360 / arTurnover in days (norm ≤ 60 days) */
  dso: number;
}
