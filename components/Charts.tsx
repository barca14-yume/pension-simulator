'use client'

import { useSimulatorStore } from '@/store/useSimulatorStore'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/format'

export function BalanceChart() {
  const { results, currencyUnit } = useSimulatorStore()
  
  if (!results) return null
  
  const data = results.timeline.map(row => ({
    age: row.agePrimary,
    balance: row.endBalance,
    year: row.year,
  }))
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">資産残高推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="age" 
            label={{ value: '年齢', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value, currencyUnit, 0)}
            label={{ value: '残高', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value, currencyUnit)}
            labelFormatter={(age) => `${age}歳`}
          />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="資産残高"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CashFlowChart() {
  const { results, currencyUnit } = useSimulatorStore()
  
  if (!results) return null
  
  const data = results.timeline.map(row => ({
    age: row.agePrimary,
    income: row.income,
    pensions: row.pensionsPublic + row.pensionsPublicSpouse + row.annuitiesPrivate,
    spending: row.spending + row.childCost + row.mortgage,
    year: row.year,
  }))
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">収入・支出推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="age" 
            label={{ value: '年齢', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value, currencyUnit, 0)}
            label={{ value: '金額', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value, currencyUnit)}
            labelFormatter={(age) => `${age}歳`}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="income" 
            stackId="1"
            stroke="#10b981" 
            fill="#10b981"
            name="給与収入"
          />
          <Area 
            type="monotone" 
            dataKey="pensions" 
            stackId="1"
            stroke="#3b82f6" 
            fill="#3b82f6"
            name="年金収入"
          />
          <Area 
            type="monotone" 
            dataKey="spending" 
            stackId="2"
            stroke="#ef4444" 
            fill="#ef4444"
            name="支出"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonteCarloChart() {
  const { results, currencyUnit } = useSimulatorStore()
  
  if (!results?.monteCarlo) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Monte Carloシミュレーション</h3>
        <p className="text-gray-500 text-center py-8">
          Monte Carloシミュレーションが有効化されていません
        </p>
      </div>
    )
  }
  
  const { monteCarlo } = results
  const { inputs } = useSimulatorStore()
  
  const data = monteCarlo.percentiles.p50.map((_, idx) => ({
    age: inputs.applicantAge + idx,
    p10: monteCarlo.percentiles.p10[idx],
    p25: monteCarlo.percentiles.p25[idx],
    p50: monteCarlo.percentiles.p50[idx],
    p75: monteCarlo.percentiles.p75[idx],
    p90: monteCarlo.percentiles.p90[idx],
  }))
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">
        Monte Carloシミュレーション（{monteCarlo.paths.length}回試行）
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="age" 
            label={{ value: '年齢', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value, currencyUnit, 0)}
            label={{ value: '残高', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value, currencyUnit)}
            labelFormatter={(age) => `${age}歳`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="p90" 
            stroke="#10b981" 
            strokeWidth={1}
            name="90%ile"
            dot={false}
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="p75" 
            stroke="#3b82f6" 
            strokeWidth={1}
            name="75%ile"
            dot={false}
            strokeDasharray="3 3"
          />
          <Line 
            type="monotone" 
            dataKey="p50" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="中央値"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="p25" 
            stroke="#f59e0b" 
            strokeWidth={1}
            name="25%ile"
            dot={false}
            strokeDasharray="3 3"
          />
          <Line 
            type="monotone" 
            dataKey="p10" 
            stroke="#ef4444" 
            strokeWidth={1}
            name="10%ile"
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
