'use client'

import { useState } from 'react'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import { BalanceChart, CashFlowChart, MonteCarloChart } from './Charts'
import { YearTable } from './YearTable'
import { KPICards } from './KPICards'
import { exportTimelineToCSV, exportTimelineToJSON } from '@/lib/export'
import { Download, FileJson, FileSpreadsheet, Settings } from 'lucide-react'
import { presets } from '@/data/presets'
import { config } from '@/config'

type TabName = 'summary' | 'timeline' | 'assumptions' | 'export'

export function ResultsTabs() {
  const [activeTab, setActiveTab] = useState<TabName>('summary')
  const { 
    results, 
    inputs, 
    currencyUnit, 
    setCurrencyUnit,
    enableMonteCarlo,
    setEnableMonteCarlo,
    currentPreset,
  } = useSimulatorStore()
  
  const tabs = [
    { id: 'summary' as TabName, label: 'サマリー' },
    { id: 'timeline' as TabName, label: '年次推移' },
    { id: 'assumptions' as TabName, label: '前提・係数' },
    { id: 'export' as TabName, label: 'エクスポート' },
  ]
  
  const handleExportCSV = () => {
    if (results) {
      exportTimelineToCSV(results.timeline)
    }
  }
  
  const handleExportJSON = () => {
    if (results) {
      exportTimelineToJSON(results.timeline, inputs)
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white no-print">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'summary' && (
          <>
            <KPICards />
            <BalanceChart />
            <CashFlowChart />
            {enableMonteCarlo && <MonteCarloChart />}
          </>
        )}
        
        {activeTab === 'timeline' && (
          <>
            <div className="flex items-center justify-between mb-4 no-print">
              <h2 className="text-xl font-bold">年次推移表</h2>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">表示単位:</label>
                <select
                  value={currencyUnit}
                  onChange={(e) => setCurrencyUnit(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="man">万円</option>
                  <option value="sen">千円</option>
                  <option value="yen">円</option>
                </select>
              </div>
            </div>
            <YearTable />
          </>
        )}
        
        {activeTab === 'assumptions' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                計算前提・係数
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">選択中のプリセット</h3>
                    <p className="text-lg">{presets[currentPreset].label}</p>
                    <p className="text-sm text-gray-600">{presets[currentPreset].description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">リターン・リスク</h3>
                    <ul className="text-sm space-y-1">
                      <li>期待リターン: {(inputs.expectedReturn * 100).toFixed(2)}%</li>
                      <li>インフレ率: {(inputs.inflationRate * 100).toFixed(2)}%</li>
                      <li>ボラティリティ: {inputs.volatility}%</li>
                      <li>給与成長率: {(inputs.salaryGrowthRate * 100).toFixed(2)}%</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">公的年金</h3>
                  <ul className="text-sm space-y-1">
                    <li>基礎年金満額: {inputs.basicPensionFullAmount.toLocaleString()}円/年</li>
                    <li>基礎年金加入率: {(inputs.basicPensionCoverage * 100).toFixed(0)}%</li>
                    <li>報酬比例係数: {(inputs.earningsRelatedFactor * 1000).toFixed(3)}‰</li>
                    <li>平均標準報酬月額: {inputs.avgStandardRemuneration.toLocaleString()}円</li>
                    <li>年金開始年齢: {config.statutoryPensionStartAge}歳</li>
                  </ul>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Monte Carloシミュレーション</h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enableMonteCarlo}
                      onChange={(e) => setEnableMonteCarlo(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">
                      有効化（{config.monteCarloIterations}回試行）
                    </span>
                  </label>
                  <p className="text-xs text-gray-600 mt-2">
                    ※ 有効化すると計算に時間がかかります
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ ディスクレーマー</h3>
              <p className="text-sm text-yellow-800">
                この画面は公的年金制度を簡略化した目安です。実際の年金額は加入期間・報酬額・制度改正等により異なります。
                税務・社会保険料・加入要件は別途ご確認ください。投資リターンは保証されるものではありません。
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-4">データエクスポート</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <FileSpreadsheet className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">CSV形式でエクスポート</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      年次推移データをCSV形式でダウンロードします。Excelで開けます。
                    </p>
                    <button
                      onClick={handleExportCSV}
                      disabled={!results}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      CSVダウンロード
                    </button>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <FileJson className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">JSON形式でエクスポート</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      入力データと年次推移データをJSON形式でダウンロードします。
                    </p>
                    <button
                      onClick={handleExportJSON}
                      disabled={!results}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      JSONダウンロード
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-4">印刷</h2>
              <p className="text-sm text-gray-600 mb-4">
                ブラウザの印刷機能を使用してA4横向きで印刷できます。
              </p>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                印刷プレビュー
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
