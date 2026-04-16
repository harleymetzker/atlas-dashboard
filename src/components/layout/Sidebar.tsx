import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, ArrowLeftRight, BarChart3, PlusCircle, BrainCircuit, Users, LogOut, Wrench, ChevronDown, Tag, Clock, Target, GitCompare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
  { to: '/dre', icon: TrendingUp, label: 'DRE' },
  { to: '/cashflow', icon: ArrowLeftRight, label: 'Fluxo de Caixa' },
  { to: '/charts', icon: BarChart3, label: 'Gráficos' },
  { to: '/entries', icon: PlusCircle, label: 'Lançamentos' },
  { to: '/diagnostico', icon: BrainCircuit, label: 'Diagnóstico IA' },
]

const ferramentasItems = [
  { to: '/ferramentas/precificacao-produto', icon: Tag, label: 'Preço de Produto' },
  { to: '/ferramentas/precificacao-servico', icon: Clock, label: 'Preço de Serviço' },
  { to: '/ferramentas/ponto-equilibrio', icon: Target, label: 'Ponto de Equilíbrio' },
  { to: '/ferramentas/simulador-cenarios', icon: GitCompare, label: 'Simulador de Cenários' },
]

const activeStyle = {
  color: '#00EF61',
  background: 'rgba(0,239,97,0.1)',
  fontWeight: 700,
}

const inactiveStyle = {
  color: 'rgba(255,255,255,0.55)',
  fontWeight: 500,
}

export function Sidebar() {
  const { signOut, isAdmin, user } = useAuth()
  const [ferramentasOpen, setFerramentasOpen] = useState(false)

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: '#0c0c0c', borderRight: '3px solid #00EF61' }}
    >
      {/* Header — green block */}
      <div style={{ background: '#00EF61', padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/logo-bs.jpg" alt="Black Sheep" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }} />
        <div>
          <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 28, letterSpacing: 6, color: '#000', fontWeight: 900, lineHeight: 1 }}>
            ATLAS
          </div>
          <div style={{ fontSize: 11, letterSpacing: 1, color: 'rgba(0,0,0,0.5)', marginTop: 4 }}>
            por Black Sheep
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {isAdmin ? (
          <NavLink
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={({ isActive }) => isActive ? activeStyle : inactiveStyle}
          >
            <Users size={16} />
            Gerenciar Usuários
          </NavLink>
        ) : (
          <>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}

            {/* Ferramentas accordion */}
            <div className="pt-2">
              <button
                onClick={() => setFerramentasOpen(o => !o)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={inactiveStyle}
              >
                <Wrench size={16} />
                <span className="flex-1 text-left">Ferramentas</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${ferramentasOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {ferramentasOpen && (
                <div className="ml-3 mt-0.5 border-l border-white/10 pl-3 space-y-0.5">
                  {ferramentasItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
                      style={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                    >
                      <Icon size={14} />
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
          {isAdmin && <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin</span>}
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:text-red-400 hover:bg-red-500/5"
          style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
