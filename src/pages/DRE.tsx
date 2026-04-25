import { useState, useMemo } from 'react'
import { format, parseISO, endOfMonth } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { useEntries } from '../hooks/useEntries'
import { useOpeningBalance } from '../hooks/useOpeningBalance'
import { calcDRE, formatCurrency, formatPercent } from '../lib/calculations'
import { Card } from '../components/ui/Card'

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

function DRERow({ label, value, pct, isResult, isProfit: _isProfit, indent, negative }: DRERowProps) {
  const valueColor = negative
    ? '#EF4444'
    : value >= 0 ? '#80EF00' : '#EF4444'

  return (
    <div
      className={isResult ? '' : 'hover:bg-[#0a0a0a] transition-colors'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isResult ? '10px 10px' : '8px 10px',
        background: isResult ? '#111' : undefined,
        // Result rows pull up 1px to cover the previous row's borderBottom with their
        // own #111 background, so only their borderTop (#333) is visible — no double lines.
        position: isResult ? 'relative' : undefined,
        zIndex: isResult ? 1 : undefined,
        marginTop: isResult ? -1 : undefined,
        borderTop: isResult ? '1px solid #333' : undefined,
        borderBottom: '1px solid #1e1e1e',
      }}
    >
      <span style={{
        fontSize: 13,
        fontWeight: isResult ? 700 : 400,
        color: isResult ? '#fff' : '#A6A8AB',
        paddingLeft: indent ? 14 : 0,
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {pct !== undefined
          ? <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#555', width: 56, textAlign: 'right' }}>{formatPercent(pct)}</span>
          : <span style={{ width: 56 }} />
        }
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: isResult ? 700 : 500, color: valueColor, width: 144, textAlign: 'right' }}>
          {negative && value > 0 ? `-${formatCurrency(value)}` : formatCurrency(value)}
        </span>
      </div>
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ marginTop: 24, padding: '6px 10px', borderBottom: '1px solid #1e1e1e' }}>
      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#555' }}>{label}</span>
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
  const valueColor = positive ? '#80EF00' : negative ? '#EF4444' : '#fff'
  return (
    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: 16 }}>
      <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 8, lineHeight: 1.4 }}>{label}</p>
      <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 22, fontWeight: 700, color: valueColor, lineHeight: 1.2 }}>{mainValue}</p>
      {subValue && <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{subValue}</p>}
    </div>
  )
}

function StatusBadge({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      borderRadius: 6, padding: '8px 12px',
      borderLeft: `3px solid ${ok ? '#80EF00' : '#EF4444'}`,
      background: ok ? 'rgba(128,239,0,0.06)' : 'rgba(239,68,68,0.06)',
    }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: ok ? '#80EF00' : '#EF4444' }}>{text}</span>
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

  // Saldo atual do caixa: opening balance (Supabase) + entradas - saídas do mês
  const { balance: openingBalance } = useOpeningBalance(user?.id, yearMonth)
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
          <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>DRE</h2>
          <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Por data de competência</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#666' }}>Mês</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              style={{ fontFamily: "'Geist Mono', monospace", background: '#111', border: '1px solid #1e1e1e', borderRadius: 6, padding: '8px 14px', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer' }}
            >
              {MONTHS.map((name, i) => (
                <option key={i + 1} value={i + 1} style={{ background: '#111', color: '#fff' }}>{name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#666' }}>Ano</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={{ fontFamily: "'Geist Mono', monospace", background: '#111', border: '1px solid #1e1e1e', borderRadius: 6, padding: '8px 14px', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer' }}
            >
              {yearOptions.map(y => (
                <option key={y} value={y} style={{ background: '#111', color: '#fff' }}>{y}</option>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 10px' }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666' }}>Descrição</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666', width: 56, textAlign: 'right' }}>%</span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666', width: 144, textAlign: 'right' }}>Valor</span>
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
              <DRERow label="Taxas de Cartão"           value={dre.taxasCartao}              pct={dre.taxasCartao / baseLiquido * 100}              negative indent />
              <DRERow label="Outras Despesas Variáveis" value={dre.outrasDespesasVariaveis} pct={dre.outrasDespesasVariaveis / baseLiquido * 100}  negative indent />
              <DRERow label="(=) Margem de Contribuição" value={dre.margemContribuicao} pct={dre.margemContribuicaoMargin}                         isResult isProfit />

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
