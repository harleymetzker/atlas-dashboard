import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { NavLinkRenderProps } from 'react-router-dom'
import {
  Home, FileText, DollarSign, BarChart3, List, Zap,
  Wrench, Users, LogOut, ChevronDown,
  Tag, Clock, Target, GitCompare,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// ── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  { to: '/dashboard',   icon: Home,       label: 'Visão Geral',    end: true  },
  { to: '/dre',         icon: FileText,   label: 'DRE',            end: false },
  { to: '/cashflow',    icon: DollarSign, label: 'Fluxo de Caixa', end: false },
  { to: '/charts',      icon: BarChart3,  label: 'Gráficos',       end: false },
  { to: '/entries',     icon: List,       label: 'Lançamentos',    end: false },
  { to: '/diagnostico', icon: Zap,        label: 'Diagnóstico IA', end: false, activeBg: '#6710A2', activeColor: '#fff' },
]

const ferramentasItems = [
  { to: '/ferramentas/precificacao-produto',  icon: Tag,       label: 'Preço de Produto' },
  { to: '/ferramentas/precificacao-servico',  icon: Clock,     label: 'Preço de Serviço' },
  { to: '/ferramentas/ponto-equilibrio',      icon: Target,    label: 'Ponto de Equilíbrio' },
  { to: '/ferramentas/simulador-cenarios',    icon: GitCompare,label: 'Simulador' },
]

// ── NavItem ───────────────────────────────────────────────────────────────────

function navStyle(
  { isActive }: NavLinkRenderProps,
  hovered: boolean,
  activeBg = '#80EF00',
  activeColor = '#000',
): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
    fontFamily: "'Geist', sans-serif",
    fontSize: 13, transition: 'all 0.15s',
    fontWeight: isActive ? 600 : 500,
    background: isActive ? activeBg : hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
    color: isActive ? activeColor : hovered ? '#fff' : '#A6A8AB',
  }
}

function NavItem({ to, icon: Icon, label, end = false, activeBg, activeColor }: {
  to: string; icon: React.ElementType; label: string; end?: boolean
  activeBg?: string; activeColor?: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <NavLink
      to={to}
      end={end}
      style={p => navStyle(p, hovered, activeBg, activeColor)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon size={15} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </NavLink>
  )
}

function SubNavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 8px', borderRadius: 6, textDecoration: 'none',
        fontFamily: "'Geist', sans-serif",
        fontSize: 12, transition: 'all 0.15s',
        fontWeight: isActive ? 600 : 500,
        background: isActive ? '#80EF00' : hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
        color: isActive ? '#000' : hovered ? '#fff' : '#A6A8AB',
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon size={13} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </NavLink>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { signOut, isAdmin, isSuperAdmin, user } = useAuth()
  const [ferramentasOpen, setFerramentasOpen] = useState(false)
  const location = useLocation()
  const ferramentasActive = location.pathname.startsWith('/ferramentas')

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: '#000',
      borderRight: '1px solid #1e1e1e',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>

      {/* ── Logo / Header ── */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1e1e1e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: '#80EF00', borderRadius: 8, padding: 0,
            width: 40, height: 40, flexShrink: 0,
            overflow: 'hidden',
          }}>
            <img
              src="/blacksheep-logo.png"
              alt="Black Sheep"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "'Geist', sans-serif",
              fontWeight: 700, fontSize: 14,
              color: '#fff', lineHeight: 1.2,
            }}>
              Black Sheep
            </div>
            <div style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 9, color: '#666',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              lineHeight: 1.4, marginTop: 1,
            }}>
              Sistema Financeiro
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {isSuperAdmin ? (
          /* blacksheep: apenas painel admin */
          <NavItem to="/admin" icon={Users} label="Gerenciar Usuários" />
        ) : (
          <>
            {navItems.map(({ to, icon, label, end, activeBg, activeColor }) => (
              <NavItem key={to} to={to} icon={icon} label={label} end={end} activeBg={activeBg} activeColor={activeColor} />
            ))}

            {/* Ferramentas accordion */}
            <div style={{ marginTop: 4 }}>
              <button
                onClick={() => setFerramentasOpen(o => !o)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8,
                  background: ferramentasActive ? 'rgba(128,239,0,0.08)' : 'transparent',
                  color: ferramentasActive ? '#80EF00' : '#A6A8AB',
                  fontWeight: 500, fontSize: 13,
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: "'Geist', sans-serif",
                }}
                onMouseEnter={e => {
                  if (!ferramentasActive) {
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={e => {
                  if (!ferramentasActive) {
                    e.currentTarget.style.color = '#A6A8AB'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <Wrench size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, textAlign: 'left' }}>Ferramentas</span>
                <ChevronDown
                  size={13}
                  style={{
                    transition: 'transform 0.2s',
                    transform: ferramentasOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {ferramentasOpen && (
                <div style={{ marginLeft: 10, marginTop: 2, borderLeft: '1px solid #1e1e1e', paddingLeft: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {ferramentasItems.map(({ to, icon: Icon, label }) => (
                    <SubNavItem key={to} to={to} icon={Icon} label={label} />
                  ))}
                </div>
              )}
            </div>

            {/* Admin */}
            {isAdmin && (
              <div style={{ marginTop: 4 }}>
                <NavItem to="/admin" icon={Users} label="Admin" />
              </div>
            )}
          </>
        )}
      </nav>

      {/* ── Footer ── */}
      <div style={{ padding: '10px 8px 14px', borderTop: '1px solid #1e1e1e' }}>
        <div style={{ padding: '4px 10px 8px' }}>
          <p style={{
            fontSize: 11, color: '#666',
            margin: 0, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: "'Geist Mono', monospace",
          }}>
            {user?.email}
          </p>
        </div>
        <button
          onClick={signOut}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 10px', borderRadius: 8,
            background: 'transparent', color: '#666',
            fontSize: 12, border: 'none', cursor: 'pointer',
            transition: 'color 0.15s',
            fontFamily: "'Geist', sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#666' }}
        >
          <LogOut size={13} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
