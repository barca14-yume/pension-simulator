export type CurrencyUnit = 'yen' | 'man' | 'sen'

export function formatCurrency(
  amount: number, 
  unit: CurrencyUnit = 'man',
  decimals: number = 1
): string {
  let value = amount
  let suffix = '円'
  
  switch (unit) {
    case 'man':
      value = amount / 10000
      suffix = '万円'
      break
    case 'sen':
      value = amount / 1000
      suffix = '千円'
      break
    case 'yen':
      value = amount
      suffix = '円'
      decimals = 0
      break
  }
  
  return `${value.toLocaleString('ja-JP', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatAge(age: number): string {
  return `${age}歳`
}

export function formatYear(year: number): string {
  return `${year}年`
}

export function parseFormattedCurrency(formatted: string, unit: CurrencyUnit = 'man'): number {
  const cleaned = formatted.replace(/[^0-9.-]/g, '')
  const value = parseFloat(cleaned) || 0
  
  switch (unit) {
    case 'man':
      return value * 10000
    case 'sen':
      return value * 1000
    case 'yen':
      return value
    default:
      return value
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
