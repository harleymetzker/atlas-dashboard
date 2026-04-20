import { useState } from 'react'
import { format, startOfMonth } from 'date-fns'
import { Plus, Trash2, Pencil, Upload } from 'lucide-react'
import { useEntries } from '../hooks/useEntries'
import type { Entry, EntryType } from '../types'
import { REVENUE_CATEGORIES, EXPENSE_CATEGORY_GROUPS, ANTECIPACAO_CATEGORY } from '../types'
import { formatCurrency } from '../lib/calculations'
import { DateFilter } from '../components/layout/DateFilter'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Card } from '../components/ui/Card'
import { ImportUploadModal } from '../components/import/ImportUploadModal'
import { ImportCategorizacao } from '../components/import/ImportCategorizacao'
import type { ImportRow } from '../components/import/ImportCategorizacao'
import type { RawRow } from '../lib/parseExtrato'

const TYPE_OPTIONS = [
  { value: 'revenue',    label: 'Receita' },
  { value: 'expense',    label: 'Despesa' },
  { value: 'withdrawal', label: 'Retirada de Sócio' },
]

const TYPE_COLORS: Record<EntryType, string> = {
  revenue:    'text-brand-green bg-brand-green/10',
  expense:    'text-white/60 bg-white/5',
  withdrawal: 'text-yellow-400/70 bg-yellow-400/5',
}

const TYPE_LABELS: Record<EntryType, string> = {
  revenue:    'Receita',
  expense:    'Despesa',
  withdrawal: 'Retirada',
}

// Returns grouped options for expense, flat for revenue/withdrawal
function getCategoryGroups(type: EntryType) {
  if (type === 'expense') {
    return EXPENSE_CATEGORY_GROUPS.map(g => ({
      group: g.group,
      options: g.categories.map(c => ({ value: c, label: c })),
    }))
  }
  return null
}

function getCategoryOptions(type: EntryType) {
  if (type === 'revenue') return REVENUE_CATEGORIES.map(c => ({ value: c, label: c }))
  if (type === 'withdrawal') return [{ value: 'Retirada de Sócio', label: 'Retirada de Sócio' }]
  return null
}

function firstCategory(type: EntryType): string {
  if (type === 'revenue') return REVENUE_CATEGORIES[0]
  if (type === 'withdrawal') return 'Retirada de Sócio'
  return EXPENSE_CATEGORY_GROUPS[0].categories[0]
}

const todayStr = format(new Date(), 'yyyy-MM-dd')

const defaultForm = {
  type: 'revenue' as EntryType,
  category: 'Vendas',
  description: '',
  amount: '',
  competence_date: todayStr,
  payment_date: todayStr,
  recorrente: false,
  mesesRecorrencia: 2,
  semDataRecebimento: false,
}

export function Entries() {
  const today = new Date()
  const [startDate, setStartDate] = useState(format(startOfMonth(today), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'))
  const [typeFilter, setTypeFilter] = useState<EntryType | ''>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [importUploadOpen, setImportUploadOpen] = useState(false)
  const [importRows, setImportRows] = useState<RawRow[] | null>(null)

  const { entries, loading, addEntry, deleteEntry, updateEntry } = useEntries({
    startDate,
    endDate,
    type: typeFilter || undefined,
    dateField: 'competence_date',
  })

  function openAdd() {
    setEditEntry(null)
    setForm(defaultForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(entry: Entry) {
    setEditEntry(entry)
    // For revenue: toggle means no payment_date. For expense/withdrawal: toggle means no competence_date.
    const semData = entry.type === 'revenue'
      ? entry.payment_date === null
      : entry.competence_date === null
    setForm({
      type: entry.type,
      category: entry.category,
      description: entry.description,
      amount: String(entry.amount),
      competence_date: entry.competence_date ?? '',
      payment_date: entry.payment_date ?? '',
      recorrente: false,
      mesesRecorrencia: 2,
      semDataRecebimento: semData,
    })
    setFormError('')
    setModalOpen(true)
  }

  function handleTypeChange(type: EntryType) {
    setForm(f => ({ ...f, type, category: firstCategory(type), semDataRecebimento: false }))
  }

  async function handleSubmit() {
    const isAntecipacao   = form.category === ANTECIPACAO_CATEGORY
    const isRevenueToggle = form.semDataRecebimento && form.type === 'revenue'
    const isExpenseToggle = form.semDataRecebimento && form.type !== 'revenue' && !isAntecipacao

    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormError('Informe um valor válido maior que zero.')
      return
    }
    // competence_date required unless: antecipacao, or expense toggle (no competence)
    if (!isAntecipacao && !isExpenseToggle && !form.competence_date) {
      setFormError('Informe a data de competência.')
      return
    }
    // payment_date required unless: revenue toggle (no payment)
    if (!isRevenueToggle && !form.payment_date) {
      setFormError('Informe a data de pagamento/recebimento.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const { recorrente, mesesRecorrencia, semDataRecebimento, ...rest } = form
      const payload = {
        ...rest,
        amount: Number(form.amount),
        // Antecipação: competence_date = payment_date (não entra na DRE por filtro de data)
        // Expense toggle: competence_date = null (não entra na DRE)
        competence_date: isAntecipacao
          ? (form.payment_date || todayStr)
          : isExpenseToggle ? null
          : form.competence_date || null,
        // Revenue toggle: payment_date = null (não entra no fluxo de caixa)
        payment_date: isRevenueToggle ? null : (form.payment_date || null),
      }
      if (editEntry) {
        await updateEntry(editEntry.id, payload)
      } else if (recorrente) {
        const recurrence_id = crypto.randomUUID()
        await addEntry({ ...payload, recurrence_id }, mesesRecorrencia)
      } else {
        await addEntry(payload)
      }
      setModalOpen(false)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Erro ao salvar.')
    }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este lançamento?')) return
    await deleteEntry(id)
  }

  async function handleImportRows(rows: ImportRow[]) {
    for (const row of rows) {
      const amount = Number(row.amount)
      if (isNaN(amount) || amount <= 0) continue
      const isAntecipacao = row.category === ANTECIPACAO_CATEGORY
      const paymentDate = row.semPayment ? null : (row.payment_date || null)
      await addEntry({
        type: row.type,
        category: row.category,
        description: row.description,
        amount,
        // Antecipação: competence_date = payment_date (mesma lógica do form manual)
        competence_date: isAntecipacao ? paymentDate : row.semCompetence ? null : (row.competence_date || null),
        payment_date: paymentDate,
      })
    }
    setImportRows(null)
  }

  const categoryGroups    = getCategoryGroups(form.type)
  const categoryOptions   = getCategoryOptions(form.type)
  const isAntecipacao     = form.category === ANTECIPACAO_CATEGORY
  const isRevenueToggle   = form.semDataRecebimento && form.type === 'revenue'
  const isExpenseToggle   = form.semDataRecebimento && form.type !== 'revenue' && !isAntecipacao
  const toggleLabel       = form.type === 'revenue' ? 'Sem data de recebimento' : 'Sem data de competência'
  const showCompetence    = !isAntecipacao && !isExpenseToggle
  const showPayment       = isAntecipacao || (!isRevenueToggle)

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Lançamentos</h2>
          <p className="text-sm text-white/50 mt-1">Filtro por data de competência</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportUploadOpen(true)}>
            <Upload size={16} /> Importar Extrato
          </Button>
          <Button onClick={openAdd}><Plus size={16} /> Novo Lançamento</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <DateFilter startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e) }} />
        <Select
          label="Tipo"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as EntryType | '')}
          options={[{ value: '', label: 'Todos' }, ...TYPE_OPTIONS]}
          className="w-44"
        />
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12 text-white/35">Carregando...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-white/35">Nenhum lançamento no período.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-white/60 uppercase tracking-widest">
                  <th className="text-left pb-4">Competência</th>
                  <th className="text-left pb-4">Pagamento</th>
                  <th className="text-left pb-4">Tipo</th>
                  <th className="text-left pb-4">Categoria</th>
                  <th className="text-left pb-4">Descrição</th>
                  <th className="text-right pb-4">Valor</th>
                  <th className="text-right pb-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {entries.map(entry => (
                  <tr key={entry.id} className="group text-white/80">
                    <td className="py-3 text-white/80 tabular-nums">{entry.competence_date ?? <span className="text-white/30">—</span>}</td>
                    <td className="py-3 text-white/70 tabular-nums">{entry.payment_date ?? <span className="text-white/30">—</span>}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg ${TYPE_COLORS[entry.type]}`}>
                        {TYPE_LABELS[entry.type]}
                      </span>
                    </td>
                    <td className="py-3">{entry.category}</td>
                    <td className="py-3 max-w-xs truncate text-white/80">
                      {entry.description || '—'}
                      {entry.recurrence_id && (
                        <span style={{ fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 8, border: '1px solid #333', padding: '2px 6px', borderRadius: 3 }}>
                          recorrente
                        </span>
                      )}
                    </td>
                    <td className={`py-3 text-right tabular-nums font-medium ${entry.type === 'revenue' ? 'text-brand-green' : 'text-white'}`}>
                      {entry.type !== 'revenue' ? '(' : ''}{formatCurrency(entry.amount)}{entry.type !== 'revenue' ? ')' : ''}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(entry)} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/15 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ImportUploadModal
        open={importUploadOpen}
        onClose={() => setImportUploadOpen(false)}
        onParsed={rows => { setImportUploadOpen(false); setImportRows(rows) }}
      />

      {importRows && (
        <ImportCategorizacao
          rows={importRows}
          onImport={handleImportRows}
          onClose={() => setImportRows(null)}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editEntry ? 'Editar Lançamento' : 'Novo Lançamento'}>
        <div className="space-y-4">
          <Select
            label="Tipo"
            value={form.type}
            onChange={e => handleTypeChange(e.target.value as EntryType)}
            options={TYPE_OPTIONS}
          />
          {categoryGroups ? (
            <Select
              label="Categoria"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              groups={categoryGroups}
            />
          ) : (
            <Select
              label="Categoria"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              options={categoryOptions ?? []}
            />
          )}
          <Input
            label="Descrição (opcional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Ex: Fatura fornecedor X"
          />
          <CurrencyInput
            label="Valor (R$)"
            value={form.amount}
            onChange={v => setForm(f => ({ ...f, amount: v }))}
          />
          <div className="grid grid-cols-2 gap-3">
            {showCompetence && (
              <Input
                label="Data de Competência"
                type="date"
                value={form.competence_date}
                onChange={e => setForm(f => ({ ...f, competence_date: e.target.value }))}
                required
                className={!showPayment ? 'col-span-2' : ''}
              />
            )}
            {showPayment && (
              <Input
                label={isAntecipacao ? 'Data de Recebimento' : 'Data de Pagamento/Recebimento'}
                type="date"
                value={form.payment_date}
                onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
                required
                className={isAntecipacao || !showCompetence ? 'col-span-2' : ''}
              />
            )}
          </div>
          {/* Toggle: Sem data (não disponível para antecipação) */}
          {!isAntecipacao && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, semDataRecebimento: !f.semDataRecebimento, payment_date: f.semDataRecebimento ? todayStr : f.payment_date, competence_date: f.semDataRecebimento ? todayStr : f.competence_date }))}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: form.semDataRecebimento ? '#00EF61' : '#333',
                  border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3,
                  left: form.semDataRecebimento ? 20 : 3,
                  width: 16, height: 16, borderRadius: '50%',
                  background: form.semDataRecebimento ? '#000' : '#888',
                  transition: 'left 0.2s',
                }} />
              </button>
              <span style={{ fontSize: 13, color: '#aaa' }}>{toggleLabel}</span>
            </div>
          )}
          {!editEntry && !isAntecipacao && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, recorrente: !f.recorrente }))}
                  style={{
                    width: 40, height: 22, borderRadius: 11,
                    background: form.recorrente ? '#fff' : '#333',
                    border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3,
                    left: form.recorrente ? 20 : 3,
                    width: 16, height: 16, borderRadius: '50%',
                    background: form.recorrente ? '#000' : '#888',
                    transition: 'left 0.2s',
                  }} />
                </button>
                <span style={{ fontSize: 13, color: '#aaa' }}>Lançamento recorrente</span>
              </div>
              {form.recorrente && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ fontSize: 13, color: '#aaa' }}>Repetir por</label>
                  <input
                    type="number" min={2} max={36}
                    value={form.mesesRecorrencia}
                    onChange={e => setForm(f => ({ ...f, mesesRecorrencia: Number(e.target.value) }))}
                    style={{ width: 64, background: '#111', border: '1px solid #333', color: '#fff', padding: '6px 10px', borderRadius: 4, fontSize: 14 }}
                  />
                  <label style={{ fontSize: 13, color: '#aaa' }}>meses</label>
                </div>
              )}
            </div>
          )}
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSubmit} loading={submitting} className="flex-1">
              {editEntry ? 'Salvar' : 'Lançar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
