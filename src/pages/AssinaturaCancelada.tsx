import { XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const GREEN = '#80EF00'

export function AssinaturaCancelada() {
  const { signOut } = useAuth()

  function handleReativar() {
    window.location.href = '/#precos'
  }

  async function handleSignOut() {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <XCircle size={32} color="#ef4444" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Sua assinatura foi cancelada</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 32 }}>
          Pra continuar usando o ATLAS, é só reativar.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleReativar}
            style={{
              background: GREEN,
              border: 'none',
              color: '#000',
              padding: '12px 32px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reativar assinatura
          </button>
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
    </div>
  )
}
