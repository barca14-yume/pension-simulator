import { create } from 'zustand'
import { SimulatorInputs, SimulationResults } from '@/types'
import { PresetName, presets, defaultPreset } from '@/data/presets'
import { runSimulation } from '@/lib/finance'
import { runMonteCarloSimulation } from '@/lib/montecarlo'
import { config } from '@/config'

interface SimulatorState {
  // Inputs
  inputs: SimulatorInputs
  
  // Results
  results: SimulationResults | null
  
  // UI state
  currentPreset: PresetName
  salesMode: boolean
  currencyUnit: 'man' | 'sen' | 'yen'
  enableMonteCarlo: boolean
  isCalculating: boolean
  
  // Actions
  setInputs: (inputs: Partial<SimulatorInputs>) => void
  setPreset: (preset: PresetName) => void
  setSalesMode: (enabled: boolean) => void
  setCurrencyUnit: (unit: 'man' | 'sen' | 'yen') => void
  setEnableMonteCarlo: (enabled: boolean) => void
  calculate: () => void
  reset: () => void
  loadInputs: (inputs: SimulatorInputs) => void
}

const getDefaultInputs = (): SimulatorInputs => {
  const preset = presets[defaultPreset]
  
  return {
    // 顧客情報
    applicantAge: 40,
    gender: 'male',
    spouse: {
      hasSpouse: false,
    },
    childrenAges: [],
    
    // ライフイベント
    retireAge: 65,
    deathAgePrimary: undefined,
    deathAgeSpouse: undefined,
    
    // 所得・積立
    currentGrossIncome: 6000000,
    salaryGrowthRate: preset.salaryGrowthRate,
    savingsNow: 5000000,
    annualPrivateSaving: 1200000,
    expectedReturn: preset.expectedReturn,
    volatility: preset.volatility,
    inflationRate: preset.inflationRate,
    
    // 公的年金
    basicPensionFullAmount: config.basicPensionFullAmountDefault,
    basicPensionCoverage: 1.0,
    earningsRelatedFactor: 0.005481,
    avgStandardRemuneration: 400000,
    
    // 遺族・障害
    survivorBenefitRate: 0.5,
    survivorBenefitMinYears: 10,
    
    // 私的年金・保険
    privateAnnuityStartAge: 65,
    privateAnnuityAnnual: 0,
    wholeLifeDeathBenefit: 10000000,
    termLifeDeathBenefit: 0,
    
    // 生活費
    currentAnnualSpending: 3600000,
    retireSpendingRatio: 0.8,
    childCostPerYear: 1000000,
    mortgageAnnual: 0,
    mortgageUntilAge: undefined,
  }
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  inputs: getDefaultInputs(),
  results: null,
  currentPreset: defaultPreset,
  salesMode: false,
  currencyUnit: 'man',
  enableMonteCarlo: false,
  isCalculating: false,
  
  setInputs: (newInputs) => {
    set((state) => ({
      inputs: { ...state.inputs, ...newInputs },
    }))
    // Auto-calculate after input change
    setTimeout(() => get().calculate(), config.ui.debounceMs)
  },
  
  setPreset: (preset) => {
    const presetData = presets[preset]
    set((state) => ({
      currentPreset: preset,
      inputs: {
        ...state.inputs,
        expectedReturn: presetData.expectedReturn,
        inflationRate: presetData.inflationRate,
        salaryGrowthRate: presetData.salaryGrowthRate,
        volatility: presetData.volatility,
      },
    }))
    setTimeout(() => get().calculate(), 100)
  },
  
  setSalesMode: (enabled) => {
    set({ salesMode: enabled })
  },
  
  setCurrencyUnit: (unit) => {
    set({ currencyUnit: unit })
  },
  
  setEnableMonteCarlo: (enabled) => {
    set({ enableMonteCarlo: enabled })
    setTimeout(() => get().calculate(), 100)
  },
  
  calculate: () => {
    const { inputs, enableMonteCarlo } = get()
    set({ isCalculating: true })
    
    try {
      const results = runSimulation(inputs)
      
      if (enableMonteCarlo) {
        const mcResults = runMonteCarloSimulation(inputs)
        results.monteCarlo = mcResults
        results.kpis.ruinProbability = mcResults.ruinProbability
      }
      
      set({ results, isCalculating: false })
    } catch (error) {
      console.error('Calculation error:', error)
      set({ isCalculating: false })
    }
  },
  
  reset: () => {
    set({
      inputs: getDefaultInputs(),
      results: null,
      currentPreset: defaultPreset,
    })
    setTimeout(() => get().calculate(), 100)
  },
  
  loadInputs: (inputs) => {
    set({ inputs })
    setTimeout(() => get().calculate(), 100)
  },
}))

// Initialize with calculation
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useSimulatorStore.getState().calculate()
  }, 100)
}
