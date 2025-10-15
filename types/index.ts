import { z } from 'zod'

// Spouse schema
export const spouseSchema = z.object({
  hasSpouse: z.boolean(),
  age: z.number().min(20).max(80).optional(),
  gender: z.enum(['male', 'female']).optional(),
})

// Main input schema
export const inputSchema = z.object({
  // 顧客情報
  applicantAge: z.number().min(20).max(80),
  gender: z.enum(['male', 'female']),
  spouse: spouseSchema,
  childrenAges: z.array(z.number().min(0).max(22)),
  
  // ライフイベント
  retireAge: z.number().min(55).max(75),
  deathAgePrimary: z.number().min(60).max(110).optional(),
  deathAgeSpouse: z.number().min(60).max(110).optional(),
  
  // 所得・積立
  currentGrossIncome: z.number().min(0),
  salaryGrowthRate: z.number().min(-0.05).max(0.1),
  savingsNow: z.number().min(0),
  annualPrivateSaving: z.number().min(0),
  expectedReturn: z.number().min(-0.05).max(0.15),
  volatility: z.number().min(0).max(30),
  inflationRate: z.number().min(0).max(0.1),
  
  // 公的年金
  basicPensionFullAmount: z.number().min(0),
  basicPensionCoverage: z.number().min(0).max(1),
  earningsRelatedFactor: z.number().min(0).max(0.01),
  avgStandardRemuneration: z.number().min(0),
  
  // 遺族・障害
  survivorBenefitRate: z.number().min(0).max(1),
  survivorBenefitMinYears: z.number().min(0).max(30),
  
  // 私的年金・保険
  privateAnnuityStartAge: z.number().min(55).max(80),
  privateAnnuityAnnual: z.number().min(0),
  wholeLifeDeathBenefit: z.number().min(0),
  termLifeDeathBenefit: z.number().min(0),
  
  // 生活費
  currentAnnualSpending: z.number().min(0),
  retireSpendingRatio: z.number().min(0).max(2),
  childCostPerYear: z.number().min(0),
  mortgageAnnual: z.number().min(0),
  mortgageUntilAge: z.number().min(30).max(80).optional(),
})

export type SimulatorInputs = z.infer<typeof inputSchema>
export type Spouse = z.infer<typeof spouseSchema>

// Timeline row
export interface TimelineRow {
  year: number
  agePrimary: number
  ageSpouse?: number
  income: number
  pensionsPublic: number
  pensionsPublicSpouse: number
  annuitiesPrivate: number
  spending: number
  childCost: number
  mortgage: number
  netCashFlow: number
  endBalance: number
  isRetired: boolean
  isPrimaryDeceased: boolean
  isSpouseDeceased: boolean
}

// KPI results
export interface KPIResults {
  lifetimeReceipts: number // 生涯受取合計（公的＋私的）
  lifetimeReceiptsPublic: number
  lifetimeReceiptsPrivate: number
  retirementGapNominal: number // 退職時点の不足/余剰（名目）
  retirementGapReal: number // 退職時点の不足/余剰（実質NPV）
  ruinProbability?: number // 破綻確率（Monte Carlo時）
  finalBalance: number // 最終残高
  peakBalance: number // 最大残高
  retirementBalance: number // 退職時点残高
}

// Monte Carlo results
export interface MonteCarloResults {
  paths: number[][]
  percentiles: {
    p10: number[]
    p25: number[]
    p50: number[]
    p75: number[]
    p90: number[]
  }
  ruinProbability: number
  finalBalances: number[]
}

// Complete simulation results
export interface SimulationResults {
  timeline: TimelineRow[]
  kpis: KPIResults
  monteCarlo?: MonteCarloResults
}

// Validation warnings
export interface ValidationWarning {
  field: string
  message: string
  severity: 'warning' | 'error'
}
