import { describe, it, expect } from 'vitest'
import { encodeInputsToURL, decodeInputsFromURL } from '@/lib/urlState'
import { SimulatorInputs } from '@/types'

describe('URL State', () => {
  const testInputs: SimulatorInputs = {
    applicantAge: 40,
    gender: 'male',
    spouse: { hasSpouse: false },
    childrenAges: [5, 8],
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

  it('should encode inputs to URL', () => {
    const encoded = encodeInputsToURL(testInputs)
    
    expect(encoded).toBeDefined()
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)
  })

  it('should decode inputs from URL', () => {
    const encoded = encodeInputsToURL(testInputs)
    const decoded = decodeInputsFromURL(encoded)
    
    expect(decoded).toBeDefined()
    expect(decoded).toEqual(testInputs)
  })

  it('should handle round-trip correctly', () => {
    const encoded = encodeInputsToURL(testInputs)
    const decoded = decodeInputsFromURL(encoded)
    
    expect(decoded?.applicantAge).toBe(testInputs.applicantAge)
    expect(decoded?.currentGrossIncome).toBe(testInputs.currentGrossIncome)
    expect(decoded?.childrenAges).toEqual(testInputs.childrenAges)
    expect(decoded?.spouse.hasSpouse).toBe(testInputs.spouse.hasSpouse)
  })

  it('should return null for invalid encoded string', () => {
    const decoded = decodeInputsFromURL('invalid-string')
    expect(decoded).toBeNull()
  })
})
