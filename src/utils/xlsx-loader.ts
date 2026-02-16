import * as XLSX from 'xlsx'
import type { Contact } from '../types'

function parseDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  const str = String(value).trim()
  if (str === '00/00/0000' || str === '' || str === 'null') return null

  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value)
    if (date) return new Date(date.y, date.m - 1, date.d)
  }

  const parts = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (parts) {
    const [, d, m, y] = parts
    if (d === '00' || m === '00') return null
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
  }

  const iso = new Date(str)
  if (!isNaN(iso.getTime())) return iso

  return null
}

function normalizeName(name: unknown): string {
  if (!name) return ''
  return String(name)
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => {
      const lower = word.toLowerCase()
      if (['de', 'da', 'do', 'dos', 'das', 'e'].includes(lower)) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

function normalizePhone(phone: unknown): string {
  if (!phone) return ''
  return String(phone).trim()
}

export async function loadContacts(): Promise<Contact[]> {
  const response = await fetch('/Lista aniversario atualizado KLP.xlsx')
  const buffer = await response.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  return rows.map((row, index) => ({
    id: index + 1,
    nome: normalizeName(row['Nome'] ?? row['NOME'] ?? row['nome']),
    dataNascimento: parseDate(row['DataNascimento'] ?? row['DATANASCIMENTO'] ?? row['datanascimento'] ?? row['Data Nascimento']),
    celular: normalizePhone(row['Celular'] ?? row['CELULAR'] ?? row['celular']),
  })).filter(c => c.nome !== '')
}
