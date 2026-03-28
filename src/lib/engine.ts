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
  BREAKEVEN_THRESHOLD,
} from './constants';

import type {
  FactoryInputs,
  FactoryOutputs,
  UnitsPerProduct,
  RevenueBreakdown,
  MaterialCostBreakdown,
  DepartmentCost,
  DepartmentInput,
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
  const effBase = units.base * (1 - inputs.defectRate);
  const effLite = units.lite * (1 - inputs.defectRate);
  const effPro = units.pro * (1 - inputs.defectRate);

  const base = effBase * inputs.basePrice;
  const lite = effLite * inputs.litePrice;
  const pro = effPro * inputs.proPrice;
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
// 5. Labor cost (By Departments)
// ─────────────────────────────────────────────────────────────────────────────

function calcDepartmentCost(
  dept: DepartmentInput,
  unitsPerDay: number,
  workdays: number
): DepartmentCost {
  let dailyCost = 0;
  if (dept.wageType === 'fixed') {
    dailyCost = (dept.workerCount * dept.fixedWage) / workdays;
  } else {
    // KPI piece-rate based
    // Assuming the capacity dictates if we need more workers, but we just pay per unit.
    // However, if the department is piece-rate, they get paid for all units produced.
    dailyCost = unitsPerDay * dept.kpiRate; // or workerCount * rate depending on logic vs total output
  }
  return {
    dailyCost,
    monthlyCost: dailyCost * workdays,
  };
}

export function calculateLaborCost(
  unitsPerDay: number,
  inputs: FactoryInputs
): LaborCostBreakdown {
  const sales = calcDepartmentCost(inputs.salesLabor, unitsPerDay, inputs.workdaysPerMonth);
  const tech = calcDepartmentCost(inputs.techLabor, unitsPerDay, inputs.workdaysPerMonth);
  const prod = calcDepartmentCost(inputs.prodLabor, unitsPerDay, inputs.workdaysPerMonth);
  const logistics = calcDepartmentCost(inputs.logisticsLabor, unitsPerDay, inputs.workdaysPerMonth);

  const totalDailyCost = sales.dailyCost + tech.dailyCost + prod.dailyCost + logistics.dailyCost;
  const totalMonthlyCost = totalDailyCost * inputs.workdaysPerMonth;

  return {
    sales,
    tech,
    prod,
    logistics,
    totalDailyCost,
    totalMonthlyCost,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Electricity
// ─────────────────────────────────────────────────────────────────────────────

export function calculateElectricity(inputs: FactoryInputs): ElectricityCost {
  const lightingPower = inputs.lightingPowerPerHour * inputs.shiftHours;
  const equipmentPower = inputs.equipmentPowerPerHour * inputs.shiftHours;
  const totalDaily = lightingPower + equipmentPower;
  return { lightingPower, equipmentPower, totalDaily };
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
  // Blend labor dynamically based on total real daily cost 
  const laborPerUnitDynamic = totalUnits > 0 ? labor.totalDailyCost / totalUnits : 0;

  return PRODUCTS.map((product) => {
    let material = 0;
    let sellingPrice = 0;
    if (product.sku === 'base') { material = inputs.baseMaterialCost; sellingPrice = inputs.basePrice; }
    if (product.sku === 'lite') { material = inputs.liteMaterialCost; sellingPrice = inputs.litePrice; }
    if (product.sku === 'pro') { material = inputs.proMaterialCost; sellingPrice = inputs.proPrice; }

    const laborCost = laborPerUnitDynamic; // Distributed dynamically
    const elec = electricityPerUnit;
    const oh = overhead.overheadPerUnit;
    const totalCost = material + laborCost + elec + oh;
    
    // Revenue margin after defect
    const effectiveSellingPrice = sellingPrice * (1 - inputs.defectRate);
    const grossMargin = effectiveSellingPrice - totalCost;
    const grossMarginPct = effectiveSellingPrice > 0 ? (grossMargin / effectiveSellingPrice) * 100 : 0;

    return {
      sku: product.sku,
      material,
      labor: laborCost,
      electricity: elec,
      overhead: oh,
      totalCost,
      sellingPrice: effectiveSellingPrice,
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
  const cogs = materials.total + labor.totalDailyCost + electricity.equipmentPower + overhead.dailyBurnRate;
  const opex = overhead.dailyRentAllocation + electricity.lightingPower; // OPEX separate from primary COGS
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
