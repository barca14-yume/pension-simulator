import { SimulatorInputs, TimelineRow, KPIResults, SimulationResults } from '@/types'
import { config } from '@/config'

export function calculateTimeline(inputs: SimulatorInputs): TimelineRow[] {
  const timeline: TimelineRow[] = []
  
  const maxAgePrimary = inputs.deathAgePrimary || config.maxAge
  const maxAgeSpouse = inputs.spouse.hasSpouse 
    ? (inputs.deathAgeSpouse || config.maxAge)
    : 0
  
  const maxAge = Math.max(maxAgePrimary, maxAgeSpouse)
  const yearsToSimulate = maxAge - inputs.applicantAge
  
  let currentBalance = inputs.savingsNow
  let isPrimaryDeceased = false
  let isSpouseDeceased = false
  let survivorBenefitYearsRemaining = 0
  
  for (let i = 0; i <= yearsToSimulate; i++) {
    const currentYear = new Date().getFullYear() + i
    const agePrimary = inputs.applicantAge + i
    const ageSpouse = inputs.spouse.hasSpouse && inputs.spouse.age 
      ? inputs.spouse.age + i 
      : undefined
    
    // Check death events
    if (!isPrimaryDeceased && inputs.deathAgePrimary && agePrimary >= inputs.deathAgePrimary) {
      isPrimaryDeceased = true
      // Add death benefits
      currentBalance += inputs.wholeLifeDeathBenefit + inputs.termLifeDeathBenefit
      // Start survivor benefits
      if (inputs.spouse.hasSpouse && !isSpouseDeceased) {
        survivorBenefitYearsRemaining = inputs.survivorBenefitMinYears
      }
    }
    
    if (!isSpouseDeceased && inputs.spouse.hasSpouse && ageSpouse && 
        inputs.deathAgeSpouse && ageSpouse >= inputs.deathAgeSpouse) {
      isSpouseDeceased = true
    }
    
    const isRetired = agePrimary >= inputs.retireAge
    
    // Income calculation
    let income = 0
    if (!isPrimaryDeceased && !isRetired) {
      const yearsWorked = agePrimary - inputs.applicantAge
      income = inputs.currentGrossIncome * Math.pow(1 + inputs.salaryGrowthRate, yearsWorked)
    }
    
    // Public pension calculation
    let pensionsPublic = 0
    let pensionsPublicSpouse = 0
    
    if (!isPrimaryDeceased && agePrimary >= config.statutoryPensionStartAge) {
      const basePension = inputs.basicPensionFullAmount * inputs.basicPensionCoverage
      const earningsPart = inputs.earningsRelatedFactor * inputs.avgStandardRemuneration * 12
      pensionsPublic = basePension + earningsPart
    }
    
    // Spouse pension
    if (inputs.spouse.hasSpouse && !isSpouseDeceased && ageSpouse && 
        ageSpouse >= config.statutoryPensionStartAge) {
      const spouseBasePension = inputs.basicPensionFullAmount * inputs.basicPensionCoverage * 0.5
      pensionsPublicSpouse = spouseBasePension
    }
    
    // Survivor benefits
    if (isPrimaryDeceased && !isSpouseDeceased && survivorBenefitYearsRemaining > 0) {
      const survivorBenefit = inputs.basicPensionFullAmount * 
                              inputs.basicPensionCoverage * 
                              inputs.survivorBenefitRate
      pensionsPublicSpouse += survivorBenefit
      survivorBenefitYearsRemaining--
    }
    
    // Private annuities
    let annuitiesPrivate = 0
    if (!isPrimaryDeceased && agePrimary >= inputs.privateAnnuityStartAge) {
      annuitiesPrivate = inputs.privateAnnuityAnnual
    }
    
    // Spending calculation
    let baseSpending = isRetired 
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
    
    // Net cash flow
    const totalIncome = income + pensionsPublic + pensionsPublicSpouse + annuitiesPrivate
    let netCashFlow = totalIncome - totalSpending
    
    // Add annual savings if working
    if (!isPrimaryDeceased && !isRetired) {
      netCashFlow += inputs.annualPrivateSaving
    }
    
    // Update balance
    if (netCashFlow >= 0) {
      // Positive cash flow: invest
      currentBalance = currentBalance * (1 + inputs.expectedReturn) + netCashFlow
    } else {
      // Negative cash flow: withdraw from assets
      currentBalance = currentBalance * (1 + inputs.expectedReturn) + netCashFlow
    }
    
    // Prevent negative balance (simplified - in reality would need to adjust spending)
    if (currentBalance < 0) {
      currentBalance = 0
    }
    
    timeline.push({
      year: currentYear,
      agePrimary,
      ageSpouse,
      income,
      pensionsPublic,
      pensionsPublicSpouse,
      annuitiesPrivate,
      spending: baseSpending,
      childCost,
      mortgage,
      netCashFlow,
      endBalance: currentBalance,
      isRetired,
      isPrimaryDeceased,
      isSpouseDeceased,
    })
  }
  
  return timeline
}

export function calculateKPIs(
  timeline: TimelineRow[], 
  inputs: SimulatorInputs,
  ruinProbability?: number
): KPIResults {
  const lifetimeReceiptsPublic = timeline.reduce(
    (sum, row) => sum + row.pensionsPublic + row.pensionsPublicSpouse, 
    0
  )
  
  const lifetimeReceiptsPrivate = timeline.reduce(
    (sum, row) => sum + row.annuitiesPrivate, 
    0
  )
  
  const lifetimeReceipts = lifetimeReceiptsPublic + lifetimeReceiptsPrivate
  
  // Find retirement year
  const retirementRow = timeline.find(row => row.agePrimary === inputs.retireAge)
  const retirementBalance = retirementRow?.endBalance || 0
  
  // Calculate retirement gap
  const yearsInRetirement = (inputs.deathAgePrimary || config.maxAge) - inputs.retireAge
  const annualRetirementSpending = inputs.currentAnnualSpending * inputs.retireSpendingRatio
  const totalRetirementNeeds = annualRetirementSpending * yearsInRetirement
  
  // Estimate retirement income
  const annualRetirementIncome = timeline
    .filter(row => row.isRetired && !row.isPrimaryDeceased)
    .reduce((sum, row) => sum + row.pensionsPublic + row.pensionsPublicSpouse + row.annuitiesPrivate, 0) / 
    Math.max(yearsInRetirement, 1)
  
  const totalRetirementIncome = annualRetirementIncome * yearsInRetirement
  
  const retirementGapNominal = retirementBalance + totalRetirementIncome - totalRetirementNeeds
  
  // Calculate NPV (real terms)
  const discountRate = Math.max(inputs.expectedReturn - inputs.inflationRate, config.minDiscountRate)
  let retirementGapReal = retirementBalance
  
  for (let i = 0; i < yearsInRetirement; i++) {
    const discountFactor = Math.pow(1 + discountRate, -(i + 1))
    retirementGapReal += (annualRetirementIncome - annualRetirementSpending) * discountFactor
  }
  
  const finalBalance = timeline[timeline.length - 1]?.endBalance || 0
  const peakBalance = Math.max(...timeline.map(row => row.endBalance))
  
  return {
    lifetimeReceipts,
    lifetimeReceiptsPublic,
    lifetimeReceiptsPrivate,
    retirementGapNominal,
    retirementGapReal,
    ruinProbability,
    finalBalance,
    peakBalance,
    retirementBalance,
  }
}

export function runSimulation(inputs: SimulatorInputs): SimulationResults {
  const timeline = calculateTimeline(inputs)
  const kpis = calculateKPIs(timeline, inputs)
  
  return {
    timeline,
    kpis,
  }
}

export function validateInputs(inputs: SimulatorInputs): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = []
  
  // Retirement age validation
  if (inputs.retireAge < inputs.applicantAge + config.validation.minRetireAgeGap) {
    warnings.push('退職年齢が現在年齢に近すぎます')
  }
  
  // Basic pension coverage
  if (inputs.basicPensionCoverage < config.validation.minBasicPensionCoverage) {
    warnings.push(`基礎年金加入率が${config.validation.minBasicPensionCoverage * 100}%未満です`)
  }
  
  // Survivor benefit rate
  if (inputs.survivorBenefitRate !== 0.5 && inputs.survivorBenefitRate > 0) {
    warnings.push('遺族年金率は簡易計算です。実際の制度とは異なる場合があります')
  }
  
  // Spouse age validation
  if (inputs.spouse.hasSpouse && !inputs.spouse.age) {
    warnings.push('配偶者の年齢が入力されていません')
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
  }
}
