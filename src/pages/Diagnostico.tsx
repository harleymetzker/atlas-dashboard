import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BrainCircuit, CheckCircle2, Zap, TrendingUp, AlertCircle, Trash2, ArrowLeftRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEntries } from '../hooks/useEntries'
import { calcDRE } from '../lib/calculations'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { formatCurrency } from '../lib/calculations'

const CREDIT_LIMIT = 2

interface AnalysisContent {
  diagnostico_geral: string
  dre_vs_caixa: string
  pontos_criticos: string[]
  pontos_positivos: string[]
  acoes_prioritarias: string[]
  tendencia: string
}

interface SavedAnalysis {
  id: string
  period: string
  created_at: string
  content: AnalysisContent
}

interface AnalysisCredit {
  id: string
  month: string
  used: number
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]


function AnalysisResult({ content }: { content: AnalysisContent }) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start gap-3">
          <BrainCircuit size={18} className="text-white/60 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">Diagnóstico Geral</h4>
            <p className="text-sm text-white/80 leading-relaxed">{content.diagnostico_geral}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <ArrowLeftRight size={18} className="text-white/60 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">DRE vs Fluxo de Caixa</h4>
            <p className="text-sm text-white/80 leading-relaxed">{content.dre_vs_caixa}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <TrendingUp size={18} className="text-white/60 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">Tendência</h4>
            <p className="text-sm text-white/80 leading-relaxed">{content.tendencia}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Pontos Críticos</h4>
              {content.pontos_criticos.length === 0 ? (
                <p className="text-xs text-white/50 italic">Nenhum ponto crítico identificado.</p>
              ) : (
                <ul className="space-y-2">
                  {content.pontos_criticos.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-red-400 mt-0.5 shrink-0">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-brand-green mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Pontos Positivos</h4>
              {content.pontos_positivos.length === 0 ? (
                <p className="text-xs text-white/50 italic">Nenhum ponto positivo identificado.</p>
              ) : (
                <ul className="space-y-2">
                  {content.pontos_positivos.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-brand-green mt-0.5 shrink-0">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <Zap size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Ações Prioritárias</h4>
            <ol className="space-y-2">
              {content.acoes_prioritarias.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="text-amber-400 font-bold tabular-nums shrink-0">{i + 1}.</span>
                  {a}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function Diagnostico() {
  const { user } = useAuth()
  const today = new Date()

  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear]   = useState(today.getFullYear())

  const startDate  = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay    = new Date(year, month, 0).getDate()
  const endDate    = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  const periodLabel = format(new Date(year, month - 1, 2), 'MMMM/yyyy', { locale: ptBR })

  // Current calendar month key e.g. "2026-04"
  const currentMonthKey = format(today, 'yyyy-MM')

  const { entries, loading: loadingEntries } = useEntries({ startDate, endDate, dateField: 'competence_date' })
  const { entries: cashEntries } = useEntries({ startDate, endDate, dateField: 'payment_date' })

  const [analysis, setAnalysis]     = useState<AnalysisContent | null>(null)
  const [history, setHistory]       = useState<SavedAnalysis[]>([])
  const [credits, setCredits]       = useState<AnalysisCredit | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [companyProfile, setCompanyProfile] = useState<{
    setor: string
    modelo_negocio: string
    tempo_operacao: string
    ticket_medio: string
  } | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profileForm, setProfileForm] = useState({
    setor: '',
    modelo_negocio: '',
    tempo_operacao: '',
    ticket_medio: '',
  })

  useEffect(() => {
    if (!user) return
    loadHistory()
    loadCredits()
    loadProfile()
  }, [user])

  async function loadProfile() {
    if (!user) return
    setLoadingProfile(true)
    const { data } = await supabase
      .from('company_profiles')
      .select('setor, modelo_negocio, tempo_operacao, ticket_medio')
      .eq('user_id', user.id)
      .maybeSingle()
    setCompanyProfile(data)
    setLoadingProfile(false)
  }

  async function handleSaveProfile() {
    if (!user) return
    if (!profileForm.setor || !profileForm.modelo_negocio || !profileForm.tempo_operacao || !profileForm.ticket_medio) return

    const { data, error } = await supabase
      .from('company_profiles')
      .upsert({ user_id: user.id, ...profileForm, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select('setor, modelo_negocio, tempo_operacao, ticket_medio')
      .single()

    if (!error && data) {
      setCompanyProfile(data)
      setShowProfileForm(false)
    }
  }

  // Returns the most recent analysis per period (deduped by period, latest created_at wins)
  async function loadHistory() {
    const { data } = await supabase
      .from('analyses')
      .select('id, period, created_at, content')
      .order('created_at', { ascending: false })

    if (!data) return

    const seen = new Map<string, SavedAnalysis>()
    for (const row of data as SavedAnalysis[]) {
      if (!seen.has(row.period)) seen.set(row.period, row)
    }

    // Keep only the 3 most recent unique months
    setHistory(Array.from(seen.values()).slice(0, 3))
  }

  async function loadCredits() {
    if (!user) return

    const { data } = await supabase
      .from('analysis_credits')
      .select('id, month, used')
      .eq('user_id', user.id)
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle()

    // If no record or record is from a previous month, create a fresh one
    if (!data || data.month !== currentMonthKey) {
      const { data: inserted } = await supabase
        .from('analysis_credits')
        .insert({ user_id: user.id, month: currentMonthKey, used: 0 })
        .select('id, month, used')
        .single()
      if (inserted) setCredits(inserted as AnalysisCredit)
    } else {
      setCredits(data as AnalysisCredit)
    }
  }

  const dre          = calcDRE(entries)
  const totalEntradas = cashEntries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0)
  const totalSaidas   = cashEntries.filter(e => e.type !== 'revenue').reduce((s, e) => s + e.amount, 0)
  const geracao       = totalEntradas - totalSaidas
  const runway        = dre.totalDespesasFixas > 0 ? dre.ebitda / dre.totalDespesasFixas : null

  const creditsUsed      = credits?.used ?? 0
  const creditsAvailable = Math.max(0, CREDIT_LIMIT - creditsUsed)
  const hasCredits       = creditsAvailable > 0

  async function handleGenerate() {
    if (!user || !hasCredits) return
    setGenerating(true)
    setError(null)
    setAnalysis(null)

    try {
      const session = (await supabase.auth.getSession()).data.session
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/diagnose`

      const httpRes = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          period: periodLabel,
          dre,
          cashFlow: { totalEntradas, totalSaidas, geracao },
          runway,
          companyProfile,
        }),
      })

      const data = await httpRes.json()

      if (!httpRes.ok || data?.error) {
        throw new Error(JSON.stringify({ http_status: httpRes.status, ...data }))
      }

      const result = data.analysis as AnalysisContent
      setAnalysis(result)

      // Save analysis
      await supabase.from('analyses').insert({
        user_id: user.id,
        period: periodLabel,
        content: result,
      })

      // Increment credit usage
      if (credits) {
        const newUsed = creditsUsed + 1
        await supabase
          .from('analysis_credits')
          .update({ used: newUsed })
          .eq('id', credits.id)
        setCredits({ ...credits, used: newUsed })
      }

      await loadHistory()
    } catch (err) {
      setError(String(err))
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta análise?')) return
    await supabase.from('analyses').delete().eq('id', id)
    setHistory(prev => prev.filter(h => h.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i)

  if (loadingProfile) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (!companyProfile && !showProfileForm) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="max-w-md w-full">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">Antes de começar</h2>
            <p className="text-sm text-white/60 mt-2">Precisamos entender o seu negócio para que a IA possa comparar seus números com benchmarks reais do seu setor.</p>
          </div>
          <button
            onClick={() => setShowProfileForm(true)}
            className="w-full bg-white text-black font-semibold text-sm rounded-2xl py-4 hover:bg-white/90 transition-all"
          >
            Configurar perfil da empresa
          </button>
        </div>
      </div>
    )
  }

  if (showProfileForm) {
    const SETORES = ['Alimentação', 'Indústria', 'Serviços', 'Infoprodutos & Mentoria', 'SaaS & Tecnologia', 'Varejo', 'E-commerce']
    const MODELOS = ['B2B', 'B2C', 'Ambos']
    const TEMPOS = ['Menos de 1 ano', '1–3 anos', '3+ anos']
    const TICKETS = ['Até R$200', 'R$200–2k', 'R$2k–10k', 'Acima de R$10k']

    const selectStyle = "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50 appearance-none cursor-pointer"
    const labelStyle = "block text-xs text-white/60 uppercase tracking-widest mb-2"

    const isValid = profileForm.setor && profileForm.modelo_negocio && profileForm.tempo_operacao && profileForm.ticket_medio

    return (
      <div className="p-8">
        <div className="max-w-md">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">Perfil da empresa</h2>
            <p className="text-sm text-white/60 mt-2">Essas informações definem os benchmarks usados na análise. Preenchimento único.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelStyle}>Setor</label>
              <select className={selectStyle} value={profileForm.setor} onChange={e => setProfileForm(f => ({ ...f, setor: e.target.value }))}>
                <option value="" className="bg-black">Selecione...</option>
                {SETORES.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
            </div>

            <div>
              <label className={labelStyle}>Modelo de negócio</label>
              <select className={selectStyle} value={profileForm.modelo_negocio} onChange={e => setProfileForm(f => ({ ...f, modelo_negocio: e.target.value }))}>
                <option value="" className="bg-black">Selecione...</option>
                {MODELOS.map(m => <option key={m} value={m} className="bg-black">{m}</option>)}
              </select>
            </div>

            <div>
              <label className={labelStyle}>Ticket médio</label>
              <select className={selectStyle} value={profileForm.ticket_medio} onChange={e => setProfileForm(f => ({ ...f, ticket_medio: e.target.value }))}>
                <option value="" className="bg-black">Selecione...</option>
                {TICKETS.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
              </select>
            </div>

            <div>
              <label className={labelStyle}>Tempo de operação</label>
              <select className={selectStyle} value={profileForm.tempo_operacao} onChange={e => setProfileForm(f => ({ ...f, tempo_operacao: e.target.value }))}>
                <option value="" className="bg-black">Selecione...</option>
                {TEMPOS.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
              </select>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={!isValid}
              className="w-full bg-white text-black font-semibold text-sm rounded-2xl py-4 hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all mt-4"
            >
              Salvar e continuar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Diagnóstico IA</h2>
          <p className="text-sm text-white/50 mt-1">Análise financeira gerada por inteligência artificial</p>
          <button
            onClick={() => { setProfileForm(companyProfile!); setShowProfileForm(true) }}
            className="text-xs text-white/35 hover:text-white/70 transition-colors mt-1"
          >
            {companyProfile?.setor} · Editar perfil
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/50 appearance-none cursor-pointer"
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1} className="bg-black">{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/50 appearance-none cursor-pointer"
          >
            {years.map(y => (
              <option key={y} value={y} className="bg-black">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      {!loadingEntries && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Faturamento Bruto', value: formatCurrency(dre.faturamentoBruto) },
            { label: 'Lucro Líquido',     value: formatCurrency(dre.lucro),  colored: true, positive: dre.lucro >= 0 },
            { label: 'EBITDA',            value: formatCurrency(dre.ebitda), colored: true, positive: dre.ebitda >= 0 },
            { label: 'Geração de Caixa',  value: formatCurrency(geracao),    colored: true, positive: geracao >= 0 },
          ].map(({ label, value, colored, positive }) => (
            <div key={label} className="bg-white/5 border border-white/15 rounded-2xl p-4">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-1">{label}</p>
              <p className={`text-lg font-bold tabular-nums ${colored ? (positive ? 'text-brand-green' : 'text-red-400') : 'text-white'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Credit counter */}
      <div className={`text-sm font-semibold ${hasCredits ? 'text-brand-green' : 'text-red-400'}`}>
        Créditos disponíveis: {creditsAvailable}/{CREDIT_LIMIT}
        {!hasCredits && <span className="ml-2 font-normal text-red-400/70">— Você atingiu o limite de {CREDIT_LIMIT} análises este mês.</span>}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating || loadingEntries || !hasCredits}
        className="w-full bg-white text-black font-semibold text-sm rounded-2xl py-4 hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Gerando análise...
          </>
        ) : (
          <>
            <BrainCircuit size={16} />
            Gerar Análise com IA — {periodLabel}
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">Erro</p>
          <pre className="text-xs text-red-300/80 whitespace-pre-wrap break-all font-mono leading-relaxed">
            {(() => { try { return JSON.stringify(JSON.parse(error.replace(/^Error: /, '')), null, 2) } catch { return error } })()}
          </pre>
        </div>
      )}

      {/* Current analysis result */}
      {analysis && (
        <div>
          <p className="text-xs text-white/50 uppercase tracking-widest mb-4">Análise — {periodLabel}</p>
          <AnalysisResult content={analysis} />
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">Últimas Análises</h3>
          <div className="space-y-3">
            {history.map(item => (
              <Card key={item.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white capitalize">{item.period}</p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="text-xs text-white/60 hover:text-white transition-colors whitespace-nowrap"
                    >
                      {expandedId === item.id ? 'Fechar' : 'Ver análise completa'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-white/35 hover:text-red-400 transition-colors"
                      title="Excluir análise"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {expandedId === item.id && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <AnalysisResult content={item.content} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
