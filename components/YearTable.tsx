'use client'

import { useSimulatorStore } from '@/store/useSimulatorStore'
import { formatCurrency } from '@/lib/format'
import { useMemo } from 'react'

export function YearTable() {
  const { results, currencyUnit } = useSimulatorStore()
  
  const displayData = useMemo(() => {
    if (!results) return []
    
    // Show every year for first 10 years, then every 5 years
    return results.timeline.filter((row, idx) => {
      if (idx < 10) return true
      return idx % 5 === 0
    })
  }, [results])
  
  if (!results) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center py-8">計算中...</p>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">年</th>
              <th className="px-4 py-3 text-left font-semibold">年齢</th>
              <th className="px-4 py-3 text-right font-semibold">給与</th>
              <th className="px-4 py-3 text-right font-semibold">公的年金</th>
              <th className="px-4 py-3 text-right font-semibold">私的年金</th>
              <th className="px-4 py-3 text-right font-semibold">生活費</th>
              <th className="px-4 py-3 text-right font-semibold">その他支出</th>
              <th className="px-4 py-3 text-right font-semibold">純CF</th>
              <th className="px-4 py-3 text-right font-semibold">期末残高</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayData.map((row, idx) => (
              <tr 
                key={row.year}
                className={`hover:bg-gray-50 ${row.isRetired ? 'bg-blue-50/30' : ''}`}
              >
                <td className="px-4 py-2">{row.year}</td>
                <td className="px-4 py-2">
                  {row.agePrimary}歳
                  {row.ageSpouse && ` / ${row.ageSpouse}歳`}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(row.income, currencyUnit, 0)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(row.pensionsPublic + row.pensionsPublicSpouse, currencyUnit, 0)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(row.annuitiesPrivate, currencyUnit, 0)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(row.spending, currencyUnit, 0)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(row.childCost + row.mortgage, currencyUnit, 0)}
                </td>
                <td className={`px-4 py-2 text-right font-medium ${
                  row.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(row.netCashFlow, currencyUnit, 0)}
                </td>
                <td className="px-4 py-2 text-right font-semibold">
                  {formatCurrency(row.endBalance, currencyUnit, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        ※ 最初の10年は全年表示、以降は5年ごとに表示
        {results.timeline.some(r => r.isRetired) && (
          <span className="ml-4">
            <span className="inline-block w-3 h-3 bg-blue-50 border border-blue-200 mr-1"></span>
            退職後
          </span>
        )}
      </div>
    </div>
  )
}
