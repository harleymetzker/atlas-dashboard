import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, ArrowLeftRight, BarChart3, PlusCircle, BrainCircuit, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Visão Geral' },
  { to: '/dre', icon: TrendingUp, label: 'DRE' },
  { to: '/cashflow', icon: ArrowLeftRight, label: 'Fluxo de Caixa' },
  { to: '/charts', icon: BarChart3, label: 'Gráficos' },
  { to: '/entries', icon: PlusCircle, label: 'Lançamentos' },
  { to: '/diagnostico', icon: BrainCircuit, label: 'Diagnóstico IA' },
]

export function Sidebar() {
  const { signOut, isAdmin, user } = useAuth()

  return (
    <aside className="w-60 shrink-0 bg-[#050505] border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-xl font-black tracking-[0.2em] text-white">ATLAS</h1>
        <p className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">Financial Dashboard</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {isAdmin ? (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-white text-black font-semibold' : 'text-white/50 hover:text-white hover:bg-white/5'}`
            }
          >
            <Users size={16} />
            Gerenciar Usuários
          </NavLink>
        ) : (
          navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-white text-black font-semibold' : 'text-white/50 hover:text-white hover:bg-white/5'}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))
        )}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-white/30 truncate">{user?.email}</p>
          {isAdmin && <span className="text-[10px] text-white/20 uppercase tracking-widest">Admin</span>}
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
