import type { CommercialAction } from '../types'

const STORAGE_KEY = 'crm-klp-actions'

export function loadActions(): CommercialAction[] {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function saveActions(actions: CommercialAction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
