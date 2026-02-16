import { useState, useMemo } from 'react'
import { Search, Filter, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Contact } from '../types'
import { formatDate, getAge, getWhatsAppLink, getMonthName } from '../utils/date-utils'

const PAGE_SIZE = 50

interface ContactsProps {
  contacts: Contact[]
}

export default function Contacts({ contacts }: ContactsProps) {
  const [search, setSearch] = useState('')
  const [monthFilter, setMonthFilter] = useState<number | ''>('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = contacts
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.nome.toLowerCase().includes(q) || c.celular.includes(q)
      )
    }
    if (monthFilter !== '') {
      result = result.filter(c =>
        c.dataNascimento && c.dataNascimento.getMonth() === monthFilter
      )
    }
    return result
  }, [contacts, search, monthFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleMonthChange = (value: string) => {
    setMonthFilter(value === '' ? '' : parseInt(value))
    setPage(1)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contatos</h1>
        <p className="text-gray-500 text-sm mt-1">
          {contacts.length.toLocaleString('pt-BR')} contatos cadastrados
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={monthFilter}
              onChange={e => handleMonthChange(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none bg-white cursor-pointer"
            >
              <option value="">Todos os meses</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {getMonthName(i).charAt(0).toUpperCase() + getMonthName(i).slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data de Nascimento</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Idade</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Celular</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(contact => (
                <tr key={contact.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="font-medium text-gray-900 text-sm">{contact.nome}</p>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-600">
                    {formatDate(contact.dataNascimento)}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-600">
                    {getAge(contact.dataNascimento) !== null ? `${getAge(contact.dataNascimento)} anos` : '—'}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-600">
                    {contact.celular || '—'}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {contact.celular && (
                      <a
                        href={getWhatsAppLink(contact.celular)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle size={16} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Mostrando {((page - 1) * PAGE_SIZE) + 1} a {Math.min(page * PAGE_SIZE, filtered.length)} de{' '}
            {filtered.length.toLocaleString('pt-BR')} contatos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-600 px-3">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
