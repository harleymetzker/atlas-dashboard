import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface DateFilterProps {
  startDate: string
  endDate: string
  onChange: (start: string, end: string) => void
}

export function DateFilter({ startDate, endDate, onChange }: DateFilterProps) {
  const setPreset = (months: number) => {
    const today = new Date()
    const end = endOfMonth(today)
    const start = months === 0 ? startOfMonth(today) : startOfMonth(subMonths(today, months - 1))
    onChange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'))
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
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setPreset(0)}>Este mês</Button>
        <Button variant="ghost" size="sm" onClick={() => setPreset(3)}>3 meses</Button>
        <Button variant="ghost" size="sm" onClick={() => setPreset(6)}>6 meses</Button>
        <Button variant="ghost" size="sm" onClick={() => setPreset(12)}>12 meses</Button>
      </div>
    </div>
  )
}
