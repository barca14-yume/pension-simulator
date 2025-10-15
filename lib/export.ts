import { TimelineRow, SimulatorInputs } from '@/types'

export function exportToCSV(timeline: TimelineRow[]): string {
  const headers = [
    '年',
    '本人年齢',
    '配偶者年齢',
    '給与収入',
    '公的年金(本人)',
    '公的年金(配偶者)',
    '私的年金',
    '生活費',
    '育児費',
    '住宅費',
    '純キャッシュフロー',
    '期末残高',
  ]
  
  const rows = timeline.map(row => [
    row.year,
    row.agePrimary,
    row.ageSpouse || '',
    row.income,
    row.pensionsPublic,
    row.pensionsPublicSpouse,
    row.annuitiesPrivate,
    row.spending,
    row.childCost,
    row.mortgage,
    row.netCashFlow,
    row.endBalance,
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')
  
  return csv
}

export function exportToJSON(timeline: TimelineRow[], inputs: SimulatorInputs): string {
  const data = {
    inputs,
    timeline,
    exportedAt: new Date().toISOString(),
  }
  
  return JSON.stringify(data, null, 2)
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportTimelineToCSV(timeline: TimelineRow[]): void {
  const csv = exportToCSV(timeline)
  const timestamp = new Date().toISOString().split('T')[0]
  downloadFile(csv, `pension-timeline-${timestamp}.csv`, 'text/csv')
}

export function exportTimelineToJSON(timeline: TimelineRow[], inputs: SimulatorInputs): void {
  const json = exportToJSON(timeline, inputs)
  const timestamp = new Date().toISOString().split('T')[0]
  downloadFile(json, `pension-data-${timestamp}.json`, 'application/json')
}
