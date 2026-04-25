export function AssinaturaConfirmada() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#F4F5F3', maxWidth: 480, padding: '0 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 24, color: '#80EF00' }}>✓</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' }}>Assinatura confirmada!</h1>
        <p style={{ color: '#A6A8AB', fontSize: 18, lineHeight: 1.6, marginBottom: 40 }}>
          Seu acesso será liberado em instantes.
        </p>
        <a href="/login" style={{ display: 'inline-block', background: '#80EF00', color: '#000', fontWeight: 700, padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontSize: 15 }}>
          Fazer login
        </a>
      </div>
    </div>
  )
}
