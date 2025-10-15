export const config = {
  // 公的年金開始年齢
  statutoryPensionStartAge: 65,
  
  // 基礎年金満額（令和6年度）
  basicPensionFullAmountDefault: 816000,
  
  // 割引率計算の最小値
  minDiscountRate: 0.005,
  
  // Monte Carlo シミュレーション設定
  monteCarloIterations: 500,
  
  // 最大生存年齢
  maxAge: 100,
  
  // 遺族年金の最低支給年数
  survivorBenefitMinYearsDefault: 10,
  
  // バリデーション閾値
  validation: {
    minBasicPensionCoverage: 0.6,
    minRetireAgeGap: 1,
  },
  
  // UI設定
  ui: {
    minTouchTarget: 40, // px
    inputHeight: 48, // px (h-12)
    debounceMs: 300,
  },
} as const

export type Config = typeof config
