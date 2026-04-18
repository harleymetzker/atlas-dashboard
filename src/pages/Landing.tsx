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
  .lp-pgrid{grid-template-columns:1fr!important}
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
  // NAV
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
  navSep: {
    width: 1,
    height: 14,
    background: '#2a2a2a',
    flexShrink: 0,
  },
  navBy: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: '#666',
  },
  // HERO
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
  // SECTION
  section: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '80px 48px',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: GREEN,
    marginBottom: 24,
    marginTop: 0,
    display: 'block',
  },
  h2: {
    fontSize: 'clamp(32px, 4vw, 48px)' as unknown as number,
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
  // BLOCKQUOTE
  bq: {
    margin: '48px 0',
    paddingLeft: 28,
    borderLeft: `3px solid ${GREEN}`,
  },
  bqText: {
    fontSize: 'clamp(28px, 3.5vw, 42px)' as unknown as number,
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.25,
    margin: 0,
  },
  // PGRID (diagnóstico / filtro)
  pgrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    border: '1px solid #1e1e1e',
    marginTop: 32,
  },
  pcell: {
    padding: '22px 26px',
    borderRight: '1px solid #1e1e1e',
    borderBottom: '1px solid #1e1e1e',
    fontSize: 15,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.6,
    display: 'flex',
    gap: 14,
  },
  // JORNADAS
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
    color: '#1e1e1e',
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
  // LISTA SIMPLES
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
  },
  litemFirst: { borderTop: '1px solid #1e1e1e' },
  // OBJEÇÕES
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
  // STEPS
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
  // CTA BUTTON
  btn: {
    display: 'inline-block',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: '#000',
    background: GREEN,
    padding: '22px 52px',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    transition: 'background 0.2s',
  },
  // FAQ
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
  // INVEST
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
    fontSize: 32,
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.15,
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
  // FOOTER
  footerInner: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '40px 48px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap' as const,
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
  return <p style={{ fontSize: 16, color: '#aaaaaa', lineHeight: 1.8, marginTop: 0, marginBottom: 20, ...style }}>{children}</p>
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
          Escale seu negócio digital sem o dinheiro sumir no meio do caminho.
        </h1>
        <p style={s.heroSub}>
          Em 6 meses implemente, dentro da sua empresa, um modelo de gestão que mostra pra onde vai cada real que entra — e garante que seu crescimento vire lucro, não dor de cabeça.
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
          <Para>Talvez você viva de lançamento, e cada mês é uma corrida pra encher turma e torcer pro ROI fechar.</Para>
          <Para>Talvez o CPA suba todo mês enquanto a margem aperta.</Para>
          <Para>Talvez as plataformas comam um pedaço da venda que você nem sabe calcular.</Para>
          <Para>Talvez você tenha escalado rápido — e agora tem mais gente, mais ferramenta, mais custo — e menos dinheiro do que quando faturava a metade.</Para>
          <Para>Nomes diferentes. Problema igual.</Para>
          <Para style={{ color: '#fff', fontWeight: 600 }}>Você não sabe quanto realmente lucra.</Para>
          <Para>E quando não sabe, a única estratégia que sobra é vender mais. Mais tráfego. Mais campanha. Mais esforço.</Para>
          <Para>Até o dia que vender mais não resolve.</Para>
          <Para style={{ marginBottom: 0 }}>Porque nunca resolveu.</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* TRANSIÇÃO */}
      <div style={{ ...s.section, paddingBottom: 40 }} className="lp-section">
        <h2 style={{ ...s.h2, color: GREEN }}>Vou te mostrar como é isso na prática...</h2>
      </div>

      {/* CASO REAL — E-COMMERCE */}
      <div style={s.section} className="lp-section" id="_caso1">
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para style={{ color: '#fff', fontWeight: 600 }}>E-commerce de moda feminina. Shein, TikTok Shop, Mercado Livre, Shopee.</Para>
          <Para style={{ color: '#fff' }}>Faturamento: 7 milhões por ano.</Para>
          <Para>Parece saudável, certo?</Para>
          <Para>O dono achava que não tinha margem. Nunca sobrava dinheiro. Precisou recorrer a banco mais de uma vez pra cobrir o fluxo de caixa.</Para>
          <Para>Fizemos a auditoria.</Para>
          <Para>Primeira descoberta: o negócio era extremamente lucrativo. Margem real entre 18% e 23%.</Para>
          <Para>Segunda descoberta: ele perdia 6% do faturamento inteiro em taxas e campanhas nos marketplaces que nem sabia que existiam.</Para>
          <Para style={{ color: '#fff', fontWeight: 600 }}>6% de 7 milhões. Faz a conta.</Para>
          <Para>Não era problema de margem. Era problema de visibilidade. Não enxergava os próprios números.</Para>
          <Para>O que fizemos: saímos de campanhas que queimavam margem, reprecificamos linhas de produto com dados reais, criamos um plano pra formar capital de giro. Com capital, planejamos crescimento que mantivesse as margens.</Para>
          <Para>Em 3 a 4 meses, o dinheiro que sempre existiu apareceu.</Para>
          <Para>Não vendeu mais. Não cortou marketplace. Não demitiu ninguém.</Para>
          <Para style={{ marginBottom: 0 }}>Parou de perder o que já ganhava.</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* CASO REAL — INFOPRODUTO */}
      <div style={s.section} className="lp-section" id="_caso2">
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para style={{ color: '#fff', fontWeight: 600 }}>Outro caso. Mentorias e infoprodutos.</Para>
          <Para>Num mês de escala, bateu R$600 mil de faturamento. Recorde.</Para>
          <Para>No mês seguinte, precisou de empréstimo pra pagar os cartões que usou pra rodar anúncio.</Para>
          <Para style={{ color: '#fff', fontWeight: 600 }}>Seiscentos mil de faturamento. E empréstimo pra fechar o mês.</Para>
          <Para>Margem real: abaixo de 10%.</Para>
          <Para>CAC sem teto. Retiradas sem critério. Escalou faturamento, escalou o caos junto.</Para>
          <Para>O que fizemos: implementamos gestão financeira que trouxe clareza real sobre a situação. Definimos teto de retirada baseado em dado. Estabelecemos CAC máximo por produto. Criamos metas de margem mínima.</Para>
          <Para>A empresa parou de crescer no escuro.</Para>
          <Para style={{ marginBottom: 0 }}>Pela primeira vez, o dono sabia — com número na mão — se o mês foi bom ou ruim. Antes de abrir o extrato.</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* O PADRÃO */}
      <div style={s.section} className="lp-section">
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para>Essas duas empresas tinham tudo. Produto. Audiência. Tráfego. Faturamento.</Para>
          <Para>E estavam quebrando.</Para>
        </div>
        <div style={s.bq}>
          <p style={s.bqText}>"Ninguém no digital ensina a parte que vem depois da venda."</p>
        </div>
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para>Todo mundo ensina a vender. Escalar. Lançar. Rodar tráfego.</Para>
          <Para>Ninguém ensina a controlar o que entra.</Para>
          <Para>O faturamento sobe. Os custos sobem junto. A margem comprime. O dono não enxerga. A "solução" é vender mais.</Para>
          <Para>Até o dia que o banco liga.</Para>
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
          <Para style={{ marginBottom: 0 }}>E se você não precisasse aprender gestão do zero — porque um sistema faz isso por você e alguém implementa junto?</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* O PROGRAMA */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>O Programa</span>
        <div style={{ ...s.body, maxWidth: 620 }}>
          <Para style={{ color: '#fff', fontWeight: 600 }}>O ATLAS é um programa de 6 meses da Black Sheep.</Para>
          <Para>Eu entro na sua empresa e implemento um modelo de gestão financeira. Pessoalmente.</Para>
          <Para>Você não precisa virar especialista em finanças. Precisa de três coisas:</Para>
          <Para>Preencher dados semanais no sistema — ou colocar alguém do time pra fazer.</Para>
          <Para>Aprender a ler os relatórios.</Para>
          <Para>Tomar decisão com base no que os números mostram.</Para>
          <Para style={{ marginBottom: 0 }}>O resto, eu faço com você.</Para>
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
          {[
            'Mentoria individual — 1 reunião por mês comigo durante 6 meses. Eu olho seus números, identifico onde você tá perdendo dinheiro e te digo o que fazer.',
            'Software ATLAS — dashboard financeiro da Black Sheep. DRE, fluxo de caixa, relatórios. Incluído nos 6 meses.',
            'Suporte — grupo de WhatsApp + comunidade Black Sheep.',
          ].map((item, i) => (
            <div key={i} style={{ ...s.litem, ...(i === 0 ? s.litemFirst : {}) }}>
              <span style={{ color: '#444', flexShrink: 0 }}>—</span>{item}
            </div>
          ))}
        </div>

        <p style={{ marginTop: 32, fontSize: 15, fontWeight: 300, color: '#aaaaaa', lineHeight: 1.8, maxWidth: 560 }}>
          Você não precisa montar planilha. Não precisa de ERP. Preenche os dados, lê o relatório, toma decisão. Com dados na mão, foca no que sabe fazer: crescer.
        </p>

        <div style={{ marginTop: 40, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
          <img src="/dashboard-preview.png" alt="Sistema ATLAS" style={{ width: '100%', display: 'block', opacity: 0.85 }} />
        </div>
      </div>

      <hr style={s.hr} />

      {/* FILTRO */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>Filtro</span>
        <h2 style={s.h2}>Esse programa não é pra todo mundo.</h2>

        <div style={{ ...s.pgrid, marginTop: 0 }} className="lp-filtro-grid">
          <div style={{ padding: '28px 28px 32px', borderRight: '1px solid #1e1e1e', borderBottom: 'none' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', marginTop: 0, marginBottom: 20 }}>Isso é pra você se:</p>
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
          <div style={{ padding: '28px 28px 32px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#666', marginTop: 0, marginBottom: 20 }}>Isso não é pra você se:</p>
            {[
              'Está começando e ainda não fatura consistente',
              'Quer solução mágica sem executar',
              'Acha que "no digital é diferente" e que gestão é burocracia',
              'Não tem autonomia pra decidir no seu próprio negócio',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, fontSize: 15, fontWeight: 300, color: '#666', lineHeight: 1.6, padding: '10px 0', borderBottom: i < 3 ? '1px solid #1e1e1e' : 'none' }}>
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
              a: 'Você não para. O ATLAS se implementa enquanto opera. Uma reunião por mês. Dados preenchidos em 30 minutos por semana.',
            },
            {
              q: '"Gestão é coisa de empresa grande."',
              a: 'Empresa enxuta com margem errada quebra mais rápido. Sem colchão, cada real mal gasto pesa mais.',
            },
            {
              q: '"Eu já uso Conta Azul / ERP."',
              a: 'ERP organiza nota fiscal. Não mostra margem por produto, não projeta fluxo de caixa e não diz se sua campanha de tráfego dá lucro ou prejuízo.',
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
        <div style={{ width: 48, height: 3, background: GREEN, marginBottom: 48 }} />
        <span style={s.priceLabel}>Investimento</span>
        <span style={s.price}>R$14.000</span>
        <p style={s.priceDetail}>
          6 meses. 4 módulos. 6 reuniões individuais comigo. Software ATLAS incluído. Suporte no grupo.
        </p>
        <p style={{ ...s.priceDetail, marginTop: 20 }}>
          Pra quem fatura R$60 mil por mês, isso é menos de uma semana de receita.
        </p>
        <p style={{ ...s.priceDetail, marginTop: 20 }}>
          Nos dois casos dessa página, o dinheiro perdido por falta de gestão era maior que o programa inteiro. Todo mês.
        </p>
        <p style={{ ...s.priceDetail, marginTop: 20, marginBottom: 0 }}>
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
        <img
          src="/harley.jpg"
          alt="Harley Metzker"
          style={{ width: 200, height: 200, borderRadius: '50%', objectFit: 'cover', display: 'block', marginBottom: 28 }}
        />
        <h3 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginTop: 0, marginBottom: 6 }}>Harley Metzker.</h3>
        <div style={{ ...s.body, maxWidth: 580 }}>
          <Para>Filho de empresários. Cresci dentro de fábrica, vendo decisão difícil ser tomada todo dia.</Para>
          <Para>17 anos em operações reais. Mais de 20 negócios como sócio, investidor ou conselheiro. Conselheiro de uma multinacional.</Para>
          <Para>Fundador da Black Sheep — consultoria de gestão que já passou por mais de 100 empresas.</Para>
          <Para>Meu trabalho: entrar na empresa, olhar os números, mostrar onde o dinheiro está indo. Depois, corrigir.</Para>
          <Para style={{ marginBottom: 0 }}>Não ensino teoria. Implemento gestão.</Para>
        </div>
      </div>

      <hr style={s.hr} />

      {/* FAQ */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>FAQ</span>
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
          <p style={{ fontSize: 'clamp(20px, 2.2vw, 28px)' as unknown as number, fontWeight: 700, color: '#fff', lineHeight: 1.25, marginTop: 0, marginBottom: 40 }}>
            Se você fatura bem e ainda não sabe sua margem real, esse é o programa.
          </p>
          <a href="#aplicar" style={s.btn}>Quero implementar o ATLAS</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1e1e1e' }}>
        <div style={s.footerInner} className="lp-footer-inner">
          <img src="/blacksheep-logo.png" alt="Black Sheep" style={{ height: 28, display: 'block', opacity: 0.4 }} />
          <span style={s.footerText}>ATLAS · by Black Sheep · atlasconsultoria.app</span>
        </div>
      </footer>
    </div>
  )
}
