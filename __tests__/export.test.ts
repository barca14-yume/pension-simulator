import { describe, it, expect } from 'vitest'
import { exportToCSV, exportToJSON } from '@/lib/export'
import { TimelineRow, SimulatorInputs } from '@/types'

describe('Export Functions', () => {
  const mockTimeline: TimelineRow[] = [
    {
      year: 2024,
      agePrimary: 40,
      ageSpouse: 38,
      income: 6000000,
      pensionsPublic: 0,
      pensionsPublicSpouse: 0,
      annuitiesPrivate: 0,
      spending: 3600000,
      childCost: 2000000,
      mortgage: 0,
      netCashFlow: 400000,
      endBalance: 5400000,
      isRetired: false,
      isPrimaryDeceased: false,
      isSpouseDeceased: false,
    },
    {
      year: 2025,
      agePrimary: 41,
      ageSpouse: 39,
      income: 6060000,
      pensionsPublic: 0,
      pensionsPublicSpouse: 0,
      annuitiesPrivate: 0,
      spending: 3600000,
      childCost: 2000000,
      mortgage: 0,
      netCashFlow: 460000,
      endBalance: 6022000,
      isRetired: false,
      isPrimaryDeceased: false,
      isSpouseDeceased: false,
    },
  ]

  const mockInputs: SimulatorInputs = {
    applicantAge: 40,
    gender: 'male',
    spouse: { hasSpouse: true, age: 38, gender: 'female' },
    childrenAges: [5, 8],
    retireAge: 65,
    deathAgePrimary: 95,
    deathAgeSpouse: 95,
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

  it('should export timeline to CSV', () => {
    const csv = exportToCSV(mockTimeline)
    
    expect(csv).toBeDefined()
    expect(typeof csv).toBe('string')
    
    // Check headers
    expect(csv).toContain('年')
    expect(csv).toContain('本人年齢')
    expect(csv).toContain('給与収入')
    expect(csv).toContain('期末残高')
    
    // Check data
    expect(csv).toContain('2024')
    expect(csv).toContain('40')
    expect(csv).toContain('6000000')
  })

  it('should have correct number of rows in CSV', () => {
    const csv = exportToCSV(mockTimeline)
    const lines = csv.split('\n')
    
    // Header + 2 data rows
    expect(lines.length).toBe(3)
  })

  it('should export to JSON', () => {
    const json = exportToJSON(mockTimeline, mockInputs)
    
    expect(json).toBeDefined()
    expect(typeof json).toBe('string')
    
    const parsed = JSON.parse(json)
    expect(parsed.inputs).toBeDefined()
    expect(parsed.timeline).toBeDefined()
    expect(parsed.exportedAt).toBeDefined()
    
    expect(parsed.timeline.length).toBe(mockTimeline.length)
    expect(parsed.inputs.applicantAge).toBe(mockInputs.applicantAge)
  })

  it('should include all timeline fields in CSV', () => {
    const csv = exportToCSV(mockTimeline)
    
    const expectedFields = [
      '年', '本人年齢', '配偶者年齢', '給与収入',
      '公的年金(本人)', '公的年金(配偶者)', '私的年金',
      '生活費', '育児費', '住宅費', '純キャッシュフロー', '期末残高'
    ]
    
    expectedFields.forEach(field => {
      expect(csv).toContain(field)
    })
  })
})
