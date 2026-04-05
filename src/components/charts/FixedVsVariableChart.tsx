import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '../ui/Card'

interface Props {
  fixed: number
  variable: number
}

export function FixedVsVariableChart({ fixed, variable }: Props) {
  const total = fixed + variable
  const data = [
    { name: 'Custos Fixos', value: fixed, percentage: total > 0 ? (fixed / total) * 100 : 0 },
    { name: 'Custos Variáveis', value: variable, percentage: total > 0 ? (variable / total) * 100 : 0 },
  ]

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-6">Fixo vs Variável</h3>
      {total === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-white/20 text-sm">Sem dados</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={90} innerRadius={50}>
              <Cell fill="#6366f1" />
              <Cell fill="#f59e0b" />
            </Pie>
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              itemStyle={{ fontSize: 12 }}
              formatter={(v, name, item) => {
                const pct = (item.payload as { percentage: number }).percentage
                return [`R$ ${Number(v).toLocaleString('pt-BR')} (${pct.toFixed(1)}%)`, name]
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value, entry) => {
                const d = entry.payload as unknown as { percentage: number }
                return (
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {value} {d?.percentage != null ? `(${d.percentage.toFixed(1)}%)` : ''}
                  </span>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
