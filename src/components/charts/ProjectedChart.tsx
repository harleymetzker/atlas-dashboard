import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { ProjectedCashFlow } from '../../types'
import { Card } from '../ui/Card'

interface Props { data: ProjectedCashFlow[] }

const fmt = (v: number) => `R$ ${(v / 1000).toFixed(0)}k`

// Cores por série — mesmas opacidades usadas em CashFlowLineChart
const C_GREEN  = 'rgba(52,211,153,0.8)'
const C_RED    = 'rgba(248,113,113,0.8)'
const C_AMBER  = 'rgba(251,191,36,0.8)'
const C_BLUE   = 'rgba(96,165,250,0.8)'

export function ProjectedChart({ data }: Props) {
  let accumulated = 0
  const chartData = data.map(row => {
    accumulated += row.projectedBalance
    return {
      month: row.month,
      'Entradas Previstas': row.projectedRevenue,
      'Saídas Previstas':   row.projectedCosts + row.projectedWithdrawals,
      'Saldo do Mês':       row.projectedBalance,
      'Saldo Acumulado':    accumulated,
    }
  })

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Projeção 90 Dias</h3>
        <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-white/50 uppercase tracking-widest">
          Lançamentos futuros cadastrados
        </span>
      </div>
      {chartData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-white/35 text-sm">Sem dados</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          {/* Estrutura idêntica ao CashFlowLineChart */}
          <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmt}
            />
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              itemStyle={{ fontSize: 12 }}
              formatter={(v, name) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, name]}
              itemSorter={item => ['Entradas Previstas', 'Saídas Previstas', 'Saldo do Mês', 'Saldo Acumulado'].indexOf(item.dataKey as string)}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }} />
            {/* dot visível com r=5 porque são só 3 pontos mensais — sem strokeDasharray */}
            <Line dataKey="Entradas Previstas" stroke={C_GREEN} strokeWidth={2} dot={{ fill: C_GREEN, r: 5, strokeWidth: 0 }} activeDot={{ r: 4 }} />
            <Line dataKey="Saídas Previstas"   stroke={C_RED}   strokeWidth={2} dot={{ fill: C_RED,   r: 5, strokeWidth: 0 }} activeDot={{ r: 4 }} />
            <Line dataKey="Saldo do Mês"       stroke={C_AMBER} strokeWidth={2} dot={{ fill: C_AMBER, r: 5, strokeWidth: 0 }} activeDot={{ r: 4 }} />
            <Line dataKey="Saldo Acumulado"    stroke={C_BLUE}  strokeWidth={2} dot={{ fill: C_BLUE,  r: 5, strokeWidth: 0 }} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
