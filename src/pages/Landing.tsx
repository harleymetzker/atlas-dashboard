import { useState } from 'react'

const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0c0c0c;--white:#ffffff;--grey:#777777;--grey-light:#aaaaaa;--border:#1e1e1e;--surface:#111111}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--grey-light);font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.75;-webkit-font-smoothing:antialiased}
.lp-nav{padding:36px 60px;display:flex;align-items:center;gap:20px}
.lp-nav-logo{font-family:'Arial Black','Arial Bold',sans-serif;font-size:20px;color:var(--white);letter-spacing:5px;text-decoration:none}
.lp-nav-sep{width:1px;height:14px;background:var(--border)}
.lp-nav-by{font-size:10px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:var(--grey)}
.lp-hero{padding:80px 60px 140px;max-width:980px}
.lp-hero h1{font-family:'Arial Black','Arial Bold',sans-serif;font-size:clamp(72px,10vw,128px);line-height:0.93;color:var(--white);letter-spacing:1px;margin-bottom:44px}
.lp-hero h1 .dim{color:#333}
.lp-hero-sub{font-size:17px;font-weight:300;color:var(--grey);max-width:500px;line-height:1.7;margin-bottom:52px}
.lp-btn{display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#000;background:var(--white);padding:18px 52px;text-decoration:none;transition:opacity 0.15s;cursor:pointer;border:none}
.lp-btn:hover{opacity:0.85}
.lp-hr{border:none;border-top:1px solid var(--border);margin:0 60px}
.lp-section{padding:110px 60px;max-width:860px;margin:0 auto}
.lp-eyebrow{font-size:10px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:var(--grey);margin-bottom:28px;display:block}
.lp-h2{font-family:'Arial Black','Arial Bold',sans-serif;font-size:clamp(44px,5.5vw,72px);line-height:0.97;color:var(--white);letter-spacing:1px;margin-bottom:40px}
.lp-body{font-size:16px;font-weight:300;color:var(--grey-light);line-height:1.8;max-width:620px}
.lp-body p+p{margin-top:18px}
.lp-pgrid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--border);border-left:1px solid var(--border);margin-top:44px}
.lp-pcell{padding:28px 32px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);font-size:15px;font-weight:300;color:var(--grey);line-height:1.6;display:flex;gap:14px}
.lp-dash{color:#444;flex-shrink:0}
.lp-bq{margin:56px 0;padding-left:28px;border-left:2px solid var(--white)}
.lp-bq-text{font-family:'Arial Black','Arial Bold',sans-serif;font-size:clamp(36px,4.5vw,56px);color:var(--white);line-height:1.0}
.lp-jornadas{margin-top:52px}
.lp-jornada{display:grid;grid-template-columns:72px 1fr;gap:36px;padding:44px 0;border-top:1px solid var(--border);align-items:start}
.lp-jornada:last-child{border-bottom:1px solid var(--border)}
.lp-jnum{font-family:'Arial Black','Arial Bold',sans-serif;font-size:52px;color:#222;line-height:1}
.lp-jtitle{font-size:12px;font-weight:600;color:var(--white);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
.lp-jdesc{font-size:15px;font-weight:300;color:var(--grey);line-height:1.7}
.lp-llist{margin-top:40px}
.lp-litem{display:flex;gap:20px;padding:20px 0;border-bottom:1px solid var(--border);font-size:16px;font-weight:300;color:var(--grey-light);line-height:1.55}
.lp-litem:first-child{border-top:1px solid var(--border)}
.lp-lsym{color:#444;flex-shrink:0}
.lp-alist{margin-top:40px}
.lp-aitem{display:flex;gap:20px;padding:20px 0;border-bottom:1px solid var(--border);font-size:16px;font-weight:300;color:var(--grey-light)}
.lp-aitem:first-child{border-top:1px solid var(--border)}
.lp-arr{color:var(--white);flex-shrink:0}
.lp-nao{margin-top:52px;padding:40px 44px;border:1px solid var(--border);background:var(--surface)}
.lp-nao-title{font-size:10px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:var(--grey);margin-bottom:24px}
.lp-nao-item{display:flex;gap:16px;font-size:15px;font-weight:300;color:var(--grey);padding:14px 0;border-bottom:1px solid var(--border);line-height:1.55}
.lp-nao-item:last-child{border-bottom:none;padding-bottom:0}
.lp-bs-note{margin-top:36px;font-size:14px;font-weight:300;color:var(--grey);line-height:1.7}
.lp-invest{padding:110px 60px;max-width:860px;margin:0 auto}
.lp-price-label{font-size:10px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:var(--grey);margin-bottom:20px;display:block}
.lp-price{font-family:'Arial Black','Arial Bold',sans-serif;font-size:clamp(100px,16vw,176px);color:var(--white);line-height:0.88;letter-spacing:2px;margin-bottom:36px;display:block}
.lp-price-detail{font-size:16px;font-weight:300;color:var(--grey);line-height:1.8;max-width:500px;margin-bottom:48px}
.lp-sem{display:flex;gap:40px;margin-bottom:56px;flex-wrap:wrap}
.lp-sem-item{font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--grey)}
.lp-step{display:grid;grid-template-columns:60px 1fr;gap:32px;padding:40px 0;border-top:1px solid var(--border);align-items:start}
.lp-step:last-child{border-bottom:1px solid var(--border)}
.lp-step-num{font-family:'Arial Black','Arial Bold',sans-serif;font-size:44px;color:#222;line-height:1}
.lp-step-title{font-size:12px;font-weight:600;color:var(--white);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px}
.lp-step-desc{font-size:15px;font-weight:300;color:var(--grey);line-height:1.65}
.lp-faq-item{border-top:1px solid var(--border)}
.lp-faq-item:last-child{border-bottom:1px solid var(--border)}
.lp-faq-q{width:100%;background:none;border:none;padding:28px 0;text-align:left;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:400;color:var(--white);cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:24px;line-height:1.4}
.lp-faq-icon{font-size:24px;font-weight:300;color:var(--grey);flex-shrink:0;line-height:1;transition:transform 0.2s}
.lp-faq-icon.open{transform:rotate(45deg)}
.lp-faq-a{display:none;padding:0 0 28px;font-size:15px;font-weight:300;color:var(--grey);line-height:1.75;max-width:620px}
.lp-faq-a.open{display:block}
.lp-footer{border-top:1px solid var(--border);padding:48px 60px;display:flex;align-items:center;gap:20px}
.lp-footer-logo{font-family:'Arial Black','Arial Bold',sans-serif;font-size:15px;color:#2a2a2a;letter-spacing:5px}
.lp-footer-sep{width:1px;height:14px;background:var(--border)}
.lp-footer-sub{font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:#2a2a2a}
@media(max-width:768px){
  .lp-nav{padding:28px}
  .lp-hero{padding:60px 28px 100px}
  .lp-hr{margin:0 28px}
  .lp-section{padding:80px 28px}
  .lp-invest{padding:80px 28px}
  .lp-pgrid{grid-template-columns:1fr}
  .lp-jornada{grid-template-columns:1fr;gap:8px}
  .lp-step{grid-template-columns:1fr;gap:8px}
  .lp-footer{padding:36px 28px;flex-wrap:wrap}
  .lp-nao{padding:28px}
}
`

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

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <style>{css}</style>
      <div style={{ background: '#0c0c0c', minHeight: '100vh' }}>

        {/* Nav */}
        <nav className="lp-nav">
          <a href="#" className="lp-nav-logo">ATLAS</a>
          <span className="lp-nav-sep" />
          <span className="lp-nav-by">by Black Sheep</span>
        </nav>

        {/* Hero */}
        <div className="lp-hero">
          <h1>Você dobrou<br />o faturamento.<br /><span className="dim">E passou a ter<br />menos dinheiro.</span><br />Isso não é azar...<br />É falta de gestão.</h1>
          <p className="lp-hero-sub">O mercado digital te ensinou a vender mais. Ninguém te ensinou a controlar o que já entra.</p>
          <a href="#aplicar" className="lp-btn">Quero Entrar</a>
        </div>

        <hr className="lp-hr" />

        {/* Diagnóstico */}
        <div className="lp-section">
          <span className="lp-eyebrow">O Diagnóstico</span>
          <h2 className="lp-h2">Você não tem um problema de faturamento. Você tem um problema de gestão.</h2>
          <div className="lp-body">
            <p>A maioria que chega aqui já fatura bem. Já investe em tráfego. Já tem produto validado. Já tem vendas acontecendo.</p>
            <p>O problema é outro:</p>
          </div>
          <div className="lp-pgrid">
            <div className="lp-pcell"><span className="lp-dash">—</span>Fatura bem e não sabe quanto realmente lucra</div>
            <div className="lp-pcell"><span className="lp-dash">—</span>Cada mês que cresce, menos dinheiro sobra na conta</div>
            <div className="lp-pcell"><span className="lp-dash">—</span>Toma decisão no susto porque não sabe os próprios números</div>
            <div className="lp-pcell"><span className="lp-dash">—</span>Corta custo no lugar errado e espera milagre</div>
            <div className="lp-pcell"><span className="lp-dash">—</span>Perde dinheiro porque nunca parou para estruturar</div>
            <div className="lp-pcell" />
          </div>
          <div className="lp-body" style={{ marginTop: 44 }}>
            <p>Isso não é falta de esforço. É falta de gestão.</p>
            <p>E ninguém no digital fala sobre isso — porque gestão não tem palco. Tráfego pago tem palco. Lead tem palco. Funil tem palco.</p>
            <p>Gestão é o que acontece depois que o dinheiro entra. E é onde a maioria perde.</p>
          </div>
        </div>

        <hr className="lp-hr" />

        {/* Mentira */}
        <div className="lp-section">
          <span className="lp-eyebrow">A Mentira do Mercado</span>
          <h2 className="lp-h2">Te venderam a solução errada para o problema certo.</h2>
          <div className="lp-body">
            <p>Sem margem? Aumenta o faturamento.<br />Sem dinheiro no final do mês? Vende mais.<br />Empresa no limite? Escala.</p>
            <p>Essa é a lógica que o mercado digital ensina. E é exatamente o que destrói a empresa mais rápido.</p>
            <p>Quanto mais você cresce sem estrutura, mais a margem se corrói. Até o dia que você fatura alguns milhões e não tem dinheiro para pagar o time.</p>
            <p>Já vi isso acontecer. Mais de uma vez. Com empresários sérios.</p>
          </div>
        </div>

        <hr className="lp-hr" />

        {/* História */}
        <div className="lp-section">
          <span className="lp-eyebrow">A História</span>
          <h2 className="lp-h2">14 anos de empresa. E um padrão que já vi centenas de vezes.</h2>
          <div className="lp-body">
            <p>Sou filho de empresários. Cresci dentro de empresa vendo decisão difícil ser tomada.</p>
            <p>Há 14 anos construo e opero negócios. Passei pelo corporativo como executivo. Gestão sempre fez parte do meu dia-a-dia.</p>
            <p>Quando comecei a trabalhar com algumas empresas do digital, o padrão era sempre o mesmo — independente do segmento, do faturamento, do tamanho do time:</p>
            <p>Empresário com produto validado, com vendas, com crescimento absurdo... Mas sem clareza nenhuma sobre o que sobrava. Sem saber se estava lucrando ou apenas movimentando dinheiro.</p>
            <p>Minha conclusão é:</p>
          </div>
          <div className="lp-bq">
            <div className="lp-bq-text">O problema nunca foi faturamento.<br />Foi sempre gestão.</div>
          </div>
          <div className="lp-body">
            <p>E ninguém no digital fala sobre isso — porque gestão não tem palco.</p>
            <p>Esse cenário me fez criar o ATLAS.</p>
          </div>
        </div>

        <hr className="lp-hr" />

        {/* Mecanismo */}
        <div className="lp-section">
          <span className="lp-eyebrow">O Mecanismo</span>
          <h2 className="lp-h2">ATLAS não é mentoria financeira. É um modelo de gestão focado em lucro.</h2>
          <div className="lp-body">
            <p>A diferença é simples:</p>
            <p>Mentoria financeira te ensina a entender os números. O ATLAS te ensina a usar os números para tomar decisão — e mudar o resultado.</p>
            <p>O Sistema ATLAS de Gestão é estruturado em 4 jornadas:</p>
          </div>
          <div className="lp-jornadas">
            {[
              { n: '01', t: 'ABC da Gestão', d: 'Você aprende o essencial e tem acesso ao sistema ATLAS — a ferramenta que organiza sua empresa do zero.' },
              { n: '02', t: 'Financeiro', d: 'DRE real. Fluxo de caixa. Ponto de equilíbrio. Capital de giro. Tudo estruturado para você enxergar o que o extrato não mostra.' },
              { n: '03', t: 'Eficiência e Margem', d: 'Precificação. Corte de custo. Ajustes que dobram a geração de lucro sem precisar vender mais.' },
              { n: '04', t: 'Modelo de Gestão', d: 'Rotina de gestão. KPIs essenciais. Tomada de decisão. Como escalar com controle — sem o negócio depender de você em tudo.' },
            ].map(j => (
              <div key={j.n} className="lp-jornada">
                <span className="lp-jnum">{j.n}</span>
                <div><div className="lp-jtitle">{j.t}</div><div className="lp-jdesc">{j.d}</div></div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 80 }}>
            <span className="lp-eyebrow">O Que Está Incluso</span>
            <div className="lp-llist">
              {[
                'Conteúdo gravado — acesse quando e onde quiser, no seu ritmo.',
                '1 call individual por mês — sessão direta com foco no seu negócio.',
                '1 call em grupo por mês — aprendizado coletivo com outros empresários do mesmo nível.',
                'Acesso ao Sistema ATLAS — a ferramenta que organiza seu financeiro do zero.',
                'Acesso à comunidade Black Sheep — network real com empresários sérios.',
              ].map(item => (
                <div key={item} className="lp-litem"><span className="lp-lsym">—</span>{item}</div>
              ))}
            </div>
            <p style={{ marginTop: 32, fontSize: 16, fontWeight: 300, color: '#aaaaaa' }}>Em 6 meses, você sai com clareza total sobre tudo que acontece na sua empresa.</p>
          </div>
        </div>

        <hr className="lp-hr" />

        {/* Para Quem É */}
        <div className="lp-section">
          <span className="lp-eyebrow">Para Quem É</span>
          <h2 className="lp-h2">Esse programa foi feito para empresas reais.</h2>
          <div className="lp-alist">
            {[
              'Você fatura bem mas não sabe sua margem de lucro',
              'Você cresce e o dinheiro some',
              'Você toma decisão no susto porque os números não fecham',
              'Você quer lucro previsível — não só faturamento a qualquer custo',
            ].map(item => (
              <div key={item} className="lp-aitem"><span className="lp-arr">→</span>{item}</div>
            ))}
          </div>
          <div className="lp-nao">
            <div className="lp-nao-title">Não é para você se:</div>
            {[
              'Está começando e ainda não tem resultado.',
              'Busca milagre sem processo.',
              'Opera com produtos que enganam ou prejudicam pessoas.',
            ].map(item => (
              <div key={item} className="lp-nao-item"><span>—</span>{item}</div>
            ))}
          </div>
          <p className="lp-bs-note">O ATLAS faz parte da Black Sheep. A régua aqui é alta e só aceitamos empresários sérios.</p>
        </div>

        <hr className="lp-hr" />

        {/* Investimento */}
        <div className="lp-invest">
          <span className="lp-price-label">Investimento</span>
          <span className="lp-price">R$14.000</span>
          <p className="lp-price-detail">6 meses. 4 jornadas. Resultado em até 60 dias.<br /><br />Para quem fatura bem, isso é menos de uma semana de receita. O que custa mais — o programa ou mais 6 meses perdendo margem?</p>
          <a href="#aplicar" className="lp-btn">Aplicar Agora</a>
        </div>

        <hr className="lp-hr" />

        {/* Como Entrar */}
        <div className="lp-section" id="aplicar">
          <span className="lp-eyebrow">Como Entrar</span>
          <div className="lp-sem">
            <span className="lp-sem-item">Sem call de vendas</span>
            <span className="lp-sem-item">Sem follow-up</span>
            <span className="lp-sem-item">Sem insistência</span>
          </div>
          <div>
            {[
              { n: '01', t: 'Você aplica', d: 'Formulário curto com seu negócio atual e o problema principal.' },
              { n: '02', t: 'A gente analisa', d: 'Verificamos se faz sentido para os dois lados.' },
              { n: '03', t: 'Você recebe o próximo passo', d: 'Se fizer sentido, avançamos. Sem pressão.' },
            ].map(s => (
              <div key={s.n} className="lp-step">
                <span className="lp-step-num">{s.n}</span>
                <div><div className="lp-step-title">{s.t}</div><div className="lp-step-desc">{s.d}</div></div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 56 }}>
            <a href="#" className="lp-btn">Aplicar Agora</a>
          </div>
        </div>

        <hr className="lp-hr" />

        {/* FAQ */}
        <div className="lp-section">
          <span className="lp-eyebrow">FAQ</span>
          <h2 className="lp-h2">Perguntas frequentes</h2>
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="lp-faq-item">
                <button
                  className="lp-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <span className={`lp-faq-icon${openFaq === i ? ' open' : ''}`}>+</span>
                </button>
                <div className={`lp-faq-a${openFaq === i ? ' open' : ''}`}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="lp-footer">
          <span className="lp-footer-logo">ATLAS</span>
          <span className="lp-footer-sep" />
          <span className="lp-footer-sub">by Black Sheep · atlasconsultoria.com</span>
        </footer>

      </div>
    </>
  )
}
