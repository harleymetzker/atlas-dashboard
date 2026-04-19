import { XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function AcessoBloqueado() {
  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <XCircle size={32} color="#ef4444" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Acesso bloqueado</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 32 }}>
          Seu acesso foi bloqueado.<br />
          Entre em contato com o suporte para mais informações.
        </p>
        <button
          onClick={handleSignOut}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            padding: '12px 32px',
            borderRadius: 12,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Sair
        </button>
      </div>
    </div>
  )
}
