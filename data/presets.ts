export type PresetName = 'Conservative' | 'Base' | 'Aggressive'

export interface Preset {
  name: PresetName
  label: string
  expectedReturn: number // 実質期待リターン (%)
  inflationRate: number // インフレ率 (%)
  salaryGrowthRate: number // 給与成長率 (実質, %)
  volatility: number // ボラティリティ (%)
  description: string
}

export const presets: Record<PresetName, Preset> = {
  Conservative: {
    name: 'Conservative',
    label: '保守的',
    expectedReturn: 0.015,
    inflationRate: 0.01,
    salaryGrowthRate: 0.005,
    volatility: 8,
    description: '低リスク・低リターンの想定。債券中心のポートフォリオ。',
  },
  Base: {
    name: 'Base',
    label: '標準',
    expectedReturn: 0.03,
    inflationRate: 0.015,
    salaryGrowthRate: 0.01,
    volatility: 10,
    description: 'バランス型の標準的な想定。株式・債券の分散投資。',
  },
  Aggressive: {
    name: 'Aggressive',
    label: '積極的',
    expectedReturn: 0.045,
    inflationRate: 0.02,
    salaryGrowthRate: 0.015,
    volatility: 15,
    description: '高リスク・高リターンの想定。株式中心のポートフォリオ。',
  },
}

export const defaultPreset: PresetName = 'Base'
