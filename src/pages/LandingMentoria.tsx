import { useState } from 'react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:         '#000000',
  bgRaised:   '#0A0B0A',
  bgCard:     '#0F110F',
  bgHover:    '#151815',
  border:     '#1F221F',
  borderSt:   '#2A2E2A',
  text:       '#F4F5F3',
  textDim:    '#A6A8AB',
  textMute:   '#6B6E6C',
  green:      '#00EF61',
  greenSoft:  'rgba(0,239,97,0.10)',
  greenDark:  '#005C26',
  red:        '#FF3B3B',
  redSoft:    'rgba(255,59,59,0.10)',
  radius:     14,
  radiusLg:   20,
}
const sans = "'Geist', system-ui, -apple-system, sans-serif"
const mono = "'Geist Mono', ui-monospace, monospace"

// ── Global CSS (injected once) ────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes lm-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(0,239,97,0.5); }
    50%      { box-shadow: 0 0 0 8px rgba(0,239,97,0); }
  }
  @keyframes lm-scroll { to { transform: translateX(-50%); } }

  .lm-btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .lm-btn-ghost:hover   { background: ${C.bgHover}; border-color: ${C.borderSt}; }
  .lm-nav-a:hover       { color: ${C.text}; }
  .lm-p-card:hover      { transform: translateY(-2px); }
  .lm-module:hover      { border-color: ${C.borderSt}; }
  .lm-footer-link:hover { color: ${C.green}; }

  .lm-faq details { border-bottom: 1px solid ${C.border}; padding: 22px 0; }
  .lm-faq details:first-child { border-top: 1px solid ${C.border}; }
  .lm-faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 20px; font-size: 18px; font-weight: 500; letter-spacing: -0.01em; color: ${C.text}; }
  .lm-faq summary::-webkit-details-marker { display: none; }
  .lm-faq summary .sign { width: 28px; height: 28px; border-radius: 50%; border: 1px solid ${C.borderSt}; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; color: ${C.textDim}; transition: transform .2s, color .2s, border-color .2s, background .2s; flex-shrink: 0; }
  .lm-faq details[open] summary .sign { transform: rotate(45deg); color: ${C.green}; border-color: ${C.green}; background: ${C.greenSoft}; }
  .lm-faq .ans { margin-top: 16px; font-size: 15.5px; line-height: 1.6; color: ${C.textDim}; max-width: 720px; font-family: ${sans}; }

  @media (max-width: 960px) {
    .lm-page { padding-left: 24px !important; padding-right: 24px !important; }
    .lm-nav-inner { padding-left: 24px !important; padding-right: 24px !important; }
    .lm-nav-links { display: none !important; }
    .lm-hero-inner, .lm-cases, .lm-promise-grid, .lm-deliv-layout,
    .lm-problem-grid, .lm-filter-grid, .lm-obj-grid, .lm-app-preview,
    .lm-steps, .lm-invest, .lm-mentor, .lm-footer-inner {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }
    .lm-invest-wrap { padding: 36px !important; }
    .lm-timeline-card { position: static !important; }
    .lm-section { padding: 72px 0 !important; }
  }

  @media (max-width: 768px) {
    .lm-hero-visual { display: none !important; }
    .lm-nav-cta    { display: none !important; }
    .lm-marquee    { display: none !important; }
    .lm-hero-pill  { display: none !important; }

    .lm-module {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 6px 12px !important;
      align-items: flex-start !important;
    }
    .lm-module-id      { order: 0; flex: 0 0 auto; }
    .lm-module-badge   { order: 1; flex: 0 0 auto; }
    .lm-module-content { order: 2; flex: 1 1 100%; min-width: 0; }

    .lm-metrics-grid { grid-template-columns: 1fr !important; overflow: visible !important; }
    .lm-metrics-cell { min-height: 70px; }
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

// ── Shared primitives ─────────────────────────────────────────────────────────
function Page({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="lm-page" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px', ...style }}>
      {children}
    </div>
  )
}

function SecHead({ kicker, kickerRed, title, sub, children }: {
  kicker: string; kickerRed?: boolean; title: React.ReactNode; sub?: string; children?: React.ReactNode
}) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto 56px' }}>
      <div style={{ fontFamily: sans, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: kickerRed ? C.red : C.green, marginBottom: 18 }}>
        {kicker}
      </div>
      <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: '0 0 16px', fontFamily: sans }}>
        {title}
      </h2>
      {sub && <p style={{ fontSize: 18, color: C.textDim, lineHeight: 1.5, maxWidth: 680, margin: '0 auto', fontFamily: sans }}>{sub}</p>}
      {children}
    </div>
  )
}

function BtnPrimary({ href, children, lg }: { href: string; children: React.ReactNode; lg?: boolean }) {
  return (
    <a href={href} className="lm-btn-primary" style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: lg ? '16px 26px' : '12px 20px',
      borderRadius: 10, fontSize: lg ? 15 : 14, fontWeight: 600,
      textDecoration: 'none', transition: 'filter .15s, transform .15s',
      background: C.green, color: '#041A0B', whiteSpace: 'nowrap', fontFamily: sans,
    }}>
      {children}
    </a>
  )
}


function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <details open={open} onToggle={e => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>
        <span style={{ fontFamily: sans }}>{q}</span>
        <span className="sign">+</span>
      </summary>
      <div className="ans">{a}</div>
    </details>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export function LandingMentoria() {
  injectCSS()

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: sans, fontSize: 16, lineHeight: 1.5, overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.border}` }}>
        <div className="lm-nav-inner" style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 40px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 40, alignItems: 'center' }}>
          <a className="lm-nav-a" href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: C.text }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/lp/sheep-logo.png" alt="" style={{ width: 26, height: 26 }} />
            </span>
            <span style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 700, letterSpacing: '0.02em', fontSize: 15 }}>ATLAS</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.textMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>Programa · by Black Sheep</div>
            </span>
          </a>
          <div className="lm-nav-links" style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
            {[['#diagnostico','Diagnóstico'],['#cases','Cases'],['#programa','O Programa'],['#investimento','Investimento'],['#faq','FAQ']].map(([href, label]) => (
              <a key={href} href={href} className="lm-nav-a" style={{ color: C.textDim, textDecoration: 'none', fontSize: 14, transition: 'color .15s', fontFamily: sans }}>{label}</a>
            ))}
          </div>
          <span className="lm-nav-cta"><BtnPrimary href="#aplicar">Aplicar <span style={{ fontFamily: mono }}>→</span></BtnPrimary></span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '80px 0 96px', overflow: 'hidden' }}>
        <div style={{ content: '', position: 'absolute', inset: 0, background: 'radial-gradient(60% 60% at 15% 20%, rgba(0,239,97,0.08), transparent 60%), radial-gradient(50% 50% at 90% 80%, rgba(0,239,97,0.06), transparent 60%)', pointerEvents: 'none' }} />
        <Page>
          <div className="lm-hero-inner" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div className="lm-hero-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999, border: `1px solid ${C.greenDark}`, background: C.greenSoft, color: C.green, fontFamily: mono, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 28 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, animation: 'lm-pulse 1.6s ease-in-out infinite' }} />
                Programa 001 · 6 meses · Implementação pessoal
              </div>
              <h2 style={{ fontSize: 'clamp(28px,3.6vw,52px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: '0 0 24px', fontFamily: sans }}>
                Sua empresa fatura bem. Mas você não faz ideia de quanto realmente sobra.
              </h2>
              <p style={{ fontSize: 19, lineHeight: 1.5, color: C.textDim, maxWidth: 560, margin: '0 0 32px', fontFamily: sans }}>
                Em 6 meses, você implementa um modelo de gestão que mostra pra onde vai cada real que entra — e garante que seu crescimento vire lucro.
              </p>
              <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', fontFamily: mono, fontSize: 12, color: C.textMute, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {['Controle em 30 dias', 'Mentoria 1:1 mensal', 'Software ATLAS incluído', 'Lucro previsível em 6 meses'].map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: C.green, fontWeight: 600 }}>✓</span>{s}
                  </span>
                ))}
              </div>
            </div>
            <div className="lm-hero-visual" style={{ position: 'relative' }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.textMute, letterSpacing: '0.2em', textTransform: 'uppercase', position: 'absolute', top: 8, left: 0 }}>BS / 001</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.textMute, letterSpacing: '0.2em', textTransform: 'uppercase', position: 'absolute', top: 8, right: 0, textAlign: 'right' }}>GESTÃO · FINANÇAS<br />PROCESSOS · LUCRO</div>
              <div style={{ position: 'absolute', inset: '10% 5%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,239,97,0.30), transparent 70%)', filter: 'blur(30px)' }} />
              <img src="/lp/atlas-hero.png" alt="Mascote Atlas da Black Sheep" style={{ position: 'relative', width: '100%', height: 'auto', filter: 'drop-shadow(0 30px 60px rgba(0,239,97,0.25))' }} />
            </div>
          </div>
        </Page>
      </section>

      {/* ── MARQUEE ── */}
      <div className="lm-marquee" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.bgRaised, overflow: 'hidden', padding: '18px 0' }}>
        <div className="lm-marquee-track" style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', animation: 'lm-scroll 25s linear infinite', fontFamily: mono, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim }}>
          {[...Array(2)].map((_, ri) => (
            <span key={ri}>
              {['DRE gerencial','Fluxo de caixa projetado','Margem real por produto','CAC por canal','Ponto de equilíbrio','Runway','Teto de retirada','Precificação lucrativa','Auditoria de perda invisível','Decisão com dado real'].map((s, i) => (
                <span key={i}>{s}<span style={{ color: C.green, margin: '0 12px' }}>✱</span></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── DIAGNÓSTICO §01 ── */}
      <section id="diagnostico" className="lm-section" style={{ padding: '100px 0' }}>
        <Page>
          <SecHead
            kicker="§ 01 · O diagnóstico"
            title={<>O padrão é sempre o mesmo — <em style={{ fontStyle: 'normal', color: C.green }}>e você não é exceção.</em></>}
            sub="O modelo de negócio do digital é simples: aumenta faturamento, fica feliz, repete. Ninguém olha pra margem. Ninguém sabe quanto sobra. E quando o caixa aperta, a solução é sempre a mesma — vender mais. Até o dia que vender mais não resolve. Porque nunca resolveu."
          >
            {/* Crença limitante */}
            <p style={{ fontSize: 20, color: C.text, fontWeight: 500, textAlign: 'center', maxWidth: 700, margin: '32px auto 0', lineHeight: 1.4, fontFamily: sans }}>
              "Gestão no digital é complicada demais."<br />
              <span style={{ color: C.textDim, fontSize: 16, fontWeight: 400 }}>Não é. Ninguém simplificou pra você — até agora.</span>
            </p>
          </SecHead>

          <div className="lm-problem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 56 }}>
            {/* Card 01 — updated copy */}
            <div className="lm-p-card" style={{ background: C.bgCard, border: '1px solid rgba(239,68,68,0.2)', borderRadius: C.radius, padding: 28, transition: 'border-color .2s, transform .2s' }}>
              <div style={{ fontFamily: mono, fontSize: 13, color: C.textMute, letterSpacing: '0.1em', marginBottom: 24 }}>01 — Sintoma</div>
              <h3 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 16px', fontFamily: sans }}>Sempre tem um funil novo. Nunca tem lucro novo.</h3>
              <p style={{ color: C.textDim, fontSize: 14.5, margin: '0 0 20px', fontFamily: sans }}>Novo guru, nova estratégia, novo recorde de faturamento. E o caixa? Continua no mesmo lugar. Você tá cansado disso — mesmo que ainda não admita.</p>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.red, background: C.redSoft, padding: '10px 12px', borderRadius: 8, display: 'inline-block', letterSpacing: '0.06em' }}>FLUXO = 0.00 → INDEFINIDO</span>
            </div>
            {/* Card 02 — unchanged */}
            <div className="lm-p-card" style={{ background: C.bgCard, border: '1px solid rgba(239,68,68,0.2)', borderRadius: C.radius, padding: 28, transition: 'border-color .2s, transform .2s' }}>
              <div style={{ fontFamily: mono, fontSize: 13, color: C.textMute, letterSpacing: '0.1em', marginBottom: 24 }}>02 — Sintoma</div>
              <h3 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 16px', fontFamily: sans }}>CPA sobe todo mês. Margem aperta todo mês.</h3>
              <p style={{ color: C.textDim, fontSize: 14.5, margin: '0 0 20px', fontFamily: sans }}>A conta do tráfego nunca fecha. A solução é sempre "botar mais verba pra ver se melhora" — e a gordura some.</p>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.red, background: C.redSoft, padding: '10px 12px', borderRadius: 8, display: 'inline-block', letterSpacing: '0.06em' }}>MARGEM: ??.??%</span>
            </div>
            {/* Card 03 — updated copy */}
            <div className="lm-p-card" style={{ background: C.bgCard, border: '1px solid rgba(239,68,68,0.2)', borderRadius: C.radius, padding: 28, transition: 'border-color .2s, transform .2s' }}>
              <div style={{ fontFamily: mono, fontSize: 13, color: C.textMute, letterSpacing: '0.1em', marginBottom: 24 }}>03 — Sintoma</div>
              <h3 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 16px', fontFamily: sans }}>Escalou o faturamento. Escalou o caos junto.</h3>
              <p style={{ color: C.textDim, fontSize: 14.5, margin: '0 0 20px', fontFamily: sans }}>Mais gente, mais ferramenta, mais custo. E a margem? Comprimiu. Quanto maior o faturamento, pior a situação financeira. Isso não é crescimento — é uma bomba-relógio.</p>
              <span style={{ fontFamily: mono, fontSize: 12, color: C.red, background: C.redSoft, padding: '10px 12px', borderRadius: 8, display: 'inline-block', letterSpacing: '0.06em' }}>LUCRO REAL: ERR#</span>
            </div>
          </div>

          {/* Verdict — updated copy */}
          <div style={{ marginTop: 40, border: `1px solid ${C.greenDark}`, background: 'linear-gradient(180deg,rgba(0,239,97,0.08),rgba(0,239,97,0.02))', padding: 40, borderRadius: C.radiusLg, textAlign: 'center' }}>
            <h3 style={{ fontSize: 28, lineHeight: 1.25, fontWeight: 500, letterSpacing: '-0.02em', margin: 0, fontFamily: sans }}>
              Enquanto todo mundo te ensina a vender mais, ninguém te ensinou a parar de perder o que já ganha. O ATLAS é o oposto de tudo que o digital te ensinou.
            </h3>
          </div>
        </Page>
      </section>

      {/* ── CASES §02 ── */}
      <section id="cases" className="lm-section" style={{ padding: '100px 0', background: C.bgRaised }}>
        <Page>
          <SecHead
            kicker="§ 02 · Cases reais"
            title={<>Duas empresas. Mesmo problema. <em style={{ fontStyle: 'normal', color: C.green }}>Dinheiro que já existia — só não aparecia.</em></>}
          />
          <p style={{ fontSize: 18, color: C.textDim, textAlign: 'center', maxWidth: 680, margin: '0 auto 40px', lineHeight: 1.55, fontFamily: sans }}>
            Esses são dois das 100+ outras empresas que passaram pela Black Sheep. O padrão é o mesmo — e provavelmente é o seu também.
          </p>
          <div className="lm-cases" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              {
                n: 'CASO 01', seg: 'E-commerce · moda feminina',
                q: '"Nunca sobrava. Recorri a banco mais de uma vez pra cobrir o caixa."',
                channels: 'SHEIN · TIKTOK SHOP · MERCADO LIVRE · SHOPEE',
                metrics: [
                  { k: 'Faturamento anual', v: 'R$ 7.000.000', color: C.text },
                  { k: 'Margem real (auditoria)', v: '18 – 23%', color: C.green },
                  { k: 'Perda invisível', v: '6%', u: 'do faturamento', color: C.red },
                  { k: 'Dinheiro aparecer', v: '3 – 4 meses', color: C.text },
                ],
                narr: 'saímos de campanhas que queimavam margem, reprecificamos linhas de produto com dados reais e montamos plano de capital de giro.',
                out: 'Não vendeu mais. Não cortou marketplace. Não demitiu ninguém. ',
                outGreen: 'Parou de perder o que já ganhava.',
              },
              {
                n: 'CASO 02', seg: 'Mentorias · infoprodutos',
                q: '"Bateu recorde. No mês seguinte, precisou de empréstimo."',
                channels: 'LANÇAMENTO · PERPÉTUO · ALTA MÍDIA',
                metrics: [
                  { k: 'Mês de escala', v: 'R$ 600.000', color: C.text },
                  { k: 'Margem real', v: '< 10%', color: C.red },
                  { k: 'CAC', v: 'Sem teto', color: C.text },
                  { k: 'Retiradas', v: 'Sem critério', color: C.text },
                ],
                narr: 'gestão financeira, teto de retirada, CAC máximo por produto, metas de margem mínima.',
                out: 'Pela primeira vez, o dono sabia — com número na mão — se o mês foi bom ou ruim. ',
                outGreen: 'Antes de abrir o extrato.',
              },
            ].map(({ n, seg, q, channels, metrics, narr, out, outGreen }) => (
              <article key={n} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radiusLg, padding: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textMute, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.green }}>{n}</span>
                  <span>{seg}</span>
                </div>
                <h3 style={{ fontSize: 22, lineHeight: 1.25, fontWeight: 500, letterSpacing: '-0.015em', margin: '0 0 8px', fontFamily: sans }}>{q}</h3>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.textMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 28 }}>{channels}</div>
                <div className="lm-metrics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: C.border, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
                  {metrics.map(m => (
                    <div key={m.k} className="lm-metrics-cell" style={{ background: C.bg, padding: '18px 20px' }}>
                      <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textMute, marginBottom: 8 }}>{m.k}</div>
                      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: m.color }}>
                        {m.v}
                        {'u' in m && <span style={{ fontFamily: mono, fontSize: 11, color: C.textMute, marginLeft: 6, letterSpacing: '0.08em' }}>{(m as { u: string }).u}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.55, color: C.textDim, fontFamily: sans }}>
                  <strong style={{ color: C.text, fontWeight: 500 }}>O que {n === 'CASO 01' ? 'fizemos' : 'implementamos'} —</strong> {narr}
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, color: C.text, fontWeight: 500 }}>
                    {out}<strong style={{ color: C.green }}>{outGreen}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Page>
      </section>

      {/* ── PROMESSA §03 — updated title ── */}
      <section id="promessa" className="lm-section" style={{ padding: '100px 0' }}>
        <Page>
          <SecHead
            kicker="§ 03 · A promessa"
            title={<>Em 30 dias, controle total. Em 6 meses, <em style={{ fontStyle: 'normal', color: C.green }}>outra empresa.</em></>}
          />
          <div className="lm-promise-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginTop: 40 }}>
            {[
              { n: '01', h: <>"Antes do dia 10, <em style={{fontStyle:'normal',color:C.green}}>sei quanto vai sobrar.</em>"</>, p: 'Fluxo de caixa, DRE e projeção rodando semanalmente. Você antecipa o mês em vez de torcer por ele.' },
              { n: '02', h: <>"Sei minha <em style={{fontStyle:'normal',color:C.green}}>margem real</em> por produto, canal e campanha."</>, p: 'Precificação com dado real. Identificação cirúrgica de onde o dinheiro está vazando.' },
              { n: '03', h: <>"Toda decisão de escala <em style={{fontStyle:'normal',color:C.green}}>é baseada em número.</em>"</>, p: 'CAC máximo por produto, teto de retirada, metas de margem. A operação para de girar no feeling.' },
              { n: '04', h: <>"<em style={{fontStyle:'normal',color:C.green}}>Não virei especialista em finanças.</em>"</>, p: 'O software roda por você e eu implemento junto. Você aprende a ler e decidir — não a operar planilha.' },
            ].map(({ n, h, p }) => (
              <div key={n} style={{ background: 'rgba(255,255,255,0.02)', border: 'none', borderRadius: C.radius, padding: '28px 30px', display: 'grid', gridTemplateColumns: '48px 1fr', gap: 20 }}>
                <div style={{ fontFamily: mono, fontSize: 13, color: C.green, letterSpacing: '0.08em', paddingTop: 4 }}>{n}</div>
                <div>
                  <h4 style={{ fontSize: 19, lineHeight: 1.25, fontWeight: 500, letterSpacing: '-0.01em', margin: '0 0 8px', color: C.text, fontFamily: sans }}>{h}</h4>
                  <p style={{ color: C.textDim, fontSize: 14.5, lineHeight: 1.55, margin: 0, fontFamily: sans }}>{p}</p>
                </div>
              </div>
            ))}
          </div>
        </Page>
      </section>

      {/* ── PROGRAMA §04 ── */}
      <section id="programa" className="lm-section" style={{ padding: '100px 0', background: C.bgRaised }}>
        <Page>
          <SecHead
            kicker="§ 04 · O programa"
            title={<>O que entra na sua empresa — <em style={{ fontStyle: 'normal', color: C.green }}>e quando.</em></>}
            sub="Quatro módulos de implementação, três ondas em 6 meses. Não é curso. Não é teoria. É alguém entrando na sua empresa junto com você."
          />
          <div className="lm-deliv-layout" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, marginTop: 48 }}>
            {/* Modules */}
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { n: 'M·01', h: 'ABCD da gestão', p: 'Faturamento é ego. Fixo vs variável. Separação pessoal vs empresa. Onde empresas perdem dinheiro antes de olhar pra fora.', tag: 'Fundamento' },
                { n: 'M·02', h: 'Financeiro em prática', p: 'Ponto de equilíbrio. DRE. Fluxo de caixa. Projeção. Geração de caixa vs lucro. Distribuição de lucro.', tag: 'Estrutura' },
                { n: 'M·03', h: 'Eficiência & margem', p: 'Precificação lucrativa. O que escalar primeiro. Ajustes que geram caixa rápido. CAC. Corte de custos cirúrgico.', tag: 'Margem' },
                { n: 'M·04', h: 'Modelo de gestão', p: 'Rotina semanal. Indicadores que importam. Decisões com dados. Controle com crescimento — a empresa rodando no piloto novo.', tag: 'Operação' },
              ].map(({ n, h, p, tag }) => (
                <div key={n} className="lm-module" style={{ background: 'rgba(255,255,255,0.02)', border: 'none', borderRadius: C.radius, padding: '24px 28px', display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 20, alignItems: 'center', transition: 'border-color .15s' }}>
                  <div className="lm-module-id" style={{ fontFamily: mono, fontSize: 12, color: C.green, letterSpacing: '0.08em' }}>{n}</div>
                  <div className="lm-module-content">
                    <h4 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 4px', letterSpacing: '-0.01em', fontFamily: sans }}>{h}</h4>
                    <p style={{ fontSize: 13.5, color: C.textDim, margin: 0, lineHeight: 1.45, fontFamily: sans }}>{p}</p>
                  </div>
                  <div className="lm-module-badge" style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.green, border: `1px solid ${C.greenDark}`, padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>{tag}</div>
                </div>
              ))}

              {/* Plus list */}
              <div style={{ marginTop: 8, display: 'grid', gap: 10 }}>
                {[
                  { sym: '+', t: 'Mentoria 1:1 mensal comigo', sub: 'Eu olho seus números, aponto onde está perdendo dinheiro e te digo o que fazer. Cada call é uma decisão.', b: '6 calls' },
                  { sym: '+', t: 'Software ATLAS', sub: 'Dashboard financeiro da Black Sheep. DRE, fluxo, relatórios, diagnóstico. É aqui que você vê onde está perdendo dinheiro.', b: 'Incluído' },
                  { sym: '+', t: 'Suporte contínuo', sub: 'Grupo de WhatsApp + comunidade Black Sheep. Problema surgiu, resolve rápido — sem esperar a próxima call.', b: 'Ilimitado' },
                ].map(({ sym, t, sub, b }) => (
                  <div key={t} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: '18px 22px', display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 14, alignItems: 'center' }}>
                    <div style={{ fontFamily: mono, color: C.green, fontSize: 16 }}>{sym}</div>
                    <div style={{ fontSize: 14, color: C.text, fontFamily: sans }}>
                      {t}
                      <span style={{ color: C.textDim, fontSize: 13, display: 'block', marginTop: 3 }}>{sub}</span>
                    </div>
                    <div style={{ fontFamily: mono, fontSize: 10.5, color: C.green, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{b}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline card */}
            <aside className="lm-timeline-card" style={{ background: `linear-gradient(180deg,${C.bgCard},#090A09)`, border: `1px solid ${C.greenDark}`, borderRadius: C.radiusLg, padding: 32, position: 'sticky', top: 92 }}>
              <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.green, marginBottom: 14 }}>Cronograma</div>
              <h4 style={{ fontSize: 24, lineHeight: 1.2, fontWeight: 500, letterSpacing: '-0.015em', margin: '0 0 24px', fontFamily: sans }}>
                Seis meses, <em style={{ fontStyle: 'normal', color: C.green }}>três ondas</em> de implementação.
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { when: 'M 1–2', what: <><strong style={{ color: C.text, fontWeight: 500 }}>Fundamento & diagnóstico.</strong> Módulos 01 & 02. Separação financeira, DRE, fluxo. Primeiro raio-X real.</> },
                  { when: 'M 3–4', what: <><strong style={{ color: C.text, fontWeight: 500 }}>Correção de margem.</strong> Módulo 03. Precificação, corte cirúrgico, CAC por produto. O dinheiro começa a reaparecer.</> },
                  { when: 'M 5–6', what: <><strong style={{ color: C.text, fontWeight: 500 }}>Modelo em regime.</strong> Módulo 04. Rotina semanal, indicadores-chave, decisão padronizada. Você opera sozinho — com método.</> },
                  { when: 'Contínuo', what: <><strong style={{ color: C.text, fontWeight: 500 }}>Software + WhatsApp + comunidade.</strong> Rodando desde o dia 1.</> },
                ].map(({ when, what }) => (
                  <li key={when} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 14, padding: '14px 0', borderTop: `1px solid ${C.border}`, fontSize: 14, color: C.textDim, fontFamily: sans }}>
                    <span style={{ fontFamily: mono, fontSize: 11, color: C.green, letterSpacing: '0.08em', paddingTop: 2 }}>{when}</span>
                    <span>{what}</span>
                  </li>
                ))}
                <li style={{ borderBottom: `1px solid ${C.border}`, height: 0, padding: 0, display: 'block' }} />
              </ul>
              {/* Updated commitment box */}
              <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(0,239,97,0.05)', border: `1px solid ${C.greenDark}`, borderRadius: 10, fontFamily: mono, fontSize: 12, color: C.textDim, lineHeight: 1.55 }}>
                Seu compromisso: 30 minutos por semana preenchendo dados (ou delegue pra alguém do time). Leia os relatórios. Decida com números. Você não precisa mudar o que faz —{' '}
                <strong style={{ color: C.green }}>só precisa enxergar o que não vê.</strong>
              </div>
            </aside>
          </div>

        </Page>
      </section>

      {/* ── SOFTWARE §04.5 ── */}
      <section className="lm-section" style={{ padding: '100px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <Page>
          <SecHead
            kicker="§ 05 · O software"
            title="O ATLAS faz o trabalho pesado por você."
            sub="Você lança as entradas e saídas da semana. O sistema monta DRE, fluxo de caixa, projeção, ponto de equilíbrio e diagnóstico — tudo automático. Sem planilha. Sem curso de finanças. Sem complicação."
          />
          <div className="lm-problem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 0 }}>
            {[
              { n: '01', h: 'DRE automático', p: 'Margem bruta, contribuição, EBITDA e lucro. Atualizado toda vez que você lança um dado.' },
              { n: '02', h: 'Fluxo de caixa projetado', p: 'Veja 90 dias à frente. Saiba antes se o caixa vai apertar.' },
              { n: '03', h: 'Diagnóstico com IA', p: 'Uma análise mensal que lê seus números e te diz onde está o problema — como um sócio financeiro faria.' },
            ].map(({ n, h, p }) => (
              <div key={n} className="lm-p-card" style={{ background: 'rgba(255,255,255,0.02)', border: 'none', borderRadius: C.radius, padding: 28, transition: 'transform .2s' }}>
                <div style={{ fontFamily: mono, fontSize: 13, color: C.textMute, letterSpacing: '0.1em', marginBottom: 24 }}>{n}</div>
                <h3 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 16px', fontFamily: sans }}>{h}</h3>
                <p style={{ color: C.textDim, fontSize: 14.5, margin: 0, fontFamily: sans }}>{p}</p>
              </div>
            ))}
          </div>
          {/* Demo video */}
          <div style={{ marginTop: 40, border: `1px solid ${C.border}`, borderRadius: C.radiusLg, overflow: 'hidden', background: C.bgCard, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 2, fontFamily: mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.green, background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.greenDark}`, padding: '5px 9px', borderRadius: 6, backdropFilter: 'blur(6px)' }}>SOFTWARE ATLAS · DEMO</div>
            <video
              src="/atlas-demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
        </Page>
      </section>

      {/* ── FILTRO §05 ── */}
      <section id="filtro" className="lm-section" style={{ padding: '100px 0' }}>
        <Page>
          <SecHead kicker="§ 06 · Filtro" title={<>O ATLAS <em style={{ fontStyle: 'normal', color: C.green }}>não é pra todo mundo.</em></>} />
          <div className="lm-filter-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 40 }}>
            <div style={{ background: `linear-gradient(180deg,rgba(0,239,97,0.04),transparent)`, border: `1px solid ${C.greenDark}`, borderRadius: C.radiusLg, padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 14, marginBottom: 20, borderBottom: `1px solid ${C.border}` }}>
                <h4 style={{ fontSize: 20, fontWeight: 500, margin: 0, letterSpacing: '-0.01em', fontFamily: sans }}>É pra você se</h4>
                <span style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.14em', color: C.green, textTransform: 'uppercase' }}>→ Aplicar</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Fatura R$60 mil ou mais por mês e não sabe sua margem real.','Escala — e o dinheiro some.','Toma decisão no feeling porque os números não fecham.','Quer lucro previsível, não mais faturamento.','Cansou de bater recorde e continuar no aperto.'].map((item, i) => (
                  <li key={i} style={{ padding: '14px 0', borderTop: i === 0 ? 'none' : `1px dashed ${C.border}`, fontSize: 15, color: C.textDim, lineHeight: 1.5, display: 'grid', gridTemplateColumns: '22px 1fr', gap: 10, fontFamily: sans }}>
                    <span style={{ color: C.green, fontWeight: 600 }}>✓</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radiusLg, padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 14, marginBottom: 20, borderBottom: `1px solid ${C.border}` }}>
                <h4 style={{ fontSize: 20, fontWeight: 500, margin: 0, letterSpacing: '-0.01em', fontFamily: sans }}>Não é pra você se</h4>
                <span style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.14em', color: C.red, textTransform: 'uppercase' }}>× Não aplicar</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Está começando e ainda não fatura consistente.','Quer solução mágica sem executar.','Acha que "no digital é diferente" e gestão é burocracia.','Não tem autonomia pra decidir no próprio negócio.'].map((item, i) => (
                  <li key={i} style={{ padding: '14px 0', borderTop: i === 0 ? 'none' : `1px dashed ${C.border}`, fontSize: 15, color: C.textDim, lineHeight: 1.5, display: 'grid', gridTemplateColumns: '22px 1fr', gap: 10, fontFamily: sans }}>
                    <span style={{ color: C.red }}>✕</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Page>
      </section>

      {/* ── URGÊNCIA §05.5 — new section ── */}
      <section className="lm-section" style={{ padding: '100px 0', background: C.bgRaised, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <Page>
          <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
            <div style={{ fontFamily: sans, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.green, marginBottom: 18 }}>§ 07 · A real</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: '0 0 24px', fontFamily: sans }}>
              Sem controle financeiro, um mês ruim de tráfego derruba tudo.
            </h2>
            <p style={{ fontSize: 18, color: C.textDim, lineHeight: 1.55, maxWidth: 680, margin: '0 auto', fontFamily: sans }}>
              O custo dos anúncios sobe todo ano. O mercado satura. As regras das plataformas mudam. Sem gestão, suas margens comprimem silenciosamente — e quando você percebe, o caixa já secou. Isso não é previsão. É o que acontece com quem opera no escuro.
            </p>
          </div>
        </Page>
      </section>

      {/* ── OBJEÇÕES §06 — 4 items, 2x2 grid ── */}
      <section className="lm-section" style={{ padding: '100px 0' }}>
        <Page>
          <SecHead kicker="§ 08 · Objeções" title={<>Quatro coisas que <em style={{ fontStyle: 'normal', color: C.green }}>você pode estar pensando agora.</em></>} />
          <div className="lm-obj-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginTop: 40 }}>
            {[
              { q: '"Meu negócio é muito rápido pra parar e organizar."', a: <span>Você não para. <strong style={{ color: C.green, fontWeight: 600, fontStyle: 'normal' }}>Uma call por mês. 30 minutos por semana.</strong> O ATLAS roda enquanto você opera.</span> },
              { q: '"Gestão é coisa de empresa grande."', a: <span>Empresa enxuta com margem errada <strong style={{ color: C.green, fontWeight: 600, fontStyle: 'normal' }}>quebra mais rápido.</strong> Sem colchão. Gestão é o que permite crescer sem se acidentar.</span> },
              { q: '"Eu já uso Conta Azul / ERP."', a: <span>ERP organiza nota fiscal. <strong style={{ color: C.green, fontWeight: 600, fontStyle: 'normal' }}>Não diz se sua campanha dá lucro ou prejuízo.</strong> ATLAS é a camada que falta.</span> },
              { q: '"Não tenho ninguém no time pra lançar os dados."', a: <span>Qualquer pessoa do time consegue. São 30 minutos por semana preenchendo entradas e saídas. O software faz o resto. Se você consegue preencher um extrato, <strong style={{ color: C.green, fontWeight: 600, fontStyle: 'normal' }}>consegue usar o ATLAS.</strong></span> },
            ].map(({ q, a }) => (
              <div key={q} style={{ background: 'rgba(255,255,255,0.02)', border: 'none', borderRadius: C.radius, padding: 28 }}>
                <p style={{ fontSize: 16, color: C.textMute, fontStyle: 'italic', margin: '0 0 14px', lineHeight: 1.4, fontFamily: sans }}>{q}</p>
                <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.55, margin: 0, fontFamily: sans }}>{a}</p>
              </div>
            ))}
          </div>
        </Page>
      </section>

      {/* ── INVESTIMENTO §07 ── */}
      <section id="investimento" className="lm-section" style={{ padding: '100px 0', background: C.bgRaised }}>
        <Page>
          <SecHead kicker="§ 09 · Investimento" title={<>Um ticket. <em style={{ fontStyle: 'normal', color: C.green }}>Tudo dentro.</em></>} />
          <div className="lm-invest lm-invest-wrap" style={{ marginTop: 48, border: `1px solid ${C.greenDark}`, background: `radial-gradient(60% 80% at 80% 50%, rgba(0,239,97,0.10), transparent 70%), ${C.bgCard}`, borderRadius: C.radiusLg, padding: 56, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.green, marginBottom: 12 }}>Programa ATLAS · 6 meses</div>
              <div style={{ fontSize: 'clamp(72px,10vw,128px)', fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 0.95, margin: '0 0 24px', fontFamily: sans }}>
                <span style={{ fontSize: '0.4em', verticalAlign: '0.6em', color: C.textMute, marginRight: 10, fontWeight: 500 }}>R$</span>14.000
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[['4 módulos','implementação guiada'],['6 calls 1:1','individuais comigo'],['software','ATLAS incluído'],['suporte','WhatsApp + comunidade']].map(([k, v]) => (
                  <li key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${C.border}`, fontSize: 14, color: C.textDim, fontFamily: sans }}>
                    <span style={{ fontFamily: sans, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.green }}>{k}</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: C.textDim, margin: 0, fontFamily: sans }}>
                Nos dois cases dessa página, o dinheiro que estava sendo perdido por falta de gestão era maior que o valor do programa. O ATLAS se paga com o dinheiro que você já perde sem saber.
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <BtnPrimary href="#aplicar" lg>
              <span style={{ fontFamily: sans }}>Quero implementar o ATLAS <span style={{ fontFamily: mono }}>→</span></span>
            </BtnPrimary>
          </div>
        </Page>
      </section>

      {/* ── MENTOR §08 ── */}
      <section id="mentor" className="lm-section" style={{ padding: '100px 0' }}>
        <Page>
          <SecHead kicker="§ 08 · Mentor" title="Quem entra na sua empresa." />
          <div className="lm-mentor" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, alignItems: 'start', marginTop: 40 }}>
            {/* Photo */}
            <div style={{ aspectRatio: '3/4', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius, overflow: 'hidden', position: 'relative' }}>
              <img src="/harley.jpg" alt="Harley — Fundador Black Sheep" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            {/* Body */}
            <div>
              <h3 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.025em', margin: '0 0 6px', fontFamily: sans }}>Harley</h3>
              <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.green, marginBottom: 24 }}>Fundador · Black Sheep</div>
              <p style={{ fontSize: 16.5, color: C.textDim, lineHeight: 1.55, margin: '0 0 14px', maxWidth: 620, fontFamily: sans }}>Filho de empresários. Cresci dentro de fábrica, vendo decisão difícil ser tomada todo dia. O ATLAS nasceu do que aprendi operando — não do que li em livro.</p>
              <p style={{ fontSize: 16.5, color: C.textDim, lineHeight: 1.55, margin: '0 0 14px', maxWidth: 620, fontFamily: sans }}>Meu trabalho: entrar na sua empresa, olhar seus números, mostrar onde o dinheiro está vazando. Depois, corrigimos e garantimos lucro recorrente.</p>
              <p style={{ fontSize: 16.5, color: C.textDim, lineHeight: 1.55, margin: '0 0 28px', maxWidth: 620, fontFamily: sans }}>
                <strong style={{ color: C.text, fontWeight: 500 }}>Não vou te ensinar teoria. Vamos implementar gestão.</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: C.border, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {[
                  { v: '16', k: 'anos em operações reais' },
                  { v: '20+', k: 'negócios como sócio / conselheiro' },
                  { v: '100+', k: 'empresas consultadas' },
                ].map(({ v, k }) => (
                  <div key={k} style={{ background: C.bg, padding: '20px 22px' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: C.green }}>{v}</div>
                    <div style={{ fontFamily: mono, fontSize: 10.5, color: C.textMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 6 }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Page>
      </section>

      {/* ── FAQ §09 ── */}
      <section id="faq" className="lm-section" style={{ padding: '100px 0', background: C.bgRaised }}>
        <Page>
          <SecHead kicker="§ 09 · FAQ" title="Perguntas comuns." />
          <div className="lm-faq" style={{ maxWidth: 840, margin: '40px auto 0' }}>
            <FaqItem defaultOpen q="O ATLAS é pra mim se nunca mexi com gestão?" a="Sim — desde que você fature de forma consistente. O Módulo 01 começa do zero: separação pessoal vs empresa, fixo vs variável. A curva é rápida porque o software e eu fazemos o trabalho pesado." />
            <FaqItem q="Qual a diferença do ATLAS pra uma mentoria de marketing?" a="Mentoria de marketing te ensina a vender mais. ATLAS mostra se o que você vende dá lucro. São camadas diferentes — e a segunda é a que define se você fica ou quebra." />
            <FaqItem q="Em quanto tempo vejo resultado?" a="Nos casos desta página, 3 a 4 meses até o dinheiro perdido começar a reaparecer. O primeiro raio-X — e os primeiros cortes — acontecem ainda no Mês 1." />
            <FaqItem q="Funciona pra qualquer segmento do digital?" a="E-commerce, marketplace, infoproduto, mentoria, SaaS, serviço. O princípio é o mesmo: receita, margem, CAC, caixa. O que muda é o ajuste fino — e isso é parte do programa." />
            <FaqItem q="É curso gravado?" a="Não. É implementação pessoal, ao vivo, com software rodando. Os módulos dão estrutura, mas o trabalho é feito no seu negócio — não numa plataforma de aula." />
            <FaqItem q="Quanto tempo fica o software?" a="Incluído durante os 6 meses do programa. Continuidade após o término é discutida ao final — a ideia é que você tenha autonomia pra operar, com ou sem ele." />
            <FaqItem q="Como funciona a aplicação?" a="Você preenche o formulário. Nosso time analisa e entra em contato. Se fizer sentido pros dois lados, agendamos uma conversa. Sem pressão. Sem insistência." />
          </div>
        </Page>
      </section>

      {/* ── CLOSING ── */}
      <section id="aplicar" style={{ position: 'relative', padding: '140px 0', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ content: '', position: 'absolute', inset: 0, background: 'radial-gradient(40% 60% at 50% 50%, rgba(0,239,97,0.15), transparent 70%)', pointerEvents: 'none' }} />
        <Page style={{ position: 'relative' }}>
          <h2 style={{ position: 'relative', fontSize: 'clamp(44px,6vw,92px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.02, margin: '0 auto 32px', maxWidth: '18ch', fontFamily: sans }}>
            Chega de gerir no <em style={{ fontStyle: 'italic', color: C.green, fontWeight: 700 }}>achismo.</em>
          </h2>
          <p style={{ position: 'relative', fontSize: 19, color: C.textDim, maxWidth: 720, margin: '0 auto 32px', lineHeight: 1.5, fontFamily: sans }}>
            Se você fatura bem e ainda não sabe sua margem real — você está perdendo dinheiro agora. Esse é o programa.
          </p>
          <div className="lm-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 820, margin: '40px auto 0' }}>
            {[
              { n: '01 · APLICA', h: 'Você aplica', p: 'Preenche o formulário com informações do negócio.' },
              { n: '02 · ANALISA', h: 'Time analisa', p: 'Entramos em contato pra entender se faz sentido pros dois lados.' },
              { n: '03 · AVANÇA', h: 'Avançamos', p: 'Se fizer sentido, agendamos uma conversa. Sem pressão.' },
            ].map(({ n, h, p }) => (
              <div key={n} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: '28px 26px' }}>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.green, letterSpacing: '0.2em', marginBottom: 12 }}>{n}</div>
                <h5 style={{ fontSize: 17, fontWeight: 500, margin: '0 0 6px', letterSpacing: '-0.01em', fontFamily: sans }}>{h}</h5>
                <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.5, margin: 0, fontFamily: sans }}>{p}</p>
              </div>
            ))}
          </div>
          <div style={{ position: 'relative', marginTop: 48 }}>
            <BtnPrimary href="#">
              <span style={{ fontSize: 16, padding: '4px 10px', fontFamily: sans }}>Quero implementar o ATLAS <span style={{ fontFamily: mono }}>→</span></span>
            </BtnPrimary>
          </div>
          <div style={{ position: 'relative', fontFamily: mono, fontSize: 12, color: C.textMute, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 20 }}>
            Aplicação por convite · análise em até 48h · sem insistência
          </div>
        </Page>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '40px 0 32px' }}>
        <div className="lm-footer-inner" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 32, alignItems: 'center' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: C.text }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/lp/sheep-logo.png" alt="" style={{ width: 26, height: 26 }} />
            </span>
            <span style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 700, letterSpacing: '0.02em', fontSize: 15 }}>ATLAS</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.textMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>by Black Sheep</div>
            </span>
          </a>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.textMute, letterSpacing: '0.12em', textTransform: 'uppercase' }}>© Black Sheep · atlasconsultoria.app</span>
          <a href="#" className="lm-footer-link" style={{ fontFamily: mono, fontSize: 11, color: C.textDim, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color .15s' }}>Instagram ↗</a>
        </div>
      </footer>

    </div>
  )
}
