import { useState } from 'react'

// ── Stripe price IDs ──────────────────────────────────────────────────────────

const PRICE_MENSAL = 'price_1TOpZxFVyybhsLH94Wr4qQGd'
const PRICE_ANUAL  = 'price_1TOpZxFVyybhsLH9ikBgu5Qj'

// ── Helpers ───────────────────────────────────────────────────────────────────

const green    = '#00EF61'
const red      = '#FF3B3B'
const text     = '#F4F5F3'
const textDim  = '#A6A8AB'
const textMute = '#6B6E6C'
const border   = '#1F221F'
const borderSt = '#2A2E2A'
const bgCard   = '#0F110F'
const bgRaised = '#0A0B0A'
const radius   = 14

const sans = "'Geist', -apple-system, system-ui, sans-serif"
const mono = "'Geist Mono', ui-monospace, monospace"

// ── CSS-in-JS global styles injected once ─────────────────────────────────────

const GLOBAL_CSS = `
  @keyframes marquee-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes ai-pulse {
    0%, 100% { opacity:1; transform:scale(1); }
    50%       { opacity:.5; transform:scale(1.25); }
  }
  @keyframes cursor-blink {
    50% { opacity: 0; }
  }
  .ls-faq-item summary { list-style: none; cursor: pointer; }
  .ls-faq-item summary::-webkit-details-marker { display: none; }
  .ls-faq-item summary:hover .ls-faq-q { color: ${green}; }
  .ls-faq-item[open] .ls-faq-chev {
    transform: rotate(45deg) !important;
    background: ${green} !important;
    color: #000 !important;
    border-color: ${green} !important;
  }
  .ls-btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .ls-btn-ghost:hover { background: #151815; border-color: #3A3E3A; }
  .ls-pain-card:hover { border-color: ${borderSt}; transform: translateY(-2px); }
  .ls-nav-link:hover { color: ${text}; }
  .ls-foot-link:hover { color: ${text}; }
  @media (max-width: 900px) {
    .ls-wrap { padding: 0 24px !important; }
    .ls-hero { padding: 56px 0 80px !important; }
    .ls-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .ls-hero-visual { min-height: 360px !important; order: -1 !important; }
    .ls-hero-img { max-width: 340px !important; }
    .ls-problem-grid { grid-template-columns: 1fr !important; }
    .ls-step { grid-template-columns: 1fr !important; gap: 30px !important; padding: 40px 0 !important; }
    .ls-step-copy-order { order: unset !important; }
    .ls-step-shot-order { order: unset !important; }
    .ls-ai-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .ls-plans { grid-template-columns: 1fr !important; }
    .ls-plan-monthly { order: 2 !important; }
    .ls-plan-annual  { order: 1 !important; }
    .ls-vs-table-row { grid-template-columns: 30% 35% 35% !important; }
    .ls-vs-table-row > div { font-size: 12px !important; padding: 8px !important; word-break: break-word !important; }
    .ls-vs-crit { background: ${bgRaised} !important; }
    .ls-section { padding: 72px 0 !important; }
    .ls-nav-links { display: none !important; }
    .ls-foot-grid { flex-direction: column !important; align-items: flex-start !important; }
  }
`

let cssInjected = false
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = GLOBAL_CSS
  document.head.appendChild(el)
  cssInjected = true
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BtnPrimary({ href, children, lg }: { href: string; children: React.ReactNode; lg?: boolean }) {
  return (
    <a
      href={href}
      className="ls-btn-primary"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: lg ? '18px 30px' : '14px 24px',
        borderRadius: 10, fontWeight: 600,
        fontSize: lg ? 17 : 15, letterSpacing: '-0.005em',
        transition: 'transform .15s, filter .15s',
        background: green, color: '#000',
        border: `1px solid ${green}`, textDecoration: 'none',
        whiteSpace: 'nowrap',
        fontFamily: sans,
      }}
    >
      {children}
    </a>
  )
}


function ArrowIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <details
      className="ls-faq-item"
      open={open}
      style={{ borderBottom: `1px solid ${border}`, padding: '4px 0' }}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary style={{ padding: '22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <span
          className="ls-faq-q"
          style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', transition: 'color .15s', fontFamily: sans, color: text }}
        >
          {q}
        </span>
        <span
          className="ls-faq-chev"
          style={{
            width: 24, height: 24, border: `1px solid ${borderSt}`, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: textDim,
            transition: 'transform .25s, background .15s, color .15s',
            fontFamily: mono, fontSize: 14, lineHeight: 1,
          }}
        >
          +
        </span>
      </summary>
      <div style={{ paddingBottom: 22, color: textDim, fontSize: 15.5, lineHeight: 1.6, maxWidth: 680, fontFamily: sans }}>
        {a}
      </div>
    </details>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function LandingSoftware() {
  injectCSS()

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  async function handleCheckout(priceId: string) {
    setCheckoutLoading(priceId)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      console.log('Resposta checkout:', res.status, data)
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido')
      window.location.href = data.url
    } catch (err) {
      alert('Erro: ' + (err instanceof Error ? err.message : String(err)))
      setCheckoutLoading(null)
    }
  }

  return (
    <div style={{ background: '#000', color: text, fontFamily: sans, fontSize: 16, lineHeight: 1.5, overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <div style={{ background: green, width: '100%' }}>
        <div className="ls-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '15px 48px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/blacksheep-logo.png" alt="Black Sheep" style={{ height: 60, display: 'block', flexShrink: 0 }} />
          <span style={{ fontFamily: sans, fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 900, letterSpacing: 4, color: '#000', whiteSpace: 'nowrap' as const }}>ATLAS</span>
          <span style={{ width: 1, height: 32, background: 'rgba(0,0,0,0.3)', flexShrink: 0, margin: '0 4px' }} />
          <span style={{ fontFamily: sans, fontSize: 'clamp(10px,1.2vw,13px)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#000', whiteSpace: 'nowrap' as const }}>BY BLACK SHEEP</span>
        </div>
      </div>

      {/* ── HERO ── */}
      <header className="ls-hero" style={{ position: 'relative', padding: '80px 0 120px', overflow: 'hidden' }}>
        {/* glow bg */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(600px 400px at 85% 10%, rgba(0,239,97,0.08), transparent 60%), radial-gradient(400px 300px at 10% 90%, rgba(0,239,97,0.04), transparent 60%)',
        }} />
        <div className="ls-wrap ls-hero-grid" style={{
          maxWidth: 1240, margin: '0 auto', padding: '0 40px',
          display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60,
          alignItems: 'center', position: 'relative', zIndex: 1,
        }}>
          {/* Copy */}
          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '6px 12px', border: '1px solid rgba(0,239,97,0.25)',
              background: 'rgba(0,239,97,0.10)', borderRadius: 100,
              fontFamily: mono, fontSize: 11, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: green, marginBottom: 28,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: green, boxShadow: `0 0 12px ${green}` }} />
              Gestão financeira <b style={{ marginLeft: 4 }}>sem planilha</b>
            </span>
            <h1 style={{
              fontFamily: sans, fontWeight: 700,
              fontSize: 'clamp(40px, 5.2vw, 72px)',
              lineHeight: 1, letterSpacing: '-0.035em',
              margin: 0, color: text,
            }}>
              Você{' '}
              <span style={{ textDecoration: 'line-through', textDecorationColor: red, textDecorationThickness: 4, color: textMute, fontWeight: 500 }}>
                não precisa
              </span>
              <br />aprender gestão<br />
              financeira{' '}
              <span style={{ color: green }}>do zero.</span>
            </h1>
            <p style={{ marginTop: 28, fontSize: 19, color: textDim, maxWidth: 520, lineHeight: 1.55, fontFamily: sans }}>
              Preencha seus <b style={{ color: text, fontWeight: 600 }}>gastos e receitas</b>. O ATLAS te devolve{' '}
              <b style={{ color: text, fontWeight: 600 }}>DRE, DFC e fluxo de caixa projetado</b> — tudo pronto. Nenhum curso. Nenhuma planilha. Nenhuma complicação.
            </p>
            <div style={{ marginTop: 48 }} />
          </div>
          {/* Visual */}
          <div className="ls-hero-visual" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 520 }}>
            <div style={{
              position: 'absolute', width: 420, height: 420,
              top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              background: 'radial-gradient(circle, rgba(0,239,97,0.14), transparent 60%)',
              zIndex: 1,
            }} />
            <div style={{ position: 'absolute', top: 20, left: 20, fontFamily: mono, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: textMute, zIndex: 3 }}>
              BLACK SHEEP<br />FINANCIAL OS — v1.0
            </div>
            <div style={{ position: 'absolute', top: 20, right: 20, textAlign: 'right', fontFamily: mono, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: textMute, zIndex: 3 }}>
              <b style={{ color: green, fontWeight: 500 }}>● LIVE</b><br />MAR / 2026
            </div>
            <img
              className="ls-hero-img"
              src="/atlas/atlas-hero.png"
              alt="ATLAS — a ovelha carrega o mundo financeiro do seu negócio"
              style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 2, filter: 'drop-shadow(0 40px 80px rgba(0,239,97,0.12))' }}
            />
          </div>
        </div>
      </header>

      {/* ── MARQUEE ── */}
      <div style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, background: bgRaised, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          display: 'flex', gap: 48, padding: '18px 0',
          animation: 'marquee-scroll 50s linear infinite',
          whiteSpace: 'nowrap', width: 'max-content',
        }}>
          {[...Array(2)].flatMap(() => [
            'DRE pronto', 'Fluxo de caixa projetado', 'DFC automático', 'Diagnóstico com IA',
            'Precificação de produto', 'Ponto de equilíbrio', 'Runway em tempo real', 'Alertas de retirada',
          ]).map((s, i) => (
            <span key={i} style={{
              fontFamily: mono, fontSize: 13, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: textDim,
              display: 'inline-flex', alignItems: 'center', gap: 48,
              marginRight: 48,
            }}>
              {s}
              <span style={{ color: green, fontSize: 14 }}>✱</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ── */}
      <section className="ls-section" style={{ padding: '100px 0', borderTop: `1px solid ${border}` }}>
        <div className="ls-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 60px' }}>
            <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: red, display: 'block', marginBottom: 16 }}>
              O problema
            </span>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 18px', fontFamily: sans }}>
              Você abriu o negócio pra vender, não pra virar contador.
            </h2>
            <p style={{ fontSize: 18, color: textDim, lineHeight: 1.55, fontFamily: sans, margin: 0 }}>
              Mas aí chega o final do mês e é sempre a mesma novela:
            </p>
          </div>
          <div className="ls-problem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 40 }}>
            {[
              { num: '01', h: 'A planilha\nninguém entende.', p: 'Você abriu aquela planilha que um amigo mandou, começou a preencher, mexeu numa fórmula errada e agora nada fecha.', chunk: '#REF! — #DIV/0! — #VALUE!' },
              { num: '02', h: 'O curso que\nvocê nunca termina.', p: 'Comprou um curso de gestão financeira achando que ia virar CFO. Parou na aula 3. Dashboard continua vazio.', chunk: 'Progresso: 12% concluído' },
              { num: '03', h: 'O extrato\nbancário confuso.', p: 'Você olha o saldo da conta e acha que tá tudo bem. Até o dia que a conta do fornecedor chega e o caixa não aguenta.', chunk: 'Saldo: R$ 0,00 — Boleto: venceu ontem' },
            ].map(({ num, h, p, chunk }) => (
              <div key={num} className="ls-pain-card" style={{
                background: bgCard, border: `1px solid ${border}`, borderRadius: radius,
                padding: 28, position: 'relative', transition: 'border-color .2s, transform .2s',
              }}>
                <div style={{ fontFamily: mono, fontSize: 11, color: textMute, letterSpacing: '0.14em', marginBottom: 18 }}>{num}</div>
                <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 10px', lineHeight: 1.2, fontFamily: sans }}>
                  {h.split('\n').map((line, i) => <span key={i}>{line}{i < h.split('\n').length - 1 && <br />}</span>)}
                </h3>
                <p style={{ color: textDim, fontSize: 14.5, margin: 0, lineHeight: 1.55, fontFamily: sans }}>{p}</p>
                <div style={{
                  marginTop: 18, paddingTop: 18, borderTop: `1px dashed ${borderSt}`,
                  fontFamily: mono, fontSize: 12, color: red, letterSpacing: '0.04em',
                }}>
                  {chunk}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 56, padding: 40,
            border: `1px solid ${green}`, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(0,239,97,0.06), transparent 70%)',
            textAlign: 'center',
          }}>
            <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: green, display: 'block', marginBottom: 12 }}>
              E a verdade é
            </span>
            <p style={{ fontSize: 'clamp(22px,2.4vw,30px)', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.3, fontFamily: sans }}>
              Você não precisa saber contabilidade. Você precisa{' '}
              <b style={{ color: green, fontWeight: 600 }}>dos números certos, na hora certa</b>, pra tomar decisão sem chutar.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="ls-section" style={{
        padding: '100px 0', background: bgRaised,
        borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`,
      }}>
        <div className="ls-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 60px' }}>
            <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: green, display: 'block', marginBottom: 16 }}>
              Como funciona
            </span>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 18px', fontFamily: sans }}>
              Três passos. Zero planilha.
            </h2>
            <p style={{ fontSize: 18, color: textDim, lineHeight: 1.55, fontFamily: sans, margin: 0 }}>
              Você lança o que entrou e o que saiu. O ATLAS faz o resto — da DRE ao fluxo de caixa projetado.
            </p>
          </div>
          {/* Steps */}
          {[
            {
              num: '01', h: 'Lance suas entradas e saídas.',
              p: 'Uma tela. Um botão. Você diz quanto entrou, quanto saiu, em que categoria — ou importa o extrato direto do banco.',
              bullets: ['Categorias prontas (CMV, marketing, salários, impostos…)', 'Lançamentos recorrentes automáticos', 'Importação de extrato OFX/CSV'],
              img: '/atlas/shot-overview.png', tag: 'Lançamentos', reverse: false,
            },
            {
              num: '02', h: 'ATLAS monta sua DRE, DFC e fluxo projetado.',
              p: 'No mesmo segundo em que você lança, a DRE é recalculada. O Demonstrativo de Fluxo de Caixa também. E o fluxo projetado puxa seus lançamentos futuros pra te mostrar o caixa daqui a 90 dias.',
              bullets: ['DRE gerencial pronta — margem bruta, contribuição, EBITDA', 'Fluxo de caixa realizado + projetado', 'Ponto de equilíbrio calculado no automático'],
              img: '/atlas/shot-dre.png', tag: 'DRE gerencial', reverse: true,
            },
            {
              num: '03', h: 'Entenda o negócio em uma tela.',
              p: 'A Visão Geral é a foto do mês: faturamento, lucro, margem, runway, alertas. Você bate o olho e sabe se o mês fechou no azul, no vermelho ou no limite.',
              bullets: ['KPIs que importam — não 40 gráficos enfeitando a tela', 'Alertas quando algo sai da linha (ex: retiradas > lucro)', 'Comparativo mês a mês, automático'],
              img: '/atlas/shot-entries.png', tag: 'Visão Geral', reverse: false,
            },
          ].map(({ num, h, p, bullets, img, tag, reverse }) => (
            <div key={num} className="ls-step" style={{
              display: 'grid',
              gridTemplateColumns: reverse ? '1.3fr 1fr' : '1fr 1.3fr',
              gap: 80, alignItems: 'center', padding: '50px 0',
              borderBottom: num !== '03' ? `1px solid ${border}` : 'none',
            }}>
              <div className={reverse ? 'ls-step-copy-order' : ''} style={{ maxWidth: 460, order: reverse ? 2 : 0 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, border: `1px solid ${borderSt}`, borderRadius: 10,
                  fontFamily: mono, fontSize: 14, fontWeight: 600, color: green, marginBottom: 20,
                }}>
                  {num}
                </div>
                <h3 style={{ fontSize: 'clamp(26px,2.8vw,36px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 16px', fontFamily: sans }}>{h}</h3>
                <p style={{ color: textDim, fontSize: 16.5, lineHeight: 1.6, margin: '0 0 20px', fontFamily: sans }}>{p}</p>
                <ul style={{ padding: 0, margin: '20px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {bullets.map(b => (
                    <li key={b} style={{ listStyle: 'none', display: 'flex', gap: 10, color: text, fontSize: 14.5, alignItems: 'flex-start', fontFamily: sans }}>
                      <span style={{ color: green, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={reverse ? 'ls-step-shot-order' : ''} style={{
                position: 'relative', border: `1px solid ${borderSt}`, borderRadius: radius,
                overflow: 'hidden', background: bgCard, order: reverse ? 1 : 0,
                boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,239,97,0.04)',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, transparent 70%, rgba(0,0,0,0.4))',
                  pointerEvents: 'none', zIndex: 1,
                }} />
                <span style={{
                  position: 'absolute', top: 16, left: 16,
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                  border: `1px solid ${borderSt}`, padding: '6px 10px', borderRadius: 6,
                  fontFamily: mono, fontSize: 10.5, letterSpacing: '0.14em',
                  color: green, textTransform: 'uppercase', zIndex: 2,
                }}>
                  {tag}
                </span>
                {num === '03'
                  ? <video autoPlay muted loop playsInline poster={img} style={{ width: '100%', display: 'block' }}><source src="/atlas-demo.mp4" type="video/mp4" /></video>
                  : <img src={img} alt={h} style={{ width: '100%', display: 'block' }} />
                }
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI DIAGNOSIS ── */}
      <section id="diagnostico" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(800px 500px at 50% 0%, rgba(0,239,97,0.06), transparent 60%)',
        }} />
        <div className="ls-wrap ls-ai-grid" style={{
          maxWidth: 1240, margin: '0 auto', padding: '0 40px',
          display: 'grid', gridTemplateColumns: '1fr 1.1fr',
          gap: 60, alignItems: 'center', position: 'relative', zIndex: 1,
        }}>
          {/* Copy */}
          <div>
            <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: green, display: 'block', marginBottom: 16 }}>
              Diagnóstico IA — incluso
            </span>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '18px 0 20px', fontFamily: sans }}>
              Um <span style={{ color: green }}>sócio financeiro</span> pra ler seus números.
            </h2>
            <p style={{ color: textDim, fontSize: 17, lineHeight: 1.6, margin: '0 0 16px', maxWidth: 500, fontFamily: sans }}>
              No final de cada mês, o ATLAS lê sua DRE, seu fluxo, sua tendência — e te entrega um diagnóstico em português claro: o que tá bom, o que tá péssimo, o que fazer.
            </p>
            <p style={{ color: textDim, fontSize: 17, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 500, fontFamily: sans }}>
              Sem jargão. Sem dashboard bonito pra inglês ver. Direto no ponto.
            </p>
            <BtnPrimary href="#precos">Ver um diagnóstico de verdade →</BtnPrimary>
          </div>
          {/* AI Card */}
          <div style={{
            background: bgCard, border: `1px solid ${borderSt}`, borderRadius: radius,
            padding: 28, fontFamily: mono, fontSize: 13, lineHeight: 1.6,
            position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          }}>
            {/* Gradient border */}
            <div style={{
              position: 'absolute', inset: -1, borderRadius: radius + 1, pointerEvents: 'none',
              background: 'linear-gradient(135deg, rgba(0,239,97,0.4), transparent 50%)',
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: 1,
            }} />
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${border}` }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: green, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: green, boxShadow: `0 0 10px ${green}`, animation: 'ai-pulse 1.6s ease-in-out infinite' }} />
                Diagnóstico gerado
              </span>
              <span style={{ color: textMute, fontSize: 10.5, letterSpacing: '0.12em' }}>Março / 2026 — 16:01</span>
            </div>
            {/* TL;DR */}
            <div style={{
              background: 'rgba(0,239,97,0.10)', borderLeft: `3px solid ${green}`,
              padding: '14px 16px', borderRadius: '0 8px 8px 0', marginBottom: 22,
              fontFamily: sans, fontSize: 14.5, lineHeight: 1.5, color: text,
            }}>
              Operação tá rentável, mas você se paga demais. Baixa as retiradas ou aumenta o faturamento — ou daqui 4 meses a conversa vai ser outra.
              <span style={{ display: 'inline-block', width: 7, height: 14, background: green, marginLeft: 2, verticalAlign: 'text-bottom', animation: 'cursor-blink 1s step-end infinite' }} />
            </div>
            {/* Metrics */}
            <h4 style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: green, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Diagnóstico geral</h4>
            <div style={{ color: textDim, fontFamily: mono, fontSize: 13, marginBottom: 6 }}>Margem de contribuição: <b style={{ color: green }}>74,7%</b> ✓ saudável</div>
            <div style={{ color: textDim, fontFamily: mono, fontSize: 13, marginBottom: 6 }}>Margem líquida: <b style={{ color: green }}>28,5%</b> ✓ dentro da faixa</div>
            <div style={{ color: textDim, fontFamily: mono, fontSize: 13, marginBottom: 16 }}>Runway: <b style={{ color: red }}>22 dias</b> ✗ abaixo do mínimo</div>
            {/* Critical */}
            <h4 style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: red, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pontos críticos</h4>
            <ul style={{ listStyle: 'none', margin: '0 0 16px', padding: 0 }}>
              {['Retiradas somam 62% do faturamento — acima do EBITDA em 7×.', 'Reserva de caixa abaixo de 2,5× custos fixos (R$ 30.858 ideal).'].map(item => (
                <li key={item} style={{ padding: '6px 0 6px 18px', position: 'relative', color: textDim, fontSize: 12.5 }}>
                  <span style={{ position: 'absolute', left: 0, top: 5, color: red }}>›</span>
                  {item}
                </li>
              ))}
            </ul>
            {/* Positive */}
            <h4 style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: green, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pontos positivos</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {['Despesas fixas sob controle (R$ 12.303 com R$ 9.000 de RH).', 'Faturamento cresceu 10,3% sobre fevereiro.'].map(item => (
                <li key={item} style={{ padding: '6px 0 6px 18px', position: 'relative', color: textDim, fontSize: 12.5 }}>
                  <span style={{ position: 'absolute', left: 0, top: 5, color: green }}>›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── COMPARE ── */}
      <section id="comparativo" className="ls-section" style={{
        padding: '100px 0', background: bgRaised,
        borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`,
      }}>
        <div className="ls-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 40px' }}>
            <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: textMute, display: 'block', marginBottom: 16 }}>
              ATLAS vs. o que você usa hoje
            </span>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0, fontFamily: sans }}>
              Uma coisa é planilha. Outra é gestão.
            </h2>
          </div>
          <div style={{ maxWidth: 1000, margin: '0 auto', border: `1px solid ${borderSt}`, borderRadius: radius, overflow: 'hidden', background: bgCard }}>
            {/* Header row */}
            <div className="ls-vs-table-row" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', alignItems: 'center', background: '#000', borderBottom: `1px solid ${borderSt}` }}>
              <div style={{ padding: '20px 24px', fontFamily: mono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: textMute }}>Critério</div>
              <div style={{ padding: '20px 24px', borderLeft: `1px solid ${border}`, fontFamily: mono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: textMute }}>Planilha / caderno</div>
              <div style={{ padding: '20px 24px', borderLeft: `1px solid ${border}`, fontFamily: mono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: green, fontWeight: 600 }}>ATLAS</div>
            </div>
            {/* Data rows */}
            {[
              { crit: 'DRE gerencial', planilha: 'Você monta, sem saber se fechou', atlas: 'Pronta a cada lançamento' },
              { crit: 'Fluxo de caixa projetado', planilha: 'Só vê o passado', atlas: '90 dias à frente, automático' },
              { crit: 'Diagnóstico mensal', planilha: 'Você que interpreta (e chuta)', atlas: 'IA lê e te fala o que fazer' },
              { crit: 'Precificação de produto', planilha: 'Cálculo manual, sempre furado', atlas: 'Ferramenta dedicada' },
              { crit: 'Curva de aprendizado', planilha: 'Semanas (e uns cursos)', atlas: '5 minutos' },
              { crit: 'Alertas de risco (retirada, runway)', planilha: 'Descobre quando estoura', atlas: 'Avisa antes de virar problema' },
            ].map(({ crit, planilha, atlas: atlasText }, i) => (
              <div key={crit} className="ls-vs-table-row" style={{
                display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr',
                alignItems: 'center', borderBottom: i < 5 ? `1px solid ${border}` : 'none',
              }}>
                <div className="ls-vs-crit" style={{ padding: '20px 24px', fontSize: 14.5, fontWeight: 500, color: text, fontFamily: sans }}>{crit}</div>
                <div style={{ padding: '20px 24px', fontSize: 14.5, color: textMute, borderLeft: `1px solid ${border}`, fontFamily: sans }}>
                  <span style={{ color: red, marginRight: 8, fontWeight: 700 }}>✕</span>{planilha}
                </div>
                <div style={{ padding: '20px 24px', fontSize: 14.5, color: text, borderLeft: `1px solid ${border}`, background: 'rgba(0,239,97,0.10)', fontFamily: sans }}>
                  <span style={{ color: green, marginRight: 8, fontWeight: 700 }}>✓</span>{atlasText}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precos" style={{ padding: '120px 0' }}>
        <div className="ls-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 60px' }}>
            <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: green, display: 'block', marginBottom: 16 }}>
              Preço
            </span>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 18px', fontFamily: sans }}>
              Escolha como quer começar.
            </h2>
            <p style={{ fontSize: 18, color: textDim, lineHeight: 1.55, fontFamily: sans, margin: 0 }}>
              Mensal pra testar sem compromisso. Anual pra quem já decidiu — e quer pagar metade.
            </p>
          </div>
          <div className="ls-plans" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 960, margin: '0 auto' }}>
            {/* Mensal */}
            <div className="ls-plan-monthly" style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 20, padding: 36, position: 'relative' }}>
              <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: textMute }}>Mensal</div>
              <h3 style={{ fontSize: 24, fontWeight: 600, margin: '6px 0 28px', letterSpacing: '-0.01em', fontFamily: sans }}>Pra começar agora</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <div style={{ fontFamily: mono, fontSize: 56, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: text }}>
                  <span style={{ fontSize: 20, color: textMute, marginRight: 6 }}>R$</span>99
                </div>
                <div style={{ color: textDim, fontSize: 14, fontFamily: sans }}>/ mês</div>
              </div>
              <div style={{ minHeight: 40, marginBottom: 28 }} />
              <button
                onClick={() => handleCheckout(PRICE_MENSAL)}
                disabled={checkoutLoading !== null}
                style={{
                  display: 'block', width: '100%', padding: '13px 24px',
                  border: `1px solid ${border}`, borderRadius: 10, background: 'transparent',
                  color: text, fontFamily: sans, fontWeight: 600, fontSize: 15,
                  cursor: checkoutLoading ? 'wait' : 'pointer', letterSpacing: '0.01em',
                  opacity: checkoutLoading ? 0.7 : 1, transition: 'opacity 0.15s',
                }}
              >
                {checkoutLoading === PRICE_MENSAL ? 'Aguarde...' : 'Assinar mensal'}
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Acesso completo ao ATLAS', 'DRE, DFC e fluxo projetado automáticos', 'Diagnóstico IA — 1 crédito por mês', 'Suporte por e-mail', 'Cancela quando quiser'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, color: text, fontSize: 14.5, alignItems: 'flex-start', lineHeight: 1.5, fontFamily: sans }}>
                    <span style={{ color: green, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Anual (featured) */}
            <div className="ls-plan-annual" style={{
              background: `linear-gradient(180deg, rgba(0,239,97,0.04), transparent 40%), ${bgCard}`,
              border: `2px solid ${green}`, borderRadius: 20, padding: 36, position: 'relative',
              boxShadow: `0 0 0 1px ${green}, 0 30px 80px rgba(0,239,97,0.08)`,
            }}>
              <div style={{
                position: 'absolute', top: -12, right: 24,
                background: green, color: '#000',
                fontFamily: mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '6px 12px', borderRadius: 100, fontWeight: 700,
              }}>MAIS ESCOLHIDO</div>
              <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: green }}>Anual</div>
              <h3 style={{ fontSize: 24, fontWeight: 600, margin: '6px 0 28px', letterSpacing: '-0.01em', fontFamily: sans }}>Pra quem já decidiu</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <div style={{ fontFamily: mono, fontSize: 56, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: text }}>
                  <span style={{ fontSize: 20, color: textMute, marginRight: 6 }}>R$</span>49,91
                </div>
                <div style={{ color: textDim, fontSize: 14, fontFamily: sans }}>/ mês</div>
              </div>
              <div style={{ color: textMute, fontFamily: mono, fontSize: 12, letterSpacing: '0.04em', marginBottom: 4 }}>R$ 599 cobrados 1× ao ano</div>
              <div style={{ color: green, fontFamily: mono, fontSize: 12, letterSpacing: '0.04em', marginBottom: 28 }}>Economize R$ 589/ano vs. mensal</div>
              <button
                onClick={() => handleCheckout(PRICE_ANUAL)}
                disabled={checkoutLoading !== null}
                style={{
                  display: 'block', width: '100%', padding: '13px 24px',
                  border: 'none', borderRadius: 10, background: green,
                  color: '#000', fontFamily: sans, fontWeight: 700, fontSize: 15,
                  cursor: checkoutLoading ? 'wait' : 'pointer', letterSpacing: '0.01em',
                  opacity: checkoutLoading ? 0.7 : 1, transition: 'opacity 0.15s',
                }}
              >
                {checkoutLoading === PRICE_ANUAL ? 'Aguarde...' : 'Assinar anual'}
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { f: 'Tudo do plano mensal', bold: false },
                  { f: 'Pague 6 meses, use 12', bold: true },
                  { f: 'Diagnóstico IA — 2 créditos por mês', bold: false },
                  { f: 'Suporte prioritário (resposta em até 24h)', bold: false },
                  { f: 'Acesso antecipado a novas ferramentas', bold: false },
                ].map(({ f, bold }) => (
                  <li key={f} style={{ display: 'flex', gap: 10, color: text, fontSize: 14.5, alignItems: 'flex-start', lineHeight: 1.5, fontFamily: sans, fontWeight: bold ? 600 : 400 }}>
                    <span style={{ color: green, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
                <li style={{ display: 'flex', gap: 10, fontSize: 14.5, alignItems: 'flex-start', lineHeight: 1.5, fontFamily: sans, color: green, fontWeight: 500, marginTop: 6, paddingTop: 14, borderTop: `1px dashed ${borderSt}` }}>
                  <span style={{ flexShrink: 0 }}>⭐</span>1 convite para a Mentoria em Grupo Black Sheep
                </li>
                <li style={{ display: 'flex', gap: 10, fontSize: 14.5, alignItems: 'flex-start', lineHeight: 1.5, fontFamily: sans, color: green, fontWeight: 500 }}>
                  <span style={{ flexShrink: 0 }}>⭐</span>Acesso ao Programa Domínio Empresarial da Black Sheep
                </li>
              </ul>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 40, color: textMute, fontFamily: mono, fontSize: 12, letterSpacing: '0.08em' }}>
            PAGAMENTO SEGURO — PIX, CARTÃO — NOTA FISCAL EMITIDA AUTOMATICAMENTE
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="ls-section" style={{
        padding: '100px 0', background: bgRaised,
        borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`,
      }}>
        <div className="ls-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 40px' }}>
            <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: textMute, display: 'block', marginBottom: 16 }}>
              FAQ
            </span>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0, fontFamily: sans }}>
              Perguntas que chegam direto.
            </h2>
          </div>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <FaqItem defaultOpen q="Eu não entendo nada de contabilidade. Consigo usar?" a="Essa é literalmente a ideia. Você lança o que entrou e o que saiu — o ATLAS monta DRE, DFC e fluxo projetado sozinho. Não precisa saber o que é margem de contribuição pra usar. O sistema explica quando for relevante." />
            <FaqItem q="Como funciona o diagnóstico com IA?" a='Ao fechar o mês, você clica em "Gerar diagnóstico". A IA lê toda a sua DRE, fluxo de caixa, histórico e tendência — e devolve um texto direto em português: o que tá bom, o que tá crítico, o que fazer. Cada plano vem com créditos de diagnóstico mensais.' />
            <FaqItem q="Posso importar dados do banco?" a="Sim. Você pode importar extratos em OFX ou CSV e categorizar em lote. Lançamentos recorrentes (aluguel, salários, assinaturas) você configura uma vez e o ATLAS repete." />
            <FaqItem q="Preciso assinar contrato ou fidelidade?" a="Não. No plano mensal, você cancela a qualquer momento. No plano anual, se desistir nos primeiros 7 dias, devolvemos 100% do valor." />
            <FaqItem q="Como funciona o convite para a mentoria Black Sheep?" a="Assinou o plano anual? Entra uma vez na Mentoria em Grupo Black Sheep — encontro ao vivo onde a gente destrincha gestão financeira de negócio real com base em casos dos próprios alunos. Não é curso gravado, é mentoria mesmo." />
            <FaqItem q="Meus dados ficam seguros?" a="Ficam. Criptografia em trânsito e em repouso, backup diário, autenticação por e-mail verificado. Você é o dono dos seus dados — pode exportar tudo em CSV/XLSX a qualquer momento." />
            <FaqItem q="O ATLAS substitui meu contador?" a="Não. O ATLAS é gestão financeira — te mostra a saúde do negócio pra você tomar decisão. Seu contador cuida da parte fiscal e tributária. Os dois andam juntos. Inclusive, você pode exportar relatórios do ATLAS pra mandar pro contador." />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '140px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(700px 500px at 50% 50%, rgba(0,239,97,0.08), transparent 60%)',
        }} />
        <div className="ls-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(42px,6vw,86px)', fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 0.95,
            margin: '0 auto 22px', maxWidth: 900, fontFamily: sans,
          }}>
            Chega de<br />gerir no <span style={{ color: green, fontStyle: 'normal' }}>achismo</span>.
          </h2>
          <p style={{ color: textDim, fontSize: 19, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.55, fontFamily: sans }}>
            Lance os números. Deixe o ATLAS pensar. Tome decisão com dado — não com fé.
          </p>
          <BtnPrimary href="#precos" lg>Assinar o ATLAS agora <ArrowIcon size={18} /></BtnPrimary>
        </div>
      </section>


    </div>
  )
}
