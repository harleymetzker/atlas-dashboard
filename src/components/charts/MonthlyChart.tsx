import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { MonthlyData } from '../../types'
import { Card } from '../ui/Card'

interface Props {
  data: MonthlyData[]
  title: string
  subtitle?: string
}

const fmt = (v: number) => `R$ ${(v / 1000).toFixed(0)}k`

const SERIES = [
  { name: 'Receita',          color: '#60a5fa' },
  { name: 'Custos Fixos',     color: 'rgba(255,255,255,0.25)' },
  { name: 'Custos Variáveis', color: 'rgba(255,255,255,0.12)' },
  { name: 'Lucro',            color: 'rgba(52,211,153,0.7)' },
]

function CustomLegend() {
  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 12 }}>
      {SERIES.map(s => (
        <span key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: 'inline-block', flexShrink: 0 }} />
          {s.name}
        </span>
      ))}
    </div>
  )
}

export function MonthlyChart({ data, title, subtitle }: Props) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">{title}</h3>
        {subtitle && (
          <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-white/30 uppercase tracking-widest">{subtitle}</span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            itemStyle={{ fontSize: 12 }}
            formatter={(v, name) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, name]}
            itemSorter={item => ['revenue', 'fixedCosts', 'variableCosts', 'profit'].indexOf(item.dataKey as string)}
          />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="revenue"       name="Receita"          fill="#60a5fa"                radius={[4, 4, 0, 0]} />
          <Bar dataKey="fixedCosts"    name="Custos Fixos"     fill="rgba(255,255,255,0.25)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="variableCosts" name="Custos Variáveis" fill="rgba(255,255,255,0.12)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit"        name="Lucro"            fill="rgba(52,211,153,0.7)"   radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
