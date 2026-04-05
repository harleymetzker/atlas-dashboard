import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { CategoryData } from '../../types'
import { Card } from '../ui/Card'

interface Props {
  data: CategoryData[]
  title: string
}

const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6',
  '#f97316', '#84cc16', '#06b6d4', '#e11d48',
]

export function PieChart({ data, title }: Props) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-6">{title}</h3>
      {data.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-white/20 text-sm">Sem dados</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <RechartsPie>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="45%"
              outerRadius={90}
              innerRadius={50}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              itemStyle={{ fontSize: 12 }}
              formatter={(v, name, item) => {
                const pct = (item.payload as CategoryData).percentage
                return [`R$ ${Number(v).toLocaleString('pt-BR')} (${pct.toFixed(1)}%)`, name]
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value, entry) => {
                const d = (entry.payload as unknown as CategoryData)
                return (
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {value} {d?.percentage != null ? `(${d.percentage.toFixed(1)}%)` : ''}
                  </span>
                )
              }}
            />
          </RechartsPie>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
