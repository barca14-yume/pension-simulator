'use client'

import { Header } from '@/components/Header'
import { FormPanel } from '@/components/FormPanel'
import { ResultsTabs } from '@/components/ResultsTabs'
import { useSimulatorStore } from '@/store/useSimulatorStore'

export default function Home() {
  const { salesMode } = useSimulatorStore()
  
  return (
    <div className={`min-h-screen bg-gray-50 ${salesMode ? 'sales-mode' : ''}`}>
      <Header />
      
      <main className="h-[calc(100vh-73px)] flex">
        {/* Left Panel - Form */}
        <div className="w-full md:w-[400px] lg:w-[480px] border-r border-gray-200 bg-white overflow-y-auto no-print">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">入力項目</h2>
            <FormPanel />
          </div>
        </div>
        
        {/* Right Panel - Results */}
        <div className="flex-1 overflow-hidden">
          <ResultsTabs />
        </div>
      </main>
    </div>
  )
}
