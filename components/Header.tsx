'use client'

import { useSimulatorStore } from '@/store/useSimulatorStore'
import { PresetName, presets } from '@/data/presets'
import { getShareableURL, loadInputsFromURL } from '@/lib/urlState'
import { Save, Upload, Share2, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Header() {
  const { 
    currentPreset, 
    setPreset, 
    salesMode, 
    setSalesMode,
    inputs,
    loadInputs,
    reset,
  } = useSimulatorStore()
  
  const [showCopied, setShowCopied] = useState(false)
  
  useEffect(() => {
    // Load from URL on mount
    const urlInputs = loadInputsFromURL()
    if (urlInputs) {
      loadInputs(urlInputs)
    }
  }, [loadInputs])
  
  const handleShare = () => {
    const url = getShareableURL(inputs)
    navigator.clipboard.writeText(url)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }
  
  const handleSave = () => {
    const data = JSON.stringify(inputs)
    localStorage.setItem('pension-simulator-inputs', data)
    alert('設定を保存しました')
  }
  
  const handleLoad = () => {
    const data = localStorage.getItem('pension-simulator-inputs')
    if (data) {
      try {
        const savedInputs = JSON.parse(data)
        loadInputs(savedInputs)
        alert('設定を読み込みました')
      } catch (error) {
        alert('設定の読み込みに失敗しました')
      }
    } else {
      alert('保存された設定がありません')
    }
  }
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 no-print">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          年金・資産ギャップシミュレーター
        </h1>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Preset selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              プリセット:
            </label>
            <select
              value={currentPreset}
              onChange={(e) => setPreset(e.target.value as PresetName)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(presets).map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sales mode toggle */}
          <button
            onClick={() => setSalesMode(!salesMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              salesMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="営業モード: 余白減・文字大きめ・高コントラスト"
          >
            {salesMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            営業モード
          </button>
          
          {/* Save/Load buttons */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
            title="現在の設定をブラウザに保存"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          
          <button
            onClick={handleLoad}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
            title="保存した設定を読み込み"
          >
            <Upload className="w-4 h-4" />
            読込
          </button>
          
          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium relative"
            title="設定をURLで共有"
          >
            <Share2 className="w-4 h-4" />
            共有
            {showCopied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                URLをコピーしました
              </span>
            )}
          </button>
          
          {/* Reset button */}
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium"
            title="初期値にリセット"
          >
            リセット
          </button>
        </div>
      </div>
    </header>
  )
}
