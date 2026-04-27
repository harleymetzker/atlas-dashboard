import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BrainCircuit, CheckCircle2, Zap, TrendingUp, AlertCircle, Trash2, ArrowLeftRight, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEntries } from '../hooks/useEntries'
import { calcDRE } from '../lib/calculations'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/calculations'

const CREDIT_LIMIT = 2

interface AnalysisContent {
  frase_destaque: string
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


const SECTION_KEY = ['diagnostico_geral', 'dre_vs_caixa', 'tendencia'] as const

function AnalysisResult({ content }: { content: AnalysisContent }) {
  const [openSection, setOpenSection] = useState<string | null>('diagnostico_geral')

  const quote = content.frase_destaque || content.diagnostico_geral.split(/(?<=[.!?])\s+/)[0]

  const sections = [
    { key: 'diagnostico_geral', label: 'Diagnóstico Geral',     icon: BrainCircuit,  text: content.diagnostico_geral },
    { key: 'dre_vs_caixa',     label: 'DRE vs Fluxo de Caixa', icon: ArrowLeftRight, text: content.dre_vs_caixa },
    { key: 'tendencia',        label: 'Tendência',              icon: TrendingUp,    text: content.tendencia },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Quote destaque */}
      <blockquote style={{
        margin: 0, borderLeft: '3px solid #6710A2', paddingLeft: 20,
        fontSize: 20, fontWeight: 600, color: '#fff', lineHeight: 1.45,
      }}>
        {quote}
      </blockquote>

      {/* Seções expansíveis */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, overflow: 'hidden' }}>
        {sections.map((s, i) => (
          <div key={s.key} style={{ borderBottom: i < sections.length - 1 ? '1px solid #1e1e1e' : undefined }}>
            <button
              onClick={() => setOpenSection(openSection === s.key ? null : s.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#80EF00', fontWeight: 600 }}>
                {s.label}
              </span>
              <ChevronDown size={14} style={{ color: '#80EF00', flexShrink: 0, transform: openSection === s.key ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {openSection === s.key && (
              <div style={{ padding: '0 20px 18px', color: '#A6A8AB', fontSize: 14, lineHeight: 1.7 }}>
                {s.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pontos críticos e positivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Pontos Críticos',  items: content.pontos_criticos,  icon: AlertCircle,  color: '#EF4444' },
          { label: 'Pontos Positivos', items: content.pontos_positivos, icon: CheckCircle2, color: '#80EF00' },
        ].map(({ label, items, icon: Icon, color }) => (
          <div key={label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon size={15} style={{ color, flexShrink: 0 }} />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666', fontWeight: 600 }}>{label}</span>
            </div>
            {items.length === 0 ? (
              <p style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>Nenhum identificado.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((p, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: '#A6A8AB', lineHeight: 1.5 }}>
                    <span style={{ color, flexShrink: 0, marginTop: 2 }}>•</span>
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Ações prioritárias */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Zap size={15} style={{ color: '#B5A74D', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666', fontWeight: 600 }}>Ações Prioritárias</span>
        </div>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {content.acoes_prioritarias.map((a, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: '#A6A8AB', lineHeight: 1.6 }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", color: '#B5A74D', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              {a}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

// Silence unused import warnings
void SECTION_KEY

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
    nome_empresa: string
    setor: string
    modelo_negocio: string
    tempo_operacao: string
    ticket_medio: string
  } | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profileForm, setProfileForm] = useState({
    nome_empresa: '',
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
      .select('nome_empresa, setor, modelo_negocio, tempo_operacao, ticket_medio')
      .eq('user_id', user.id)
      .maybeSingle()
    setCompanyProfile(data)
    setLoadingProfile(false)
  }

  async function handleSaveProfile() {
    if (!user) return
    if (!profileForm.nome_empresa || !profileForm.setor || !profileForm.modelo_negocio || !profileForm.tempo_operacao || !profileForm.ticket_medio) return

    const { data, error } = await supabase
      .from('company_profiles')
      .upsert({ user_id: user.id, ...profileForm, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select('nome_empresa, setor, modelo_negocio, tempo_operacao, ticket_medio')
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
    <div className="p-4 md:p-8 flex items-center justify-center min-h-[400px]">
      <div className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (!companyProfile && !showProfileForm) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[500px]">
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

    const isValid = profileForm.nome_empresa && profileForm.setor && profileForm.modelo_negocio && profileForm.tempo_operacao && profileForm.ticket_medio

    return (
      <div className="p-4 md:p-8">
        <div className="max-w-md">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">Perfil da empresa</h2>
            <p className="text-sm text-white/60 mt-2">Essas informações definem os benchmarks usados na análise. Preenchimento único.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelStyle}>Nome da empresa</label>
              <input
                type="text"
                className={selectStyle}
                placeholder="Ex: Black Sheep Burguer"
                value={profileForm.nome_empresa}
                onChange={e => setProfileForm(f => ({ ...f, nome_empresa: e.target.value }))}
              />
            </div>
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
    <div className="p-4 md:p-8 space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>Diagnóstico</h2>
          <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Análise gerada por IA. Interpretada como um sócio falaria.</p>
          <button
            onClick={() => { setProfileForm(companyProfile!); setShowProfileForm(true) }}
            style={{ fontSize: 11, color: '#555', marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#A6A8AB' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
          >
            {companyProfile?.setor} · Editar perfil
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            style={{ fontFamily: "'Geist Mono', monospace", background: '#111', border: '1px solid #1e1e1e', borderRadius: 6, padding: '8px 14px', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1} style={{ background: '#111' }}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ fontFamily: "'Geist Mono', monospace", background: '#111', border: '1px solid #1e1e1e', borderRadius: 6, padding: '8px 14px', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            {years.map(y => (
              <option key={y} value={y} style={{ background: '#111' }}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      {!loadingEntries && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Faturamento Bruto', value: formatCurrency(dre.faturamentoBruto), color: '#fff' },
            { label: 'Lucro Líquido',     value: formatCurrency(dre.lucro),            color: dre.lucro >= 0 ? '#80EF00' : '#EF4444' },
            { label: 'EBITDA',            value: formatCurrency(dre.ebitda),           color: dre.ebitda >= 0 ? '#80EF00' : '#EF4444' },
            { label: 'Geração de Caixa',  value: formatCurrency(geracao),              color: geracao >= 0 ? '#80EF00' : '#EF4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: 16 }}>
              <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 8 }}>{label}</p>
              <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 22, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</p>
              <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{periodLabel}</p>
            </div>
          ))}
        </div>
      )}

      {/* Generate block */}
      <div
        className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6"
        style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: 24 }}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(103,16,162,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BrainCircuit size={20} style={{ color: '#6710A2' }} />
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Diagnóstico Financeiro</p>
            <p style={{ fontSize: 14, color: '#A6A8AB', lineHeight: 1.5, marginBottom: 8 }}>
              Análise completa da sua DRE e fluxo de caixa. Interpretada como um sócio falaria.
            </p>
            <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: !hasCredits ? '#EF4444' : '#80EF00' }}>
              {creditsAvailable}/{CREDIT_LIMIT} créditos disponíveis este mês
              {!hasCredits && ' — limite atingido'}
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || loadingEntries || !hasCredits}
          className="w-full md:w-auto"
          style={{
            background: '#6710A2', color: '#fff', borderRadius: 8,
            fontWeight: 600, fontSize: 14, padding: '12px 24px',
            border: 'none', cursor: hasCredits && !generating ? 'pointer' : 'not-allowed',
            opacity: (!hasCredits || generating) ? 0.4 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap', flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { if (hasCredits && !generating) e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { if (hasCredits && !generating) e.currentTarget.style.opacity = '1' }}
        >
          {generating ? (
            <>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Gerando análise...
            </>
          ) : (
            <>
              <BrainCircuit size={16} />
              Gerar diagnóstico
            </>
          )}
        </button>
      </div>

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
          <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 16 }}>Últimas Análises</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map(item => (
              <div key={item.id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: 20 }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span style={{ background: 'rgba(128,239,0,0.15)', color: '#80EF00', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, padding: '3px 7px', borderRadius: 4, flexShrink: 0 }}>
                      Encerrada
                    </span>
                    <div className="min-w-0">
                      <p className="truncate" style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>O sócio chato que lê seus números</p>
                      <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#555' }}>
                        {item.period} · {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      style={{ fontSize: 12, color: '#666', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#666' }}
                    >
                      {expandedId === item.id ? 'Fechar' : 'Ver análise'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Excluir análise"
                      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {expandedId === item.id && (
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #1e1e1e' }}>
                    <AnalysisResult content={item.content} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
