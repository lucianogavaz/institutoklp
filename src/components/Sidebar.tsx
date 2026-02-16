import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Cake, Megaphone } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contatos', label: 'Contatos', icon: Users },
  { to: '/aniversarios', label: 'Aniversários', icon: Cake },
  { to: '/acoes-comerciais', label: 'Ações Comerciais', icon: Megaphone },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-white font-bold text-lg leading-tight">Instituto</h1>
        <h2 className="text-primary-400 font-bold text-xl leading-tight">Karen Lorena Pacheco</h2>
        <p className="text-white/40 text-xs mt-1">CRM & Gestão de Clientes</p>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-white/60 hover:text-white hover:bg-sidebar-hover'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <p className="text-white/30 text-xs text-center">CRM KLP v1.0</p>
      </div>
    </aside>
  )
}
