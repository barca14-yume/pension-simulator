'use client'

import { useSimulatorStore } from '@/store/useSimulatorStore'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface AccordionSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border border-gray-200 rounded-lg mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg font-semibold text-left"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

interface InputFieldProps {
  label: string
  value: number | string
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  type?: 'number' | 'slider'
  tooltip?: string
}

function InputField({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max, 
  step = 1, 
  unit = '',
  type = 'number',
  tooltip,
}: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700" title={tooltip}>
        {label}
      </label>
      
      {type === 'slider' ? (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md"
            inputMode="numeric"
          />
          {unit && <span className="text-sm text-gray-600">{unit}</span>}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            inputMode="numeric"
            pattern="\d*"
          />
          {unit && <span className="text-sm text-gray-600 min-w-[60px]">{unit}</span>}
        </div>
      )}
    </div>
  )
}

export function FormPanel() {
  const { inputs, setInputs } = useSimulatorStore()
  
  return (
    <div className="space-y-3 h-full overflow-y-auto pb-6">
      {/* 顧客情報 */}
      <AccordionSection title="顧客情報" defaultOpen={true}>
        <InputField
          label="現在年齢"
          value={inputs.applicantAge}
          onChange={(v) => setInputs({ applicantAge: v })}
          min={20}
          max={80}
          unit="歳"
          tooltip="申込者の現在の年齢"
        />
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">性別</label>
          <select
            value={inputs.gender}
            onChange={(e) => setInputs({ gender: e.target.value as 'male' | 'female' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inputs.spouse.hasSpouse}
              onChange={(e) => setInputs({ 
                spouse: { ...inputs.spouse, hasSpouse: e.target.checked } 
              })}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-gray-700">配偶者あり</span>
          </label>
          
          {inputs.spouse.hasSpouse && (
            <>
              <InputField
                label="配偶者年齢"
                value={inputs.spouse.age || 40}
                onChange={(v) => setInputs({ 
                  spouse: { ...inputs.spouse, age: v } 
                })}
                min={20}
                max={80}
                unit="歳"
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">配偶者性別</label>
                <select
                  value={inputs.spouse.gender || 'female'}
                  onChange={(e) => setInputs({ 
                    spouse: { ...inputs.spouse, gender: e.target.value as 'male' | 'female' } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
              </div>
            </>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              子供の年齢
            </label>
            <button
              type="button"
              onClick={() => {
                setInputs({ childrenAges: [...inputs.childrenAges, 0] })
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + 追加
            </button>
          </div>
          
          {inputs.childrenAges.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">
              子供がいない場合はそのままで大丈夫です
            </p>
          ) : (
            <div className="space-y-2">
              {inputs.childrenAges.map((age, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-[60px]">
                    子供{index + 1}:
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={22}
                    value={age}
                    onChange={(e) => {
                      const newAges = [...inputs.childrenAges]
                      newAges[index] = parseInt(e.target.value) || 0
                      setInputs({ childrenAges: newAges })
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputMode="numeric"
                  />
                  <span className="text-sm text-gray-600">歳</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newAges = inputs.childrenAges.filter((_, i) => i !== index)
                      setInputs({ childrenAges: newAges })
                    }}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="削除"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">
            0〜22歳まで入力可能
            {inputs.childrenAges.length > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                （合計: {inputs.childrenAges.length}人）
              </span>
            )}
          </p>
        </div>
      </AccordionSection>
      
      {/* ライフイベント */}
      <AccordionSection title="ライフイベント">
        <InputField
          label="退職予定年齢"
          value={inputs.retireAge}
          onChange={(v) => setInputs({ retireAge: v })}
          min={55}
          max={75}
          unit="歳"
          type="slider"
        />
        
        <InputField
          label="想定死亡年齢（本人）"
          value={inputs.deathAgePrimary || 95}
          onChange={(v) => setInputs({ deathAgePrimary: v })}
          min={60}
          max={110}
          unit="歳"
          tooltip="空欄の場合は100歳まで計算"
        />
        
        {inputs.spouse.hasSpouse && (
          <InputField
            label="想定死亡年齢（配偶者）"
            value={inputs.deathAgeSpouse || 95}
            onChange={(v) => setInputs({ deathAgeSpouse: v })}
            min={60}
            max={110}
            unit="歳"
          />
        )}
      </AccordionSection>
      
      {/* 所得・積立 */}
      <AccordionSection title="所得・積立" defaultOpen={true}>
        <InputField
          label="現在の年収（税込）"
          value={inputs.currentGrossIncome}
          onChange={(v) => setInputs({ currentGrossIncome: v })}
          min={0}
          step={100000}
          unit="円"
        />
        
        <InputField
          label="給与成長率（実質）"
          value={inputs.salaryGrowthRate * 100}
          onChange={(v) => setInputs({ salaryGrowthRate: v / 100 })}
          min={-5}
          max={10}
          step={0.1}
          unit="%"
          type="slider"
        />
        
        <InputField
          label="現在の貯蓄額"
          value={inputs.savingsNow}
          onChange={(v) => setInputs({ savingsNow: v })}
          min={0}
          step={100000}
          unit="円"
        />
        
        <InputField
          label="年間積立額"
          value={inputs.annualPrivateSaving}
          onChange={(v) => setInputs({ annualPrivateSaving: v })}
          min={0}
          step={100000}
          unit="円"
        />
        
        <InputField
          label="期待リターン（実質）"
          value={inputs.expectedReturn * 100}
          onChange={(v) => setInputs({ expectedReturn: v / 100 })}
          min={-5}
          max={15}
          step={0.1}
          unit="%"
          type="slider"
        />
        
        <InputField
          label="ボラティリティ"
          value={inputs.volatility}
          onChange={(v) => setInputs({ volatility: v })}
          min={0}
          max={30}
          step={1}
          unit="%"
          type="slider"
        />
        
        <InputField
          label="インフレ率"
          value={inputs.inflationRate * 100}
          onChange={(v) => setInputs({ inflationRate: v / 100 })}
          min={0}
          max={10}
          step={0.1}
          unit="%"
          type="slider"
        />
      </AccordionSection>
      
      {/* 公的年金 */}
      <AccordionSection title="公的年金">
        <InputField
          label="基礎年金満額"
          value={inputs.basicPensionFullAmount}
          onChange={(v) => setInputs({ basicPensionFullAmount: v })}
          min={0}
          step={1000}
          unit="円/年"
          tooltip="令和6年度: 816,000円"
        />
        
        <InputField
          label="基礎年金加入率"
          value={inputs.basicPensionCoverage * 100}
          onChange={(v) => setInputs({ basicPensionCoverage: v / 100 })}
          min={0}
          max={100}
          step={1}
          unit="%"
          type="slider"
        />
        
        <InputField
          label="報酬比例係数"
          value={inputs.earningsRelatedFactor * 1000}
          onChange={(v) => setInputs({ earningsRelatedFactor: v / 1000 })}
          min={0}
          max={10}
          step={0.1}
          unit="‰"
          tooltip="厚生年金の報酬比例部分の係数（標準: 5.481‰）"
        />
        
        <InputField
          label="平均標準報酬月額"
          value={inputs.avgStandardRemuneration}
          onChange={(v) => setInputs({ avgStandardRemuneration: v })}
          min={0}
          step={10000}
          unit="円"
        />
      </AccordionSection>
      
      {/* 遺族・障害 */}
      <AccordionSection title="遺族・障害">
        <InputField
          label="遺族年金率"
          value={inputs.survivorBenefitRate * 100}
          onChange={(v) => setInputs({ survivorBenefitRate: v / 100 })}
          min={0}
          max={100}
          step={5}
          unit="%"
          type="slider"
          tooltip="基礎年金に対する遺族年金の割合（簡易計算）"
        />
        
        <InputField
          label="遺族年金最低支給年数"
          value={inputs.survivorBenefitMinYears}
          onChange={(v) => setInputs({ survivorBenefitMinYears: v })}
          min={0}
          max={30}
          unit="年"
        />
      </AccordionSection>
      
      {/* 私的年金・保険 */}
      <AccordionSection title="私的年金・保険">
        <InputField
          label="私的年金開始年齢"
          value={inputs.privateAnnuityStartAge}
          onChange={(v) => setInputs({ privateAnnuityStartAge: v })}
          min={55}
          max={80}
          unit="歳"
        />
        
        <InputField
          label="私的年金年額"
          value={inputs.privateAnnuityAnnual}
          onChange={(v) => setInputs({ privateAnnuityAnnual: v })}
          min={0}
          step={100000}
          unit="円"
        />
        
        <InputField
          label="終身保険死亡保険金"
          value={inputs.wholeLifeDeathBenefit}
          onChange={(v) => setInputs({ wholeLifeDeathBenefit: v })}
          min={0}
          step={1000000}
          unit="円"
        />
        
        <InputField
          label="定期保険死亡保険金"
          value={inputs.termLifeDeathBenefit}
          onChange={(v) => setInputs({ termLifeDeathBenefit: v })}
          min={0}
          step={1000000}
          unit="円"
        />
      </AccordionSection>
      
      {/* 生活費 */}
      <AccordionSection title="生活費">
        <InputField
          label="現在の年間生活費"
          value={inputs.currentAnnualSpending}
          onChange={(v) => setInputs({ currentAnnualSpending: v })}
          min={0}
          step={100000}
          unit="円"
        />
        
        <InputField
          label="退職後生活費率"
          value={inputs.retireSpendingRatio * 100}
          onChange={(v) => setInputs({ retireSpendingRatio: v / 100 })}
          min={0}
          max={200}
          step={5}
          unit="%"
          type="slider"
          tooltip="現役時代の生活費に対する退職後の生活費の割合"
        />
        
        <InputField
          label="子供1人あたり年間費用"
          value={inputs.childCostPerYear}
          onChange={(v) => setInputs({ childCostPerYear: v })}
          min={0}
          step={100000}
          unit="円"
        />
      </AccordionSection>
      
      {/* 住宅 */}
      <AccordionSection title="住宅">
        <InputField
          label="住宅ローン年額"
          value={inputs.mortgageAnnual}
          onChange={(v) => setInputs({ mortgageAnnual: v })}
          min={0}
          step={100000}
          unit="円"
        />
        
        {inputs.mortgageAnnual > 0 && (
          <InputField
            label="ローン完済年齢"
            value={inputs.mortgageUntilAge || inputs.retireAge}
            onChange={(v) => setInputs({ mortgageUntilAge: v })}
            min={30}
            max={80}
            unit="歳"
          />
        )}
      </AccordionSection>
    </div>
  )
}
