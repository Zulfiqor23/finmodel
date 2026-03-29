// ─────────────────────────────────────────────────────────────────────────────
// FinModel — Engine Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import {
  calculateUnitsPerProduct,
  calculateRevenue,
  calculateMaterialCost,
  calculateLaborCost,
  calculateElectricity,
  calculateOverhead,
  calculateUnitCostBreakdown,
  calculateContributionMargins,
  calculateBreakeven,
  generateMarketingAdvice,
  calculateAll,
} from '../engine';
import type { FactoryInputs } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: FactoryInputs = {
  unitsPerDay: 50,
  baseMix: 0.4,
  liteMix: 0.35,
  proMix: 0.25,
  shiftHours: 8,
  efficiency: 0.85,
  workdaysPerMonth: 22,
  defectRate: 0.05,
  monthlyRent: 5000,
  baseMaterialCost: 200,
  liteMaterialCost: 280,
  proMaterialCost: 420,
  basePrice: 400,
  litePrice: 550,
  proPrice: 900,
  salesLabor: { workerCount: 2, wageType: 'kpi', fixedWage: 300, kpiCapacity: 50, kpiRate: 2 },
  techLabor: { workerCount: 1, wageType: 'fixed', fixedWage: 1200, kpiCapacity: 0, kpiRate: 0 },
  prodLabor: { workerCount: 5, wageType: 'fixed', fixedWage: 700, kpiCapacity: 10, kpiRate: 0 },
  logisticsLabor: { workerCount: 2, wageType: 'fixed', fixedWage: 500, kpiCapacity: 0, kpiRate: 0 },
  lightingPowerPerHour: 2,
  equipmentPowerPerHour: 8,
  burnRatePerHour: 25,
  initialInvestment: 500000,
  vatRate: 0.12,
  ownEquity: 300000,
  currentLiabilities: 50000,
  longTermDebt: 150000,
  accountsReceivable: 25000,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. calculateUnitsPerProduct
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateUnitsPerProduct', () => {
  it('distributes units according to mix percentages', () => {
    const result = calculateUnitsPerProduct({
      unitsPerDay: 100,
      baseMix: 0.5,
      liteMix: 0.3,
      proMix: 0.2,
    });
    expect(result.base).toBe(50);
    expect(result.lite).toBe(30);
    expect(result.pro).toBe(20);
  });

  it('absorbs rounding residual into pro', () => {
    const result = calculateUnitsPerProduct({
      unitsPerDay: 10,
      baseMix: 0.33,
      liteMix: 0.33,
      proMix: 0.34,
    });
    expect(result.base + result.lite + result.pro).toBe(10);
  });

  it('handles zero units', () => {
    const result = calculateUnitsPerProduct({
      unitsPerDay: 0,
      baseMix: 0.4,
      liteMix: 0.35,
      proMix: 0.25,
    });
    expect(result.base).toBe(0);
    expect(result.lite).toBe(0);
    expect(result.pro).toBe(0);
  });

  it('handles 100% single product', () => {
    const result = calculateUnitsPerProduct({
      unitsPerDay: 50,
      baseMix: 1.0,
      liteMix: 0,
      proMix: 0,
    });
    expect(result.base).toBe(50);
    expect(result.lite).toBe(0);
    expect(result.pro).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. calculateRevenue
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateRevenue', () => {
  it('calculates revenue for each SKU correctly with defect rate', () => {
    const units = { base: 20, lite: 15, pro: 10 };
    const result = calculateRevenue(units, DEFAULT_INPUTS);
    // defectRate = 0.05, so effective = units * 0.95
    expect(result.base).toBeCloseTo(20 * 0.95 * 400, 2);
    expect(result.lite).toBeCloseTo(15 * 0.95 * 550, 2);
    expect(result.pro).toBeCloseTo(10 * 0.95 * 900, 2);
    expect(result.total).toBeCloseTo(result.base + result.lite + result.pro, 2);
  });

  it('returns zero for zero units', () => {
    const result = calculateRevenue({ base: 0, lite: 0, pro: 0 }, DEFAULT_INPUTS);
    expect(result.total).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. calculateMaterialCost
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateMaterialCost', () => {
  it('calculates material costs per SKU', () => {
    const units = { base: 10, lite: 10, pro: 10 };
    const result = calculateMaterialCost(units, DEFAULT_INPUTS);
    expect(result.base).toBe(10 * 200);
    expect(result.lite).toBe(10 * 280);
    expect(result.pro).toBe(10 * 420);
    expect(result.total).toBe(2000 + 2800 + 4200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. calculateLaborCost (department-based)
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateLaborCost', () => {
  it('calculates monthly fixed labor cost from departments', () => {
    const result = calculateLaborCost(DEFAULT_INPUTS.unitsPerDay, DEFAULT_INPUTS);
    // techLabor: 1 worker * $1200 / 22 days = ~$54.55/day
    // prodLabor: 5 workers * $700 / 22 days = ~$159.09/day
    // logisticsLabor: 2 workers * $500 / 22 days = ~$45.45/day
    // salesLabor: KPI, 50 units * $2 = $100/day
    expect(result.totalMonthlyCost).toBeCloseTo(result.totalDailyCost * DEFAULT_INPUTS.workdaysPerMonth, 2);
  });

  it('KPI department cost scales with units', () => {
    const result = calculateLaborCost(100, DEFAULT_INPUTS);
    // salesLabor KPI: 100 * $2 = $200/day
    expect(result.sales.dailyCost).toBeCloseTo(200, 2);
  });

  it('fixed department cost is independent of units', () => {
    const result10 = calculateLaborCost(10, DEFAULT_INPUTS);
    const result80 = calculateLaborCost(80, DEFAULT_INPUTS);
    // techLabor is fixed — same daily cost regardless of units
    expect(result10.tech.dailyCost).toBeCloseTo(result80.tech.dailyCost, 2);
  });

  it('total monthly = daily * workdays', () => {
    const result = calculateLaborCost(DEFAULT_INPUTS.unitsPerDay, DEFAULT_INPUTS);
    expect(result.totalMonthlyCost).toBeCloseTo(result.totalDailyCost * DEFAULT_INPUTS.workdaysPerMonth, 2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. calculateElectricity
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateElectricity', () => {
  it('calculates electricity costs for given shift hours', () => {
    const result = calculateElectricity(DEFAULT_INPUTS);
    // lightingPowerPerHour=2, equipmentPowerPerHour=8, shiftHours=8
    expect(result.lightingPower).toBe(2 * 8);
    expect(result.equipmentPower).toBe(8 * 8);
    expect(result.totalDaily).toBe(16 + 64);
  });

  it('scales linearly with shift hours', () => {
    const shortShift = { ...DEFAULT_INPUTS, shiftHours: 4 };
    const longShift = { ...DEFAULT_INPUTS, shiftHours: 8 };
    const r4 = calculateElectricity(shortShift);
    const r8 = calculateElectricity(longShift);
    expect(r8.totalDaily).toBeCloseTo(r4.totalDaily * 2, 2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. calculateOverhead
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateOverhead', () => {
  it('computes daily burn rate and rent allocation', () => {
    const result = calculateOverhead(DEFAULT_INPUTS);
    // burnRatePerHour=25, shiftHours=8 → dailyBurnRate=200
    expect(result.dailyBurnRate).toBe(200);
    // monthlyRent=5000, workdays=22 → 5000/22 ≈ 227.27
    expect(result.dailyRentAllocation).toBeCloseTo(227.27, 1);
    expect(result.totalDailyFixed).toBeCloseTo(427.27, 1);
  });

  it('computes overhead per unit', () => {
    const result = calculateOverhead(DEFAULT_INPUTS);
    const effectiveUnits = DEFAULT_INPUTS.unitsPerDay * DEFAULT_INPUTS.efficiency;
    const expected = result.totalDailyFixed / effectiveUnits;
    expect(result.overheadPerUnit).toBeCloseTo(expected, 2);
  });

  it('handles zero units gracefully', () => {
    const zeroUnits = { ...DEFAULT_INPUTS, unitsPerDay: 0 };
    const result = calculateOverhead(zeroUnits);
    expect(result.overheadPerUnit).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. calculateUnitCostBreakdown
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateUnitCostBreakdown', () => {
  it('returns breakdown for all three SKUs', () => {
    const labor = calculateLaborCost(50, DEFAULT_INPUTS);
    const electricity = calculateElectricity(DEFAULT_INPUTS);
    const overhead = calculateOverhead(DEFAULT_INPUTS);
    const units = { base: 20, lite: 18, pro: 12 };
    const result = calculateUnitCostBreakdown(labor, electricity, overhead, units, DEFAULT_INPUTS);

    expect(result).toHaveLength(3);
    expect(result[0].sku).toBe('base');
    expect(result[1].sku).toBe('lite');
    expect(result[2].sku).toBe('pro');
  });

  it('calculates gross margin correctly', () => {
    const labor = calculateLaborCost(50, DEFAULT_INPUTS);
    const electricity = calculateElectricity(DEFAULT_INPUTS);
    const overhead = calculateOverhead(DEFAULT_INPUTS);
    const units = { base: 20, lite: 18, pro: 12 };
    const result = calculateUnitCostBreakdown(labor, electricity, overhead, units, DEFAULT_INPUTS);

    for (const item of result) {
      expect(item.grossMargin).toBeCloseTo(item.sellingPrice - item.totalCost, 2);
      expect(item.grossMarginPct).toBeCloseTo(
        (item.grossMargin / item.sellingPrice) * 100,
        2
      );
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. calculateContributionMargins
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateContributionMargins', () => {
  it('returns correct contribution margins from prices and costs', () => {
    const result = calculateContributionMargins(DEFAULT_INPUTS);
    // base: 400 - 200 - 23.50 = 176.50
    expect(result.base).toBeCloseTo(176.5, 1);
    // lite: 550 - 280 - 35.00 = 235.00
    expect(result.lite).toBeCloseTo(235.0, 1);
    // pro: 900 - 420 - 60.00 = 420.00
    expect(result.pro).toBeCloseTo(420.0, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. calculateBreakeven
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateBreakeven', () => {
  it('marks below threshold as potentially unsafe', () => {
    const inputs = { ...DEFAULT_INPUTS, unitsPerDay: 5 };
    const labor = calculateLaborCost(5, inputs);
    const electricity = calculateElectricity(inputs);
    const overhead = calculateOverhead(inputs);
    const units = calculateUnitsPerProduct(inputs);
    const unitCosts = calculateUnitCostBreakdown(labor, electricity, overhead, units, inputs);
    const result = calculateBreakeven(inputs, labor, electricity, overhead, unitCosts);
    expect(result.currentUnits).toBe(5);
    expect(typeof result.isSafe).toBe('boolean');
    expect(typeof result.threshold).toBe('number');
  });

  it('marks above threshold as safe', () => {
    const inputs = { ...DEFAULT_INPUTS, unitsPerDay: 80 };
    const labor = calculateLaborCost(80, inputs);
    const electricity = calculateElectricity(inputs);
    const overhead = calculateOverhead(inputs);
    const units = calculateUnitsPerProduct(inputs);
    const unitCosts = calculateUnitCostBreakdown(labor, electricity, overhead, units, inputs);
    const result = calculateBreakeven(inputs, labor, electricity, overhead, unitCosts);
    expect(result.currentUnits).toBe(80);
    expect(result.isSafe).toBe(true);
  });

  it('unitsFromBreakeven reflects distance from threshold', () => {
    const labor = calculateLaborCost(DEFAULT_INPUTS.unitsPerDay, DEFAULT_INPUTS);
    const electricity = calculateElectricity(DEFAULT_INPUTS);
    const overhead = calculateOverhead(DEFAULT_INPUTS);
    const units = calculateUnitsPerProduct(DEFAULT_INPUTS);
    const unitCosts = calculateUnitCostBreakdown(labor, electricity, overhead, units, DEFAULT_INPUTS);
    const result = calculateBreakeven(DEFAULT_INPUTS, labor, electricity, overhead, unitCosts);
    expect(result.unitsFromBreakeven).toBe(result.currentUnits - result.threshold);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. generateMarketingAdvice
// ─────────────────────────────────────────────────────────────────────────────

describe('generateMarketingAdvice', () => {
  it('recommends SKU with highest weighted CM', () => {
    // All pro: CM_pro = 420, volume share = 1.0, score = 420
    const units = { base: 0, lite: 0, pro: 50 };
    const inputs = { ...DEFAULT_INPUTS, baseMix: 0, liteMix: 0, proMix: 1.0 };
    const result = generateMarketingAdvice(units, inputs);
    expect(result.recommendedSku).toBe('pro');
  });

  it('recommends base when it dominates volume', () => {
    // 90% base: 176.5 * 0.9 = 158.85 > lite: 235 * 0.05 = 11.75, pro: 420 * 0.05 = 21.0
    const units = { base: 45, lite: 3, pro: 2 };
    const inputs = { ...DEFAULT_INPUTS, baseMix: 0.9, liteMix: 0.05, proMix: 0.05 };
    const result = generateMarketingAdvice(units, inputs);
    expect(result.recommendedSku).toBe('base');
  });

  it('generates a rationale string', () => {
    const units = { base: 20, lite: 18, pro: 12 };
    const result = generateMarketingAdvice(units, DEFAULT_INPUTS);
    expect(result.rationale).toBeTruthy();
    expect(typeof result.rationale).toBe('string');
  });

  it('handles zero total units gracefully', () => {
    const units = { base: 0, lite: 0, pro: 0 };
    const inputs = { ...DEFAULT_INPUTS, unitsPerDay: 0 };
    const result = generateMarketingAdvice(units, inputs);
    expect(result.scores.base).toBe(0);
    expect(result.scores.lite).toBe(0);
    expect(result.scores.pro).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. calculateAll (integration)
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateAll', () => {
  it('returns all output sections', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    expect(result.units).toBeDefined();
    expect(result.revenue).toBeDefined();
    expect(result.materials).toBeDefined();
    expect(result.labor).toBeDefined();
    expect(result.electricity).toBeDefined();
    expect(result.overhead).toBeDefined();
    expect(result.unitCosts).toHaveLength(3);
    expect(result.contributionMargins).toBeDefined();
    expect(result.breakeven).toBeDefined();
    expect(result.marketing).toBeDefined();
    expect(typeof result.dailyProfit).toBe('number');
    expect(typeof result.monthlyProfit).toBe('number');
  });

  it('units sum to unitsPerDay', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    const { base, lite, pro } = result.units;
    expect(base + lite + pro).toBe(DEFAULT_INPUTS.unitsPerDay);
  });

  it('monthly profit = daily * workdays', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    expect(result.monthlyProfit).toBeCloseTo(
      result.dailyProfit * DEFAULT_INPUTS.workdaysPerMonth,
      2
    );
  });

  it('breakeven reflects current units', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    expect(result.breakeven.currentUnits).toBe(DEFAULT_INPUTS.unitsPerDay);
    expect(result.breakeven.isSafe).toBe(true);
  });

  // ─── New financial health outputs ───

  it('grossProfitMonthly is defined and is a number', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    expect(typeof result.grossProfitMonthly).toBe('number');
  });

  it('grossMarginPct is between 0 and 100 for profitable scenario', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    expect(result.grossMarginPct).toBeGreaterThanOrEqual(0);
    expect(result.grossMarginPct).toBeLessThanOrEqual(100);
  });

  it('ebitMonthly is defined and a number', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    expect(typeof result.ebitMonthly).toBe('number');
  });

  it('currentRatio is positive when currentLiabilities > 0', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    expect(result.currentRatio).toBeGreaterThan(0);
  });

  it('quickRatio is positive when currentLiabilities > 0', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    expect(result.quickRatio).toBeGreaterThan(0);
  });

  it('solvencyRatio uses ownEquity + longTermDebt / totalAssets', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    const expected = (DEFAULT_INPUTS.ownEquity + DEFAULT_INPUTS.longTermDebt) / result.totalAssets;
    expect(result.solvencyRatio).toBeCloseTo(expected, 4);
  });

  it('equityRatio uses ownEquity / totalAssets', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    const expected = DEFAULT_INPUTS.ownEquity / result.totalAssets;
    expect(result.equityRatio).toBeCloseTo(expected, 4);
  });

  it('arTurnover is positive when accountsReceivable > 0', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    expect(result.arTurnover).toBeGreaterThan(0);
  });

  it('dso = 360 / arTurnover', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    expect(result.dso).toBeCloseTo(360 / result.arTurnover, 4);
  });

  it('currentLiabilities = 0 yields currentRatio of 0', () => {
    const inputs = { ...DEFAULT_INPUTS, currentLiabilities: 0 };
    const result = calculateAll(inputs);
    expect(result.currentRatio).toBe(0);
    expect(result.quickRatio).toBe(0);
  });

  it('accountsReceivable = 0 yields arTurnover and dso of 0', () => {
    const inputs = { ...DEFAULT_INPUTS, accountsReceivable: 0 };
    const result = calculateAll(inputs);
    expect(result.arTurnover).toBe(0);
    expect(result.dso).toBe(0);
  });
});
