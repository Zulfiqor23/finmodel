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
  unitsPerDay: string;
  productMix: string;
  basePercent: string;
  litePercent: string;
  proPercent: string;
  shiftHours: string;
  efficiency: string;
  workdaysPerMonth: string;
  monthlyRent: string;
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
  pieceRateLabel: string;
  monthly: string;
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
