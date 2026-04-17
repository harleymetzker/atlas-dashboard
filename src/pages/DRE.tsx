import { useState, useMemo } from 'react'
import { format, parseISO, endOfMonth } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { useEntries } from '../hooks/useEntries'
import { calcDRE, formatCurrency, formatPercent } from '../lib/calculations'
import { Card } from '../components/ui/Card'

// ── helpers ────────────────────────────────────────────────────────────────

function loadBalance(userId: string, yearMonth: string): number {
  const v = localStorage.getItem(`atlas_ob_${userId}_${yearMonth}`)
  return v !== null ? parseFloat(v) : 0
}

// ── sub-components ─────────────────────────────────────────────────────────

interface DRERowProps {
  label: string
  value: number
  pct?: number
  isResult?: boolean
  isProfit?: boolean
  indent?: boolean
  negative?: boolean
}

function DRERow({ label, value, pct, isResult, isProfit, indent, negative }: DRERowProps) {
  const profitColor = value >= 0 ? 'text-brand-green' : 'text-red-400'
  return (
    <div className={`flex items-center justify-between py-2.5 ${isResult ? 'border-t border-white/15 mt-0.5 pt-3' : 'border-b border-white/[0.04]'}`}>
      <span className={`text-sm ${isResult ? 'font-semibold text-white' : indent ? 'text-white/80 pl-4' : 'text-white/80'}`}>
        {label}
      </span>
      <div className="flex items-center gap-6">
        {pct !== undefined
          ? <span className="text-xs text-white/60 w-14 text-right tabular-nums">{formatPercent(pct)}</span>
          : <span className="w-14" />
        }
        <span className={`text-sm tabular-nums font-medium w-36 text-right ${
          isProfit ? profitColor : negative ? 'text-white/80' : isResult ? 'text-white font-bold' : 'text-white'
        }`}>
          {negative && value > 0 ? `(${formatCurrency(value)})` : formatCurrency(value)}
        </span>
      </div>
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="pt-5 pb-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{label}</span>
    </div>
  )
}

interface IndicCardProps {
  label: string
  mainValue: string
  subValue?: string
  positive?: boolean
  negative?: boolean
}

function IndicCard({ label, mainValue, subValue, positive, negative }: IndicCardProps) {
  const color = positive ? 'text-brand-green' : negative ? 'text-red-400' : 'text-white'
  const subColor = positive ? 'text-brand-green/60' : negative ? 'text-red-400/60' : 'text-white/35'
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <p className="text-[10px] text-white/60 uppercase tracking-widest mb-2 leading-snug">{label}</p>
      <p className={`text-base font-bold tabular-nums leading-tight ${color}`}>{mainValue}</p>
      {subValue && <p className={`text-xs tabular-nums mt-1 ${subColor}`}>{subValue}</p>}
    </div>
  )
}

function StatusBadge({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${ok ? 'bg-brand-green/10' : 'bg-red-500/10'}`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ok ? 'bg-brand-green' : 'bg-red-400'}`} />
      <span className={`text-xs font-medium ${ok ? 'text-brand-green' : 'text-red-400'}`}>{text}</span>
    </div>
  )
}

// ── page ───────────────────────────────────────────────────────────────────

export function DRE() {
  const today = new Date()
  const { user } = useAuth()
  const [selectedYear,  setSelectedYear]  = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1) // 1–12

  const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
  const startDate = yearMonth + '-01'
  const endDate   = format(endOfMonth(parseISO(startDate)), 'yyyy-MM-dd')

  // DRE entries (competence_date)
  const { entries, loading } = useEntries({ startDate, endDate, dateField: 'competence_date' })
  // Cash flow entries for the same month (payment_date) — for analytical indicators
  const { entries: cfEntries } = useEntries({ startDate, endDate, dateField: 'payment_date' })
  // All entries — to build year dropdown
  const { entries: allEntries } = useEntries()

  const MONTHS = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
  ]

  // Year dropdown: current year + any year that has data
  const yearOptions = useMemo(() => {
    const set = new Set<number>()
    set.add(today.getFullYear())
    for (const e of allEntries) if (e.competence_date) set.add(Number(e.competence_date.slice(0, 4)))
    return Array.from(set).sort((a, b) => b - a)
  }, [allEntries])

  const dre = calcDRE(entries)

  const baseBruto   = dre.faturamentoBruto   || 1
  const baseLiquido = dre.faturamentoLiquido || 1

  // Margem Bruta % = Lucro Bruto / Faturamento Bruto
  const margemBrutaPct = (dre.lucroBruto / baseBruto) * 100

  // Saldo atual do caixa: opening balance (localStorage) + entradas - saídas do mês
  const openingBalance = user ? loadBalance(user.id, yearMonth) : 0
  const totalEntradas  = cfEntries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0)
  const totalSaidas    = cfEntries.filter(e => e.type !== 'revenue').reduce((s, e) => s + e.amount, 0)
  const saldoAtual     = openingBalance + totalEntradas - totalSaidas

  // ── Ponto de Equilíbrio ──
  const mcRatio = dre.faturamentoBruto > 0 ? dre.margemContribuicao / dre.faturamentoBruto : 0

  // Operacional: Custos Fixos / MC%
  const peOp      = mcRatio > 0 ? dre.totalDespesasFixas / mcRatio : 0
  const peOpPct   = dre.faturamentoBruto > 0 && peOp > 0 ? (peOp / dre.faturamentoBruto) * 100 : 0
  const acimaPeOp = peOp > 0 && dre.faturamentoBruto >= peOp

  // Real: (Custos Fixos + Despesas Variáveis de Venda) / MC%
  const peReal      = mcRatio > 0 ? (dre.totalDespesasFixas + dre.totalDespesasVariaveis) / mcRatio : 0
  const peRealPct   = dre.faturamentoBruto > 0 && peReal > 0 ? (peReal / dre.faturamentoBruto) * 100 : 0
  const acimaPeReal = peReal > 0 && dre.faturamentoBruto >= peReal

  // ── Necessidade de Caixa Mínimo ──
  const caixaMinimo = dre.totalDespesasFixas * 2.5
  const gapCaixa    = saldoAtual - caixaMinimo

  // ── Runway ──
  const runway      = dre.totalDespesasFixas > 0 ? saldoAtual / dre.totalDespesasFixas : null
  const runwayColor = runway === null ? 'text-white/60'
    : runway < 1  ? 'text-red-400'
    : runway <= 3 ? 'text-yellow-400'
    : 'text-brand-green'
  const runwayDisplay = runway === null ? '—'
    : runway < 1 ? `${Math.round(runway * 30)} dias`
    : `${runway.toFixed(1)} meses`

  return (
    <div className="p-8 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">DRE</h2>
          <p className="text-sm text-white/50 mt-1">Por data de competência</p>
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
        <div className="flex gap-6 items-start">

          {/* ── Coluna esquerda: tabela DRE (60%) — sticky para acompanhar scroll da coluna direita ── */}
          <div className="flex-[3] min-w-0 self-start">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-white/60 uppercase tracking-widest">Descrição</span>
                <div className="flex items-center gap-6">
                  <span className="text-[10px] text-white/60 uppercase tracking-widest w-14 text-right">%</span>
                  <span className="text-[10px] text-white/60 uppercase tracking-widest w-36 text-right">Valor (R$)</span>
                </div>
              </div>

              <DRERow label="(+) Faturamento Bruto"   value={dre.faturamentoBruto}   pct={100}                                       isResult />
              <DRERow label="(-) Impostos"             value={dre.impostos}           pct={dre.impostos / baseBruto * 100}            negative indent />
              <DRERow label="(=) Faturamento Líquido"  value={dre.faturamentoLiquido} pct={dre.faturamentoLiquido / baseBruto * 100}  isResult />

              <SectionHeader label="Custo dos Produtos/Serviços" />
              <DRERow label="(-) CMV"         value={dre.cmv}        pct={dre.cmv / baseLiquido * 100}       negative indent />
              <DRERow label="(=) Lucro Bruto" value={dre.lucroBruto} pct={dre.lucroBrutoMargin}              isResult isProfit />

              <SectionHeader label="Despesas Variáveis de Venda" />
              <DRERow label="Comissões de Venda"        value={dre.comissoesVendas} pct={dre.comissoesVendas / baseLiquido * 100} negative indent />
              <DRERow label="Marketing e Anúncios"      value={dre.marketingAds}   pct={dre.marketingAds / baseLiquido * 100}    negative indent />
              <DRERow label="Taxas de Cartão"           value={dre.taxasCartao}    pct={dre.taxasCartao / baseLiquido * 100}     negative indent />
              <DRERow label="(=) Margem de Contribuição" value={dre.margemContribuicao} pct={dre.margemContribuicaoMargin}       isResult isProfit />

              <SectionHeader label="Despesas Fixas" />
              <DRERow label="RH (Salários, Pró-labore)" value={dre.despesasRH}       pct={dre.despesasRH / baseLiquido * 100}       negative indent />
              <DRERow label="Ocupação"                  value={dre.despesasOcupacao} pct={dre.despesasOcupacao / baseLiquido * 100} negative indent />
              <DRERow label="Administrativo"            value={dre.despesasAdmin}   pct={dre.despesasAdmin / baseLiquido * 100}    negative indent />
              <DRERow label="(=) EBITDA"                value={dre.ebitda}          pct={dre.ebitdaMargin}                         isResult isProfit />

              <SectionHeader label="Retiradas de Sócios" />
              <DRERow label="(-) Retiradas"   value={dre.retiradas} pct={dre.retiradas / baseLiquido * 100} negative indent />
              <DRERow label="(=) Lucro Líquido" value={dre.lucro}   pct={dre.lucroMargin}                   isResult isProfit />
            </Card>
          </div>

          {/* ── Coluna direita: indicadores (40%) ── */}
          <div className="flex-[2] min-w-0 space-y-4">

            {/* 6 cards */}
            <div className="grid grid-cols-2 gap-3">
              <IndicCard
                label="Faturamento Bruto"
                mainValue={formatCurrency(dre.faturamentoBruto)}
                subValue="100% do faturamento"
              />
              <IndicCard
                label="Margem Bruta"
                mainValue={formatPercent(margemBrutaPct)}
                subValue={formatCurrency(dre.lucroBruto)}
                positive={margemBrutaPct >= 0}
                negative={margemBrutaPct < 0}
              />
              <IndicCard
                label="Margem de Contribuição"
                mainValue={formatCurrency(dre.margemContribuicao)}
                subValue={`${formatPercent(dre.margemContribuicaoMargin)} do Fat. Líq.`}
                positive={dre.margemContribuicao >= 0}
                negative={dre.margemContribuicao < 0}
              />
              <IndicCard
                label="EBITDA"
                mainValue={formatCurrency(dre.ebitda)}
                subValue={`${formatPercent(dre.ebitdaMargin)} do Fat. Líq.`}
                positive={dre.ebitda >= 0}
                negative={dre.ebitda < 0}
              />
              <IndicCard
                label="Lucro Líquido"
                mainValue={formatCurrency(dre.lucro)}
                subValue={`${formatPercent(dre.lucroMargin)} do Fat. Líq.`}
                positive={dre.lucro >= 0}
                negative={dre.lucro < 0}
              />
              <IndicCard
                label="Retiradas de Sócios"
                mainValue={formatCurrency(dre.retiradas)}
                subValue={`${formatPercent((dre.retiradas / baseLiquido) * 100)} do Fat. Líq.`}
                negative={dre.retiradas > 0}
              />
            </div>

            {/* PE Operacional */}
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Ponto de Equilíbrio Operacional</p>
              <p className="text-[10px] text-white/35 mb-4">Faturamento mínimo para cobrir os custos fixos</p>
              {peOp === 0 ? (
                <p className="text-xs text-white/50 py-2">Sem custos fixos cadastrados no período.</p>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-white/70">PE necessário</span>
                    <span className="text-sm font-bold tabular-nums text-white">{formatCurrency(peOp)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-white/70">Equivale a</span>
                    <span className="text-sm tabular-nums text-white/60">{formatPercent(peOpPct)} do fat. atual</span>
                  </div>
                  <StatusBadge
                    ok={acimaPeOp}
                    text={acimaPeOp
                      ? `Acima do PE — ${formatPercent(((dre.faturamentoBruto - peOp) / baseBruto) * 100)} de folga`
                      : `Abaixo do PE — falta ${formatCurrency(peOp - dre.faturamentoBruto)}`}
                  />
                </div>
              )}
            </Card>

            {/* PE Real */}
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Ponto de Equilíbrio Real</p>
              <p className="text-[10px] text-white/35 mb-4">Faturamento mínimo para cobrir todos os custos incluindo variáveis de venda</p>
              {peReal === 0 ? (
                <p className="text-xs text-white/50 py-2">Sem custos cadastrados no período.</p>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-white/70">PE necessário</span>
                    <span className="text-sm font-bold tabular-nums text-white">{formatCurrency(peReal)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-white/70">Equivale a</span>
                    <span className="text-sm tabular-nums text-white/60">{formatPercent(peRealPct)} do fat. atual</span>
                  </div>
                  <StatusBadge
                    ok={acimaPeReal}
                    text={acimaPeReal
                      ? `Acima do PE — ${formatPercent(((dre.faturamentoBruto - peReal) / baseBruto) * 100)} de folga`
                      : `Abaixo do PE — falta ${formatCurrency(peReal - dre.faturamentoBruto)}`}
                  />
                </div>
              )}
            </Card>

            {/* Necessidade de Caixa Mínimo */}
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4">Necessidade de Caixa Mínimo</p>
              <div className="space-y-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-white/70">Caixa mínimo (2,5× fixos)</span>
                  <span className="text-sm font-bold tabular-nums text-white">{formatCurrency(caixaMinimo)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-white/70">Caixa atual do mês</span>
                  <span className={`text-sm tabular-nums font-medium ${saldoAtual >= 0 ? 'text-white/70' : 'text-red-400'}`}>
                    {formatCurrency(saldoAtual)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-white/70">Diferença</span>
                  <span className={`text-sm tabular-nums font-semibold ${gapCaixa >= 0 ? 'text-brand-green' : 'text-red-400'}`}>
                    {gapCaixa >= 0 ? '+' : ''}{formatCurrency(gapCaixa)}
                  </span>
                </div>
                <StatusBadge
                  ok={gapCaixa >= 0}
                  text={gapCaixa >= 0
                    ? `Superávit de ${formatCurrency(gapCaixa)} sobre o mínimo`
                    : `Déficit de ${formatCurrency(Math.abs(gapCaixa))} para atingir o mínimo`}
                />
              </div>
            </Card>

          </div>
        </div>

        {/* Runway — largura total */}
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Runway — Meses de Sobrevivência</p>
          <div className="flex items-center gap-12 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold tabular-nums ${runwayColor}`}>
                {runway !== null ? (runway < 1 ? Math.round(runway * 30) : runway.toFixed(1)) : '—'}
              </span>
              <span className="text-sm text-white/60">{runway !== null && runway < 1 ? 'dias' : 'meses'}</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Com o caixa atual, o negócio sobrevive{' '}
              <span className={`font-semibold ${runwayColor}`}>{runwayDisplay}</span>{' '}
              sem faturar.
            </p>
            {runway !== null && (
              <StatusBadge
                ok={runway > 3}
                text={runway < 1
                  ? 'Crítico — menos de 1 mês de reserva'
                  : runway <= 3
                  ? 'Atenção — reserva entre 1 e 3 meses'
                  : 'Saudável — mais de 3 meses de reserva'}
              />
            )}
          </div>
        </Card>
        </>
      )}
    </div>
  )
}
