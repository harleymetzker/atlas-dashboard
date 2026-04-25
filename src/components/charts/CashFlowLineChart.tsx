import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { CashFlowEntry } from '../../types'

interface Props { data: CashFlowEntry[] }

const fmt = (v: number) => `R$ ${(v / 1000).toFixed(0)}k`

export function CashFlowLineChart({ data }: Props) {
  const chartData = data.map(e => ({
    date: e.date.slice(5), // MM-DD
    Entradas: e.revenue,
    Saídas: e.costs + e.withdrawals,
  }))

  return (
    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: 24 }}>
      <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 20 }}>
        Padrão de Fluxo no Período
      </p>
      {chartData.length === 0 ? (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>Sem dados</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10, fontFamily: "'Geist Mono', monospace" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#555', fontSize: 10, fontFamily: "'Geist Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8 }}
              labelStyle={{ color: '#666', fontSize: 11, fontFamily: "'Geist Mono', monospace" }}
              itemStyle={{ fontSize: 12, fontFamily: "'Geist Mono', monospace" }}
              formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#555', fontFamily: "'Geist Mono', monospace" }} />
            <Line dataKey="Entradas" stroke="#80EF00" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line dataKey="Saídas" stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
