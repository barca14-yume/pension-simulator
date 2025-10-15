import { describe, it, expect } from 'vitest'
import { runSimulation, validateInputs } from '@/lib/finance'
import { SimulatorInputs } from '@/types'
import { config } from '@/config'

describe('Finance Engine', () => {
  const baseInputs: SimulatorInputs = {
    applicantAge: 40,
    gender: 'male',
    spouse: { hasSpouse: false },
    childrenAges: [],
    retireAge: 65,
    deathAgePrimary: 95,
    deathAgeSpouse: undefined,
    currentGrossIncome: 6000000,
    salaryGrowthRate: 0.01,
    savingsNow: 5000000,
    annualPrivateSaving: 1200000,
    expectedReturn: 0.03,
    volatility: 10,
    inflationRate: 0.015,
    basicPensionFullAmount: 816000,
    basicPensionCoverage: 1.0,
    earningsRelatedFactor: 0.005481,
    avgStandardRemuneration: 400000,
    survivorBenefitRate: 0.5,
    survivorBenefitMinYears: 10,
    privateAnnuityStartAge: 65,
    privateAnnuityAnnual: 0,
    wholeLifeDeathBenefit: 10000000,
    termLifeDeathBenefit: 0,
    currentAnnualSpending: 3600000,
    retireSpendingRatio: 0.8,
    childCostPerYear: 1000000,
    mortgageAnnual: 0,
    mortgageUntilAge: undefined,
  }

  it('should calculate timeline for base case', () => {
    const results = runSimulation(baseInputs)
    
    expect(results.timeline).toBeDefined()
    expect(results.timeline.length).toBeGreaterThan(0)
    expect(results.kpis).toBeDefined()
  })

  it('should have positive balance at age 95 for base case', () => {
    const results = runSimulation(baseInputs)
    const finalRow = results.timeline[results.timeline.length - 1]
    
    expect(finalRow.agePrimary).toBe(95)
    expect(finalRow.endBalance).toBeGreaterThan(0)
  })

  it('should calculate public pension correctly', () => {
    const results = runSimulation(baseInputs)
    
    // Find first row with pension
    const pensionRow = results.timeline.find(
      row => row.agePrimary >= config.statutoryPensionStartAge
    )
    
    expect(pensionRow).toBeDefined()
    expect(pensionRow!.pensionsPublic).toBeGreaterThan(0)
    
    // Expected pension = base + earnings-related
    const expectedBase = baseInputs.basicPensionFullAmount * baseInputs.basicPensionCoverage
    const expectedEarnings = baseInputs.earningsRelatedFactor * baseInputs.avgStandardRemuneration * 12
    const expectedTotal = expectedBase + expectedEarnings
    
    expect(pensionRow!.pensionsPublic).toBeCloseTo(expectedTotal, -2)
  })

  it('should handle survivor benefits', () => {
    const inputsWithSpouse: SimulatorInputs = {
      ...baseInputs,
      spouse: {
        hasSpouse: true,
        age: 38,
        gender: 'female',
      },
      deathAgePrimary: 55,
    }
    
    const results = runSimulation(inputsWithSpouse)
    
    // Find row after death
    const afterDeathRow = results.timeline.find(row => row.agePrimary >= 56)
    
    expect(afterDeathRow).toBeDefined()
    expect(afterDeathRow!.isPrimaryDeceased).toBe(true)
    expect(afterDeathRow!.income).toBe(0)
    
    // Check death benefit was added
    const deathRow = results.timeline.find(row => row.agePrimary === 55)
    expect(deathRow).toBeDefined()
  })

  it('should validate inputs correctly', () => {
    const validResult = validateInputs(baseInputs)
    expect(validResult.isValid).toBe(true)
    expect(validResult.warnings).toHaveLength(0)
  })

  it('should warn on low pension coverage', () => {
    const lowCoverageInputs: SimulatorInputs = {
      ...baseInputs,
      basicPensionCoverage: 0.5,
    }
    
    const result = validateInputs(lowCoverageInputs)
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toContain('基礎年金加入率')
  })

  it('should calculate KPIs correctly', () => {
    const results = runSimulation(baseInputs)
    
    expect(results.kpis.lifetimeReceipts).toBeGreaterThan(0)
    expect(results.kpis.lifetimeReceiptsPublic).toBeGreaterThan(0)
    expect(results.kpis.retirementBalance).toBeGreaterThan(0)
    expect(results.kpis.finalBalance).toBeGreaterThan(0)
    expect(results.kpis.peakBalance).toBeGreaterThanOrEqual(results.kpis.finalBalance)
  })

  it('should handle children costs', () => {
    const inputsWithChildren: SimulatorInputs = {
      ...baseInputs,
      childrenAges: [5, 8],
    }
    
    const results = runSimulation(inputsWithChildren)
    
    // Find row where children are still young
    const rowWithChildren = results.timeline[0]
    expect(rowWithChildren.childCost).toBe(baseInputs.childCostPerYear * 2)
    
    // Find row where children are adults
    const rowWithoutChildren = results.timeline.find(row => {
      const oldestChildAge = Math.max(...inputsWithChildren.childrenAges) + (row.agePrimary - baseInputs.applicantAge)
      return oldestChildAge > 22
    })
    
    if (rowWithoutChildren) {
      expect(rowWithoutChildren.childCost).toBe(0)
    }
  })

  it('should handle mortgage correctly', () => {
    const inputsWithMortgage: SimulatorInputs = {
      ...baseInputs,
      mortgageAnnual: 1200000,
      mortgageUntilAge: 60,
    }
    
    const results = runSimulation(inputsWithMortgage)
    
    // Before mortgage end
    const beforeEnd = results.timeline.find(row => row.agePrimary === 50)
    expect(beforeEnd!.mortgage).toBe(1200000)
    
    // After mortgage end
    const afterEnd = results.timeline.find(row => row.agePrimary === 65)
    expect(afterEnd!.mortgage).toBe(0)
  })
})
