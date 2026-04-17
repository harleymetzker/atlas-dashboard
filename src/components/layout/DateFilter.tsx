import { useState } from 'react'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  color: 'rgba(255,255,255,0.7)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 12,
  padding: '10px 16px',
  fontSize: 14,
  color: '#fff',
  outline: 'none',
  height: 42,
  boxSizing: 'border-box',
}

interface DateFilterProps {
  startDate: string
  endDate: string
  onChange: (start: string, end: string) => void
}

export function DateFilter({ startDate, endDate, onChange }: DateFilterProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  function handleMonthSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setSelectedMonth(val)
    const monthIndex = Number(val)
    if (isNaN(monthIndex)) return
    const year = endDate ? parseISO(endDate).getFullYear() : new Date().getFullYear()
    const ref = new Date(year, monthIndex, 1)
    onChange(
      format(startOfMonth(ref), 'yyyy-MM-dd'),
      format(endOfMonth(ref), 'yyyy-MM-dd'),
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <label style={labelStyle}>De</label>
        <input
          type="date"
          value={startDate}
          onChange={e => onChange(e.target.value, endDate)}
          style={{ ...inputStyle, width: 160 }}
        />
      </div>
      <div>
        <label style={labelStyle}>Até</label>
        <input
          type="date"
          value={endDate}
          onChange={e => onChange(startDate, e.target.value)}
          style={{ ...inputStyle, width: 160 }}
        />
      </div>
      <div>
        <label style={labelStyle}>Mês</label>
        <select
          value={selectedMonth}
          onChange={handleMonthSelect}
          style={{ ...inputStyle, width: 160, cursor: 'pointer' }}
        >
          <option value="" disabled style={{ background: '#111', color: 'rgba(255,255,255,0.4)' }}>Selecionar mês</option>
          {MONTHS.map((name, i) => (
            <option key={i} value={i} style={{ background: '#111', color: '#fff' }}>{name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
