import { useState } from 'react'
import { format, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '../context/AuthContext'
import { useEntries } from '../hooks/useEntries'
import { useOpeningBalance } from '../hooks/useOpeningBalance'
import { calcCashFlow, calcProjected90Days, formatCurrency, formatPercent } from '../lib/calculations'
import { DateFilter } from '../components/layout/DateFilter'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { CashFlowLineChart } from '../components/charts/CashFlowLineChart'

export function CashFlow() {
  const { user } = useAuth()
  const today = new Date()

  const [startDate, setStartDate] = useState(format(startOfMonth(today), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'))

  // Mês-chave derivado do mês inicial do período selecionado
  const yearMonth = startDate.slice(0, 7)

  const { balance: openingBalance, setBalance: saveOpeningBalance } = useOpeningBalance(user?.id, yearMonth)

  function handleBalanceChange(value: number) {
    saveOpeningBalance(value)
  }

  // Histórico filtrado por payment_date
  const { entries, loading } = useEntries({ startDate, endDate, dateField: 'payment_date' })
  // Todos os lançamentos para projeção futura
  const { entries: allEntries } = useEntries()

  const cashFlowEntries = calcCashFlow(entries, openingBalance)
  const projected = calcProjected90Days(allEntries)

  // Entradas = receitas; Saídas = despesas (fixas + variáveis) + retiradas
  const totalEntradas    = entries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0)
  const totalSaidas      = entries.filter(e => e.type !== 'revenue').reduce((s, e) => s + e.amount, 0)
  const closingBalance   = openingBalance + totalEntradas - totalSaidas
  const cashGeneration   = totalEntradas - totalSaidas
  const cashGenPct       = totalEntradas > 0 ? (cashGeneration / totalEntradas) * 100 : 0

  const hasProjected = projected.some(p => p.projectedRevenue > 0 || p.projectedCosts > 0 || p.projectedWithdrawals > 0)

  // Saldo acumulado da projeção parte de zero (apenas lançamentos futuros)
  let runningBalance = 0

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 style={{ fontFamily: "'Geist', sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>Fluxo de Caixa</h2>
          <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Por data de pagamento/recebimento</p>
        </div>
        <DateFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e) }} />
      </div>

      {/* Saldo inicial por mês */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666', whiteSpace: 'nowrap' }}>
          Saldo inicial de {format(new Date(yearMonth + '-02'), 'MMMM/yyyy', { locale: ptBR })}:
        </span>
        <div style={{ width: 192 }}>
          <CurrencyInput
            value={openingBalance === 0 ? '' : String(openingBalance)}
            onChange={v => handleBalanceChange(parseFloat(v) || 0)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-white/35">Carregando...</div>
      ) : (
        <>
          {/* Indicadores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <StatCard label="Saldo Inicial" value={formatCurrency(openingBalance)} />
            <StatCard label="(+) Entradas" value={formatCurrency(totalEntradas)} positive />
            <StatCard label="(-) Saídas" value={formatCurrency(totalSaidas)} sub="Despesas + Retiradas" negative />
            <StatCard
              label="Saldo Final"
              value={formatCurrency(closingBalance)}
              positive={closingBalance >= 0}
              negative={closingBalance < 0}
              highlight
            />
            <StatCard
              label="Geração de Caixa"
              value={formatCurrency(cashGeneration)}
              sub={`${formatPercent(cashGenPct)} de geração de caixa`}
              positive={cashGeneration >= 0}
              negative={cashGeneration < 0}
            />
          </div>

          {/* Tabela de movimentação diária */}
          <Card>
            <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 20 }}>Movimentação Diária</p>
            {cashFlowEntries.length === 0 ? (
              <p className="text-white/35 text-sm py-8 text-center">Nenhuma movimentação no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666', borderBottom: '1px solid #333' }}>
                      <th className="text-left py-3 font-medium">Data Pagamento</th>
                      <th className="text-right py-3 font-medium">Entradas</th>
                      <th className="text-right py-3 font-medium">Saídas</th>
                      <th className="text-right py-3 font-medium">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlowEntries.map(entry => (
                      <tr key={entry.date} className="hover:bg-[#111] transition-colors" style={{ borderBottom: '1px solid #1e1e1e' }}>
                        <td className="py-3" style={{ fontFamily: "'Geist Mono', monospace", color: '#A6A8AB' }}>{entry.date}</td>
                        <td className="py-3 text-right" style={{ fontFamily: "'Geist Mono', monospace", color: entry.revenue > 0 ? '#00EF61' : '#555' }}>
                          {entry.revenue > 0 ? formatCurrency(entry.revenue) : '—'}
                        </td>
                        <td className="py-3 text-right" style={{ fontFamily: "'Geist Mono', monospace", color: (entry.costs + entry.withdrawals) > 0 ? '#EF4444' : '#555' }}>
                          {(entry.costs + entry.withdrawals) > 0 ? formatCurrency(entry.costs + entry.withdrawals) : '—'}
                        </td>
                        <td className="py-3 text-right" style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 600, color: entry.balance >= 0 ? '#fff' : '#EF4444' }}>
                          {formatCurrency(entry.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Gráfico de linhas: Entradas vs Saídas por dia */}
          <CashFlowLineChart data={cashFlowEntries} />

          {/* Projeção 90 dias — tabela de lançamentos futuros */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Fluxo Projetado — 90 dias</h3>
              <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-white/50 uppercase tracking-widest">
                Lançamentos futuros cadastrados
              </span>
            </div>

            {!hasProjected ? (
              <p className="text-sm text-white/35 py-8 text-center">
                Nenhum lançamento futuro cadastrado. Lance receitas ou despesas com data de pagamento futura para ver a projeção.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-white/60 uppercase tracking-widest">
                      <th className="text-left pb-4">Mês</th>
                      <th className="text-right pb-4">Entradas previstas</th>
                      <th className="text-right pb-4">Saídas previstas</th>
                      <th className="text-right pb-4">Saldo do mês</th>
                      <th className="text-right pb-4">Saldo acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Próximos 30 dias', rows: projected.slice(0, 4) },
                      { label: 'Próximos 60 dias', rows: projected.slice(4, 8) },
                      { label: 'Próximos 90 dias', rows: projected.slice(8, 13) },
                    ].map(({ label, rows }) => {
                      const subEntradas = rows.reduce((s, r) => s + r.projectedRevenue, 0)
                      const subSaidas   = rows.reduce((s, r) => s + r.projectedCosts + r.projectedWithdrawals, 0)
                      const subBalance  = subEntradas - subSaidas
                      // Pré-computa saldo acumulado por semana dentro do grupo
                      const weekRows = rows.map(row => {
                        const rowBalance = row.projectedRevenue - row.projectedCosts - row.projectedWithdrawals
                        runningBalance += rowBalance
                        return { row, rowBalance, accum: runningBalance }
                      })
                      const subAccum = runningBalance
                      return (
                        <>
                          {weekRows.map(({ row, rowBalance, accum }) => (
                            <tr key={row.month} className="border-b border-white/5 text-white/80">
                              <td className="py-2.5 pl-3 tabular-nums">{row.month}</td>
                              <td className="py-2.5 text-right tabular-nums text-brand-green/70">
                                {row.projectedRevenue > 0 ? formatCurrency(row.projectedRevenue) : '—'}
                              </td>
                              <td className="py-2.5 text-right tabular-nums text-red-400/70">
                                {(row.projectedCosts + row.projectedWithdrawals) > 0
                                  ? formatCurrency(row.projectedCosts + row.projectedWithdrawals)
                                  : '—'}
                              </td>
                              <td className={`py-2.5 text-right tabular-nums ${rowBalance >= 0 ? 'text-white/80' : 'text-red-400/70'}`}>
                                {formatCurrency(rowBalance)}
                              </td>
                              <td className={`py-2.5 text-right tabular-nums ${accum >= 0 ? 'text-white/80' : 'text-red-400/70'}`}>
                                {formatCurrency(accum)}
                              </td>
                            </tr>
                          ))}
                          <tr key={label} className="bg-white/5 border-b border-white/15">
                            <td className="py-3 pl-3 font-bold text-white text-xs uppercase tracking-widest">{label}</td>
                            <td className={`py-3 text-right tabular-nums font-bold ${subEntradas > 0 ? 'text-brand-green' : 'text-white/60'}`}>
                              {subEntradas > 0 ? formatCurrency(subEntradas) : '—'}
                            </td>
                            <td className={`py-3 text-right tabular-nums font-bold ${subSaidas > 0 ? 'text-red-400' : 'text-white/60'}`}>
                              {subSaidas > 0 ? formatCurrency(subSaidas) : '—'}
                            </td>
                            <td className={`py-3 text-right tabular-nums font-bold ${subBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                              {formatCurrency(subBalance)}
                            </td>
                            <td className={`py-3 text-right tabular-nums font-bold ${subAccum >= 0 ? 'text-white' : 'text-red-400'}`}>
                              {formatCurrency(subAccum)}
                            </td>
                          </tr>
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
