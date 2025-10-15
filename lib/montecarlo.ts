import { SimulatorInputs, MonteCarloResults } from '@/types'
import { config } from '@/config'

// Box-Muller transform for normal distribution
function generateNormalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z0 * stdDev + mean
}

export function runMonteCarloSimulation(inputs: SimulatorInputs): MonteCarloResults {
  const iterations = config.monteCarloIterations
  const maxAgePrimary = inputs.deathAgePrimary || config.maxAge
  const yearsToSimulate = maxAgePrimary - inputs.applicantAge
  
  const paths: number[][] = []
  const finalBalances: number[] = []
  let ruinCount = 0
  
  for (let iter = 0; iter < iterations; iter++) {
    const path: number[] = []
    let currentBalance = inputs.savingsNow
    let hasRuined = false
    
    for (let i = 0; i <= yearsToSimulate; i++) {
      const agePrimary = inputs.applicantAge + i
      const isRetired = agePrimary >= inputs.retireAge
      const isPrimaryDeceased = inputs.deathAgePrimary ? agePrimary >= inputs.deathAgePrimary : false
      
      // Income
      let income = 0
      if (!isPrimaryDeceased && !isRetired) {
        const yearsWorked = agePrimary - inputs.applicantAge
        income = inputs.currentGrossIncome * Math.pow(1 + inputs.salaryGrowthRate, yearsWorked)
      }
      
      // Public pension (simplified)
      let pensionsPublic = 0
      if (!isPrimaryDeceased && agePrimary >= config.statutoryPensionStartAge) {
        const basePension = inputs.basicPensionFullAmount * inputs.basicPensionCoverage
        const earningsPart = inputs.earningsRelatedFactor * inputs.avgStandardRemuneration * 12
        pensionsPublic = basePension + earningsPart
      }
      
      // Private annuities
      let annuitiesPrivate = 0
      if (!isPrimaryDeceased && agePrimary >= inputs.privateAnnuityStartAge) {
        annuitiesPrivate = inputs.privateAnnuityAnnual
      }
      
      // Spending
      const baseSpending = isRetired 
        ? inputs.currentAnnualSpending * inputs.retireSpendingRatio
        : inputs.currentAnnualSpending
      
      // Child costs
      let childCost = 0
      for (const childAge of inputs.childrenAges) {
        const currentChildAge = childAge + i
        if (currentChildAge <= 22) {
          childCost += inputs.childCostPerYear
        }
      }
      
      // Mortgage
      let mortgage = 0
      if (inputs.mortgageAnnual > 0) {
        const mortgageEndAge = inputs.mortgageUntilAge || inputs.retireAge
        if (agePrimary < mortgageEndAge) {
          mortgage = inputs.mortgageAnnual
        }
      }
      
      const totalSpending = baseSpending + childCost + mortgage
      const totalIncome = income + pensionsPublic + annuitiesPrivate
      let netCashFlow = totalIncome - totalSpending
      
      // Add annual savings if working
      if (!isPrimaryDeceased && !isRetired) {
        netCashFlow += inputs.annualPrivateSaving
      }
      
      // Generate random return
      const randomReturn = generateNormalRandom(
        inputs.expectedReturn,
        inputs.volatility / 100
      )
      
      // Update balance
      currentBalance = currentBalance * (1 + randomReturn) + netCashFlow
      
      // Check for ruin
      if (currentBalance < 0 && !hasRuined) {
        hasRuined = true
        ruinCount++
      }
      
      // Floor at zero for display
      currentBalance = Math.max(0, currentBalance)
      path.push(currentBalance)
    }
    
    paths.push(path)
    finalBalances.push(path[path.length - 1])
  }
  
  // Calculate percentiles
  const percentiles = {
    p10: [] as number[],
    p25: [] as number[],
    p50: [] as number[],
    p75: [] as number[],
    p90: [] as number[],
  }
  
  for (let yearIdx = 0; yearIdx <= yearsToSimulate; yearIdx++) {
    const valuesAtYear = paths.map(path => path[yearIdx]).sort((a, b) => a - b)
    
    percentiles.p10.push(valuesAtYear[Math.floor(iterations * 0.1)])
    percentiles.p25.push(valuesAtYear[Math.floor(iterations * 0.25)])
    percentiles.p50.push(valuesAtYear[Math.floor(iterations * 0.5)])
    percentiles.p75.push(valuesAtYear[Math.floor(iterations * 0.75)])
    percentiles.p90.push(valuesAtYear[Math.floor(iterations * 0.9)])
  }
  
  const ruinProbability = ruinCount / iterations
  
  return {
    paths,
    percentiles,
    ruinProbability,
    finalBalances,
  }
}
