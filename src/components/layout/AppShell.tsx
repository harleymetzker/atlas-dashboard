import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  // Fecha drawer ao navegar
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  // Trava scroll do body quando drawer aberto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar — desktop sempre visível, mobile drawer */}
      <div
        className="app-shell-sidebar"
        style={{
          position: 'relative',
          zIndex: 50,
        }}
      >
        <Sidebar />
      </div>

      {/* Backdrop mobile */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="app-shell-backdrop"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Header mobile com hambúrguer */}
        <div
          className="app-shell-mobile-header"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #1F221F',
            background: '#000',
            position: 'sticky', top: 0, zIndex: 30,
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            style={{
              background: 'transparent',
              border: '1px solid #2A2E2A',
              borderRadius: 8,
              padding: '8px 10px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ width: 16, height: 2, background: '#fff', display: 'block', boxShadow: '0 5px 0 #fff, 0 -5px 0 #fff' }} />
          </button>
          <span style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: 1 }}>ATLAS</span>
          <span style={{ width: 38 }} /> {/* spacer pra centralizar título */}
        </div>

        {children}
      </main>

      {/* Estilos responsivos */}
      <style>{`
        @media (max-width: 768px) {
          .app-shell-sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            height: 100vh;
            transform: translateX(${drawerOpen ? '0' : '-100%'});
            transition: transform 0.25s ease;
            z-index: 50;
          }
          .app-shell-mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}
