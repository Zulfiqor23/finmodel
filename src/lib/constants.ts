// ─────────────────────────────────────────────────────────────────────────────
// FinModel — Business Constants
// Single source of truth for all fixed financial parameters.
// Change a number here → reflected everywhere via engine.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { Product, LaborTier } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Product catalogue
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contribution margin = price − materialCost − laborPerUnit
 * Base : 400 − 200 − 23.50 = 176.50
 * Lite : 550 − 280 − 35.00 = 235.00
 * Pro  : 900 − 420 − 60.00 = 420.00
 */
export const PRODUCTS: Readonly<Product[]> = [
  {
    sku: 'base',
    label: 'Base',
    price: 400,
    materialCost: 200,
    laborPerUnit: 23.5,
    stdHours: 1.5,
    contributionMargin: 176.5,
  },
  {
    sku: 'lite',
    label: 'Lite',
    price: 550,
    materialCost: 280,
    laborPerUnit: 35.0,
    stdHours: 2.0,
    contributionMargin: 235.0,
  },
  {
    sku: 'pro',
    label: 'Pro',
    price: 900,
    materialCost: 420,
    laborPerUnit: 60.0,
    stdHours: 3.5,
    contributionMargin: 420.0,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Step-fixed labor tiers
// ─────────────────────────────────────────────────────────────────────────────

/** Monthly wage per worker (USD) */
export const WAGE_PER_WORKER_MONTHLY = 700;

/**
 * Step-fixed labor schedule.
 * Tiers are evaluated in order; the first matching tier wins.
 */
export const LABOR_TIERS: Readonly<LaborTier[]> = [
  {
    minUnits: 1,
    maxUnits: 15,
    workerCount: 2,
    wagePerWorker: WAGE_PER_WORKER_MONTHLY,
    pieceRateApplies: false,
  },
  {
    minUnits: 16,
    maxUnits: 40,
    workerCount: 5,
    wagePerWorker: WAGE_PER_WORKER_MONTHLY,
    pieceRateApplies: false,
  },
  {
    minUnits: 41,
    maxUnits: 80,
    workerCount: 10,
    wagePerWorker: WAGE_PER_WORKER_MONTHLY,
    pieceRateApplies: true,
  },
  {
    minUnits: 81,
    maxUnits: 100,
    workerCount: 15,
    wagePerWorker: WAGE_PER_WORKER_MONTHLY,
    pieceRateApplies: true,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Piece-rate surcharge (applied per unit when pieceRateApplies = true)
// ─────────────────────────────────────────────────────────────────────────────

/** Additional cost per unit produced when operating in a piece-rate tier (USD) */
export const PIECE_RATE = 23.5;

// ─────────────────────────────────────────────────────────────────────────────
// Factory burn rate
// ─────────────────────────────────────────────────────────────────────────────

/** Hourly fixed cost of running the factory (USD/hour) */
export const BURN_RATE = 25;

// ─────────────────────────────────────────────────────────────────────────────
// Electricity
// ─────────────────────────────────────────────────────────────────────────────

/** Always-on electricity cost: lighting, office, servers (USD/day) */
export const BASE_POWER = 8;

/**
 * Maximum machine electricity cost at full 10-hour operation (USD/day).
 * Actual machine power scales linearly: MACHINE_POWER × (actualHours / 10)
 */
export const MACHINE_POWER = 45;

// ─────────────────────────────────────────────────────────────────────────────
// Calendar / scheduling
// ─────────────────────────────────────────────────────────────────────────────

/** Default working days per month (used for monthly projections) */
export const WORKDAYS_PER_MONTH = 22;

// ─────────────────────────────────────────────────────────────────────────────
// Fixed overhead
// ─────────────────────────────────────────────────────────────────────────────

/** Monthly factory rent / fixed overhead (USD) */
export const MONTHLY_RENT = 5_000;

// ─────────────────────────────────────────────────────────────────────────────
// Breakeven
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Daily unit threshold for profitability.
 * N < BREAKEVEN_THRESHOLD → RED (danger zone)
 * N ≥ BREAKEVEN_THRESHOLD → GREEN (safe zone)
 */
export const BREAKEVEN_THRESHOLD = 42;
