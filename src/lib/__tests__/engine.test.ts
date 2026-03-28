// ─────────────────────────────────────────────────────────────────────────────
// FinModel — Engine Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import {
  calculateUnitsPerProduct,
  calculateRevenue,
  calculateMaterialCost,
  calculateLaborTier,
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
  monthlyRent: 5000,
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
  it('calculates revenue for each SKU correctly', () => {
    const units = { base: 20, lite: 15, pro: 10 };
    const result = calculateRevenue(units);
    expect(result.base).toBe(20 * 400);
    expect(result.lite).toBe(15 * 550);
    expect(result.pro).toBe(10 * 900);
    expect(result.total).toBe(8000 + 8250 + 9000);
  });

  it('returns zero for zero units', () => {
    const result = calculateRevenue({ base: 0, lite: 0, pro: 0 });
    expect(result.total).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. calculateMaterialCost
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateMaterialCost', () => {
  it('calculates material costs per SKU', () => {
    const units = { base: 10, lite: 10, pro: 10 };
    const result = calculateMaterialCost(units);
    expect(result.base).toBe(10 * 200);
    expect(result.lite).toBe(10 * 280);
    expect(result.pro).toBe(10 * 420);
    expect(result.total).toBe(2000 + 2800 + 4200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. calculateLaborTier
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateLaborTier', () => {
  it('returns tier 1 for 1-15 units', () => {
    const tier = calculateLaborTier(10);
    expect(tier.workerCount).toBe(2);
    expect(tier.pieceRateApplies).toBe(false);
  });

  it('returns tier 2 for 16-40 units', () => {
    const tier = calculateLaborTier(25);
    expect(tier.workerCount).toBe(5);
    expect(tier.pieceRateApplies).toBe(false);
  });

  it('returns tier 3 for 41-80 units', () => {
    const tier = calculateLaborTier(50);
    expect(tier.workerCount).toBe(10);
    expect(tier.pieceRateApplies).toBe(true);
  });

  it('returns tier 4 for 81-100 units', () => {
    const tier = calculateLaborTier(90);
    expect(tier.workerCount).toBe(15);
    expect(tier.pieceRateApplies).toBe(true);
  });

  it('throws for out-of-range units', () => {
    expect(() => calculateLaborTier(0)).toThrow(RangeError);
    expect(() => calculateLaborTier(101)).toThrow(RangeError);
  });

  it('handles boundary values correctly', () => {
    expect(calculateLaborTier(1).workerCount).toBe(2);
    expect(calculateLaborTier(15).workerCount).toBe(2);
    expect(calculateLaborTier(16).workerCount).toBe(5);
    expect(calculateLaborTier(40).workerCount).toBe(5);
    expect(calculateLaborTier(41).workerCount).toBe(10);
    expect(calculateLaborTier(80).workerCount).toBe(10);
    expect(calculateLaborTier(81).workerCount).toBe(15);
    expect(calculateLaborTier(100).workerCount).toBe(15);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. calculateLaborCost
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateLaborCost', () => {
  it('calculates daily wage cost for tier 1 (no piece rate)', () => {
    const result = calculateLaborCost(10, 22);
    // 2 workers * $700/month / 22 workdays = ~$63.64/day
    expect(result.workerCount).toBe(2);
    expect(result.dailyWageCost).toBeCloseTo(63.636, 2);
    expect(result.dailyPieceRateCost).toBe(0);
  });

  it('includes piece rate for tier 3', () => {
    const result = calculateLaborCost(50, 22);
    // 10 workers * $700 / 22 = ~$318.18/day wage
    // 50 units * $23.50 = $1175/day piece rate
    expect(result.workerCount).toBe(10);
    expect(result.dailyWageCost).toBeCloseTo(318.18, 1);
    expect(result.dailyPieceRateCost).toBe(50 * 23.5);
  });

  it('calculates monthly total correctly', () => {
    const result = calculateLaborCost(10, 22);
    expect(result.totalMonthlyCost).toBeCloseTo(result.totalDailyCost * 22, 2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. calculateElectricity
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateElectricity', () => {
  it('calculates full 10-hour shift', () => {
    const result = calculateElectricity(10);
    expect(result.basePower).toBe(8);
    expect(result.machinePower).toBe(45);
    expect(result.totalDaily).toBe(53);
  });

  it('scales machine power linearly with shift hours', () => {
    const result = calculateElectricity(5);
    expect(result.machinePower).toBe(22.5);
    expect(result.totalDaily).toBe(30.5);
  });

  it('handles zero shift hours', () => {
    const result = calculateElectricity(0);
    expect(result.machinePower).toBe(0);
    expect(result.totalDaily).toBe(8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. calculateOverhead
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateOverhead', () => {
  it('computes daily burn rate and rent allocation', () => {
    const result = calculateOverhead(8, 50, 0.85, 5000, 22);
    expect(result.dailyBurnRate).toBe(200); // 25 * 8
    expect(result.dailyRentAllocation).toBeCloseTo(227.27, 1); // 5000 / 22
    expect(result.totalDailyFixed).toBeCloseTo(427.27, 1);
  });

  it('computes overhead per unit', () => {
    const result = calculateOverhead(8, 50, 0.85, 5000, 22);
    const effectiveUnits = 50 * 0.85;
    const expected = result.totalDailyFixed / effectiveUnits;
    expect(result.overheadPerUnit).toBeCloseTo(expected, 2);
  });

  it('handles zero units gracefully', () => {
    const result = calculateOverhead(8, 0, 0.85, 5000, 22);
    expect(result.overheadPerUnit).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. calculateUnitCostBreakdown
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateUnitCostBreakdown', () => {
  it('returns breakdown for all three SKUs', () => {
    const labor = calculateLaborCost(50, 22);
    const electricity = calculateElectricity(8);
    const overhead = calculateOverhead(8, 50, 0.85, 5000, 22);
    const units = { base: 20, lite: 18, pro: 12 };
    const result = calculateUnitCostBreakdown(labor, electricity, overhead, units);

    expect(result).toHaveLength(3);
    expect(result[0].sku).toBe('base');
    expect(result[1].sku).toBe('lite');
    expect(result[2].sku).toBe('pro');
  });

  it('includes piece rate in labor when applicable', () => {
    const labor = calculateLaborCost(50, 22);
    const electricity = calculateElectricity(8);
    const overhead = calculateOverhead(8, 50, 0.85, 5000, 22);
    const units = { base: 20, lite: 18, pro: 12 };
    const result = calculateUnitCostBreakdown(labor, electricity, overhead, units);

    // Base labor = $23.50 + $23.50 piece rate = $47.00
    expect(result[0].labor).toBe(23.5 + 23.5);
  });

  it('calculates gross margin correctly', () => {
    const labor = calculateLaborCost(50, 22);
    const electricity = calculateElectricity(8);
    const overhead = calculateOverhead(8, 50, 0.85, 5000, 22);
    const units = { base: 20, lite: 18, pro: 12 };
    const result = calculateUnitCostBreakdown(labor, electricity, overhead, units);

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
// 9. calculateContributionMargins
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateContributionMargins', () => {
  it('returns correct contribution margins from constants', () => {
    const result = calculateContributionMargins();
    expect(result.base).toBe(176.5);
    expect(result.lite).toBe(235.0);
    expect(result.pro).toBe(420.0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. calculateBreakeven
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateBreakeven', () => {
  it('marks below threshold as unsafe', () => {
    const result = calculateBreakeven(30);
    expect(result.isSafe).toBe(false);
    expect(result.unitsFromBreakeven).toBe(-12);
    expect(result.threshold).toBe(42);
  });

  it('marks at threshold as safe', () => {
    const result = calculateBreakeven(42);
    expect(result.isSafe).toBe(true);
    expect(result.unitsFromBreakeven).toBe(0);
  });

  it('marks above threshold as safe', () => {
    const result = calculateBreakeven(80);
    expect(result.isSafe).toBe(true);
    expect(result.unitsFromBreakeven).toBe(38);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. generateMarketingAdvice
// ─────────────────────────────────────────────────────────────────────────────

describe('generateMarketingAdvice', () => {
  it('recommends SKU with highest weighted CM', () => {
    // All pro: CM_pro = 420, volume share = 1.0, score = 420
    const units = { base: 0, lite: 0, pro: 50 };
    const result = generateMarketingAdvice(units, 50);
    expect(result.recommendedSku).toBe('pro');
  });

  it('recommends base when it dominates volume', () => {
    // 90% base: 176.5 * 0.9 = 158.85, lite: 235 * 0.05 = 11.75, pro: 420 * 0.05 = 21.0
    const units = { base: 45, lite: 3, pro: 2 };
    const result = generateMarketingAdvice(units, 50);
    expect(result.recommendedSku).toBe('base');
  });

  it('generates a rationale string', () => {
    const units = { base: 20, lite: 18, pro: 12 };
    const result = generateMarketingAdvice(units, 50);
    expect(result.rationale).toBeTruthy();
    expect(typeof result.rationale).toBe('string');
  });

  it('handles zero total units gracefully', () => {
    const units = { base: 0, lite: 0, pro: 0 };
    const result = generateMarketingAdvice(units, 0);
    expect(result.scores.base).toBe(0);
    expect(result.scores.lite).toBe(0);
    expect(result.scores.pro).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. calculateAll (integration)
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

  it('daily profit = revenue - all costs', () => {
    const result = calculateAll(DEFAULT_INPUTS);
    const totalCosts =
      result.materials.total +
      result.labor.totalDailyCost +
      result.electricity.totalDaily +
      result.overhead.totalDailyFixed;
    expect(result.dailyProfit).toBeCloseTo(result.revenue.total - totalCosts, 2);
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
});
