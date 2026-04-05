import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { period, dre, cashFlow, runway } = body

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not set')
    }

    const systemPrompt = `Você é um consultor financeiro especialista em empresas do digital (e-commerce, SaaS, agências, infoprodutos). Analisa DREs e fluxos de caixa com precisão e linguagem direta, sem rodeios. Sempre responde em JSON com a estrutura exata solicitada. Nunca adiciona campos extras. Usa valores reais fornecidos no contexto. Dá diagnóstico honesto mesmo quando os números são ruins. Nunca faça comparações com médias de mercado, benchmarks de setor ou dados externos. Analise apenas os números fornecidos. Não use frases como "acima da média do setor" ou "típico do mercado". O parâmetro de caixa mínimo saudável desta empresa é 2,5 vezes os custos fixos mensais. Use sempre esse multiplicador nas recomendações, nunca 3 meses.`

    const userPrompt = `Analise os dados financeiros abaixo referentes ao período ${period} e retorne um JSON com exatamente estes campos:

{
  "diagnostico_geral": "string (2-3 frases resumindo a saúde financeira do negócio)",
  "dre_vs_caixa": "string (análise técnica da relação entre o lucro da DRE e a geração de caixa do período — se há divergência, qual a causa provável — competência vs caixa, retiradas, prazo de recebimento — e o que o empresário deve monitorar; tom de CFO, técnico e direto, 2-4 frases)",
  "pontos_criticos": ["string", "string", "string"] (lista de 2-4 problemas urgentes, ou lista vazia se não houver),
  "pontos_positivos": ["string", "string"] (lista de 2-4 pontos fortes, ou lista vazia se não houver),
  "acoes_prioritarias": ["string", "string", "string"] (lista de 3-5 ações concretas e específicas),
  "tendencia": "string (parágrafo de 2-4 frases descrevendo a tendência do negócio — se está melhorando ou piorando em relação ao mês anterior e por quê, baseado exclusivamente nos números fornecidos)"
}

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

    console.log('[diagnose] Calling Anthropic API...')
    console.log('[diagnose] API key present:', !!ANTHROPIC_API_KEY, '| key prefix:', ANTHROPIC_API_KEY.slice(0, 10))

    let response: Response
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
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
    } catch (fetchErr) {
      console.error('[diagnose] fetch() threw:', fetchErr)
      return new Response(JSON.stringify({
        error: 'fetch_failed',
        detail: String(fetchErr),
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log('[diagnose] Anthropic status:', response.status)

    if (!response.ok) {
      const errText = await response.text()
      console.error('[diagnose] Anthropic error body:', errText)
      return new Response(JSON.stringify({
        error: 'anthropic_api_error',
        status: response.status,
        detail: errText,
      }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const data = await response.json()
    console.log('[diagnose] Anthropic response keys:', Object.keys(data))
    const content = data.content?.[0]?.text ?? ''
    console.log('[diagnose] Raw AI text (first 200):', content.slice(0, 200))

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch (parseErr) {
      console.error('[diagnose] JSON parse failed:', parseErr)
      return new Response(JSON.stringify({
        error: 'json_parse_failed',
        detail: String(parseErr),
        raw: content,
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ analysis: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[diagnose] Unhandled error:', err)
    return new Response(JSON.stringify({
      error: 'unhandled_error',
      detail: String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
