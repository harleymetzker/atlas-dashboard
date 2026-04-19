import { useState } from 'react'

const FAQ_ITEMS = [
  { q: 'O ATLAS é pra mim se nunca mexi com gestão?', a: 'Sim. O primeiro módulo foi feito pra isso. E a mentoria individual existe pra implementar junto com você.' },
  { q: 'Qual a diferença do ATLAS pra uma mentoria de marketing?', a: 'O ATLAS não ensina a vender mais. Ensina a não perder o que já entra.' },
  { q: 'Em quanto tempo vejo resultado?', a: 'Até 60 dias. Quando você enxerga a margem real e faz os primeiros ajustes.' },
  { q: 'Funciona pra qualquer segmento do digital?', a: 'Sim. Infoproduto, e-commerce, SaaS, agência, serviço. Gestão financeira é gestão financeira.' },
  { q: 'É curso gravado?', a: 'Tem conteúdo gravado, mas não é curso pra assistir sozinho. Tem mentoria mensal e suporte.' },
  { q: 'Acesso ao software por quanto tempo?', a: '6 meses inclusos. Depois, pode assinar.' },
  { q: 'Como funciona a aplicação?', a: 'Formulário, equipe analisa, retorno em até 48h.' },
]

const mq = `
@media(max-width:640px){
  .lp-wrap{padding:0 24px!important}
  .lp-section{padding:48px 24px!important}
  .lp-invest{padding:48px 24px!important}
  .lp-hero{padding:80px 24px 48px!important}
  .lp-nav{padding:20px 24px!important}
  .lp-footer-inner{padding:32px 24px!important}
  .lp-filtro-grid{grid-template-columns:1fr!important}
}`

const GREEN = '#00EF61'

const s = {
  root: {
    background: '#0c0c0c',
    color: '#aaaaaa',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 16,
    lineHeight: 1.8,
    overflowX: 'hidden' as const,
    WebkitFontSmoothing: 'antialiased' as const,
  },
  navWrap: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '28px 48px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  navAtlas: {
    fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
    fontSize: 17,
    color: '#fff',
    letterSpacing: 5,
    textDecoration: 'none',
    marginLeft: 10,
  },
  navSep: { width: 1, height: 14, background: '#2a2a2a', flexShrink: 0 },
  navBy: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: '#666',
  },
  hero: {
    maxWidth: 760,
    margin: '0 auto',
    paddingTop: 100,
    paddingBottom: 72,
    paddingLeft: 48,
    paddingRight: 48,
  },
  heroTitle: {
    fontSize: 'clamp(44px, 6vw, 72px)' as unknown as number,
    fontWeight: 900,
    lineHeight: 1.1,
    color: '#fff',
    marginTop: 0,
    marginBottom: 28,
  },
  heroSub: {
    fontSize: 16,
    color: '#aaaaaa',
    lineHeight: 1.8,
    maxWidth: 580,
    marginBottom: 0,
  },
  heroAccentLine: {
    width: 48,
    height: 3,
    background: GREEN,
    margin: '44px 0 0',
    border: 'none',
  },
  section: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '80px 48px',
  },
  eyebrow: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: GREEN,
    marginBottom: 24,
    marginTop: 0,
    display: 'block',
  },
  h2: {
    fontSize: 'clamp(36px, 4.5vw, 52px)' as unknown as number,
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#fff',
    marginTop: 0,
    marginBottom: 28,
  },
  body: {
    fontSize: 16,
    color: '#aaaaaa',
    lineHeight: 1.8,
    maxWidth: 600,
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #1e1e1e',
    maxWidth: 760,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  bq: {
    margin: '48px 0',
    paddingLeft: 28,
    borderLeft: `3px solid ${GREEN}`,
  },
  bqText: {
    fontSize: 'clamp(36px, 4.5vw, 52px)' as unknown as number,
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.25,
    margin: 0,
  },
  pgrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    border: '1px solid #1e1e1e',
    marginTop: 0,
  },
  jornadas: { marginTop: 48 },
  jornada: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr',
    gap: 28,
    padding: '32px 0',
    borderTop: '1px solid #1e1e1e',
    alignItems: 'start',
  },
  jnum: {
    fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
    fontSize: 60,
    color: 'rgba(0, 239, 97, 0.25)',
    lineHeight: 1,
    marginTop: 4,
  },
  jtitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  jdesc: {
    fontSize: 15,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.7,
  },
  llist: { marginTop: 28 },
  litem: {
    display: 'flex',
    gap: 16,
    padding: '16px 0',
    borderBottom: '1px solid #1e1e1e',
    fontSize: 16,
    fontWeight: 300,
    color: '#aaa',
    lineHeight: 1.6,
    wordBreak: 'break-word' as const,
  },
  litemFirst: { borderTop: '1px solid #1e1e1e' },
  objBlock: {
    padding: '32px 0',
    borderTop: '1px solid #1e1e1e',
  },
  objQ: {
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  objA: {
    fontSize: 15,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.75,
    maxWidth: 560,
    margin: 0,
  },
  step: {
    display: 'grid',
    gridTemplateColumns: '52px 1fr',
    gap: 24,
    padding: '32px 0',
    borderTop: '1px solid #1e1e1e',
    alignItems: 'start',
  },
  stepNum: {
    fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
    fontSize: 52,
    color: '#1e1e1e',
    lineHeight: 1,
    marginTop: 4,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 15,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.65,
  },
  btn: {
    display: 'inline-block',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: '#000',
    background: GREEN,
    padding: '22px 56px',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
  },
  faqItem: { borderTop: '1px solid #1e1e1e' },
  faqQ: {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '22px 0',
    textAlign: 'left' as const,
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 16,
    fontWeight: 400,
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
    lineHeight: 1.4,
  },
  faqIcon: {
    fontSize: 22,
    fontWeight: 300,
    color: '#666',
    flexShrink: 0,
    lineHeight: 1,
    transition: 'transform 0.2s',
  },
  faqA: {
    paddingBottom: 22,
    fontSize: 15,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.75,
    maxWidth: 560,
  },
  invest: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '80px 48px',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: '#666',
    marginBottom: 16,
    display: 'block',
  },
  price: {
    fontSize: 'clamp(36px, 5vw, 56px)' as unknown as number,
    fontWeight: 900,
    color: '#fff',
    lineHeight: 1.1,
    marginBottom: 24,
    display: 'block',
  },
  priceDetail: {
    fontSize: 16,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.8,
    maxWidth: 520,
  },
  footerInner: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '40px 48px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: 8,
  },
  footerText: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: '#2a2a2a',
  },
}

function Para({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: 16, color: '#aaaaaa', lineHeight: 1.8, marginTop: 0, marginBottom: 20, wordBreak: 'break-word', ...style }}>{children}</p>
}


// Separador verde 48px
function GreenLine() {
  return <div style={{ width: 48, height: 2, background: GREEN, marginBottom: 48 }} />
}

// Bullets "O que fizemos"
function Bullets({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, marginBottom: 20 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, fontSize: 16, color: '#aaaaaa', lineHeight: 1.7 }}>
          <span style={{ color: '#555', flexShrink: 0 }}>—</span>{item}
        </div>
      ))}
    </div>
  )
}

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={s.root}>
      <style>{mq}</style>

      {/* NAV */}
      <nav style={s.navWrap} className="lp-nav">
        <img src="/blacksheep-logo.png" alt="Black Sheep" style={{ height: 32, display: 'block' }} />
        <span style={s.navAtlas}>ATLAS</span>
        <span style={s.navSep} />
        <span style={s.navBy}>by Black Sheep</span>
      </nav>

      {/* HERO */}
      <div style={s.hero} className="lp-hero">
        <h1 style={s.heroTitle}>
          Você dobrou o faturamento. Cresceu. E o dinheiro some no final do mês.
        </h1>
        <p style={s.heroSub}>
          Em 6 meses, a gente mostra pra onde vai cada real que entra — e garante que seu crescimento vire lucro.
        </p>
        <div style={s.heroAccentLine} />
      </div>

      <hr style={s.hr} />

      {/* ESPELHO */}
      <div style={s.section} className="lp-section">
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para>Se você está lendo isso, provavelmente já sentiu que tem algo errado com o dinheiro da sua empresa.</Para>
          <Para>Você fatura. Cresce. Bate meta.</Para>
          <Para>Abre o banco no final do mês.</Para>
          <Para style={{ fontWeight: 600, color: '#fff' }}>Cadê o dinheiro?</Para>
          <Para>Talvez você viva de lançamento, e cada mês começa do zero.</Para>
          <Para>Talvez o CPA suba todo mês enquanto a margem aperta.</Para>
          <Para>Talvez você tenha escalado rápido — mais gente, mais ferramenta, mais custo — e menos dinheiro do que quando faturava a metade.</Para>
        </div>

        {/* Frase isolada centralizada */}
        <p style={{
          fontSize: 'clamp(36px, 4.5vw, 52px)' as unknown as number,
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.2,
          textAlign: 'center' as const,
          marginTop: 48,
          marginBottom: 48,
          wordBreak: 'break-word',
        }}>
          Nomes diferentes. Problema igual.
        </p>

        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para>Você não sabe quanto realmente lucra.</Para>
          <Para>E quando não sabe, decide no escuro.</Para>
          <Para>A única estratégia que sobra é vender mais. Mais tráfego. Mais campanha. Mais esforço.</Para>
          <Para>Até o dia que vender mais não resolve.</Para>
          <Para style={{ marginBottom: 0 }}>Porque nunca resolveu.</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* TRANSIÇÃO */}
      <div style={{ ...s.section, paddingBottom: 0 }} className="lp-section">
        <h2 style={{ ...s.h2, color: GREEN }}>O padrão é sempre o mesmo.</h2>
      </div>

      {/* CONTEXTO */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 48px 0' }}>
        <p style={{ fontSize: 16, color: '#aaaaaa', lineHeight: 1.8, margin: 0, maxWidth: 620, wordBreak: 'break-word' }}>
          Duas empresas do digital chegaram na Black Sheep. O que encontramos lá dentro foi o mesmo de sempre — só que pior.
        </p>
      </div>

      {/* CASO 01 */}
      <div style={{ ...s.section, paddingTop: 40 }} className="lp-section" id="_caso1">
        <span style={s.eyebrow}>Caso 01</span>
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para style={{ color: '#fff', fontWeight: 600 }}>E-commerce de moda feminina. Shein, TikTok Shop, Mercado Livre, Shopee.</Para>
          <Para style={{ color: '#fff' }}>Faturamento: 7 milhões por ano.</Para>
          <Para>O dono achava que não tinha margem. Nunca sobrava dinheiro. Recorreu a banco mais de uma vez pra cobrir o fluxo de caixa.</Para>
          <Para>Fizemos a auditoria.</Para>
          <Para>Margem real: entre 18% e 23%. O negócio era extremamente lucrativo.</Para>
          <Para>Mas ele perdia 6% do faturamento inteiro em taxas e campanhas nos marketplaces que nem sabia que existiam.</Para>
          <p style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' as unknown as number, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginTop: 40, marginBottom: 40, wordBreak: 'break-word' }}>6% de 7 milhões. Faz a conta.</p>
          <p style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginTop: 0, marginBottom: 12 }}>O que fizemos:</p>
          <Bullets items={[
            'Saímos de campanhas que queimavam margem',
            'Reprecificamos linhas de produto com dados reais',
            'Criamos um plano pra formar capital de giro',
          ]} />
          <Para>Em 3 a 4 meses, o dinheiro que sempre existiu apareceu.</Para>
          <Para style={{ marginBottom: 0 }}>Não vendeu mais. Não cortou marketplace. Não demitiu ninguém. Parou de perder o que já ganhava.</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* CASO 02 */}
      <div style={s.section} className="lp-section" id="_caso2">
        <span style={s.eyebrow}>Caso 02</span>
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para style={{ color: '#fff', fontWeight: 600 }}>Mentorias e infoprodutos.</Para>
          <Para>Num mês de escala, bateu R$600 mil de faturamento. Recorde.</Para>
          <p style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' as unknown as number, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginTop: 40, marginBottom: 40, wordBreak: 'break-word' }}>No mês seguinte, precisou de empréstimo pra fechar o mês.</p>
          <Para>Margem real: abaixo de 10%. CAC sem teto. Retiradas sem critério.</Para>
          <p style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginTop: 0, marginBottom: 12 }}>O que fizemos:</p>
          <Bullets items={[
            'Gestão financeira que trouxe clareza real',
            'Teto de retirada baseado em dado',
            'CAC máximo por produto',
            'Metas de margem mínima',
          ]} />
          <Para style={{ marginBottom: 0 }}>Pela primeira vez, o dono sabia — com número na mão — se o mês foi bom ou ruim. Antes de abrir o extrato.</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* O PADRÃO */}
      <div style={s.section} className="lp-section">
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para>Essas duas empresas tinham tudo. Produto. Audiência. Tráfego. Faturamento.</Para>
          <Para>E estavam quebrando.</Para>
          <Para style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>Não é exceção.</Para>
          <Para style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>É padrão.</Para>
          <Para style={{ color: '#fff', fontWeight: 600 }}>É assim que empresas quebram faturando alto.</Para>
        </div>
        <div style={s.bq}>
          <p style={s.bqText}>Ninguém no digital ensina a parte que vem depois da venda.</p>
        </div>
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para>Todo mundo ensina a vender. Escalar. Lançar. Rodar tráfego.</Para>
          <Para>Ninguém ensina a controlar o que entra.</Para>
          <Para style={{ marginBottom: 0 }}>O ATLAS existe porque esse ciclo precisa parar.</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* VIRADA */}
      <div style={s.section} className="lp-section">
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para>E se, em vez de torcer pro mês fechar positivo, você soubesse — antes do dia 10 — exatamente quanto vai sobrar?</Para>
          <Para>E se você tivesse clareza sobre sua margem por produto, por canal, por campanha?</Para>
          <Para>E se toda decisão de escala fosse baseada em número real?</Para>
          <Para>E se você não precisasse aprender gestão do zero — porque um sistema faz isso por você e alguém implementa junto?</Para>
        </div>
        <h2 style={{ ...s.h2, marginTop: 40, marginBottom: 0 }}>É isso que o ATLAS faz.</h2>
      </div>

      <hr style={s.hr} />

      {/* O PROGRAMA */}
      <div style={s.section} className="lp-section">
        <GreenLine />
        <span style={s.eyebrow}>O Programa</span>
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para style={{ color: '#fff', fontWeight: 600 }}>O ATLAS é um programa de 6 meses da Black Sheep.</Para>
          <Para>Eu entro na sua empresa e implemento um modelo de gestão financeira. Pessoalmente.</Para>
          <Para style={{ color: '#fff', fontWeight: 600 }}>Não é teoria. É implementação.</Para>
          <Para>Você não precisa virar especialista em finanças. Precisa de três coisas:</Para>
          <Para>Preencher dados semanais no sistema — ou colocar alguém do time pra fazer.</Para>
          <Para>Aprender a ler os relatórios.</Para>
          <Para>Tomar decisão com base no que os números mostram.</Para>
          <Para style={{ color: '#fff', fontWeight: 700, marginTop: 24, marginBottom: 0 }}>O resto, eu faço com você.</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* ENTREGA */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>Entrega</span>
        <div style={s.jornadas}>
          {[
            { n: '01', t: 'ABC da Gestão', d: 'Fundamentos. Faturamento é ego. Custos fixos vs variáveis. Separação pessoal vs empresa. Onde empresas perdem dinheiro.' },
            { n: '02', t: 'Financeiro', d: 'Ponto de equilíbrio. DRE. Fluxo de caixa. Projeção. Geração de caixa vs lucro. Distribuição de lucro.' },
            { n: '03', t: 'Eficiência e Margem', d: 'Precificação lucrativa. O que escalar primeiro. Ajustes que geram caixa rápido. CAC. Corte de custos.' },
            { n: '04', t: 'Modelo de Gestão', d: 'Rotina semanal. Indicadores que importam. Decisões com dados. Controle com crescimento.' },
          ].map((j, i) => (
            <div key={j.n} style={{ ...s.jornada, ...(i === 3 ? { borderBottom: '1px solid #1e1e1e' } : {}) }}>
              <span style={s.jnum}>{j.n}</span>
              <div>
                <div style={s.jtitle}>{j.t}</div>
                <div style={s.jdesc}>{j.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={s.llist}>
          {/* Mentoria */}
          <div style={{ ...s.litem, ...s.litemFirst, flexDirection: 'column' as const, gap: 4 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ color: '#444', flexShrink: 0 }}>—</span>
              <span><strong style={{ color: '#fff', fontWeight: 700 }}>Mentoria individual</strong> — 1 reunião por mês comigo durante 6 meses. Eu olho seus números, identifico onde você tá perdendo dinheiro e te digo o que fazer.</span>
            </div>
            <p style={{ margin: '4px 0 0 32px', fontSize: 14, color: '#666', lineHeight: 1.5 }}>Cada call é uma decisão.</p>
          </div>
          {/* Software */}
          <div style={{ ...s.litem, flexDirection: 'column' as const, gap: 4 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ color: '#444', flexShrink: 0 }}>—</span>
              <span><strong style={{ color: '#fff', fontWeight: 700 }}>Software ATLAS</strong> — dashboard financeiro da Black Sheep. DRE, fluxo de caixa, relatórios. Incluído nos 6 meses.</span>
            </div>
            <p style={{ margin: '4px 0 0 32px', fontSize: 14, color: GREEN, fontWeight: 600, lineHeight: 1.5 }}>É aqui que você vê onde está perdendo dinheiro.</p>
          </div>
          {/* Suporte */}
          <div style={{ ...s.litem, flexDirection: 'column' as const, gap: 4 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ color: '#444', flexShrink: 0 }}>—</span>
              <span><strong style={{ color: '#fff', fontWeight: 700 }}>Suporte</strong> — grupo de WhatsApp + comunidade Black Sheep.</span>
            </div>
            <p style={{ margin: '4px 0 0 32px', fontSize: 14, color: '#666', lineHeight: 1.5 }}>Problema surgiu, resolve rápido.</p>
          </div>
        </div>

        {/* Screenshot placeholder */}
        <div style={{ margin: '48px 0 0', padding: '24px', border: '1px solid #1e1e1e', textAlign: 'center' as const }}>
          <img
            src="/atlas-screenshot.png"
            alt="Software ATLAS — Dashboard Financeiro"
            style={{ maxWidth: '100%', borderRadius: 4 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              ((e.target as HTMLImageElement).nextElementSibling as HTMLElement)!.style.display = 'block'
            }}
          />
          <p style={{ display: 'none', color: '#555', fontSize: 13, margin: 0 }}>Screenshot do Software ATLAS será adicionado aqui</p>
        </div>
      </div>

      <hr style={s.hr} />

      {/* FILTRO */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>Filtro</span>
        <h2 style={s.h2}>Mas esse programa não é pra todo mundo.</h2>

        <div style={{ ...s.pgrid }} className="lp-filtro-grid">
          {/* Coluna positiva — borda top verde */}
          <div style={{ padding: '28px 28px 32px', borderRight: '1px solid #1e1e1e', borderTop: `3px solid ${GREEN}` }}>
            <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: GREEN, marginTop: 0, marginBottom: 20 }}>Isso é pra você se:</p>
            {[
              'Fatura R$60 mil ou mais por mês e não sabe sua margem real',
              'Escala e o dinheiro some',
              'Toma decisão no feeling porque os números não fecham',
              'Quer lucro previsível, não mais faturamento',
              'Cansou de bater recorde e continuar no aperto',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, fontSize: 15, fontWeight: 300, color: '#aaa', lineHeight: 1.6, padding: '10px 0', borderBottom: i < 4 ? '1px solid #1e1e1e' : 'none' }}>
                <span style={{ color: GREEN, flexShrink: 0 }}>—</span>{item}
              </div>
            ))}
          </div>
          {/* Coluna negativa */}
          <div style={{ padding: '28px 28px 32px', borderTop: '1px solid #333' }}>
            <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#555', marginTop: 0, marginBottom: 20 }}>Isso não é pra você se:</p>
            {[
              'Está começando e ainda não fatura consistente',
              'Quer solução mágica sem executar',
              'Acha que "no digital é diferente" e que gestão é burocracia',
              'Não tem autonomia pra decidir no seu próprio negócio',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, fontSize: 15, fontWeight: 300, color: '#555', lineHeight: 1.6, padding: '10px 0', borderBottom: i < 3 ? '1px solid #1e1e1e' : 'none' }}>
                <span style={{ flexShrink: 0 }}>—</span>{item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr style={s.hr} />

      {/* OBJEÇÕES */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>Três coisas que você pode estar pensando</span>
        <div>
          {[
            {
              q: '"Meu negócio é muito rápido pra parar e organizar."',
              a: 'Você não para. Uma call por mês. 30 minutos por semana. O ATLAS roda enquanto você opera.',
            },
            {
              q: '"Gestão é coisa de empresa grande."',
              a: 'Empresa enxuta com margem errada quebra mais rápido. Sem colchão.',
            },
            {
              q: '"Eu já uso Conta Azul / ERP."',
              a: 'ERP organiza nota fiscal. Não te diz se sua campanha dá lucro ou prejuízo.',
            },
          ].map((obj, i) => (
            <div key={i} style={{ ...s.objBlock, ...(i === 2 ? { borderBottom: '1px solid #1e1e1e' } : {}) }}>
              <p style={s.objQ}>{obj.q}</p>
              <p style={s.objA}>{obj.a}</p>
            </div>
          ))}
        </div>
      </div>

      <hr style={s.hr} />

      {/* INVESTIMENTO */}
      <div style={s.invest} className="lp-invest">
        <GreenLine />
        <span style={s.priceLabel}>Investimento</span>
        <span style={s.price}>R$14.000</span>
        <p style={s.priceDetail}>
          6 meses. 4 módulos. 6 reuniões individuais comigo. Software ATLAS incluído. Suporte no grupo.
        </p>
        <p style={{ ...s.priceDetail, marginTop: 20 }}>
          Nos dois casos dessa página, o dinheiro perdido por falta de gestão era maior que o programa inteiro. Todo mês.
        </p>
        <p style={{ ...s.priceDetail, marginTop: 20, marginBottom: 48 }}>
          A pergunta não é se R$14 mil é caro. É quanto você tá perdendo por mês sem saber.
        </p>
      </div>

      <hr style={s.hr} />

      {/* COMO ENTRAR */}
      <div style={s.section} id="aplicar" className="lp-section">
        <span style={s.eyebrow}>Próximo Passo</span>
        <div>
          {[
            { n: '01', t: 'Você aplica.', d: 'Preenche o formulário com informações sobre seu negócio.' },
            { n: '02', t: 'A equipe analisa.', d: 'Nosso time entra em contato pra entender se faz sentido pros dois lados.' },
            { n: '03', t: 'Avançamos.', d: 'Se fizer sentido, agendamos uma conversa.' },
          ].map((step, i) => (
            <div key={step.n} style={{ ...s.step, ...(i === 2 ? { borderBottom: '1px solid #1e1e1e' } : {}) }}>
              <span style={s.stepNum}>{step.n}</span>
              <div>
                <div style={s.stepTitle}>{step.t}</div>
                <div style={s.stepDesc}>{step.d}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, fontWeight: 300, color: '#666', marginTop: 24, marginBottom: 48 }}>Sem pressão. Sem insistência.</p>
        <a href="#aplicar" style={s.btn}>Quero implementar o ATLAS</a>
      </div>

      <hr style={s.hr} />

      {/* QUEM VAI IMPLEMENTAR */}
      <div style={s.section} className="lp-section">
        <h2 style={s.h2}>Quem será seu Mentor</h2>
        <img
          src="/harley.jpg"
          alt="Harley Metzker"
          style={{ width: 180, height: 180, borderRadius: 12, objectFit: 'cover', display: 'block', marginBottom: 32 }}
        />
        <h3 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginTop: 0, marginBottom: 20 }}>Harley</h3>
        <div style={{ ...s.body, maxWidth: 580 }}>
          <Para>Sou filho de empresários. Cresci dentro de fábrica, vendo decisão difícil ser tomada todo dia.</Para>
          <Para>São 16 anos em operações reais. Mais de 20 negócios como sócio, investidor ou conselheiro.</Para>
          <Para>Fundador da Black Sheep — consultoria de gestão que já passou em mais de 100 empresas de diversos tamanhos e setores.</Para>
          <Para>Meu trabalho: entrar na sua empresa, olhar seus números, mostrar onde o dinheiro está vazando. Depois, corrigimos e garantimos <strong style={{ color: GREEN, fontWeight: 700 }}>LUCRO</strong> recorrente.</Para>
          <Para style={{ marginBottom: 0 }}>Não vou te ensinar teoria. Vamos implementar gestão.</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* FAQ */}
      <div style={s.section} className="lp-section">
        <span style={{ ...s.eyebrow, fontSize: 40 }}>FAQ</span>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{ ...s.faqItem, ...(i === FAQ_ITEMS.length - 1 ? { borderBottom: '1px solid #1e1e1e' } : {}) }}
            >
              <button style={s.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q}
                <span style={{ ...s.faqIcon, transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openFaq === i && <div style={s.faqA}>{item.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{ borderTop: '1px solid #1e1e1e', borderBottom: '1px solid #1e1e1e' }}>
        <div
          style={{ maxWidth: 760, margin: '0 auto', padding: '80px 48px', textAlign: 'center' as const }}
          className="lp-section"
        >
          <p style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' as unknown as number, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginTop: 0, marginBottom: 40 }}>
            Se você fatura bem e ainda não sabe sua margem real — você tá perdendo dinheiro agora. Esse é o programa.
          </p>
          <a href="#aplicar" style={s.btn}>Quero implementar o ATLAS</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1e1e1e' }}>
        <div style={s.footerInner} className="lp-footer-inner">
          <img src="/blacksheep-logo.png" alt="Black Sheep" style={{ height: 36, marginBottom: 8, opacity: 0.6, display: 'block' }} />
          <span style={s.footerText}>ATLAS · by Black Sheep · atlasconsultoria.app</span>
          <div style={{ marginTop: 8 }}>
            <a href="https://instagram.com/blacksheep" target="_blank" rel="noopener noreferrer" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
