import { SimulatorInputs } from '@/types'

export function encodeInputsToURL(inputs: SimulatorInputs): string {
  const compressed = JSON.stringify(inputs)
  const encoded = btoa(encodeURIComponent(compressed))
  return encoded
}

export function decodeInputsFromURL(encoded: string): SimulatorInputs | null {
  try {
    const compressed = decodeURIComponent(atob(encoded))
    const inputs = JSON.parse(compressed)
    return inputs as SimulatorInputs
  } catch (error) {
    console.error('Failed to decode inputs from URL:', error)
    return null
  }
}

export function getShareableURL(inputs: SimulatorInputs): string {
  const encoded = encodeInputsToURL(inputs)
  const url = new URL(window.location.href)
  url.searchParams.set('settings', encoded)
  return url.toString()
}

export function loadInputsFromURL(): SimulatorInputs | null {
  if (typeof window === 'undefined') return null
  
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('settings')
  
  if (!encoded) return null
  
  return decodeInputsFromURL(encoded)
}
