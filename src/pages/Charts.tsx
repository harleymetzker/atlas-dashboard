import { useState } from 'react'
import { format, startOfMonth, subMonths } from 'date-fns'
import { useEntries } from '../hooks/useEntries'
import { calcMonthlyData, calcCategoryBreakdown, calcProjected90Days } from '../lib/calculations'
import { ALL_FIXED_CATEGORIES, ALL_VARIABLE_CATEGORIES } from '../types'
import { DateFilter } from '../components/layout/DateFilter'
import { MonthlyChart } from '../components/charts/MonthlyChart'
import { PieChart } from '../components/charts/PieChart'
import { FixedVsVariableChart } from '../components/charts/FixedVsVariableChart'
import { ProjectedChart } from '../components/charts/ProjectedChart'

export function Charts() {
  const today = new Date()
  const [startDate, setStartDate] = useState(format(startOfMonth(subMonths(today, 5)), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'))

  // Por competence_date (DRE)
  const { entries: entriesComp, loading } = useEntries({ startDate, endDate, dateField: 'competence_date' })
  // Por payment_date (Fluxo de Caixa)
  const { entries: entriesPay } = useEntries({ startDate, endDate, dateField: 'payment_date' })
  // Todos para projeção futura
  const { entries: allEntries } = useEntries()

  const monthlyComp   = calcMonthlyData(entriesComp, 'competence_date')
  const monthlyPay    = calcMonthlyData(entriesPay, 'payment_date')
  const fixedBreakdown = calcCategoryBreakdown(entriesComp, ALL_FIXED_CATEGORIES)
  const varBreakdown   = calcCategoryBreakdown(entriesComp, ALL_VARIABLE_CATEGORIES)
  const fixedTotal     = entriesComp.filter(e => e.type === 'expense' && ALL_FIXED_CATEGORIES.includes(e.category)).reduce((s, e) => s + e.amount, 0)
  const variableTotal  = entriesComp.filter(e => e.type === 'expense' && ALL_VARIABLE_CATEGORIES.includes(e.category)).reduce((s, e) => s + e.amount, 0)
  const projected      = calcProjected90Days(allEntries)

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Gráficos</h2>
          <p className="text-sm text-white/30 mt-1">Análise visual dos dados financeiros</p>
        </div>
        <DateFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e) }} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-white/20">Carregando...</div>
      ) : (
        <>
          <MonthlyChart
            data={monthlyComp}
            title="Evolução Mensal — Regime de Competência"
            subtitle="DRE"
          />
          <MonthlyChart
            data={monthlyPay}
            title="Evolução Mensal — Regime de Caixa"
            subtitle="Fluxo de Caixa"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChart data={fixedBreakdown} title="Despesas Fixas por Categoria" />
            <PieChart data={varBreakdown} title="Despesas Variáveis por Categoria" />
          </div>
          <FixedVsVariableChart fixed={fixedTotal} variable={variableTotal} />
          <ProjectedChart data={projected} />
        </>
      )}
    </div>
  )
}
