import { CheckCircle2 } from 'lucide-react'

const GREEN = '#00EF61'

export function CadastroEnviado() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${GREEN}15`, border: `1px solid ${GREEN}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle2 size={32} color={GREEN} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Cadastro recebido!</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 32 }}>
          Nossa equipe analisará seu acesso em breve.<br />
          Você receberá um contato quando seu cadastro for aprovado.
        </p>
        <a
          href="/login"
          style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            padding: '12px 32px',
            borderRadius: 12,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          Voltar ao login
        </a>
      </div>
    </div>
  )
}
