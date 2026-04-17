import { useState } from 'react'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { Input } from '../ui/Input'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

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
    <div className="flex flex-wrap items-end gap-3">
      <Input
        label="De"
        type="date"
        value={startDate}
        onChange={e => onChange(e.target.value, endDate)}
        className="w-40"
      />
      <Input
        label="Até"
        type="date"
        value={endDate}
        onChange={e => onChange(startDate, e.target.value)}
        className="w-40"
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/70 uppercase tracking-widest">Mês</label>
        <select
          value={selectedMonth}
          onChange={handleMonthSelect}
          className="bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/50 transition-colors"
        >
          <option value="" disabled className="bg-[#111] text-white/40">Selecionar mês</option>
          {MONTHS.map((name, i) => (
            <option key={i} value={i} className="bg-[#111] text-white">{name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
