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

export function calculateRevenue(units: UnitsPerProduct, inputs: FactoryInputs): RevenueBreakdown {
  const base = units.base * inputs.basePrice;
  const lite = units.lite * inputs.litePrice;
  const pro = units.pro * inputs.proPrice;
  const total = base + lite + pro;

  return { base, lite, pro, total };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Material costs
// ─────────────────────────────────────────────────────────────────────────────

export function calculateMaterialCost(
  units: UnitsPerProduct,
  inputs: FactoryInputs
): MaterialCostBreakdown {
  const base = units.base * inputs.baseMaterialCost;
  const lite = units.lite * inputs.liteMaterialCost;
  const pro = units.pro * inputs.proMaterialCost;
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
  inputs: FactoryInputs
): LaborCostBreakdown {
  const tier = calculateLaborTier(unitsPerDay);
  const dailyWageCost =
    (tier.workerCount * inputs.workerWage) / inputs.workdaysPerMonth;
  const dailyPieceRateCost = tier.pieceRateApplies
    ? unitsPerDay * PIECE_RATE
    : 0;
  const totalDailyCost = dailyWageCost + dailyPieceRateCost;
  const totalMonthlyCost = totalDailyCost * inputs.workdaysPerMonth;

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

export function calculateElectricity(inputs: FactoryInputs): ElectricityCost {
  const basePower = inputs.basePowerCost;
  const machinePower = inputs.machinePowerCost * (inputs.shiftHours / 10);
  const totalDaily = basePower + machinePower;
  return { basePower, machinePower, totalDaily };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Overhead / burn rate
// ─────────────────────────────────────────────────────────────────────────────

export function calculateOverhead(
  inputs: FactoryInputs
): OverheadBreakdown {
  const dailyBurnRate = inputs.burnRatePerHour * inputs.shiftHours;
  const dailyRentAllocation = inputs.monthlyRent / inputs.workdaysPerMonth;
  const totalDailyFixed = dailyBurnRate + dailyRentAllocation;
  const effectiveUnits = inputs.unitsPerDay * inputs.efficiency;
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
  units: UnitsPerProduct,
  inputs: FactoryInputs
): UnitCostBreakdown[] {
  const totalUnits = units.base + units.lite + units.pro;
  const electricityPerUnit = totalUnits > 0 ? electricity.totalDaily / totalUnits : 0;

  return PRODUCTS.map((product) => {
    let material = 0;
    let sellingPrice = 0;
    if (product.sku === 'base') { material = inputs.baseMaterialCost; sellingPrice = inputs.basePrice; }
    if (product.sku === 'lite') { material = inputs.liteMaterialCost; sellingPrice = inputs.litePrice; }
    if (product.sku === 'pro') { material = inputs.proMaterialCost; sellingPrice = inputs.proPrice; }

    const laborCost = product.laborPerUnit + (labor.tier.pieceRateApplies ? PIECE_RATE : 0);
    const elec = electricityPerUnit;
    const oh = overhead.overheadPerUnit;
    const totalCost = material + laborCost + elec + oh;
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

export function calculateContributionMargins(inputs: FactoryInputs): ContributionMargins {
  const baseLabor = _getProduct('base').laborPerUnit;
  const liteLabor = _getProduct('lite').laborPerUnit;
  const proLabor = _getProduct('pro').laborPerUnit;

  const base = inputs.basePrice - inputs.baseMaterialCost - baseLabor;
  const lite = inputs.litePrice - inputs.liteMaterialCost - liteLabor;
  const pro = inputs.proPrice - inputs.proMaterialCost - proLabor;
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
  inputs: FactoryInputs
): MarketingAdvice {
  const cms = calculateContributionMargins(inputs);
  const skus: ProductSku[] = ['base', 'lite', 'pro'];

  const scores: Record<ProductSku, number> = {
    base: 0,
    lite: 0,
    pro: 0,
  };

  for (const sku of skus) {
    const volumeShare = inputs.unitsPerDay > 0 ? units[sku] / inputs.unitsPerDay : 0;
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
  const rationale = `Focus on ${product.label}: highest weighted contribution margin of $${maxScore.toFixed(2)} (CM $${cms[recommendedSku].toFixed(2)} x ${((inputs.unitsPerDay > 0 ? units[recommendedSku] / inputs.unitsPerDay : 0) * 100).toFixed(0)}% volume share).`;

  return { recommendedSku, scores, rationale };
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Master calculation
// ─────────────────────────────────────────────────────────────────────────────

export function calculateAll(inputs: FactoryInputs): FactoryOutputs {
  const units = calculateUnitsPerProduct(inputs);
  const revenue = calculateRevenue(units, inputs);
  const materials = calculateMaterialCost(units, inputs);
  const labor = calculateLaborCost(inputs.unitsPerDay, inputs);
  const electricity = calculateElectricity(inputs);
  const overhead = calculateOverhead(inputs);
  const unitCosts = calculateUnitCostBreakdown(labor, electricity, overhead, units, inputs);
  const contributionMargins = calculateContributionMargins(inputs);
  const breakeven = calculateBreakeven(inputs.unitsPerDay);
  const marketing = generateMarketingAdvice(units, inputs);

  const totalDailyCosts =
    materials.total + labor.totalDailyCost + electricity.totalDaily + overhead.totalDailyFixed;
  const dailyProfit = revenue.total - totalDailyCosts;
  const monthlyProfit = dailyProfit * inputs.workdaysPerMonth;

  // New Global Metrics
  const cogs = materials.total + labor.totalDailyCost + electricity.machinePower + overhead.dailyBurnRate;
  const opex = overhead.dailyRentAllocation + electricity.basePower; // OPEX separate from primary COGS
  const ebitda = revenue.total - cogs - opex; // Simple EBITDA model (excluding Dep/Amort)
  const roi = totalDailyCosts > 0 ? (dailyProfit / totalDailyCosts) * 100 : 0;

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
    cogs,
    opex,
    ebitda,
    roi,
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
