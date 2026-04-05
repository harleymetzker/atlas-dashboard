import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { CashFlowEntry } from '../../types'
import { Card } from '../ui/Card'

interface Props { data: CashFlowEntry[] }

const fmt = (v: number) => `R$ ${(v / 1000).toFixed(0)}k`

export function CashFlowLineChart({ data }: Props) {
  const chartData = data.map(e => ({
    date: e.date.slice(5), // MM-DD
    Entradas: e.revenue,
    Saídas: e.costs + e.withdrawals,
  }))

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-6">
        Padrão de Fluxo no Período
      </h3>
      {chartData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-white/20 text-sm">Sem dados</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              itemStyle={{ fontSize: 12 }}
              formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }} />
            <Line dataKey="Entradas" stroke="rgba(52,211,153,0.8)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line dataKey="Saídas" stroke="rgba(248,113,113,0.8)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
