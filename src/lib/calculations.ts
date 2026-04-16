import type { Entry, DRE, CashFlowEntry, MonthlyData, CategoryData, ProjectedCashFlow } from '../types'
import {
  ALL_FIXED_CATEGORIES,
  FIXED_RH_CATEGORIES,
  FIXED_OCUPACAO_CATEGORIES,
  FIXED_ADMIN_CATEGORIES,
  ANTECIPACAO_CATEGORY,
} from '../types'
import { format, addDays } from 'date-fns'

function sumByCategory(entries: Entry[], categories: string[]): number {
  return entries
    .filter(e => e.type === 'expense' && categories.includes(e.category))
    .reduce((s, e) => s + e.amount, 0)
}

export function calcDRE(entries: Entry[]): DRE {
  // Antecipação de Vendas entra apenas no fluxo de caixa, não na DRE
  const dreEntries = entries.filter(e => e.category !== ANTECIPACAO_CATEGORY)
  return _calcDRE(dreEntries)
}

function _calcDRE(entries: Entry[]): DRE {
  const faturamentoBruto = entries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0)
  const retiradas        = entries.filter(e => e.type === 'withdrawal').reduce((s, e) => s + e.amount, 0)

  const impostos         = sumByCategory(entries, ['Impostos'])
  const cmv              = sumByCategory(entries, ['CMV'])
  const comissoesVendas  = sumByCategory(entries, ['Comissões de Venda'])
  const marketingAds     = sumByCategory(entries, ['Marketing e Anúncios'])
  const taxasCartao      = sumByCategory(entries, ['Taxas de Cartão'])
  const despesasRH       = sumByCategory(entries, FIXED_RH_CATEGORIES)
  const despesasOcupacao = sumByCategory(entries, FIXED_OCUPACAO_CATEGORIES)
  const despesasAdmin    = sumByCategory(entries, FIXED_ADMIN_CATEGORIES)

  const faturamentoLiquido    = faturamentoBruto - impostos
  const lucroBruto            = faturamentoLiquido - cmv
  const totalDespesasVariaveis = comissoesVendas + marketingAds + taxasCartao
  const margemContribuicao    = lucroBruto - totalDespesasVariaveis
  const totalDespesasFixas    = despesasRH + despesasOcupacao + despesasAdmin
  const ebitda                = margemContribuicao - totalDespesasFixas
  const lucro                 = ebitda - retiradas

  const baseLiquido = faturamentoLiquido || 1

  return {
    faturamentoBruto,
    impostos,
    faturamentoLiquido,
    cmv,
    lucroBruto,
    lucroBrutoMargin: (lucroBruto / baseLiquido) * 100,
    comissoesVendas,
    marketingAds,
    taxasCartao,
    totalDespesasVariaveis,
    margemContribuicao,
    margemContribuicaoMargin: (margemContribuicao / baseLiquido) * 100,
    despesasRH,
    despesasOcupacao,
    despesasAdmin,
    totalDespesasFixas,
    ebitda,
    ebitdaMargin: (ebitda / baseLiquido) * 100,
    retiradas,
    lucro,
    lucroMargin: (lucro / baseLiquido) * 100,
  }
}

export function calcCashFlow(entries: Entry[], openingBalance = 0): CashFlowEntry[] {
  const byDate: Record<string, { revenue: number; costs: number; withdrawals: number }> = {}
  for (const e of entries.filter(e => e.payment_date)) {
    const key = e.payment_date as string
    if (!byDate[key]) byDate[key] = { revenue: 0, costs: 0, withdrawals: 0 }
    if (e.type === 'revenue') byDate[key].revenue += e.amount
    else if (e.type === 'withdrawal') byDate[key].withdrawals += e.amount
    else byDate[key].costs += e.amount
  }
  const sorted = Object.keys(byDate).sort()
  let balance = openingBalance
  return sorted.map(date => {
    const d = byDate[date]
    balance = balance + d.revenue - d.costs - d.withdrawals
    return { date, ...d, balance }
  })
}

export function calcMonthlyData(entries: Entry[], dateField: 'competence_date' | 'payment_date' = 'competence_date'): MonthlyData[] {
  const byMonth: Record<string, MonthlyData> = {}
  for (const e of entries) {
    const dateVal = e[dateField]
    if (!dateVal) continue
    const month = dateVal.slice(0, 7)
    if (!byMonth[month]) byMonth[month] = { month, revenue: 0, fixedCosts: 0, variableCosts: 0, withdrawals: 0, profit: 0 }
    if (e.type === 'revenue') {
      byMonth[month].revenue += e.amount
    } else if (e.type === 'withdrawal') {
      byMonth[month].withdrawals += e.amount
    } else if (e.type === 'expense') {
      if (ALL_FIXED_CATEGORIES.includes(e.category)) byMonth[month].fixedCosts += e.amount
      else byMonth[month].variableCosts += e.amount
    }
  }
  return Object.values(byMonth)
    .map(m => ({ ...m, profit: m.revenue - m.fixedCosts - m.variableCosts - m.withdrawals }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export function calcCategoryBreakdown(entries: Entry[], categories: string[]): CategoryData[] {
  const filtered = entries.filter(e => e.type === 'expense' && categories.includes(e.category))
  const total = filtered.reduce((s, e) => s + e.amount, 0)
  const byCat: Record<string, number> = {}
  for (const e of filtered) byCat[e.category] = (byCat[e.category] || 0) + e.amount
  return Object.entries(byCat)
    .map(([category, amount]) => ({ category, amount, percentage: total > 0 ? (amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount)
}

// Real future entries grouped by week (~13 weeks = 90 days), payment_date > today
export function calcProjected90Days(allEntries: Entry[]): ProjectedCashFlow[] {
  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')

  const buckets = Array.from({ length: 13 }, (_, i) => {
    const start = addDays(now, i * 7 + 1)
    const end   = addDays(now, i * 7 + 7)
    return {
      label: format(start, 'dd/MM'),
      start: format(start, 'yyyy-MM-dd'),
      end:   format(end,   'yyyy-MM-dd'),
      revenue: 0, costs: 0, withdrawals: 0,
    }
  })

  for (const e of allEntries.filter(e => e.payment_date && e.payment_date > todayStr)) {
    const pd = e.payment_date as string
    for (const b of buckets) {
      if (pd >= b.start && pd <= b.end) {
        if (e.type === 'revenue')       b.revenue     += e.amount
        else if (e.type === 'withdrawal') b.withdrawals += e.amount
        else                              b.costs       += e.amount
        break
      }
    }
  }

  return buckets.map(b => ({
    month: b.label,
    projectedRevenue:     b.revenue,
    projectedCosts:       b.costs,
    projectedWithdrawals: b.withdrawals,
    projectedBalance:     b.revenue - b.costs - b.withdrawals,
  }))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}
