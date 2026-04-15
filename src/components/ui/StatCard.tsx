import type { ReactNode } from 'react'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon?: ReactNode
  positive?: boolean
  negative?: boolean
  highlight?: boolean
}

export function StatCard({ label, value, sub, icon, positive, negative, highlight }: StatCardProps) {
  const valueColor = positive ? 'text-brand-green' : negative ? 'text-red-400' : highlight ? 'text-white' : 'text-white'
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/60 uppercase tracking-widest mb-3">{label}</p>
          <p className={`text-2xl font-bold tracking-tight tabular-nums ${valueColor}`}>{value}</p>
          {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
