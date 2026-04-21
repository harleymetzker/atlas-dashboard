import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BENCHMARKS: Record<string, string> = {
  'Alimentação': `
- Margem líquida saudável: 8–12% | Crítico: abaixo de 5%
- CMV saudável: até 35% | Crítico: acima de 40%
- Margem de contribuição esperada: 55–65%
- Despesas fixas saudáveis: até 45% do faturamento líquido
- Tolerância: ±2p.p. = aceitável | acima disso = alerta | muito acima = crítico`,

  'Indústria': `
- Margem líquida saudável: 8–15% | Crítico: abaixo de 5%
- CMV saudável: até 50% | Crítico: acima de 60%
- Margem de contribuição esperada: 40–55%
- Despesas fixas saudáveis: até 35% do faturamento líquido
- Tolerância: ±2p.p.`,

  'Serviços': `
- Margem líquida saudável: 15–25% (se intensivo em pessoas: 10–20%) | Crítico: abaixo de 8%
- CMV saudável: até 20% | Crítico: acima de 30%
- Margem de contribuição esperada: 60–75%
- IMPORTANTE: se RH representa mais de 40% das despesas fixas, margem no limite inferior é normal — não classificar como problema
- Tolerância: ±2p.p.`,

  'Infoprodutos & Mentoria': `
- Margem líquida saudável: 20–40% (com tráfego pago pesado) ou 40–60% (orgânico/marca forte) | Crítico: abaixo de 15%
- CMV saudável: até 10% | Crítico: acima de 20%
- Margem de contribuição esperada: 60–80%
- Despesas variáveis de venda altas são normais (tráfego, afiliados) — não classificar como problema isolado
- Tolerância: ±2p.p.`,

  'SaaS & Tecnologia': `
- Margem bruta esperada: acima de 70% — principal indicador do setor
- Margem líquida saudável (empresas maduras): 10–25% | Early stage (menos de 3 anos): não usar margem líquida como benchmark
- Despesas fixas altas de RH e infra com receita crescente podem indicar estratégia de crescimento — não classificar como crítico automaticamente
- Tolerância: ±2p.p.`,

  'Varejo': `
- Margem líquida saudável: 5–10% | Crítico: abaixo de 3%
- CMV saudável: até 60% | Crítico: acima de 70%
- Margem de contribuição esperada: 30–45%
- Despesas fixas saudáveis: até 30% do faturamento líquido
- Tolerância: ±2p.p.`,

  'E-commerce': `
- Margem líquida saudável: 8–13% (marketplace) ou 10–15% (loja própria) | Crítico: abaixo de 5%
- CMV saudável: até 55% | Crítico: acima de 65%
- Margem de contribuição esperada: 35–50%
- Despesas variáveis de venda altas são normais (frete, marketplace, tráfego)
- Tolerância: ±2p.p.`,
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { period, dre, cashFlow, runway, companyProfile } = body

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')

    const benchmarks = companyProfile?.setor ? BENCHMARKS[companyProfile.setor] ?? '' : ''

    const profileContext = companyProfile ? `
PERFIL DA EMPRESA:
- Nome: ${companyProfile.nome_empresa || 'não informado'}
- Setor: ${companyProfile.setor}
- Modelo de negócio: ${companyProfile.modelo_negocio}
- Ticket médio: ${companyProfile.ticket_medio}
- Tempo de operação: ${companyProfile.tempo_operacao}` : ''

    const benchmarkContext = benchmarks ? `
BENCHMARKS DO SETOR (${companyProfile.setor}):
${benchmarks}
Use esses benchmarks para classificar cada indicador como saudável, em alerta ou crítico. Aplique a tolerância de ±2p.p. antes de classificar qualquer indicador como problema.` : ''

    const systemPrompt = `Você é um consultor financeiro especialista em empresas do mercado brasileiro. Analisa DREs e fluxos de caixa com precisão e linguagem direta, sem rodeios. Sempre responde em JSON com a estrutura exata solicitada. Nunca adiciona campos extras. Usa valores reais fornecidos no contexto. Dá diagnóstico honesto mesmo quando os números são ruins. Quando benchmarks de setor forem fornecidos, use-os para comparar e classificar os indicadores — diga explicitamente se o número está dentro, abaixo ou acima do esperado para o setor. O parâmetro de caixa mínimo saudável é 2,5 vezes os custos fixos mensais.`

    const companyName = companyProfile?.nome_empresa || 'a empresa'

    const userPrompt = `Analise os dados financeiros de ${companyName} referentes ao período ${period} e retorne um JSON com exatamente estes campos:

{
  "frase_destaque": "string (1-2 frases de resumo INDEPENDENTE sobre o estado geral de ${companyName}. REGRA CRÍTICA: NÃO pode repetir nenhum trecho do campo diagnostico_geral. Deve ser uma conclusão própria, escrita antes de qualquer análise — como se fosse o título de um laudo.)",
  "diagnostico_geral": "string (2-3 frases resumindo a saúde financeira de ${companyName}, mencionando o setor quando relevante. O texto deve ser diferente da frase_destaque.)",
  "dre_vs_caixa": "string (análise técnica da relação entre lucro da DRE e geração de caixa — divergências, causas prováveis, o que monitorar; tom de CFO, 2-4 frases)",
  "pontos_criticos": ["string"] (2-4 problemas urgentes com referência aos benchmarks do setor quando aplicável, ou lista vazia),
  "pontos_positivos": ["string"] (2-4 pontos fortes com referência aos benchmarks do setor quando aplicável, ou lista vazia),
  "acoes_prioritarias": ["string"] (3-5 ações concretas e específicas para ${companyName}),
  "tendencia": "string (2-4 frases sobre tendência do negócio baseada exclusivamente nos números fornecidos)"
}

${profileContext}

${benchmarkContext}

DADOS DO PERÍODO ${period}:

DRE:
- Faturamento Bruto: R$ ${dre.faturamentoBruto.toFixed(2)}
- Impostos: R$ ${dre.impostos.toFixed(2)}
- Faturamento Líquido: R$ ${dre.faturamentoLiquido.toFixed(2)}
- CMV: R$ ${dre.cmv.toFixed(2)}
- Lucro Bruto: R$ ${dre.lucroBruto.toFixed(2)} (${dre.lucroBrutoMargin.toFixed(1)}%)
- Despesas Variáveis: R$ ${dre.totalDespesasVariaveis.toFixed(2)}
- Margem de Contribuição: R$ ${dre.margemContribuicao.toFixed(2)} (${dre.margemContribuicaoMargin.toFixed(1)}%)
- Despesas Fixas: R$ ${dre.totalDespesasFixas.toFixed(2)}
  - RH: R$ ${dre.despesasRH.toFixed(2)}
  - Ocupação: R$ ${dre.despesasOcupacao.toFixed(2)}
  - Administrativo: R$ ${dre.despesasAdmin.toFixed(2)}
- EBITDA: R$ ${dre.ebitda.toFixed(2)} (${dre.ebitdaMargin.toFixed(1)}%)
- Retiradas: R$ ${dre.retiradas.toFixed(2)}
- Lucro Líquido: R$ ${dre.lucro.toFixed(2)} (${dre.lucroMargin.toFixed(1)}%)

FLUXO DE CAIXA:
- Total Entradas: R$ ${cashFlow.totalEntradas.toFixed(2)}
- Total Saídas: R$ ${cashFlow.totalSaidas.toFixed(2)}
- Geração de Caixa: R$ ${cashFlow.geracao.toFixed(2)}
- Runway estimado: ${runway === null ? 'não calculado' : runway < 1 ? Math.round(runway * 30) + ' dias' : runway.toFixed(1) + ' meses'}

Retorne APENAS o JSON, sem markdown, sem explicações adicionais.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return new Response(JSON.stringify({ error: 'anthropic_api_error', status: response.status, detail: errText }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text ?? ''

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      return new Response(JSON.stringify({ error: 'json_parse_failed', raw: content }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ analysis: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'unhandled_error', detail: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
