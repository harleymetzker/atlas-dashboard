import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon?: ReactNode
  positive?: boolean
  negative?: boolean
  highlight?: boolean
}

export function StatCard({ label, value, sub, icon, positive, negative }: StatCardProps) {
  const valueColor = positive ? '#00EF61' : negative ? '#EF4444' : '#fff'
  return (
    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 10 }}>{label}</p>
          <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 22, fontWeight: 700, color: valueColor, lineHeight: 1.2 }}>{value}</p>
          {sub && <p style={{ fontSize: 11, color: '#555', marginTop: 5 }}>{sub}</p>}
        </div>
        {icon && (
          <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
