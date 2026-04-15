import { useState, useEffect, useMemo } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { calcDRE, formatCurrency } from '../../lib/calculations'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import type { DRE, Entry } from '../../types'

interface SimForm {
  faturamentoBruto: string
  impostosPct: string
  cmvPct: string
  comissoesPct: string
  marketingPct: string
  taxasCartaoPct: string
  despesasRH: string
  despesasOcupacao: string
  despesasAdmin: string
  retiradas: string
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
  margemContribuicao: number
  despesasRH: number
  despesasOcupacao: number
  despesasAdmin: number
  ebitda: number
  retiradas: number
  lucro: number
}

function n(v: string) { return parseFloat(v) || 0 }

function dreToForm(dre: DRE): SimForm {
  const liq = dre.faturamentoLiquido || 1
  const bruto = dre.faturamentoBruto || 1
  return {
    faturamentoBruto: dre.faturamentoBruto.toFixed(2),
    impostosPct: ((dre.impostos / bruto) * 100).toFixed(2),
    cmvPct: ((dre.cmv / liq) * 100).toFixed(2),
    comissoesPct: ((dre.comissoesVendas / liq) * 100).toFixed(2),
    marketingPct: ((dre.marketingAds / liq) * 100).toFixed(2),
    taxasCartaoPct: ((dre.taxasCartao / liq) * 100).toFixed(2),
    despesasRH: dre.despesasRH.toFixed(2),
    despesasOcupacao: dre.despesasOcupacao.toFixed(2),
    despesasAdmin: dre.despesasAdmin.toFixed(2),
    retiradas: dre.retiradas.toFixed(2),
  }
}

function calcSim(f: SimForm): SimCalc {
  const fat = n(f.faturamentoBruto)
  const impostos = fat * n(f.impostosPct) / 100
  const liq = fat - impostos
  const cmv = liq * n(f.cmvPct) / 100
  const lucroBruto = liq - cmv
  const comissoes = liq * n(f.comissoesPct) / 100
  const marketing = liq * n(f.marketingPct) / 100
  const taxasCartao = liq * n(f.taxasCartaoPct) / 100
  const margemContribuicao = lucroBruto - comissoes - marketing - taxasCartao
  const despesasRH = n(f.despesasRH)
  const despesasOcupacao = n(f.despesasOcupacao)
  const despesasAdmin = n(f.despesasAdmin)
  const ebitda = margemContribuicao - despesasRH - despesasOcupacao - despesasAdmin
  const retiradas = n(f.retiradas)
  const lucro = ebitda - retiradas
  return { faturamentoBruto: fat, impostos, faturamentoLiquido: liq, cmv, lucroBruto, comissoes, marketing, taxasCartao, margemContribuicao, despesasRH, despesasOcupacao, despesasAdmin, ebitda, retiradas, lucro }
}

function Delta({ actual, simulated, positive = true }: { actual: number; simulated: number; positive?: boolean }) {
  const diff = simulated - actual
  if (Math.abs(diff) < 0.005) return <span className="text-white/20 tabular-nums text-xs">—</span>
  const good = positive ? diff > 0 : diff < 0
  const color = good ? 'text-emerald-400' : 'text-red-400'
  return (
    <span className={`${color} tabular-nums text-xs font-semibold`}>
      {diff > 0 ? '+' : ''}{formatCurrency(diff)}
    </span>
  )
}

function SimCurrencyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <CurrencyInput value={value} onChange={onChange} />
}

function PctInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:border-white/25 transition-colors">
      <input
        type="number" min="0" max="100" step="0.01" value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white focus:outline-none tabular-nums text-right"
        placeholder="0"
      />
      <span className="pr-2 text-xs text-white/30">%</span>
    </div>
  )
}

function Row({ label, actual, simNode, delta, indent = false }: {
  label: string; actual: string; simNode: React.ReactNode; delta: React.ReactNode; indent?: boolean
}) {
  return (
    <div className="grid grid-cols-[1fr_160px_200px_130px] items-center px-6 py-3">
      <span className={`text-sm text-white/60 ${indent ? 'pl-5' : ''}`}>{label}</span>
      <span className="text-sm text-white/50 tabular-nums text-right pr-4">{actual}</span>
      <div>{simNode}</div>
      <div className="text-right">{delta}</div>
    </div>
  )
}

function TotalRow({ label, actual, simValue, delta }: {
  label: string; actual: string; simValue: string; delta: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[1fr_160px_200px_130px] items-center px-6 py-3 bg-white/[0.025]">
      <span className="text-sm font-semibold text-white">{label}</span>
      <span className="text-sm font-semibold text-white/80 tabular-nums text-right pr-4">{actual}</span>
      <span className="text-sm font-semibold text-white tabular-nums text-right pr-2">{simValue}</span>
      <div className="text-right">{delta}</div>
    </div>
  )
}

function SectionRow({ label }: { label: string }) {
  return (
    <div className="px-6 py-2 border-t border-white/5 bg-white/[0.01]">
      <span className="text-[10px] text-white/25 uppercase tracking-widest">{label}</span>
    </div>
  )
}

export function SimuladorCenarios() {
  const [availableMonths, setAvailableMonths] = useState<Array<{ value: string; label: string }>>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [dre, setDre] = useState<DRE | null>(null)
  const [form, setForm] = useState<SimForm | null>(null)
  const [loadingMonths, setLoadingMonths] = useState(true)
  const [loadingDre, setLoadingDre] = useState(false)

  // Load distinct months available in entries
  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('entries').select('competence_date')
      if (!data || data.length === 0) { setLoadingMonths(false); return }

      const monthSet = new Set(data.map((e: { competence_date: string }) => e.competence_date.slice(0, 7)))
      const months = Array.from(monthSet).sort().reverse() as string[]
      const formatted = months.map(m => ({
        value: m,
        label: format(new Date(m + '-02'), 'MMMM/yyyy', { locale: ptBR }),
      }))

      setAvailableMonths(formatted)
      if (months.length > 0) setSelectedMonth(months[0])
      setLoadingMonths(false)
    }
    load()
  }, [])

  // Load DRE whenever selected month changes
  useEffect(() => {
    if (!selectedMonth) return
    async function load() {
      setLoadingDre(true)
      const ref = new Date(selectedMonth + '-02')
      const startDate = format(startOfMonth(ref), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(ref), 'yyyy-MM-dd')

      const { data } = await supabase
        .from('entries')
        .select('*')
        .gte('competence_date', startDate)
        .lte('competence_date', endDate)

      if (data && data.length > 0) {
        const computed = calcDRE(data as Entry[])
        setDre(computed)
        setForm(dreToForm(computed))
      } else {
        setDre(null)
        setForm(null)
      }
      setLoadingDre(false)
    }
    load()
  }, [selectedMonth])

  const sim = useMemo(() => (form ? calcSim(form) : null), [form])

  function set(key: keyof SimForm) {
    return (v: string) => setForm(f => (f ? { ...f, [key]: v } : f))
  }

  function handleReset() {
    if (dre) setForm(dreToForm(dre))
  }

  const loading = loadingMonths || loadingDre

  if (loading && !dre) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!loadingMonths && availableMonths.length === 0) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Simulador de Cenários</h2>
          <p className="text-sm text-white/30 mt-1">Altere os indicadores e veja o impacto no lucro em tempo real.</p>
        </div>
        <div className="mt-12 text-center py-16">
          <p className="text-white/30 text-sm">Nenhum dado encontrado. Lance suas entradas na DRE para usar o simulador.</p>
        </div>
      </div>
    )
  }

  if (!dre || !form || !sim) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const liq = dre.faturamentoLiquido || 1
  const bruto = dre.faturamentoBruto || 1
  const lucroAtual = dre.lucro
  const lucroSim = sim.lucro
  const lucroDiff = lucroSim - lucroAtual
  const lucroPct = lucroAtual !== 0 ? (lucroDiff / Math.abs(lucroAtual)) * 100 : 0

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Simulador de Cenários</h2>
          <p className="text-sm text-white/30 mt-1">Altere os indicadores e veja o impacto no lucro em tempo real.</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <RefreshCw size={14} />
          Resetar Simulação
        </button>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/30 uppercase tracking-widest whitespace-nowrap">Período de referência</span>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
        >
          {availableMonths.map(m => (
            <option key={m.value} value={m.value} className="bg-[#0a0a0a]">{m.label}</option>
          ))}
        </select>
        {loadingDre && (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        )}
      </div>

      {/* Comparison Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_160px_200px_130px] items-center px-6 py-3 border-b border-white/10">
          <span className="text-xs text-white/25 uppercase tracking-widest">Linha DRE</span>
          <span className="text-xs text-white/25 uppercase tracking-widest text-right pr-4">Atual</span>
          <span className="text-xs text-white/25 uppercase tracking-widest">Simulado</span>
          <span className="text-xs text-white/25 uppercase tracking-widest text-right">Δ</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          <Row
            label="(+) Faturamento Bruto"
            actual={formatCurrency(dre.faturamentoBruto)}
            simNode={<SimCurrencyInput value={form.faturamentoBruto} onChange={set('faturamentoBruto')} />}
            delta={<Delta actual={dre.faturamentoBruto} simulated={sim.faturamentoBruto} />}
          />
          <Row indent
            label="(-) Impostos"
            actual={`${((dre.impostos / bruto) * 100).toFixed(1)}%`}
            simNode={<PctInput value={form.impostosPct} onChange={set('impostosPct')} />}
            delta={<Delta actual={dre.impostos} simulated={sim.impostos} positive={false} />}
          />
          <TotalRow
            label="(=) Faturamento Líquido"
            actual={formatCurrency(dre.faturamentoLiquido)}
            simValue={formatCurrency(sim.faturamentoLiquido)}
            delta={<Delta actual={dre.faturamentoLiquido} simulated={sim.faturamentoLiquido} />}
          />
          <Row indent
            label="(-) CMV"
            actual={`${((dre.cmv / liq) * 100).toFixed(1)}%`}
            simNode={<PctInput value={form.cmvPct} onChange={set('cmvPct')} />}
            delta={<Delta actual={dre.cmv} simulated={sim.cmv} positive={false} />}
          />
          <TotalRow
            label="(=) Lucro Bruto"
            actual={formatCurrency(dre.lucroBruto)}
            simValue={formatCurrency(sim.lucroBruto)}
            delta={<Delta actual={dre.lucroBruto} simulated={sim.lucroBruto} />}
          />

          <SectionRow label="Despesas Variáveis de Venda" />
          <Row indent
            label="Comissões de Venda"
            actual={`${((dre.comissoesVendas / liq) * 100).toFixed(1)}%`}
            simNode={<PctInput value={form.comissoesPct} onChange={set('comissoesPct')} />}
            delta={<Delta actual={dre.comissoesVendas} simulated={sim.comissoes} positive={false} />}
          />
          <Row indent
            label="Marketing e Anúncios"
            actual={`${((dre.marketingAds / liq) * 100).toFixed(1)}%`}
            simNode={<PctInput value={form.marketingPct} onChange={set('marketingPct')} />}
            delta={<Delta actual={dre.marketingAds} simulated={sim.marketing} positive={false} />}
          />
          <Row indent
            label="Taxas de Cartão"
            actual={`${((dre.taxasCartao / liq) * 100).toFixed(1)}%`}
            simNode={<PctInput value={form.taxasCartaoPct} onChange={set('taxasCartaoPct')} />}
            delta={<Delta actual={dre.taxasCartao} simulated={sim.taxasCartao} positive={false} />}
          />
          <TotalRow
            label="(=) Margem de Contribuição"
            actual={formatCurrency(dre.margemContribuicao)}
            simValue={formatCurrency(sim.margemContribuicao)}
            delta={<Delta actual={dre.margemContribuicao} simulated={sim.margemContribuicao} />}
          />

          <SectionRow label="Despesas Fixas" />
          <Row indent
            label="RH"
            actual={formatCurrency(dre.despesasRH)}
            simNode={<SimCurrencyInput value={form.despesasRH} onChange={set('despesasRH')} />}
            delta={<Delta actual={dre.despesasRH} simulated={sim.despesasRH} positive={false} />}
          />
          <Row indent
            label="Ocupação"
            actual={formatCurrency(dre.despesasOcupacao)}
            simNode={<SimCurrencyInput value={form.despesasOcupacao} onChange={set('despesasOcupacao')} />}
            delta={<Delta actual={dre.despesasOcupacao} simulated={sim.despesasOcupacao} positive={false} />}
          />
          <Row indent
            label="Administrativo"
            actual={formatCurrency(dre.despesasAdmin)}
            simNode={<SimCurrencyInput value={form.despesasAdmin} onChange={set('despesasAdmin')} />}
            delta={<Delta actual={dre.despesasAdmin} simulated={sim.despesasAdmin} positive={false} />}
          />
          <TotalRow
            label="(=) EBITDA"
            actual={formatCurrency(dre.ebitda)}
            simValue={formatCurrency(sim.ebitda)}
            delta={<Delta actual={dre.ebitda} simulated={sim.ebitda} />}
          />
          <Row indent
            label="(-) Retiradas"
            actual={formatCurrency(dre.retiradas)}
            simNode={<SimCurrencyInput value={form.retiradas} onChange={set('retiradas')} />}
            delta={<Delta actual={dre.retiradas} simulated={sim.retiradas} positive={false} />}
          />

          {/* Lucro — destaque */}
          <div className="grid grid-cols-[1fr_160px_200px_130px] items-center px-6 py-4 bg-white/5 border-t border-white/10">
            <span className="text-sm font-bold text-white">(=) Lucro</span>
            <span className={`text-sm font-bold tabular-nums text-right pr-4 ${dre.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(dre.lucro)}
            </span>
            <span className={`text-sm font-bold tabular-nums text-right pr-2 ${sim.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(sim.lucro)}
            </span>
            <div className="text-right">
              <Delta actual={dre.lucro} simulated={sim.lucro} />
            </div>
          </div>
        </div>
      </div>

      {/* Result summary card */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-3 gap-6 text-center divide-x divide-white/5">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Lucro Atual</p>
            <p className={`text-2xl font-black tabular-nums ${lucroAtual >= 0 ? 'text-white' : 'text-red-400'}`}>
              {formatCurrency(lucroAtual)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Lucro Simulado</p>
            <p className={`text-2xl font-black tabular-nums ${lucroSim >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(lucroSim)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Variação</p>
            <p className={`text-2xl font-black tabular-nums ${lucroDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {lucroDiff >= 0 ? '+' : ''}{formatCurrency(lucroDiff)}
            </p>
            {lucroAtual !== 0 && (
              <p className={`text-xs mt-1 ${lucroDiff >= 0 ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                ({lucroDiff >= 0 ? '+' : ''}{lucroPct.toFixed(1)}%)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
