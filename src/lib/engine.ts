// ─────────────────────────────────────────────────────────────────────────────
// FinModel — Calculation Engine
//
// ALL financial math lives here. Components must never perform calculations;
// they only render values passed in as props (see Architecture Rule #1).
//
// Every exported function must have a corresponding unit test.
// ─────────────────────────────────────────────────────────────────────────────

import {
  PRODUCTS,
  LABOR_TIERS,
  PIECE_RATE,
  BURN_RATE,
  BASE_POWER,
  MACHINE_POWER,
  BREAKEVEN_THRESHOLD,
} from './constants';

import type {
  FactoryInputs,
  FactoryOutputs,
  UnitsPerProduct,
  RevenueBreakdown,
  MaterialCostBreakdown,
  LaborTier,
  LaborCostBreakdown,
  ElectricityCost,
  OverheadBreakdown,
  UnitCostBreakdown,
  ContributionMargins,
  BreakevenResult,
  MarketingAdvice,
  ProductSku,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Unit distribution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Splits total daily units across the three SKUs according to mix ratios.
 * The Pro bucket absorbs any rounding residual so totals always sum exactly
 * to unitsPerDay.
 *
 * @param inputs.unitsPerDay  Total daily production target
 * @param inputs.baseMix      Fraction allocated to Base (0–1)
 * @param inputs.liteMix      Fraction allocated to Lite (0–1)
 * @param inputs.proMix       Fraction allocated to Pro  (0–1)
 */
export function calculateUnitsPerProduct(
  inputs: Pick<FactoryInputs, 'unitsPerDay' | 'baseMix' | 'liteMix' | 'proMix'>
): UnitsPerProduct {
  // TODO: implement
  // base = Math.round(unitsPerDay * baseMix)
  // lite = Math.round(unitsPerDay * liteMix)
  // pro  = unitsPerDay − base − lite   (absorbs rounding residual)
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Revenue
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates daily gross revenue per SKU and in aggregate.
 *
 * @param units  Result of calculateUnitsPerProduct()
 */
export function calculateRevenue(units: UnitsPerProduct): RevenueBreakdown {
  // TODO: implement
  // For each SKU: revenue = units[sku] * PRODUCTS[sku].price
  // total = base + lite + pro
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Material costs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates daily raw material costs per SKU and in aggregate.
 *
 * @param units  Result of calculateUnitsPerProduct()
 */
export function calculateMaterialCost(
  units: UnitsPerProduct
): MaterialCostBreakdown {
  // TODO: implement
  // For each SKU: cost = units[sku] * PRODUCTS[sku].materialCost
  // total = base + lite + pro
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Labor tier lookup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the active LaborTier for a given daily unit count.
 * Throws if unitsPerDay falls outside all defined tiers.
 *
 * @param unitsPerDay  Total daily production (1–100)
 */
export function calculateLaborTier(unitsPerDay: number): LaborTier {
  // TODO: implement
  // Find first tier where minUnits <= unitsPerDay <= maxUnits
  // Throw RangeError if none found
  void LABOR_TIERS; // reference to suppress unused-import lint until implemented
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Labor cost
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the full daily and monthly labor bill.
 *
 * Daily wage cost  = (workerCount × wagePerWorker) / workdaysPerMonth
 * Daily piece rate = unitsPerDay × PIECE_RATE  (only when pieceRateApplies)
 * Total daily      = dailyWageCost + dailyPieceRateCost
 * Total monthly    = totalDailyCost × workdaysPerMonth
 *
 * @param unitsPerDay       Total daily production
 * @param workdaysPerMonth  Working days in the current month
 */
export function calculateLaborCost(
  unitsPerDay: number,
  workdaysPerMonth: number
): LaborCostBreakdown {
  // TODO: implement
  // 1. Get tier via calculateLaborTier(unitsPerDay)
  // 2. dailyWageCost = (tier.workerCount * tier.wagePerWorker) / workdaysPerMonth
  // 3. dailyPieceRateCost = tier.pieceRateApplies ? unitsPerDay * PIECE_RATE : 0
  void PIECE_RATE; // suppress until implemented
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Electricity
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates daily electricity cost.
 *
 * Formula: BASE_POWER + MACHINE_POWER × (shiftHours / 10)
 *
 * @param shiftHours  Active shift length (1–10 hours)
 */
export function calculateElectricity(shiftHours: number): ElectricityCost {
  // TODO: implement
  // machinePower = MACHINE_POWER * (shiftHours / 10)
  // totalDaily   = BASE_POWER + machinePower
  void BASE_POWER;
  void MACHINE_POWER;
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Overhead / burn rate
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates factory burn rate and overhead allocated per unit.
 *
 * dailyBurnRate       = BURN_RATE × shiftHours
 * dailyRentAllocation = monthlyRent / workdaysPerMonth
 * totalDailyFixed     = dailyBurnRate + dailyRentAllocation
 * overheadPerUnit     = totalDailyFixed / (unitsPerDay × efficiency)
 *
 * @param shiftHours        Active shift length in hours
 * @param unitsPerDay       Total daily production
 * @param efficiency        Worker efficiency ratio (0–1)
 * @param monthlyRent       Monthly rent / fixed overhead (USD)
 * @param workdaysPerMonth  Working days in the month
 */
export function calculateOverhead(
  shiftHours: number,
  unitsPerDay: number,
  efficiency: number,
  monthlyRent: number,
  workdaysPerMonth: number
): OverheadBreakdown {
  // TODO: implement
  void BURN_RATE; // suppress until implemented
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Per-unit cost breakdown
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a full cost/margin breakdown for each SKU.
 *
 * totalCost       = material + labor + electricity + overhead
 * grossMargin     = sellingPrice − totalCost
 * grossMarginPct  = (grossMargin / sellingPrice) × 100
 *
 * @param labor        Result of calculateLaborCost()
 * @param electricity  Result of calculateElectricity()
 * @param overhead     Result of calculateOverhead()
 */
export function calculateUnitCostBreakdown(
  labor: LaborCostBreakdown,
  electricity: ElectricityCost,
  overhead: OverheadBreakdown
): UnitCostBreakdown[] {
  // TODO: implement
  // For each product in PRODUCTS:
  //   material  = product.materialCost
  //   labor     = product.laborPerUnit  (+pieceRate if applicable)
  //   electricity = electricity.totalDaily / sum(units)   (allocated equally per unit)
  //   overhead  = overhead.overheadPerUnit
  //   totalCost = material + labor + electricity + overhead
  void PRODUCTS;
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Contribution margins
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the contribution margin per unit for each SKU.
 * CM = price − materialCost − laborPerUnit
 * Values are sourced directly from PRODUCTS constants (pre-computed).
 */
export function calculateContributionMargins(): ContributionMargins {
  // TODO: implement
  // Return { base: 176.50, lite: 235.00, pro: 420.00 } derived from PRODUCTS
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Breakeven analysis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines whether the factory is operating above the breakeven threshold.
 *
 * @param unitsPerDay  Total daily production
 */
export function calculateBreakeven(unitsPerDay: number): BreakevenResult {
  // TODO: implement
  // isSafe = unitsPerDay >= BREAKEVEN_THRESHOLD
  // unitsFromBreakeven = unitsPerDay - BREAKEVEN_THRESHOLD
  void BREAKEVEN_THRESHOLD;
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Marketing advice
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recommends the SKU with the highest weighted contribution margin.
 *
 * Score(sku) = CM(sku) × volumeShare(sku)
 * where volumeShare = units[sku] / unitsPerDay
 *
 * The SKU with the highest score is recommended.
 *
 * @param units        Result of calculateUnitsPerProduct()
 * @param unitsPerDay  Total daily production (used to compute share)
 */
export function generateMarketingAdvice(
  units: UnitsPerProduct,
  unitsPerDay: number
): MarketingAdvice {
  // TODO: implement
  // 1. Get CMs from calculateContributionMargins()
  // 2. For each SKU: score = CM * (units[sku] / unitsPerDay)
  // 3. recommendedSku = argmax(scores)
  // 4. Build rationale string
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Master calculation — called by Dashboard.tsx on every slider change
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs the full calculation pipeline from raw slider inputs to all dashboard
 * outputs. This is the only function Dashboard.tsx should call.
 *
 * Pipeline order:
 *  1. calculateUnitsPerProduct
 *  2. calculateRevenue
 *  3. calculateMaterialCost
 *  4. calculateLaborCost
 *  5. calculateElectricity
 *  6. calculateOverhead
 *  7. calculateUnitCostBreakdown
 *  8. calculateContributionMargins
 *  9. calculateBreakeven
 * 10. generateMarketingAdvice
 * 11. Derive dailyProfit and monthlyProfit
 *
 * @param inputs  All slider values from Dashboard state
 */
export function calculateAll(inputs: FactoryInputs): FactoryOutputs {
  // TODO: implement
  // Wire up all sub-functions in order and return assembled FactoryOutputs
  void inputs;
  throw new Error('Not implemented');
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers (not exported — tested indirectly via public API)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Looks up a Product record by SKU. Throws if SKU is not found.
 * @internal
 */
function _getProduct(sku: ProductSku) {
  const product = PRODUCTS.find((p) => p.sku === sku);
  if (!product) throw new RangeError(`Unknown SKU: ${sku}`);
  return product;
}

// Prevent unused-variable lint error until _getProduct is called by implementors
void _getProduct;
