import React, { useState } from 'react'
import { format, startOfMonth, startOfMonth as som, endOfMonth, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2, Pencil, Search } from 'lucide-react'
import { useEntries } from '../hooks/useEntries'
import type { Entry, EntryType } from '../types'
import { REVENUE_CATEGORIES, EXPENSE_CATEGORY_GROUPS, ANTECIPACAO_CATEGORY } from '../types'
import { formatCurrency } from '../lib/calculations'
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

const TYPE_BADGE_STYLE: Record<EntryType, React.CSSProperties> = {
  revenue:    { background: 'rgba(0,239,97,0.15)',   color: '#00EF61' },
  expense:    { background: 'rgba(255,255,255,0.08)', color: '#A6A8AB' },
  withdrawal: { background: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
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

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

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
  const [search, setSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [editingDateId, setEditingDateId] = useState<string | null>(null)
  const [editingDateValue, setEditingDateValue] = useState('')

  const { entries: agendados, updateEntry: updateAgendado, deleteEntry: deleteAgendado, refetch: refetchAgendados } = useEntries({ dateField: 'payment_date' })
  const scheduledEntries = agendados
    .filter(e => e.status === 'agendado' && e.payment_date)
    .sort((a, b) => (a.payment_date ?? '').localeCompare(b.payment_date ?? ''))

  async function handleConfirmar(entry: Entry) {
    await updateAgendado(entry.id, { status: 'realizado', payment_date: todayStr })
    refetchAgendados()
  }

  async function handleAlterarData(entry: Entry) {
    if (!editingDateValue) return
    await updateAgendado(entry.id, { payment_date: editingDateValue })
    setEditingDateId(null)
    setEditingDateValue('')
    refetchAgendados()
  }

  async function handleDeleteAgendado(id: string) {
    if (!confirm('Excluir este lançamento agendado?')) return
    await deleteAgendado(id)
    refetchAgendados()
  }

  const { entries, loading, addEntry, deleteEntry, updateEntry } = useEntries({
    startDate,
    endDate,
    type: typeFilter || undefined,
    dateField: 'competence_date',
  })

  // Unfiltered by type — used for summary cards so they always show full-period totals
  const { entries: allPeriodEntries } = useEntries({
    startDate,
    endDate,
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
    // competence_date required unless: antecipacao, expense toggle, or withdrawal
    if (!isAntecipacao && !isExpenseToggle && form.type !== 'withdrawal' && !form.competence_date) {
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
      const resolvedPaymentDate = isRevenueToggle ? null : (form.payment_date || null)
      const status: 'agendado' | 'realizado' = (resolvedPaymentDate && resolvedPaymentDate > todayStr)
        ? 'agendado'
        : 'realizado'
      const payload = {
        ...rest,
        amount: Number(form.amount),
        // Antecipação: competence_date = payment_date (não entra na DRE por filtro de data)
        // Expense toggle: competence_date = null (não entra na DRE)
        competence_date: isAntecipacao
          ? (form.payment_date || todayStr)
          : (isExpenseToggle || form.type === 'withdrawal') ? null
          : form.competence_date || null,
        // Revenue toggle: payment_date = null (não entra no fluxo de caixa)
        payment_date: resolvedPaymentDate,
        status,
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
      const isRowWithdrawal = row.type === 'withdrawal'
      const paymentDate = row.semPayment ? null : (row.payment_date || null)
      const importStatus: 'agendado' | 'realizado' = (paymentDate && paymentDate > todayStr)
        ? 'agendado'
        : 'realizado'
      await addEntry({
        type: row.type,
        category: row.category,
        description: row.description,
        amount,
        // Antecipação: competence_date = payment_date; Retirada: null; sem toggle: null
        competence_date: isAntecipacao ? paymentDate : (isRowWithdrawal || row.semCompetence) ? null : (row.competence_date || null),
        payment_date: paymentDate,
        status: importStatus,
      })
    }
    setImportRows(null)
  }

  function handleMonthShortcut(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setSelectedMonth(val)
    const idx = Number(val)
    if (isNaN(idx)) return
    const year = endDate ? parseISO(endDate).getFullYear() : new Date().getFullYear()
    const ref = new Date(year, idx, 1)
    setStartDate(format(som(ref), 'yyyy-MM-dd'))
    setEndDate(format(endOfMonth(ref), 'yyyy-MM-dd'))
  }

  const filteredEntries = search.trim()
    ? entries.filter(e =>
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  const totalReceitas   = allPeriodEntries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0)
  const totalDespesas   = allPeriodEntries.filter(e => e.type !== 'revenue').reduce((s, e) => s + e.amount, 0)
  const periodoLabel    = startDate ? format(parseISO(startDate), 'MMMM yyyy', { locale: ptBR }) : ''

  const categoryGroups    = getCategoryGroups(form.type)
  const categoryOptions   = getCategoryOptions(form.type)
  const isAntecipacao     = form.category === ANTECIPACAO_CATEGORY
  const isRevenueToggle   = form.semDataRecebimento && form.type === 'revenue'
  const isWithdrawal      = form.type === 'withdrawal'
  const isExpenseToggle   = form.semDataRecebimento && form.type !== 'revenue' && !isAntecipacao && !isWithdrawal
  const toggleLabel       = form.type === 'revenue' ? 'Sem data de recebimento' : 'Sem data de competência'
  const showCompetence    = !isAntecipacao && !isExpenseToggle && !isWithdrawal
  const showPayment       = isAntecipacao || (!isRevenueToggle)

  const F: React.CSSProperties = {
    height: 44, background: '#111', border: '1px solid #1e1e1e', borderRadius: 6,
    fontFamily: "'Geist Mono', monospace", fontSize: 14, color: '#fff',
    outline: 'none', boxSizing: 'border-box',
  }
  const filterLabelStyle: React.CSSProperties = {
    fontFamily: "'Geist Mono', monospace", fontSize: 10,
    textTransform: 'uppercase', letterSpacing: 1, color: '#666', display: 'block', marginBottom: 5,
  }

  return (
    <div className="p-8 space-y-6">
      {/* ── Title + buttons ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Geist', sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>Lançamentos</h2>
          <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>fato a fato, sem eufemismo</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setImportUploadOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
          >
            + Importar extrato
          </button>
          <button
            onClick={openAdd}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#00EF61', border: 'none', borderRadius: 8, color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
          >
            + Novo lançamento
          </button>
        </div>
      </div>

      {/* ── Aguardando Confirmação ── */}
      {scheduledEntries.length > 0 && (
        <div style={{ background: '#0c0c0c', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 15, fontWeight: 700, color: '#fff' }}>Aguardando Confirmação</span>
            <span style={{ background: 'rgba(234,179,8,0.18)', color: '#eab308', fontFamily: "'Geist Mono', monospace", fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: 1 }}>
              {scheduledEntries.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {scheduledEntries.map(entry => {
              const vencido = entry.payment_date! <= todayStr
              const isEditingDate = editingDateId === entry.id
              return (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  padding: '10px 14px', borderRadius: 8,
                  background: vencido ? 'rgba(234,179,8,0.07)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${vencido ? 'rgba(234,179,8,0.3)' : '#1e1e1e'}`,
                }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: '#fff', fontFamily: "'Geist', sans-serif" }}>
                      {entry.description || entry.category}
                    </span>
                    <span style={{ fontSize: 11, color: '#666', marginLeft: 8, fontFamily: "'Geist Mono', monospace" }}>
                      {entry.category}
                    </span>
                  </div>
                  {/* Valor */}
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 600, color: entry.type === 'revenue' ? '#00EF61' : '#EF4444', whiteSpace: 'nowrap' }}>
                    {entry.type !== 'revenue' ? '-' : ''}{formatCurrency(entry.amount)}
                  </span>
                  {/* Data prevista */}
                  {isEditingDate ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="date"
                        value={editingDateValue}
                        onChange={e => setEditingDateValue(e.target.value)}
                        style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontFamily: "'Geist Mono', monospace" }}
                      />
                      <button onClick={() => handleAlterarData(entry)} style={{ padding: '4px 10px', background: '#fff', color: '#000', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Salvar</button>
                      <button onClick={() => setEditingDateId(null)} style={{ padding: '4px 10px', background: 'transparent', color: '#666', border: '1px solid #333', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: vencido ? '#eab308' : '#666', whiteSpace: 'nowrap' }}>
                      {vencido ? '⚠ ' : ''}{entry.payment_date}
                    </span>
                  )}
                  {/* Ações */}
                  {!isEditingDate && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleConfirmar(entry)}
                        style={{ padding: '5px 12px', background: 'rgba(0,239,97,0.15)', border: '1px solid rgba(0,239,97,0.3)', color: '#00EF61', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => { setEditingDateId(entry.id); setEditingDateValue(entry.payment_date ?? todayStr) }}
                        style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#aaa', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Alterar data
                      </button>
                      <button
                        onClick={() => handleDeleteAgendado(entry.id)}
                        style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 10 }}>
        {/* DE */}
        <div>
          <label style={filterLabelStyle}>De</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            style={{ ...F, padding: '0 12px', minWidth: 160 }} />
        </div>
        {/* ATÉ */}
        <div>
          <label style={filterLabelStyle}>Até</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            style={{ ...F, padding: '0 12px', minWidth: 160 }} />
        </div>
        {/* MÊS */}
        <div>
          <label style={filterLabelStyle}>Mês</label>
          <select value={selectedMonth} onChange={handleMonthShortcut}
            style={{ ...F, padding: '0 12px', minWidth: 160, cursor: 'pointer' }}>
            <option value="">Selecionar...</option>
            {MONTHS.map((m, i) => <option key={i} value={i} style={{ background: '#111' }}>{m}</option>)}
          </select>
        </div>
        {/* TIPO segmented */}
        <div>
          <label style={filterLabelStyle}>Tipo</label>
          <div style={{ ...F, display: 'flex', alignItems: 'center', padding: '0 4px', gap: 2, overflow: 'hidden' }}>
            {([['', 'Todos'], ['revenue', 'Receitas'], ['expense', 'Despesas']] as const).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setTypeFilter(val as EntryType | '')}
                style={{
                  height: 34, padding: '0 12px', borderRadius: 4, fontSize: 13, fontWeight: 500,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: "'Geist Mono', monospace",
                  background: typeFilter === val ? '#fff' : 'transparent',
                  color: typeFilter === val ? '#000' : '#A6A8AB',
                  whiteSpace: 'nowrap',
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
        {/* BUSCAR */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={filterLabelStyle}>Buscar</label>
          <div style={{ ...F, display: 'flex', alignItems: 'center', paddingLeft: 12, paddingRight: 12, gap: 8 }}>
            <Search size={13} style={{ color: '#555', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Descrição, categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontFamily: "'Geist Mono', monospace", width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12 text-white/35">Carregando...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-white/35">Nenhum lançamento no período.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#666', borderBottom: '1px solid #333' }}>
                  <th className="text-left py-3 font-medium">Competência</th>
                  <th className="text-left py-3 font-medium">Pagamento</th>
                  <th className="text-left py-3 font-medium">Tipo</th>
                  <th className="text-left py-3 font-medium">Categoria</th>
                  <th className="text-left py-3 font-medium">Descrição</th>
                  <th className="text-right py-3 font-medium">Valor</th>
                  <th className="text-right py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(entry => (
                  <tr key={entry.id} className="group hover:bg-[#111] transition-colors" style={{ borderBottom: '1px solid #1e1e1e' }}>
                    <td className="py-3" style={{ fontFamily: "'Geist Mono', monospace", color: '#A6A8AB' }}>
                      {entry.competence_date ?? <span style={{ color: '#333' }}>—</span>}
                    </td>
                    <td className="py-3" style={{ fontFamily: "'Geist Mono', monospace", color: '#A6A8AB' }}>
                      {entry.payment_date ?? <span style={{ color: '#333' }}>—</span>}
                    </td>
                    <td className="py-3">
                      <span style={{
                        ...TYPE_BADGE_STYLE[entry.type],
                        fontWeight: 600, fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                        padding: '4px 8px', borderRadius: 4,
                      }}>
                        {TYPE_LABELS[entry.type]}
                      </span>
                    </td>
                    <td className="py-3 text-white/60">{entry.category}</td>
                    <td className="py-3 max-w-xs truncate text-white/80">
                      {entry.description || '—'}
                      {entry.recurrence_id && (
                        <span style={{
                          fontSize: 9, color: '#00EF61', letterSpacing: 1,
                          textTransform: 'uppercase', marginLeft: 8,
                          background: 'rgba(0,239,97,0.1)',
                          padding: '2px 6px', borderRadius: 3,
                        }}>
                          Recorrente
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right" style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 500, color: entry.type === 'revenue' ? '#00EF61' : '#EF4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        {entry.status === 'agendado' && (
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, padding: '2px 6px', borderRadius: 4, background: 'rgba(234,179,8,0.15)', color: '#eab308', textTransform: 'uppercase' }}>
                            Agendado
                          </span>
                        )}
                        {entry.type !== 'revenue' ? '-' : ''}{formatCurrency(entry.amount)}
                      </div>
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

      {/* ── Summary cards ── */}
      {!loading && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Total de Lançamentos', value: String(allPeriodEntries.length), color: '#fff', isCount: true },
            { label: 'Total de Receitas',    value: formatCurrency(totalReceitas),   color: '#00EF61' },
            { label: 'Total de Despesas',    value: `-${formatCurrency(totalDespesas)}`, color: '#EF4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, minWidth: 160, background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: 20 }}>
              <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 8 }}>{label}</p>
              <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 22, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</p>
              <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{periodoLabel}</p>
            </div>
          ))}
        </div>
      )}

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
          {/* Toggle: Sem data (não disponível para antecipação ou retirada) */}
          {!isAntecipacao && !isWithdrawal && (
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
