import { useState, useEffect, useMemo } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { calcDRE, formatCurrency } from '../../lib/calculations'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import type { DRE, Entry } from '../../types'

// ── Types ────────────────────────────────────────────────────────────────────

interface SimForm {
  faturamentoBruto: string
  impostosPct: string
  cmvPct: string
  comissoesPct: string
  marketingPct: string
  taxasCartaoPct: string
  outrasDespesasVariavelPct: string
  despesasRH: string
  despesasOcupacao: string
  despesasAdmin: string
  retiradas: string
  parcelamentos: string
}

interface SimCalc {
  faturamentoBruto: number
  impostos: number
  faturamentoLiquido: number
  cmv: number
  lucroBruto: number
  comissoes: number
  marketing: number
  taxasCartao: number
  outrasDespesasVariaveis: number
  totalDespesasVariaveis: number
  margemContribuicao: number
  despesasRH: number
  despesasOcupacao: number
  despesasAdmin: number
  totalDespesasFixas: number
  ebitda: number
  retiradas: number
  lucro: number
  parcelamentos: number
  lucroAposDividas: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function n(v: string) { return parseFloat(v) || 0 }

function pct(value: number, base: number) {
  if (!base) return 0
  return (value / base) * 100
}

function fmtPct(value: number, base: number) {
  const p = pct(value, base)
  return `(${p.toFixed(1)}%)`
}

function dreToForm(dre: DRE): SimForm {
  const liq  = dre.faturamentoLiquido || 1
  const bruto = dre.faturamentoBruto  || 1
  return {
    faturamentoBruto:            dre.faturamentoBruto.toFixed(2),
    impostosPct:                 ((dre.impostos / bruto) * 100).toFixed(2),
    cmvPct:                      ((dre.cmv / liq) * 100).toFixed(2),
    comissoesPct:                ((dre.comissoesVendas / liq) * 100).toFixed(2),
    marketingPct:                ((dre.marketingAds / liq) * 100).toFixed(2),
    taxasCartaoPct:              ((dre.taxasCartao / liq) * 100).toFixed(2),
    outrasDespesasVariavelPct:   ((dre.outrasDespesasVariaveis / liq) * 100).toFixed(2),
    despesasRH:                  dre.despesasRH.toFixed(2),
    despesasOcupacao:            dre.despesasOcupacao.toFixed(2),
    despesasAdmin:               dre.despesasAdmin.toFixed(2),
    retiradas:                   dre.retiradas.toFixed(2),
    parcelamentos:               '0',
  }
}

function calcSim(f: SimForm): SimCalc {
  const fat    = n(f.faturamentoBruto)
  const impostos = fat * n(f.impostosPct) / 100
  const liq    = fat - impostos
  const cmv    = liq * n(f.cmvPct) / 100
  const lucroBruto = liq - cmv
  const comissoes              = liq * n(f.comissoesPct) / 100
  const marketing              = liq * n(f.marketingPct) / 100
  const taxasCartao            = liq * n(f.taxasCartaoPct) / 100
  const outrasDespesasVariaveis = liq * n(f.outrasDespesasVariavelPct) / 100
  const totalDespesasVariaveis = comissoes + marketing + taxasCartao + outrasDespesasVariaveis
  const margemContribuicao     = lucroBruto - totalDespesasVariaveis
  const despesasRH      = n(f.despesasRH)
  const despesasOcupacao = n(f.despesasOcupacao)
  const despesasAdmin   = n(f.despesasAdmin)
  const totalDespesasFixas = despesasRH + despesasOcupacao + despesasAdmin
  const ebitda = margemContribuicao - totalDespesasFixas
  const retiradas = n(f.retiradas)
  const lucro = ebitda - retiradas           // req 4: Lucro = EBITDA - Retiradas
  const parcelamentos = n(f.parcelamentos)
  const lucroAposDividas = lucro - parcelamentos

  return {
    faturamentoBruto: fat, impostos, faturamentoLiquido: liq, cmv, lucroBruto,
    comissoes, marketing, taxasCartao, outrasDespesasVariaveis, totalDespesasVariaveis,
    margemContribuicao, despesasRH, despesasOcupacao, despesasAdmin, totalDespesasFixas,
    ebitda, retiradas, lucro, parcelamentos, lucroAposDividas,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Delta({ actual, simulated, positive = true }: { actual: number; simulated: number; positive?: boolean }) {
  const diff = simulated - actual
  if (Math.abs(diff) < 0.005) return <span className="text-white/35 tabular-nums text-xs">—</span>
  const good = positive ? diff > 0 : diff < 0
  return (
    <span className={`${good ? 'text-brand-green' : 'text-red-400'} tabular-nums text-xs font-semibold`}>
      {diff > 0 ? '+' : ''}{formatCurrency(diff)}
    </span>
  )
}

function SimCurrencyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <CurrencyInput value={value} onChange={onChange} />
}

function PctInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center bg-white/5 border border-white/15 rounded-lg overflow-hidden focus-within:border-white/40 transition-colors">
      <input
        type="number" min="0" max="100" step="0.01" value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white focus:outline-none tabular-nums text-right"
        placeholder="0"
      />
      <span className="pr-2 text-xs text-white/50">%</span>
    </div>
  )
}


// ── Main component ────────────────────────────────────────────────────────────

export function SimuladorCenarios() {
  const [availableMonths, setAvailableMonths] = useState<Array<{ value: string; label: string }>>([])
  const [selectedMonth, setSelectedMonth]     = useState<string>('')
  const [dre, setDre]                         = useState<DRE | null>(null)
  const [form, setForm]                       = useState<SimForm | null>(null)
  const [loadingMonths, setLoadingMonths]     = useState(true)
  const [loadingDre, setLoadingDre]           = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('entries').select('competence_date')
      if (!data || data.length === 0) { setLoadingMonths(false); return }
      const monthSet = new Set(
        data.filter((e: { competence_date: string | null }) => e.competence_date)
            .map((e: { competence_date: string | null }) => e.competence_date!.slice(0, 7))
      )
      const months = Array.from(monthSet).sort().reverse() as string[]
      setAvailableMonths(months.map(m => ({
        value: m,
        label: format(new Date(m + '-02'), 'MMMM/yyyy', { locale: ptBR }),
      })))
      if (months.length > 0) setSelectedMonth(months[0])
      setLoadingMonths(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedMonth) return
    async function load() {
      setLoadingDre(true)
      const ref       = new Date(selectedMonth + '-02')
      const startDate = format(startOfMonth(ref), 'yyyy-MM-dd')
      const endDate   = format(endOfMonth(ref),   'yyyy-MM-dd')
      const { data }  = await supabase
        .from('entries').select('*')
        .gte('competence_date', startDate)
        .lte('competence_date', endDate)
      if (data && data.length > 0) {
        const computed = calcDRE(data as Entry[])
        setDre(computed)
        setForm(dreToForm(computed))
      } else {
        setDre(null); setForm(null)
      }
      setLoadingDre(false)
    }
    load()
  }, [selectedMonth])

  const sim = useMemo(() => (form ? calcSim(form) : null), [form])

  function set(key: keyof SimForm) {
    return (v: string) => setForm(f => (f ? { ...f, [key]: v } : f))
  }

  function handleReset() { if (dre) setForm(dreToForm(dre)) }

  const loading = loadingMonths || loadingDre

  if (loading && !dre) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!loadingMonths && availableMonths.length === 0) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Simulador de Cenários</h2>
          <p className="text-sm text-white/50 mt-1">Altere os indicadores e veja o impacto no lucro em tempo real.</p>
        </div>
        <div className="mt-12 text-center py-16">
          <p className="text-white/50 text-sm">Nenhum dado encontrado. Lance suas entradas na DRE para usar o simulador.</p>
        </div>
      </div>
    )
  }

  if (!dre || !form || !sim) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const liq   = dre.faturamentoLiquido || 1
  const bruto = dre.faturamentoBruto   || 1

  // Req 4: current lucro = ebitda - retiradas (consistent with simulator)
  const lucroAtual = dre.ebitda - dre.retiradas
  const lucroSim   = sim.lucro
  const lucroDiff  = lucroSim - lucroAtual
  const lucroPct   = lucroAtual !== 0 ? (lucroDiff / Math.abs(lucroAtual)) * 100 : 0

  // Req 5: PE simulado
  const simMcRatio = sim.faturamentoBruto > 0 ? sim.margemContribuicao / sim.faturamentoBruto : 0
  const simPE      = simMcRatio > 0 ? sim.totalDespesasFixas / simMcRatio : 0
  const simPEPct   = sim.faturamentoBruto > 0 && simPE > 0 ? (simPE / sim.faturamentoBruto) * 100 : 0

  const curMcRatio = dre.faturamentoBruto > 0 ? dre.margemContribuicao / dre.faturamentoBruto : 0
  const curPE      = curMcRatio > 0 ? dre.totalDespesasFixas / curMcRatio : 0
  const curPEPct   = dre.faturamentoBruto > 0 && curPE > 0 ? (curPE / dre.faturamentoBruto) * 100 : 0

  // MC% label helpers (req 6: % of faturamento líquido)
  const mcActualLabel = `${formatCurrency(dre.margemContribuicao)} ${fmtPct(dre.margemContribuicao, dre.faturamentoLiquido || 1)}`
  const mcSimLabel    = `${formatCurrency(sim.margemContribuicao)} ${fmtPct(sim.margemContribuicao, sim.faturamentoLiquido || 1)}`

  // EBITDA % label (req 3: % of faturamento bruto)
  const ebitdaActualLabel = `${formatCurrency(dre.ebitda)} ${fmtPct(dre.ebitda, bruto)}`
  const ebitdaSimLabel    = `${formatCurrency(sim.ebitda)} ${fmtPct(sim.ebitda, sim.faturamentoBruto || 1)}`

  // Lucro % label (req 3)
  const lucroActualLabel = `${formatCurrency(lucroAtual)} ${fmtPct(lucroAtual, bruto)}`
  const lucroSimLabel    = `${formatCurrency(lucroSim)} ${fmtPct(lucroSim, sim.faturamentoBruto || 1)}`

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Simulador de Cenários</h2>
          <p className="text-sm text-white/50 mt-1">Altere os indicadores e veja o impacto no lucro em tempo real.</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 border border-white/15 transition-all"
        >
          <RefreshCw size={14} />
          Resetar Simulação
        </button>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/50 uppercase tracking-widest whitespace-nowrap">Período de referência</span>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/50 transition-colors appearance-none cursor-pointer"
        >
          {availableMonths.map(m => (
            <option key={m.value} value={m.value} className="bg-[#0a0a0a]">{m.label}</option>
          ))}
        </select>
        {loadingDre && <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />}
      </div>

      {/* Comparison Table */}
      <div className="bg-white/[0.03] border border-white/15 rounded-2xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3 border-b border-white/15">
          <span className="text-xs text-white/60 uppercase tracking-widest">Linha DRE</span>
          <span className="text-xs text-white/60 uppercase tracking-widest text-right pr-4">Atual</span>
          <span className="text-xs text-white/60 uppercase tracking-widest">Simulado</span>
          <span className="text-xs text-white/60 uppercase tracking-widest text-right">Δ</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {/* Faturamento */}
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80">(+) Faturamento Bruto</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{formatCurrency(dre.faturamentoBruto)}</span>
            <div><SimCurrencyInput value={form.faturamentoBruto} onChange={set('faturamentoBruto')} /></div>
            <div className="text-right"><Delta actual={dre.faturamentoBruto} simulated={sim.faturamentoBruto} /></div>
          </div>

          {/* Impostos */}
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">(-) Impostos</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{pct(dre.impostos, bruto).toFixed(1)}%</span>
            <div><PctInput value={form.impostosPct} onChange={set('impostosPct')} /></div>
            <div className="text-right"><Delta actual={dre.impostos} simulated={sim.impostos} positive={false} /></div>
          </div>

          {/* Faturamento Líquido */}
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3 bg-white/[0.025]">
            <span className="text-sm font-semibold text-white">(=) Faturamento Líquido</span>
            <span className="text-sm font-semibold text-white/80 tabular-nums text-right pr-4">{formatCurrency(dre.faturamentoLiquido)}</span>
            <span className="text-sm font-semibold text-white tabular-nums text-right pr-2">{formatCurrency(sim.faturamentoLiquido)}</span>
            <div className="text-right"><Delta actual={dre.faturamentoLiquido} simulated={sim.faturamentoLiquido} /></div>
          </div>

          {/* CMV */}
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">(-) CMV</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{pct(dre.cmv, liq).toFixed(1)}%</span>
            <div><PctInput value={form.cmvPct} onChange={set('cmvPct')} /></div>
            <div className="text-right"><Delta actual={dre.cmv} simulated={sim.cmv} positive={false} /></div>
          </div>

          {/* Lucro Bruto */}
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3 bg-white/[0.025]">
            <span className="text-sm font-semibold text-white">(=) Lucro Bruto</span>
            <span className="text-sm font-semibold text-white/80 tabular-nums text-right pr-4">{formatCurrency(dre.lucroBruto)}</span>
            <span className="text-sm font-semibold text-white tabular-nums text-right pr-2">{formatCurrency(sim.lucroBruto)}</span>
            <div className="text-right"><Delta actual={dre.lucroBruto} simulated={sim.lucroBruto} /></div>
          </div>

          {/* Despesas Variáveis */}
          <div className="px-6 py-2 border-t border-white/5 bg-white/[0.01]">
            <span className="text-[10px] text-white/60 uppercase tracking-widest">Despesas Variáveis de Venda</span>
          </div>
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">Comissões de Venda</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{pct(dre.comissoesVendas, liq).toFixed(1)}%</span>
            <div><PctInput value={form.comissoesPct} onChange={set('comissoesPct')} /></div>
            <div className="text-right"><Delta actual={dre.comissoesVendas} simulated={sim.comissoes} positive={false} /></div>
          </div>
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">Marketing e Anúncios</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{pct(dre.marketingAds, liq).toFixed(1)}%</span>
            <div><PctInput value={form.marketingPct} onChange={set('marketingPct')} /></div>
            <div className="text-right"><Delta actual={dre.marketingAds} simulated={sim.marketing} positive={false} /></div>
          </div>
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">Taxas de Cartão</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{pct(dre.taxasCartao, liq).toFixed(1)}%</span>
            <div><PctInput value={form.taxasCartaoPct} onChange={set('taxasCartaoPct')} /></div>
            <div className="text-right"><Delta actual={dre.taxasCartao} simulated={sim.taxasCartao} positive={false} /></div>
          </div>
          {/* req 1: Outras Despesas Variáveis */}
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">Outras Despesas Variáveis</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{pct(dre.outrasDespesasVariaveis, liq).toFixed(1)}%</span>
            <div><PctInput value={form.outrasDespesasVariavelPct} onChange={set('outrasDespesasVariavelPct')} /></div>
            <div className="text-right"><Delta actual={dre.outrasDespesasVariaveis} simulated={sim.outrasDespesasVariaveis} positive={false} /></div>
          </div>

          {/* Margem de Contribuição — req 6: com % do fat líquido */}
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3 bg-white/[0.025]">
            <span className="text-sm font-semibold text-white">(=) Margem de Contribuição</span>
            <span className="text-sm font-semibold text-white/80 tabular-nums text-right pr-4">{mcActualLabel}</span>
            <span className="text-sm font-semibold text-white tabular-nums text-right pr-2">{mcSimLabel}</span>
            <div className="text-right"><Delta actual={dre.margemContribuicao} simulated={sim.margemContribuicao} /></div>
          </div>

          {/* Despesas Fixas */}
          <div className="px-6 py-2 border-t border-white/5 bg-white/[0.01]">
            <span className="text-[10px] text-white/60 uppercase tracking-widest">Despesas Fixas</span>
          </div>
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">RH</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{formatCurrency(dre.despesasRH)}</span>
            <div><SimCurrencyInput value={form.despesasRH} onChange={set('despesasRH')} /></div>
            <div className="text-right"><Delta actual={dre.despesasRH} simulated={sim.despesasRH} positive={false} /></div>
          </div>
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">Ocupação</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{formatCurrency(dre.despesasOcupacao)}</span>
            <div><SimCurrencyInput value={form.despesasOcupacao} onChange={set('despesasOcupacao')} /></div>
            <div className="text-right"><Delta actual={dre.despesasOcupacao} simulated={sim.despesasOcupacao} positive={false} /></div>
          </div>
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">Administrativo</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{formatCurrency(dre.despesasAdmin)}</span>
            <div><SimCurrencyInput value={form.despesasAdmin} onChange={set('despesasAdmin')} /></div>
            <div className="text-right"><Delta actual={dre.despesasAdmin} simulated={sim.despesasAdmin} positive={false} /></div>
          </div>

          {/* EBITDA — req 3: com % do fat bruto */}
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3 bg-white/[0.025]">
            <span className="text-sm font-semibold text-white">(=) EBITDA</span>
            <span className="text-sm font-semibold text-white/80 tabular-nums text-right pr-4">{ebitdaActualLabel}</span>
            <span className="text-sm font-semibold text-white tabular-nums text-right pr-2">{ebitdaSimLabel}</span>
            <div className="text-right"><Delta actual={dre.ebitda} simulated={sim.ebitda} /></div>
          </div>

          {/* req 4: Retiradas de Sócios entre EBITDA e Lucro */}
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">(-) Retiradas de Sócios</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">{formatCurrency(dre.retiradas)}</span>
            <div><SimCurrencyInput value={form.retiradas} onChange={set('retiradas')} /></div>
            <div className="text-right"><Delta actual={dre.retiradas} simulated={sim.retiradas} positive={false} /></div>
          </div>

          {/* Lucro — req 3: com % do fat bruto */}
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-4 bg-white/5 border-t border-white/15">
            <span className="text-sm font-bold text-white">(=) Lucro</span>
            <span className={`text-sm font-bold tabular-nums text-right pr-4 ${lucroAtual >= 0 ? 'text-brand-green' : 'text-red-400'}`}>
              {lucroActualLabel}
            </span>
            <span className={`text-sm font-bold tabular-nums text-right pr-2 ${lucroSim >= 0 ? 'text-brand-green' : 'text-red-400'}`}>
              {lucroSimLabel}
            </span>
            <div className="text-right"><Delta actual={lucroAtual} simulated={lucroSim} /></div>
          </div>

          {/* req 2: Parcelamentos e Dívidas */}
          <div className="px-6 py-2 border-t border-white/5 bg-white/[0.01]">
            <span className="text-[10px] text-white/60 uppercase tracking-widest">Parcelamentos e Dívidas</span>
          </div>
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3">
            <span className="text-sm text-white/80 pl-5">(-) Parcelamentos e Dívidas</span>
            <span className="text-sm text-white/80 tabular-nums text-right pr-4">—</span>
            <div><SimCurrencyInput value={form.parcelamentos} onChange={set('parcelamentos')} /></div>
            <div className="text-right"><Delta actual={0} simulated={sim.parcelamentos} positive={false} /></div>
          </div>
          <div className="grid grid-cols-[1fr_200px_220px_130px] items-center px-6 py-3 bg-white/[0.025]">
            <span className="text-sm font-bold text-white">(=) Lucro após Dívidas</span>
            <span className="text-sm font-bold text-white/80 tabular-nums text-right pr-4">—</span>
            <span className={`text-sm font-bold tabular-nums text-right pr-2 ${sim.lucroAposDividas >= 0 ? 'text-brand-green' : 'text-red-400'}`}>
              {formatCurrency(sim.lucroAposDividas)}
            </span>
            <div className="text-right" />
          </div>
        </div>
      </div>

      {/* Result summary card */}
      <div className="bg-white/[0.03] border border-white/15 rounded-2xl p-6">
        <div className="grid grid-cols-3 gap-6 text-center divide-x divide-white/5">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Lucro Atual</p>
            <p className={`text-2xl font-black tabular-nums ${lucroAtual >= 0 ? 'text-white' : 'text-red-400'}`}>
              {formatCurrency(lucroAtual)}
            </p>
            <p className="text-xs text-white/40 mt-1">{fmtPct(lucroAtual, bruto)} do faturamento</p>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Lucro Simulado</p>
            <p className={`text-2xl font-black tabular-nums ${lucroSim >= 0 ? 'text-brand-green' : 'text-red-400'}`}>
              {formatCurrency(lucroSim)}
            </p>
            <p className="text-xs text-white/40 mt-1">{fmtPct(lucroSim, sim.faturamentoBruto || 1)} do faturamento</p>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Variação</p>
            <p className={`text-2xl font-black tabular-nums ${lucroDiff >= 0 ? 'text-brand-green' : 'text-red-400'}`}>
              {lucroDiff >= 0 ? '+' : ''}{formatCurrency(lucroDiff)}
            </p>
            {lucroAtual !== 0 && (
              <p className={`text-xs mt-1 ${lucroDiff >= 0 ? 'text-brand-green/60' : 'text-red-400/60'}`}>
                ({lucroDiff >= 0 ? '+' : ''}{lucroPct.toFixed(1)}%)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* req 5: Ponto de Equilíbrio Simulado */}
      <div className="bg-white/[0.03] border border-white/15 rounded-2xl p-6">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-4">Ponto de Equilíbrio</p>
        <div className="grid grid-cols-2 gap-6 divide-x divide-white/5">
          <div className="text-center">
            <p className="text-xs text-white/40 mb-2">Atual</p>
            <p className="text-xl font-black tabular-nums text-white">{formatCurrency(curPE)}</p>
            {curPEPct > 0 && (
              <p className="text-xs text-white/40 mt-1">{curPEPct.toFixed(1)}% do faturamento</p>
            )}
          </div>
          <div className="text-center pl-6">
            <p className="text-xs text-white/40 mb-2">Simulado</p>
            <p className={`text-xl font-black tabular-nums ${simPE > 0 && simPE <= sim.faturamentoBruto ? 'text-brand-green' : 'text-red-400'}`}>
              {simPE > 0 ? formatCurrency(simPE) : '—'}
            </p>
            {simPEPct > 0 && (
              <p className="text-xs text-white/40 mt-1">{simPEPct.toFixed(1)}% do faturamento</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
