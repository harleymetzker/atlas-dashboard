import { useState, useMemo } from 'react'
import { format, parseISO, endOfMonth, subMonths, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, AlertTriangle, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useEntries } from '../hooks/useEntries'
import { useOpeningBalance } from '../hooks/useOpeningBalance'
import { calcDRE, formatCurrency, formatPercent } from '../lib/calculations'
import { Card } from '../components/ui/Card'
import { CurrencyInput } from '../components/ui/CurrencyInput'

// ── helpers ────────────────────────────────────────────────────────────────


function loadWithdrawalGoal(userId: string): string {
  return localStorage.getItem(`atlas_wgoal_${userId}`) ?? ''
}

function saveWithdrawalGoal(userId: string, val: string) {
  localStorage.setItem(`atlas_wgoal_${userId}`, val)
}

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// ── sub-components ─────────────────────────────────────────────────────────

function BigMetricCard({
  label, value, sub, positive, negative,
}: { label: string; value: string; sub?: string; positive?: boolean; negative?: boolean }) {
  const color = positive ? 'text-brand-green' : negative ? 'text-red-400' : 'text-white'
  return (
    <div className="bg-[#0a0a0a] border border-white/15 rounded-2xl p-6">
      <p className="text-xs text-white/60 uppercase tracking-widest mb-3 whitespace-nowrap overflow-hidden text-ellipsis">{label}</p>
      <p className={`text-2xl font-bold tabular-nums tracking-tight leading-tight ${color}`}>{value}</p>
      {sub && <p className="text-xs text-white/70 mt-1.5 leading-snug">{sub}</p>}
    </div>
  )
}

function DeltaBadge({ pct }: { pct: number }) {
  const up = pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${up ? 'text-brand-green' : 'text-red-400'}`}>
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

// ── page ───────────────────────────────────────────────────────────────────

export function Overview() {
  const today = new Date()
  const { user } = useAuth()

  const [selectedYear,  setSelectedYear]  = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)

  const yearMonth  = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
  const startDate  = yearMonth + '-01'
  const endDate    = format(endOfMonth(parseISO(startDate)), 'yyyy-MM-dd')

  // Previous month
  const prevDate      = subMonths(parseISO(startDate), 1)
  const prevYearMonth = format(prevDate, 'yyyy-MM')
  const prevStart     = prevYearMonth + '-01'
  const prevEnd       = format(endOfMonth(prevDate), 'yyyy-MM-dd')

  // Last 6 months start (for chart)
  const sixStart = format(startOfMonth(subMonths(parseISO(startDate), 5)), 'yyyy-MM-dd')

  // Entries
  const { entries, loading }          = useEntries({ startDate, endDate,   dateField: 'competence_date' })
  const { entries: prevEntries }      = useEntries({ startDate: prevStart, endDate: prevEnd, dateField: 'competence_date' })
  const { entries: cfEntries }        = useEntries({ startDate, endDate,   dateField: 'payment_date' })
  const { entries: historicalEntries} = useEntries({ startDate: sixStart,  endDate,   dateField: 'competence_date' })
  const { entries: allEntries }       = useEntries()

  // Year dropdown
  const yearOptions = useMemo(() => {
    const set = new Set<number>()
    set.add(today.getFullYear())
    for (const e of allEntries) if (e.competence_date) set.add(Number(e.competence_date.slice(0, 4)))
    return Array.from(set).sort((a, b) => b - a)
  }, [allEntries])

  // DRE calculations
  const dre     = calcDRE(entries)
  const prevDre = calcDRE(prevEntries)

  // Cash flow / runway
  const { balance: openingBalance } = useOpeningBalance(user?.id, yearMonth)
  const totalIn  = cfEntries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0)
  const totalOut = cfEntries.filter(e => e.type !== 'revenue').reduce((s, e) => s + e.amount, 0)
  const saldoAtual = openingBalance + totalIn - totalOut
  const runway     = dre.totalDespesasFixas > 0 ? saldoAtual / dre.totalDespesasFixas : null
  const runwayDisplay = runway === null ? '—'
    : runway < 1 ? `${Math.round(runway * 30)} dias`
    : `${runway.toFixed(1)} meses`

  // PE Real
  const mcRatio = dre.faturamentoBruto > 0 ? dre.margemContribuicao / dre.faturamentoBruto : 0
  const peReal  = mcRatio > 0 ? (dre.totalDespesasFixas + dre.totalDespesasVariaveis) / mcRatio : 0

  // Status
  // 15 dias = 0.5 meses | 60 dias = 2 meses
  type Status = 'green' | 'yellow' | 'red'
  let status: Status = 'yellow'
  if (dre.lucro <= 0 || (runway !== null && runway < 0.5)) {
    status = 'red'
  } else if (
    dre.lucro > 0 &&
    dre.lucroMargin > 15 &&
    (runway === null || runway > 2)
  ) {
    status = 'green'
  }

  const statusConfig = {
    green:  { bg: 'bg-brand-green/10 border-brand-green/20', icon: <CheckCircle size={28} className="text-brand-green" />, label: 'Negócio saudável',    text: 'text-brand-green' },
    yellow: { bg: 'bg-yellow-500/10 border-yellow-500/20',   icon: <AlertTriangle size={28} className="text-yellow-400" />, label: 'Atenção necessária', text: 'text-yellow-400' },
    red:    { bg: 'bg-red-500/10 border-red-500/20',         icon: <XCircle size={28} className="text-red-400" />,         label: 'Situação crítica',   text: 'text-red-400' },
  }[status]

  // Comparison deltas
  function delta(curr: number, prev: number) {
    return prev > 0 ? ((curr - prev) / prev) * 100 : 0
  }
  const fatDelta   = delta(dre.faturamentoBruto, prevDre.faturamentoBruto)
  const lucroDelta = delta(dre.lucro, prevDre.lucro)

  // Alerts
  const alerts: { text: string; severity: 'red' | 'yellow' }[] = []
  if (dre.lucro < 0) {
    alerts.push({ text: 'Lucro negativo — a operação está consumindo caixa.', severity: 'red' })
  }
  const currVarExp = dre.impostos + dre.cmv + dre.totalDespesasVariaveis
  const prevVarExp = prevDre.impostos + prevDre.cmv + prevDre.totalDespesasVariaveis
  if (prevVarExp > 0 && ((currVarExp - prevVarExp) / prevVarExp) > 0.2) {
    const pct = (((currVarExp - prevVarExp) / prevVarExp) * 100).toFixed(0)
    alerts.push({ text: `Suas despesas variáveis cresceram ${pct}% em relação ao mês anterior`, severity: 'yellow' })
  }
  if (peReal > 0 && dre.faturamentoBruto < peReal) {
    alerts.push({ text: `Você está abaixo do Ponto de Equilíbrio Real — faltam ${formatCurrency(peReal - dre.faturamentoBruto)} para atingi-lo`, severity: 'red' })
  }
  if (runway !== null && runway < 0.5) {
    alerts.push({ text: `Runway crítico — seu caixa cobre apenas ${Math.round(runway * 30)} dias sem faturar`, severity: 'red' })
  } else if (runway !== null && runway <= 2) {
    alerts.push({ text: `Runway baixo — seu caixa cobre apenas ${Math.round(runway * 30)} dias sem faturar`, severity: 'yellow' })
  }
  if (dre.faturamentoBruto > 0 && dre.lucroMargin < 15) {
    alerts.push({ text: `Margem baixa — seu negócio retém apenas ${formatPercent(dre.lucroMargin)} do que fatura`, severity: 'yellow' })
  }
  if (dre.retiradas > 0 && dre.retiradas > dre.lucro) {
    alerts.push({ text: `Suas retiradas (${formatCurrency(dre.retiradas)}) estão maiores que o lucro do período (${formatCurrency(dre.lucro)})`, severity: 'red' })
  }
  const shownAlerts = alerts.slice(0, 3)

  // Withdrawal goal
  const [withdrawalGoal, setWithdrawalGoalState] = useState(() =>
    user ? loadWithdrawalGoal(user.id) : ''
  )
  function handleWithdrawalGoal(val: string) {
    setWithdrawalGoalState(val)
    if (user) saveWithdrawalGoal(user.id, val)
  }
  const hasValidMargin  = dre.faturamentoBruto > 0 && dre.lucroMargin > 0
  const goalAmount      = parseFloat(withdrawalGoal) || 0
  const requiredRevenue = hasValidMargin && goalAmount > 0
    ? goalAmount / (dre.lucroMargin / 100) : 0
  const revenueGap      = requiredRevenue > 0 ? dre.faturamentoBruto - requiredRevenue : 0
  const goalReached     = revenueGap >= 0

  // 6-month chart data — usa calcDRE por mês (mesma lógica da página DRE)
  const chartMonths = Array.from({ length: 6 }, (_, i) =>
    format(subMonths(parseISO(startDate), 5 - i), 'yyyy-MM')
  )
  const chartData = chartMonths.map(ym => {
    const monthEntries = historicalEntries.filter(e => e.competence_date?.slice(0, 7) === ym)
    const dre = calcDRE(monthEntries)
    return {
      mes:             format(parseISO(ym + '-02'), 'MMM/yy', { locale: ptBR }),
      'Faturamento':   dre.faturamentoBruto,
      'Lucro Líquido': dre.lucro,
      'Margem %':      dre.faturamentoBruto > 0
        ? parseFloat(((dre.lucro / dre.faturamentoBruto) * 100).toFixed(1))
        : 0,
    }
  })

  const fmtK = (v: number) => `R$${(v / 1000).toFixed(0)}k`

  return (
    <div className="p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Visão Geral</h2>
          <p className="text-sm text-white/50 mt-1">Resumo financeiro do período selecionado</p>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/70 uppercase tracking-widest">Mês</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/50 transition-colors"
            >
              {MONTHS.map((name, i) => (
                <option key={i + 1} value={i + 1} className="bg-[#111] text-white">{name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/70 uppercase tracking-widest">Ano</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/50 transition-colors"
            >
              {yearOptions.map(y => (
                <option key={y} value={y} className="bg-[#111] text-white">{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-white/35">Carregando...</div>
      ) : (
        <>

          {/* ── 1. Status card ── */}
          <div className={`border rounded-2xl p-6 flex items-center gap-6 ${statusConfig.bg}`}>
            {statusConfig.icon}
            <div className="flex-1">
              <p className={`text-lg font-bold ${statusConfig.text}`}>{statusConfig.label}</p>
              <p className="text-sm text-white/60 mt-0.5">
                Margem líquida {dre.faturamentoBruto > 0 ? formatPercent(dre.lucroMargin) : '—'}
                {' · '}
                Runway {runwayDisplay}
                {peReal > 0 && ` · PE Real ${dre.faturamentoBruto >= peReal ? 'atingido' : 'não atingido'}`}
              </p>
            </div>
          </div>

          {/* ── 2. 6 indicadores únicos ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <BigMetricCard
              label="Faturamento Bruto"
              value={formatCurrency(dre.faturamentoBruto)}
              positive={dre.faturamentoBruto > 0}
            />
            <BigMetricCard
              label="Lucro Líquido"
              value={formatCurrency(dre.lucro)}
              sub={dre.faturamentoBruto > 0 ? `${formatPercent((dre.lucro / dre.faturamentoBruto) * 100)} do fat. bruto` : undefined}
              positive={dre.lucro > 0}
              negative={dre.lucro <= 0}
            />
            <BigMetricCard
              label="Margem EBITDA"
              value={dre.faturamentoBruto > 0 ? formatPercent(dre.ebitdaMargin) : '—'}
              sub={formatCurrency(dre.ebitda)}
              positive={dre.ebitdaMargin > 0}
              negative={dre.ebitdaMargin <= 0}
            />
            <BigMetricCard
              label="Margem de Contribuição"
              value={dre.faturamentoBruto > 0 ? formatPercent(dre.margemContribuicaoMargin) : '—'}
              sub={formatCurrency(dre.margemContribuicao)}
              positive={dre.margemContribuicaoMargin > 0}
              negative={dre.margemContribuicaoMargin <= 0}
            />
            <BigMetricCard
              label="Runway"
              value={runway !== null ? (runway < 1 ? `${Math.round(runway * 30)}` : runway.toFixed(1)) : '—'}
              sub={runway !== null && runway < 1 ? 'dias de caixa' : 'meses de caixa'}
              positive={runway !== null && runway > 2}
              negative={runway !== null && runway < 0.5}
            />
            <BigMetricCard
              label="Retiradas de Sócios"
              value={formatCurrency(dre.retiradas)}
              sub={dre.faturamentoBruto > 0 ? `${formatPercent((dre.retiradas / dre.faturamentoBruto) * 100)} do fat. bruto` : undefined}
              negative={dre.retiradas > 0}
            />
          </div>

          {/* ── 4. Comparativo mês anterior ── */}
          <Card>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-5">
              Comparativo — {MONTHS[selectedMonth - 1]} vs {MONTHS[(selectedMonth === 1 ? 12 : selectedMonth) - 2]}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Faturamento */}
              <div className="space-y-2">
                <p className="text-xs text-white/60 uppercase tracking-widest">Faturamento Bruto</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-xl font-bold tabular-nums text-white">{formatCurrency(dre.faturamentoBruto)}</span>
                  <DeltaBadge pct={fatDelta} />
                </div>
                <div className="flex items-baseline gap-2 text-xs text-white/50 tabular-nums">
                  <span>mês anterior:</span>
                  <span>{formatCurrency(prevDre.faturamentoBruto)}</span>
                </div>
              </div>
              {/* Lucro */}
              <div className="space-y-2">
                <p className="text-xs text-white/60 uppercase tracking-widest">Lucro Líquido</p>
                <div className="flex items-baseline gap-3">
                  <span className={`text-xl font-bold tabular-nums ${dre.lucro >= 0 ? 'text-brand-green' : 'text-red-400'}`}>
                    {formatCurrency(dre.lucro)}
                  </span>
                  {prevDre.lucro !== 0 && <DeltaBadge pct={lucroDelta} />}
                </div>
                <div className="flex items-baseline gap-2 text-xs text-white/50 tabular-nums">
                  <span>mês anterior:</span>
                  <span>{formatCurrency(prevDre.lucro)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* ── 5. Alertas automáticos ── */}
          <Card>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4">Alertas</p>
            {shownAlerts.length === 0 ? (
              <div className="flex items-center gap-2 text-brand-green">
                <CheckCircle size={16} />
                <span className="text-sm">Nenhum alerta crítico este mês.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {shownAlerts.map((a, i) => (
                  <div key={i} className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 ${a.severity === 'red' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                    {a.severity === 'red'
                      ? <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                      : <AlertTriangle size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />}
                    <span className={`text-xs leading-relaxed ${a.severity === 'red' ? 'text-red-300' : 'text-yellow-300'}`}>{a.text}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── 6. Meta de retirada ── */}
          <Card>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4">Meta de Retirada Mensal</p>
            <div className="flex flex-wrap items-end gap-6">
              <CurrencyInput
                label="Quero retirar por mês"
                value={withdrawalGoal}
                onChange={handleWithdrawalGoal}
              />

              {goalAmount > 0 && (
                <div className="flex flex-wrap gap-6 items-end">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Faturamento necessário</p>
                    <p className="text-lg font-bold tabular-nums text-white">
                      {hasValidMargin ? formatCurrency(requiredRevenue) : '—'}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {hasValidMargin
                        ? `baseado na margem líquida atual (${formatPercent(dre.lucroMargin)})`
                        : 'Insira lançamentos para calcular'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
                      {goalReached ? 'Faturamento excedente' : 'Faturamento que falta'}
                    </p>
                    <p className={`text-lg font-bold tabular-nums ${hasValidMargin ? (goalReached ? 'text-brand-green' : 'text-red-400') : 'text-white/40'}`}>
                      {hasValidMargin ? `${goalReached ? '+' : '-'}${formatCurrency(Math.abs(revenueGap))}` : '—'}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {hasValidMargin
                        ? goalReached
                          ? 'Meta atingida com o faturamento atual'
                          : `Precisa crescer ${formatPercent(((requiredRevenue - dre.faturamentoBruto) / dre.faturamentoBruto) * 100)}`
                        : ''}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 self-end ${hasValidMargin ? (goalReached ? 'bg-brand-green/10' : 'bg-red-500/10') : 'bg-white/5'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${hasValidMargin ? (goalReached ? 'bg-brand-green' : 'bg-red-400') : 'bg-white/30'}`} />
                    <span className={`text-xs font-medium ${hasValidMargin ? (goalReached ? 'text-brand-green' : 'text-red-400') : 'text-white/40'}`}>
                      {hasValidMargin ? (goalReached ? 'Meta atingida' : 'Abaixo da meta') : 'Sem dados suficientes'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ── 7. Gráfico evolução 6 meses ── */}
          <Card>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-6">Evolução — Últimos 6 Meses</p>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={chartData} margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtK}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  itemStyle={{ fontSize: 12 }}
                  formatter={(v, name) =>
                    name === 'Margem %'
                      ? [`${Number(v).toFixed(1)}%`, name]
                      : [`R$ ${Number(v).toLocaleString('pt-BR')}`, name]
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingTop: 16 }} />
                <Line
                  yAxisId="left"
                  dataKey="Faturamento"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ fill: '#60a5fa', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="left"
                  dataKey="Lucro Líquido"
                  stroke="rgba(52,211,153,0.85)"
                  strokeWidth={2}
                  dot={{ fill: 'rgba(52,211,153,0.85)', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="right"
                  dataKey="Margem %"
                  stroke="rgba(251,191,36,0.85)"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={{ fill: 'rgba(251,191,36,0.85)', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

        </>
      )}
    </div>
  )
}
