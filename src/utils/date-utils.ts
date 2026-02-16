import { format, isToday, isSameMonth, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Contact } from '../types'

function getBirthdayThisYear(date: Date): Date {
  const now = new Date()
  return new Date(now.getFullYear(), date.getMonth(), date.getDate())
}

export function isBirthdayToday(contact: Contact): boolean {
  if (!contact.dataNascimento) return false
  const bday = getBirthdayThisYear(contact.dataNascimento)
  return isToday(bday)
}

export function isBirthdayThisWeek(contact: Contact): boolean {
  if (!contact.dataNascimento) return false
  const bday = getBirthdayThisYear(contact.dataNascimento)
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 })
  return isWithinInterval(bday, { start: weekStart, end: weekEnd })
}

export function isBirthdayThisMonth(contact: Contact): boolean {
  if (!contact.dataNascimento) return false
  const bday = getBirthdayThisYear(contact.dataNascimento)
  return isSameMonth(bday, new Date())
}

export function formatDate(date: Date | null): string {
  if (!date) return '—'
  return format(date, 'dd/MM/yyyy')
}

export function formatBirthday(date: Date | null): string {
  if (!date) return '—'
  return format(date, "dd 'de' MMMM", { locale: ptBR })
}

export function getAge(date: Date | null): number | null {
  if (!date) return null
  const now = new Date()
  let age = now.getFullYear() - date.getFullYear()
  const m = now.getMonth() - date.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--
  return age
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month, 1)
  return format(date, 'MMMM', { locale: ptBR })
}

export function getWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${number}`
}
