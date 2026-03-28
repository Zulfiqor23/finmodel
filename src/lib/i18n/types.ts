// ─────────────────────────────────────────────────────────────────────────────
// FinModel — i18n Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type Locale = 'en' | 'ru' | 'uz';

export type Theme = 'dark' | 'light' | 'cold';

// ─── Per-component string maps ───────────────────────────────────────────────

export interface HeaderStrings {
  title: string;
  subtitle: string;
}

export interface InputPanelStrings {
  heading: string;
  // Groups
  groupProduction: string;
  groupMaterials: string;
  groupOverhead: string;
  // Volume inputs
  unitsPerDay: string;
  productMix: string;
  basePercent: string;
  litePercent: string;
  proPercent: string;
  shiftHours: string;
  efficiency: string;
  workdaysPerMonth: string;
  // Material / Price inputs
  basePrice: string;
  litePrice: string;
  proPrice: string;
  baseMaterialCost: string;
  liteMaterialCost: string;
  proMaterialCost: string;
  // Overhead / Labor inputs
  monthlyRent: string;
  lightingPowerCost: string;
  equipmentPowerCost: string;
  burnRatePerHour: string;
  defectRate: string;
  groupDepartments: string;
  salesLabor: string;
  techLabor: string;
  prodLabor: string;
  logisticsLabor: string;
  wageTypeLabel: string;
  kpiCapacity: string;
  kpiRate: string;
}

export interface ProfitabilityStrings {
  heading: string;
  perDay: string;
  perMonth: string;
  revenue: string;
  materials: string;
  labor: string;
  electricity: string;
  overhead: string;
}

export interface BreakevenStrings {
  heading: string;
  breakeven: string;
  unitsPerDay: string;
  aboveBreakeven: string;
  belowBreakeven: string;
}

export interface UnitCostStrings {
  heading: string;
  cost: string;
  margin: string;
  material: string;
  labor: string;
  electricity: string;
  overhead: string;
}

export interface LaborCardStrings {
  heading: string;
  workers: string;
  pieceRate: string;
  unitsPerWorker: string;
  effectivePerWorker: string;
  dailyLaborCost: string;
  laborPerUnit: string;
  dailyWage: string;
  monthly: string;
  salesDept: string;
  techDept: string;
  prodDept: string;
  logisticsDept: string;
  totalLaborDesc: string;
}

export interface MarketingStrings {
  heading: string;
  recommendedFocus: string;
  rationale: string;
  focusOn: string;
  highestWeighted: string;
  cmLabel: string;
  volumeShare: string;
}

export interface LanguageSwitcherStrings {
  label: string;
}

export interface ThemeSwitcherStrings {
  dark: string;
  light: string;
  cold: string;
}

export interface DashboardStrings {
  cogs: string;
  cogsTitle: string;
  cogsDesc: string;
  opex: string;
  opexTitle: string;
  opexDesc: string;
  ebitda: string;
  ebitdaTitle: string;
  ebitdaDesc: string;
  roi: string;
  roiTitle: string;
  roiDesc: string;
}

// ─── Aggregate dictionary ────────────────────────────────────────────────────

export interface Dictionary {
  header: HeaderStrings;
  inputPanel: InputPanelStrings;
  profitability: ProfitabilityStrings;
  breakeven: BreakevenStrings;
  unitCost: UnitCostStrings;
  laborCard: LaborCardStrings;
  marketing: MarketingStrings;
  languageSwitcher: LanguageSwitcherStrings;
  themeSwitcher: ThemeSwitcherStrings;
  dashboard: DashboardStrings;
}

// ─── Theme classes interface ─────────────────────────────────────────────────

export interface ThemeClasses {
  bg: string;
  text: string;
  textMuted: string;
  textDimmed: string;
  card: string;
  cardBorder: string;
  accent: string;
  accentBg: string;
  accentMuted: string;
  border: string;
  input: string;
  headerBg: string;
  headerBorder: string;
  kpiBlock: string;
  barBg: string;
  pillActive: string;
  pillInactive: string;
}
