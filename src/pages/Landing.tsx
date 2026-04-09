import { useState } from 'react'

const FAQ_ITEMS = [
  { q: 'O ATLAS é para mim se eu nunca mexi com gestão antes?', a: 'Sim — a primeira jornada (ABC da Gestão) foi feita exatamente para quem nunca estruturou nada. Você não precisa de conhecimento prévio.' },
  { q: 'Qual a diferença entre o ATLAS e uma mentoria de marketing ou vendas?', a: 'O ATLAS não ensina a vender mais. Ensina a não perder o que já entra. São problemas diferentes com soluções diferentes.' },
  { q: 'Em quanto tempo vejo resultado?', a: 'Os primeiros resultados aparecem em até 60 dias — quando você enxerga sua margem real, identifica os vazamentos e faz os primeiros ajustes.' },
  { q: 'É um curso gravado ou tem acompanhamento?', a: 'É um programa com acompanhamento. Não é curso para assistir sozinho.' },
  { q: 'Funciona para qualquer segmento do digital?', a: 'Sim. Gestão é gestão — independente se você vende mentoria, infoproduto, serviço ou SaaS. Os princípios são os mesmos.' },
  { q: 'Por que R$14.000 se existem cursos mais baratos?', a: 'Cursos te dão conteúdo. O ATLAS te dá resultado. A diferença está na implementação, no acompanhamento e na aplicação real no seu negócio.' },
  { q: 'E se eu já tiver contador ou CFO?', a: 'Contador cuida do fiscal. CFO cuida do estratégico. O ATLAS te ensina a ser o dono que entende os próprios números — sem depender de terceiros para tomar decisão.' },
  { q: 'Como funciona o processo de aplicação?', a: 'Você preenche o formulário, a gente analisa e retorna em até 48 horas. Se fizer sentido para os dois lados, avançamos.' },
]

const mq = `
@media(max-width:640px){
  .lp-wrap{padding:0 24px!important}
  .lp-section{padding:48px 24px!important}
  .lp-invest{padding:48px 24px!important}
  .lp-hero{padding:80px 24px 48px!important}
  .lp-nav{padding:28px 24px!important}
  .lp-footer-inner{padding:36px 24px!important}
}`

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
  inner: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '0 48px',
  },
  nav: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '36px 48px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  navLogo: {
    fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
    fontSize: 18,
    color: '#fff',
    letterSpacing: 5,
    textDecoration: 'none',
  },
  navSep: {
    width: 1,
    height: 14,
    background: '#1e1e1e',
    flexShrink: 0,
  },
  navBy: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: '#666666',
  },
  hero: {
    maxWidth: 760,
    margin: '0 auto',
    paddingTop: 140,
    paddingBottom: 80,
    paddingLeft: 48,
    paddingRight: 48,
  },
  heroTitle: {
    fontSize: 'clamp(36px, 4.5vw, 56px)' as unknown as number,
    fontWeight: 900,
    lineHeight: 1.1,
    color: '#fff',
    marginBottom: 16,
    maxWidth: '100%',
  },
  heroSub: {
    fontSize: 'clamp(18px, 2vw, 24px)' as unknown as number,
    fontWeight: 400,
    color: '#aaaaaa',
    marginBottom: 24,
    lineHeight: 1.3,
  },
  heroBody: {
    fontSize: 16,
    color: '#aaaaaa',
    lineHeight: 1.8,
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #1e1e1e',
    maxWidth: 760,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  section: {
    padding: '64px 48px',
    maxWidth: 760,
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
    color: '#555',
    marginBottom: 14,
    display: 'block',
  },
  h2: {
    fontSize: 'clamp(22px, 2.5vw, 30px)' as unknown as number,
    fontWeight: 700,
    lineHeight: 1.25,
    color: '#fff',
    marginBottom: 28,
    maxWidth: '100%',
  },
  body: {
    fontSize: 16,
    color: '#aaaaaa',
    lineHeight: 1.8,
    maxWidth: 580,
  },
  pgrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    border: '1px solid #1e1e1e',
    marginTop: 40,
  },
  pcell: {
    padding: '24px 28px',
    borderRight: '1px solid #1e1e1e',
    borderBottom: '1px solid #1e1e1e',
    fontSize: 15,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.6,
    display: 'flex',
    gap: 14,
  },
  bq: {
    margin: '48px 0',
    paddingLeft: 24,
    borderLeft: '2px solid #fff',
  },
  bqText: {
    fontSize: 'clamp(20px, 2.2vw, 28px)' as unknown as number,
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.3,
  },
  jornadas: {
    marginTop: 48,
  },
  jornada: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr',
    gap: 32,
    padding: '36px 0',
    borderTop: '1px solid #1e1e1e',
    alignItems: 'start',
  },
  jnum: {
    fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
    fontSize: 44,
    color: '#222',
    lineHeight: 1,
  },
  jtitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#fff',
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  },
  jdesc: {
    fontSize: 15,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.7,
  },
  llist: {
    marginTop: 36,
  },
  litem: {
    display: 'flex',
    gap: 18,
    padding: '18px 0',
    borderBottom: '1px solid #1e1e1e',
    fontSize: 16,
    fontWeight: 300,
    color: '#aaa',
    lineHeight: 1.55,
  },
  litemFirst: {
    borderTop: '1px solid #1e1e1e',
  },
  alist: {
    marginTop: 36,
  },
  aitem: {
    display: 'flex',
    gap: 18,
    padding: '18px 0',
    borderBottom: '1px solid #1e1e1e',
    fontSize: 16,
    fontWeight: 300,
    color: '#aaa',
  },
  aitemFirst: {
    borderTop: '1px solid #1e1e1e',
  },
  nao: {
    marginTop: 48,
    padding: '36px 40px',
    border: '1px solid #1e1e1e',
    background: '#111',
  },
  naoTitle: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
    color: '#666666',
    marginBottom: 20,
  },
  naoItem: {
    display: 'flex',
    gap: 14,
    fontSize: 15,
    fontWeight: 300,
    color: '#aaaaaa',
    padding: '12px 0',
    borderBottom: '1px solid #1e1e1e',
    lineHeight: 1.55,
  },
  bsNote: {
    marginTop: 32,
    fontSize: 14,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.7,
  },
  invest: {
    padding: '64px 48px',
    maxWidth: 760,
    margin: '0 auto',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
    color: '#666666',
    marginBottom: 16,
    display: 'block',
  },
  price: {
    fontSize: 'clamp(36px, 4vw, 52px)' as unknown as number,
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.1,
    letterSpacing: 1,
    marginBottom: 24,
    display: 'block',
  },
  priceDetail: {
    fontSize: 16,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.8,
    maxWidth: 500,
    marginBottom: 0,
  },
  sem: {
    display: 'flex',
    gap: 36,
    marginBottom: 48,
    flexWrap: 'wrap' as const,
  },
  semItem: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: '#666666',
  },
  step: {
    display: 'grid',
    gridTemplateColumns: '52px 1fr',
    gap: 28,
    padding: '36px 0',
    borderTop: '1px solid #1e1e1e',
    alignItems: 'start',
  },
  stepNum: {
    fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
    fontSize: 40,
    color: '#222',
    lineHeight: 1,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginBottom: 8,
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
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 2.5,
    textTransform: 'uppercase' as const,
    color: '#000',
    background: '#fff',
    padding: '18px 48px',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
  },
  faqItem: {
    borderTop: '1px solid #1e1e1e',
  },
  faqQ: {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '24px 0',
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
    color: '#666666',
    flexShrink: 0,
    lineHeight: 1,
  },
  faqA: {
    paddingBottom: 24,
    fontSize: 15,
    fontWeight: 300,
    color: '#aaaaaa',
    lineHeight: 1.75,
    maxWidth: 560,
  },
  footer: {
    borderTop: '1px solid #1e1e1e',
    padding: '44px 48px',
    maxWidth: 760,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 18,
  },
  footerLogo: {
    fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
    fontSize: 14,
    color: '#2a2a2a',
    letterSpacing: 5,
  },
  footerSep: {
    width: 1,
    height: 12,
    background: '#1e1e1e',
  },
  footerSub: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: '#2a2a2a',
  },
}

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={s.root}>
      <style>{mq}</style>

      {/* Nav */}
      <nav style={s.nav} className="lp-nav">
        <a href="#" style={s.navLogo}>ATLAS</a>
        <span style={s.navSep} />
        <span style={s.navBy}>by Black Sheep</span>
      </nav>

      {/* Hero */}
      <div style={s.hero} className="lp-hero">
        <h1 style={s.heroTitle}>Você dobrou o faturamento.<br />E passou a ter menos dinheiro.</h1>
        <p style={s.heroSub}>Isso não é azar... É falta de gestão.</p>
        <p style={s.heroBody}>O mercado digital te ensinou a vender mais. Ninguém te ensinou a controlar o que já entra.</p>
      </div>



      {/* Diagnóstico */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>O Diagnóstico</span>
        <h2 style={s.h2}>Você não tem um problema de faturamento. Você tem um problema de gestão.</h2>
        <div style={s.body}>
          <p>A maioria que chega aqui já fatura bem. Já investe em tráfego. Já tem produto validado. Já tem vendas acontecendo.</p>
          <p style={{ marginTop: 16 }}>O problema é outro:</p>
        </div>
        <div style={{ ...s.pgrid, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {[
            'Fatura bem e não sabe quanto realmente lucra',
            'Cada mês que cresce, menos dinheiro sobra na conta',
            'Toma decisão no susto porque não sabe os próprios números',
            'Corta custo no lugar errado e espera milagre',
            'Perde dinheiro porque nunca parou para estruturar',
          ].map((item, i) => (
            <div key={i} style={s.pcell}>
              <span style={{ color: '#444', flexShrink: 0 }}>—</span>{item}
            </div>
          ))}
          <div style={s.pcell} />
        </div>
        <div style={{ ...s.body, marginTop: 40 }}>
          <p>Isso não é falta de esforço. É falta de gestão.</p>
          <p style={{ marginTop: 16 }}>E ninguém no digital fala sobre isso — porque gestão não tem palco. Tráfego pago tem palco. Lead tem palco. Funil tem palco.</p>
          <p style={{ marginTop: 16 }}>Gestão é o que acontece depois que o dinheiro entra. E é onde a maioria perde.</p>
        </div>
      </div>



      {/* Mentira */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>A Mentira do Mercado</span>
        <h2 style={s.h2}>Te venderam a solução errada para o problema certo.</h2>
        <div style={s.body}>
          <p>Sem margem? Aumenta o faturamento.<br />Sem dinheiro no final do mês? Vende mais.<br />Empresa no limite? Escala.</p>
          <p style={{ marginTop: 16 }}>Essa é a lógica que o mercado digital ensina. E é exatamente o que destrói a empresa mais rápido.</p>
          <p style={{ marginTop: 16 }}>Quanto mais você cresce sem estrutura, mais a margem se corrói. Até o dia que você fatura alguns milhões e não tem dinheiro para pagar o time.</p>
          <p style={{ marginTop: 16 }}>Já vi isso acontecer. Mais de uma vez. Com empresários sérios.</p>
        </div>
      </div>



      {/* História */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>A História</span>
        <h2 style={s.h2}>14 anos de empresa. E um padrão que já vi centenas de vezes.</h2>
        <div style={s.body}>
          <p>Sou filho de empresários. Cresci dentro de empresa vendo decisão difícil ser tomada.</p>
          <p style={{ marginTop: 16 }}>Há 14 anos construo e opero negócios. Passei pelo corporativo como executivo. Gestão sempre fez parte do meu dia-a-dia.</p>
          <p style={{ marginTop: 16 }}>Quando comecei a trabalhar com algumas empresas do digital, o padrão era sempre o mesmo — independente do segmento, do faturamento, do tamanho do time:</p>
          <p style={{ marginTop: 16 }}>Empresário com produto validado, com vendas, com crescimento absurdo... Mas sem clareza nenhuma sobre o que sobrava. Sem saber se estava lucrando ou apenas movimentando dinheiro.</p>
          <p style={{ marginTop: 16 }}>Minha conclusão é:</p>
        </div>
        <div style={s.bq}>
          <div style={s.bqText}>O problema nunca foi faturamento.<br />Foi sempre gestão.</div>
        </div>
        <div style={s.body}>
          <p>E ninguém no digital fala sobre isso — porque gestão não tem palco.</p>
          <p style={{ marginTop: 16 }}>Esse cenário me fez criar o ATLAS.</p>
        </div>
      </div>



      {/* Mecanismo */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>O Mecanismo</span>
        <h2 style={s.h2}>ATLAS não é mentoria financeira. É um modelo de gestão focado em lucro.</h2>
        <div style={s.body}>
          <p>A diferença é simples:</p>
          <p style={{ marginTop: 16 }}>Mentoria financeira te ensina a entender os números. O ATLAS te ensina a usar os números para tomar decisão — e mudar o resultado.</p>
          <p style={{ marginTop: 16 }}>O Sistema ATLAS de Gestão é estruturado em 4 jornadas:</p>
        </div>
        <div style={s.jornadas}>
          {[
            { n: '01', t: 'ABC da Gestão', d: 'Você aprende o essencial e tem acesso ao sistema ATLAS — a ferramenta que organiza sua empresa do zero.' },
            { n: '02', t: 'Financeiro', d: 'DRE real. Fluxo de caixa. Ponto de equilíbrio. Capital de giro. Tudo estruturado para você enxergar o que o extrato não mostra.' },
            { n: '03', t: 'Eficiência e Margem', d: 'Precificação. Corte de custo. Ajustes que dobram a geração de lucro sem precisar vender mais.' },
            { n: '04', t: 'Modelo de Gestão', d: 'Rotina de gestão. KPIs essenciais. Tomada de decisão. Como escalar com controle — sem o negócio depender de você em tudo.' },
          ].map((j, i) => (
            <div key={j.n} style={{ ...s.jornada, ...(i === 3 ? { borderBottom: '1px solid #1e1e1e' } : {}) }}>
              <span style={s.jnum}>{j.n}</span>
              <div><div style={s.jtitle}>{j.t}</div><div style={s.jdesc}>{j.d}</div></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 72 }}>
          <span style={s.eyebrow}>O Que Está Incluso</span>
          <div style={s.llist}>
            {[
              'Conteúdo gravado — acesse quando e onde quiser, no seu ritmo.',
              '1 call individual por mês — sessão direta com foco no seu negócio.',
              '1 call em grupo por mês — aprendizado coletivo com outros empresários do mesmo nível.',
              'Acesso ao Sistema ATLAS — a ferramenta que organiza seu financeiro do zero.',
              'Acesso à comunidade Black Sheep — network real com empresários sérios.',
            ].map((item, i) => (
              <div key={i} style={{ ...s.litem, ...(i === 0 ? s.litemFirst : {}) }}>
                <span style={{ color: '#444', flexShrink: 0 }}>—</span>{item}
              </div>
            ))}
          </div>
          <p style={{ marginTop: 28, fontSize: 16, fontWeight: 300, color: '#aaa' }}>Em 6 meses, você sai com clareza total sobre tudo que acontece na sua empresa.</p>
        </div>
      </div>



      {/* Para Quem É */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>Para Quem É</span>
        <h2 style={s.h2}>Esse programa foi feito para empresas reais.</h2>
        <div style={s.alist}>
          {[
            'Você fatura bem mas não sabe sua margem de lucro',
            'Você cresce e o dinheiro some',
            'Você toma decisão no susto porque os números não fecham',
            'Você quer lucro previsível — não só faturamento a qualquer custo',
          ].map((item, i) => (
            <div key={i} style={{ ...s.aitem, ...(i === 0 ? s.aitemFirst : {}) }}>
              <span style={{ color: '#fff', flexShrink: 0 }}>→</span>{item}
            </div>
          ))}
        </div>
        <div style={s.nao}>
          <div style={s.naoTitle}>Não é para você se:</div>
          {[
            'Está começando e ainda não tem resultado.',
            'Busca milagre sem processo.',
            'Opera com produtos que enganam ou prejudicam pessoas.',
          ].map((item, i) => (
            <div key={i} style={{ ...s.naoItem, ...(i === 2 ? { borderBottom: 'none', paddingBottom: 0 } : {}) }}>
              <span style={{ flexShrink: 0 }}>—</span>{item}
            </div>
          ))}
        </div>
        <p style={s.bsNote}>O ATLAS faz parte da Black Sheep. A régua aqui é alta e só aceitamos empresários sérios.</p>
      </div>



      {/* Investimento */}
      <div style={s.invest} className="lp-invest">
        <span style={s.priceLabel}>Investimento</span>
        <span style={s.price}>R$14.000</span>
        <p style={s.priceDetail}>6 meses. 4 jornadas. Resultado em até 60 dias.<br /><br />Para quem fatura bem, isso é menos de uma semana de receita. O que custa mais — o programa ou mais 6 meses perdendo margem?</p>
      </div>



      {/* Como Entrar */}
      <div style={s.section} id="aplicar" className="lp-section">
        <span style={s.eyebrow}>Como Entrar</span>
        <div style={s.sem}>
          <span style={s.semItem}>Sem call de vendas</span>
          <span style={s.semItem}>Sem follow-up</span>
          <span style={s.semItem}>Sem insistência</span>
        </div>
        <div>
          {[
            { n: '01', t: 'Você aplica', d: 'Formulário curto com seu negócio atual e o problema principal.' },
            { n: '02', t: 'A gente analisa', d: 'Verificamos se faz sentido para os dois lados.' },
            { n: '03', t: 'Você recebe o próximo passo', d: 'Se fizer sentido, avançamos. Sem pressão.' },
          ].map((step, i) => (
            <div key={step.n} style={{ ...s.step, ...(i === 2 ? { borderBottom: '1px solid #1e1e1e' } : {}) }}>
              <span style={s.stepNum}>{step.n}</span>
              <div><div style={s.stepTitle}>{step.t}</div><div style={s.stepDesc}>{step.d}</div></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 52 }}>
          <a href="#" style={s.btn}>Aplicar Agora</a>
        </div>
      </div>



      {/* FAQ */}
      <div style={s.section} className="lp-section">
        <span style={s.eyebrow}>FAQ</span>
        <h2 style={s.h2}>Perguntas frequentes</h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{ ...s.faqItem, ...(i === FAQ_ITEMS.length - 1 ? { borderBottom: '1px solid #1e1e1e' } : {}) }}>
              <button
                style={s.faqQ}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <span style={{ ...s.faqIcon, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
              </button>
              {openFaq === i && <div style={s.faqA}>{item.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e1e1e' }}>
        <div style={s.footer} className="lp-footer-inner">
          <span style={s.footerLogo}>ATLAS</span>
          <span style={s.footerSep} />
          <span style={s.footerSub}>by Black Sheep · atlasconsultoria.com</span>
        </div>
      </footer>

    </div>
  )
}
