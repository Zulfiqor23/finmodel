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

export function calculateUnitsPerProduct(
  inputs: Pick<FactoryInputs, 'unitsPerDay' | 'baseMix' | 'liteMix' | 'proMix'>
): UnitsPerProduct {
  const { unitsPerDay, baseMix, liteMix } = inputs;
  const base = Math.round(unitsPerDay * baseMix);
  const lite = Math.round(unitsPerDay * liteMix);
  const pro = unitsPerDay - base - lite; // absorbs rounding residual
  return { base, lite, pro };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Revenue
// ─────────────────────────────────────────────────────────────────────────────

export function calculateRevenue(units: UnitsPerProduct): RevenueBreakdown {
  const baseProduct = _getProduct('base');
  const liteProduct = _getProduct('lite');
  const proProduct = _getProduct('pro');

  const base = units.base * baseProduct.price;
  const lite = units.lite * liteProduct.price;
  const pro = units.pro * proProduct.price;
  const total = base + lite + pro;

  return { base, lite, pro, total };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Material costs
// ─────────────────────────────────────────────────────────────────────────────

export function calculateMaterialCost(
  units: UnitsPerProduct
): MaterialCostBreakdown {
  const baseProduct = _getProduct('base');
  const liteProduct = _getProduct('lite');
  const proProduct = _getProduct('pro');

  const base = units.base * baseProduct.materialCost;
  const lite = units.lite * liteProduct.materialCost;
  const pro = units.pro * proProduct.materialCost;
  const total = base + lite + pro;

  return { base, lite, pro, total };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Labor tier lookup
// ─────────────────────────────────────────────────────────────────────────────

export function calculateLaborTier(unitsPerDay: number): LaborTier {
  const tier = LABOR_TIERS.find(
    (t) => unitsPerDay >= t.minUnits && unitsPerDay <= t.maxUnits
  );
  if (!tier) {
    throw new RangeError(
      `No labor tier defined for ${unitsPerDay} units/day. Valid range: 1–100.`
    );
  }
  return { ...tier };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Labor cost
// ─────────────────────────────────────────────────────────────────────────────

export function calculateLaborCost(
  unitsPerDay: number,
  workdaysPerMonth: number
): LaborCostBreakdown {
  const tier = calculateLaborTier(unitsPerDay);
  const dailyWageCost =
    (tier.workerCount * tier.wagePerWorker) / workdaysPerMonth;
  const dailyPieceRateCost = tier.pieceRateApplies
    ? unitsPerDay * PIECE_RATE
    : 0;
  const totalDailyCost = dailyWageCost + dailyPieceRateCost;
  const totalMonthlyCost = totalDailyCost * workdaysPerMonth;

  return {
    tier,
    workerCount: tier.workerCount,
    dailyWageCost,
    dailyPieceRateCost,
    totalDailyCost,
    totalMonthlyCost,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Electricity
// ─────────────────────────────────────────────────────────────────────────────

export function calculateElectricity(shiftHours: number): ElectricityCost {
  const basePower = BASE_POWER;
  const machinePower = MACHINE_POWER * (shiftHours / 10);
  const totalDaily = basePower + machinePower;
  return { basePower, machinePower, totalDaily };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Overhead / burn rate
// ─────────────────────────────────────────────────────────────────────────────

export function calculateOverhead(
  shiftHours: number,
  unitsPerDay: number,
  efficiency: number,
  monthlyRent: number,
  workdaysPerMonth: number
): OverheadBreakdown {
  const dailyBurnRate = BURN_RATE * shiftHours;
  const dailyRentAllocation = monthlyRent / workdaysPerMonth;
  const totalDailyFixed = dailyBurnRate + dailyRentAllocation;
  const effectiveUnits = unitsPerDay * efficiency;
  const overheadPerUnit = effectiveUnits > 0 ? totalDailyFixed / effectiveUnits : 0;

  return { dailyBurnRate, dailyRentAllocation, totalDailyFixed, overheadPerUnit };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Per-unit cost breakdown
// ─────────────────────────────────────────────────────────────────────────────

export function calculateUnitCostBreakdown(
  labor: LaborCostBreakdown,
  electricity: ElectricityCost,
  overhead: OverheadBreakdown,
  units: UnitsPerProduct
): UnitCostBreakdown[] {
  const totalUnits = units.base + units.lite + units.pro;
  const electricityPerUnit = totalUnits > 0 ? electricity.totalDaily / totalUnits : 0;

  return PRODUCTS.map((product) => {
    const material = product.materialCost;
    const laborCost = product.laborPerUnit + (labor.tier.pieceRateApplies ? PIECE_RATE : 0);
    const elec = electricityPerUnit;
    const oh = overhead.overheadPerUnit;
    const totalCost = material + laborCost + elec + oh;
    const sellingPrice = product.price;
    const grossMargin = sellingPrice - totalCost;
    const grossMarginPct = sellingPrice > 0 ? (grossMargin / sellingPrice) * 100 : 0;

    return {
      sku: product.sku,
      material,
      labor: laborCost,
      electricity: elec,
      overhead: oh,
      totalCost,
      sellingPrice,
      grossMargin,
      grossMarginPct,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Contribution margins
// ─────────────────────────────────────────────────────────────────────────────

export function calculateContributionMargins(): ContributionMargins {
  const base = _getProduct('base').contributionMargin;
  const lite = _getProduct('lite').contributionMargin;
  const pro = _getProduct('pro').contributionMargin;
  return { base, lite, pro };
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Breakeven analysis
// ─────────────────────────────────────────────────────────────────────────────

export function calculateBreakeven(unitsPerDay: number): BreakevenResult {
  return {
    threshold: BREAKEVEN_THRESHOLD,
    currentUnits: unitsPerDay,
    isSafe: unitsPerDay >= BREAKEVEN_THRESHOLD,
    unitsFromBreakeven: unitsPerDay - BREAKEVEN_THRESHOLD,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Marketing advice
// ─────────────────────────────────────────────────────────────────────────────

export function generateMarketingAdvice(
  units: UnitsPerProduct,
  unitsPerDay: number
): MarketingAdvice {
  const cms = calculateContributionMargins();
  const skus: ProductSku[] = ['base', 'lite', 'pro'];

  const scores: Record<ProductSku, number> = {
    base: 0,
    lite: 0,
    pro: 0,
  };

  for (const sku of skus) {
    const volumeShare = unitsPerDay > 0 ? units[sku] / unitsPerDay : 0;
    scores[sku] = cms[sku] * volumeShare;
  }

  let recommendedSku: ProductSku = 'base';
  let maxScore = -Infinity;
  for (const sku of skus) {
    if (scores[sku] > maxScore) {
      maxScore = scores[sku];
      recommendedSku = sku;
    }
  }

  const product = _getProduct(recommendedSku);
  const rationale = `Focus on ${product.label}: highest weighted contribution margin of $${maxScore.toFixed(2)} (CM $${cms[recommendedSku].toFixed(2)} x ${((unitsPerDay > 0 ? units[recommendedSku] / unitsPerDay : 0) * 100).toFixed(0)}% volume share).`;

  return { recommendedSku, scores, rationale };
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Master calculation
// ─────────────────────────────────────────────────────────────────────────────

export function calculateAll(inputs: FactoryInputs): FactoryOutputs {
  const units = calculateUnitsPerProduct(inputs);
  const revenue = calculateRevenue(units);
  const materials = calculateMaterialCost(units);
  const labor = calculateLaborCost(inputs.unitsPerDay, inputs.workdaysPerMonth);
  const electricity = calculateElectricity(inputs.shiftHours);
  const overhead = calculateOverhead(
    inputs.shiftHours,
    inputs.unitsPerDay,
    inputs.efficiency,
    inputs.monthlyRent,
    inputs.workdaysPerMonth
  );
  const unitCosts = calculateUnitCostBreakdown(labor, electricity, overhead, units);
  const contributionMargins = calculateContributionMargins();
  const breakeven = calculateBreakeven(inputs.unitsPerDay);
  const marketing = generateMarketingAdvice(units, inputs.unitsPerDay);

  const totalDailyCosts =
    materials.total + labor.totalDailyCost + electricity.totalDaily + overhead.totalDailyFixed;
  const dailyProfit = revenue.total - totalDailyCosts;
  const monthlyProfit = dailyProfit * inputs.workdaysPerMonth;

  return {
    units,
    revenue,
    materials,
    labor,
    electricity,
    overhead,
    unitCosts,
    contributionMargins,
    breakeven,
    marketing,
    dailyProfit,
    monthlyProfit,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function _getProduct(sku: ProductSku) {
  const product = PRODUCTS.find((p) => p.sku === sku);
  if (!product) throw new RangeError(`Unknown SKU: ${sku}`);
  return product;
}
