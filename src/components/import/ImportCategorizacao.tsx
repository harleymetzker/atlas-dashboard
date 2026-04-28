import { useEffect, useState, useCallback } from 'react'
import { X, Check, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import type { RawRow } from '../../lib/parseExtrato'
import type { EntryType } from '../../types'
import { REVENUE_CATEGORIES, EXPENSE_CATEGORY_GROUPS, ANTECIPACAO_CATEGORY } from '../../types'

export interface ImportRow {
  id: string
  include: boolean
  type: EntryType
  category: string
  description: string
  amount: string
  competence_date: string   // '' means null (sem competência)
  payment_date: string      // '' means null (sem pagamento)
  semCompetence: boolean
  semPayment: boolean
}

interface ImportCategorizacaoProps {
  rows: RawRow[]
  onImport: (rows: ImportRow[]) => Promise<void>
  onClose: () => void
  /** Quando presente, sobrescreve a inicialização padrão (recuperação de progresso salvo). */
  initialRows?: ImportRow[]
  /** Notifica o pai a cada mudança no estado interno (pra persistência debounced). */
  onChange?: (rows: ImportRow[]) => void
}

const TYPE_OPTIONS: { value: EntryType; label: string }[] = [
  { value: 'revenue',    label: 'Receita' },
  { value: 'expense',    label: 'Despesa' },
  { value: 'withdrawal', label: 'Retirada' },
]

function firstCategory(type: EntryType): string {
  if (type === 'revenue') return REVENUE_CATEGORIES[0]
  if (type === 'withdrawal') return 'Retirada de Sócio'
  return EXPENSE_CATEGORY_GROUPS[0].categories[0]
}

function rawToImportRow(raw: RawRow): ImportRow {
  const absAmount = Math.abs(raw.amount)
  const type: EntryType = raw.amount >= 0 ? 'revenue' : 'expense'
  return {
    id: crypto.randomUUID(),
    include: true,
    type,
    category: firstCategory(type),
    description: raw.description,
    amount: absAmount.toFixed(2),
    competence_date: raw.date,
    payment_date: raw.date,
    semCompetence: false,
    semPayment: false,
  }
}

const todayStr = format(new Date(), 'yyyy-MM-dd')

// Inline toggle — same visual as the form manual
function MiniToggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      style={{
        width: 28, height: 16, borderRadius: 8,
        background: on ? '#80EF00' : '#333',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background 0.2s',
        flexShrink: 0, opacity: disabled ? 0.4 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 2,
        left: on ? 13 : 2,
        width: 12, height: 12, borderRadius: '50%',
        background: on ? '#000' : '#888',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

// Category select with optgroups for expense, flat for revenue/withdrawal
function CategorySelect({
  type,
  value,
  onChange,
  disabled,
}: {
  type: EntryType
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const cls = "w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 disabled:cursor-not-allowed pr-6"

  if (type === 'expense') {
    return (
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className={cls}>
          {EXPENSE_CATEGORY_GROUPS.map(g => (
            <optgroup key={g.group} label={g.group} className="bg-[#111] text-white/50">
              {g.categories.map(c => (
                <option key={c} value={c} className="bg-[#111] text-white">{c}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      </div>
    )
  }

  const options = type === 'revenue'
    ? REVENUE_CATEGORIES.map(c => ({ value: c, label: c }))
    : [{ value: 'Retirada de Sócio', label: 'Retirada de Sócio' }]

  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className={cls}>
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>
        ))}
      </select>
      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  )
}

export function ImportCategorizacao({ rows, onImport, onClose, initialRows, onChange }: ImportCategorizacaoProps) {
  const [importRows, setImportRows] = useState<ImportRow[]>(
    () => initialRows ?? rows.map(rawToImportRow)
  )
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    onChange?.(importRows)
  }, [importRows, onChange])

  const selectedCount = importRows.filter(r => r.include).length

  const updateRow = useCallback((id: string, patch: Partial<ImportRow>) => {
    setImportRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }, [])

  function handleTypeChange(id: string, type: EntryType) {
    updateRow(id, { type, category: firstCategory(type) })
  }

  function toggleSemCompetence(row: ImportRow) {
    const next = !row.semCompetence
    updateRow(row.id, {
      semCompetence: next,
      competence_date: next ? '' : todayStr,
    })
  }

  function toggleSemPayment(row: ImportRow) {
    const next = !row.semPayment
    updateRow(row.id, {
      semPayment: next,
      payment_date: next ? '' : todayStr,
    })
  }

  function toggleAll(include: boolean) {
    setImportRows(prev => prev.map(r => ({ ...r, include })))
  }

  async function handleImport() {
    const selected = importRows.filter(r => r.include)
    if (selected.length === 0) {
      setError('Selecione ao menos um lançamento para importar.')
      return
    }
    setImporting(true)
    setError('')
    try {
      await onImport(selected)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao importar.')
      setImporting(false)
    }
  }

  const allSelected = importRows.length > 0 && importRows.every(r => r.include)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Categorizar Extrato</h2>
          <p className="text-xs text-white/40 mt-0.5">
            {importRows.length} transações encontradas — revise e categorize antes de importar
          </p>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5">
          <X size={20} />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 py-4">
        <table className="w-full text-sm border-separate border-spacing-y-1">
          <thead>
            <tr className="text-xs text-white/40 uppercase tracking-widest">
              <th className="text-left pb-3 w-8">
                <button
                  onClick={() => toggleAll(!allSelected)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    allSelected ? 'bg-brand-green border-brand-green' : 'border-white/20 bg-transparent'
                  }`}
                >
                  {allSelected && <Check size={10} className="text-black" strokeWidth={3} />}
                </button>
              </th>
              <th className="text-left pb-3 w-28">Tipo</th>
              <th className="text-left pb-3 w-52">Categoria</th>
              <th className="text-left pb-3">Descrição</th>
              <th className="text-left pb-3 w-36">Competência</th>
              <th className="text-left pb-3 w-36">Pagamento</th>
              <th className="text-right pb-3 w-28">Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {importRows.map(row => (
              <tr
                key={row.id}
                className={`align-top transition-opacity ${row.include ? 'opacity-100' : 'opacity-30'}`}
              >
                {/* Checkbox */}
                <td className="pt-2 pr-2">
                  <button
                    onClick={() => updateRow(row.id, { include: !row.include })}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      row.include ? 'bg-brand-green border-brand-green' : 'border-white/20 bg-transparent'
                    }`}
                  >
                    {row.include && <Check size={10} className="text-black" strokeWidth={3} />}
                  </button>
                </td>

                {/* Type */}
                <td className="py-1 pr-2">
                  <div className="relative">
                    <select
                      value={row.type}
                      onChange={e => handleTypeChange(row.id, e.target.value as EntryType)}
                      disabled={!row.include}
                      className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 disabled:cursor-not-allowed pr-6"
                    >
                      {TYPE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                </td>

                {/* Category — grouped for expense */}
                <td className="py-1 pr-2">
                  <CategorySelect
                    type={row.type}
                    value={row.category}
                    onChange={v => updateRow(row.id, { category: v })}
                    disabled={!row.include}
                  />
                </td>

                {/* Description */}
                <td className="py-1 pr-2">
                  <input
                    type="text"
                    value={row.description}
                    onChange={e => updateRow(row.id, { description: e.target.value })}
                    disabled={!row.include}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 disabled:cursor-not-allowed"
                    placeholder="Descrição"
                  />
                </td>

                {/* Competence date + toggle */}
                <td className="py-1 pr-2">
                  {row.category === ANTECIPACAO_CATEGORY ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/30 tabular-nums">
                      = pagamento
                    </div>
                  ) : (row.type === 'withdrawal' || row.semCompetence) ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/30 tabular-nums">
                      —
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={row.competence_date}
                      onChange={e => updateRow(row.id, { competence_date: e.target.value || todayStr })}
                      disabled={!row.include}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 disabled:cursor-not-allowed"
                    />
                  )}
                  {row.category !== ANTECIPACAO_CATEGORY && row.type !== 'withdrawal' && (
                    <div className="flex items-center gap-1.5 mt-1 ml-0.5">
                      <MiniToggle
                        on={row.semCompetence}
                        onToggle={() => toggleSemCompetence(row)}
                        disabled={!row.include}
                      />
                      <span className="text-[10px] text-white/30 leading-none">sem competência</span>
                    </div>
                  )}
                </td>

                {/* Payment date + toggle */}
                <td className="py-1 pr-2">
                  {row.semPayment ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/30 tabular-nums">
                      —
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={row.payment_date}
                      onChange={e => updateRow(row.id, { payment_date: e.target.value || todayStr })}
                      disabled={!row.include}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 disabled:cursor-not-allowed"
                    />
                  )}
                  <div className="flex items-center gap-1.5 mt-1 ml-0.5">
                    <MiniToggle
                      on={row.semPayment}
                      onToggle={() => toggleSemPayment(row)}
                      disabled={!row.include}
                    />
                    <span className="text-[10px] text-white/30 leading-none">sem pagamento</span>
                  </div>
                </td>

                {/* Amount */}
                <td className="py-1">
                  <input
                    type="number"
                    value={row.amount}
                    onChange={e => updateRow(row.id, { amount: e.target.value })}
                    disabled={!row.include}
                    min="0"
                    step="0.01"
                    className={`w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-right tabular-nums focus:outline-none focus:border-white/30 disabled:cursor-not-allowed ${
                      row.type === 'revenue' ? 'text-brand-green' : 'text-white'
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-8 py-5 border-t border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-red-400">{error}</span>}
          {!error && (
            <span className="text-sm text-white/40">
              {selectedCount} de {importRows.length} selecionados para importar
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={importing || selectedCount === 0}
            className="px-6 py-2 rounded-xl text-sm font-semibold bg-brand-green text-black hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {importing ? 'Importando...' : `Importar ${selectedCount} lançamento${selectedCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
