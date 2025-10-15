'use client'

import { useSimulatorStore } from '@/store/useSimulatorStore'
import { formatCurrency, formatPercent } from '@/lib/format'
import { TrendingUp, AlertTriangle, DollarSign, Copy } from 'lucide-react'
import { useState } from 'react'

export function KPICards() {
  const { results, currencyUnit } = useSimulatorStore()
  const [copiedKPI, setCopiedKPI] = useState<string | null>(null)
  
  if (!results) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 rounded-lg p-6 animate-pulse h-32" />
        <div className="bg-gray-100 rounded-lg p-6 animate-pulse h-32" />
        <div className="bg-gray-100 rounded-lg p-6 animate-pulse h-32" />
      </div>
    )
  }
  
  const { kpis } = results
  
  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(`${label}: ${value}`)
    setCopiedKPI(label)
    setTimeout(() => setCopiedKPI(null), 2000)
  }
  
  const cards = [
    {
      label: '生涯受取合計',
      value: formatCurrency(kpis.lifetimeReceipts, currencyUnit),
      subValue: `公的: ${formatCurrency(kpis.lifetimeReceiptsPublic, currencyUnit)} / 私的: ${formatCurrency(kpis.lifetimeReceiptsPrivate, currencyUnit)}`,
      icon: DollarSign,
      color: 'blue',
      tooltip: '公的年金と私的年金の生涯受取額の合計',
    },
    {
      label: 'リタイア時点の資産状況',
      value: formatCurrency(kpis.retirementGapReal, currencyUnit),
      subValue: `名目: ${formatCurrency(kpis.retirementGapNominal, currencyUnit)}`,
      icon: TrendingUp,
      color: kpis.retirementGapReal >= 0 ? 'green' : 'red',
      tooltip: '退職時点での資産余剰/不足（実質NPV）',
    },
    {
      label: '破綻確率',
      value: kpis.ruinProbability !== undefined 
        ? formatPercent(kpis.ruinProbability)
        : 'Monte Carlo未実行',
      subValue: `最終残高: ${formatCurrency(kpis.finalBalance, currencyUnit)}`,
      icon: AlertTriangle,
      color: kpis.ruinProbability !== undefined && kpis.ruinProbability > 0.1 ? 'red' : 'green',
      tooltip: 'Monte Carloシミュレーションによる資産枯渇の確率',
    },
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon
        const colorClasses = {
          blue: 'bg-blue-50 border-blue-200 text-blue-900',
          green: 'bg-green-50 border-green-200 text-green-900',
          red: 'bg-red-50 border-red-200 text-red-900',
        }[card.color]
        
        const iconColorClasses = {
          blue: 'text-blue-600',
          green: 'text-green-600',
          red: 'text-red-600',
        }[card.color]
        
        return (
          <div
            key={card.label}
            className={`relative rounded-lg border-2 p-6 ${colorClasses} card group`}
            title={card.tooltip}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${iconColorClasses}`} />
                <h3 className="font-semibold text-sm">{card.label}</h3>
              </div>
              <button
                onClick={() => handleCopy(card.label, card.value)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                title="コピー"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-2xl md:text-3xl font-bold mb-1">
              {card.value}
            </div>
            
            <div className="text-xs opacity-75">
              {card.subValue}
            </div>
            
            {copiedKPI === card.label && (
              <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                コピーしました
              </div>
            )}
            
            {/* Tooltip for touch devices */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 group-active:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
              {card.tooltip}
            </div>
          </div>
        )
      })}
    </div>
  )
}
