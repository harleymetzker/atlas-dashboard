import Papa from 'papaparse'

export interface RawRow {
  date: string        // yyyy-MM-dd
  description: string
  amount: number      // positive = entrada, negative = saída
}

export interface CSVMappingNeeded {
  needsMapping: true
  headers: string[]
  rows: Record<string, string>[]
}

export type ParseCSVResult =
  | { needsMapping: false; rows: RawRow[] }
  | CSVMappingNeeded

// ── OFX ──────────────────────────────────────────────────────────────────────

function parseOFXDate(raw: string): string {
  // DTPOSTED format: 20250315120000[-03:BRT] or 20250315
  const digits = raw.replace(/\[.*\]/, '').trim().slice(0, 8)
  if (digits.length < 8) return ''
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
}

function extractTag(block: string, tag: string): string {
  // Matches both <TAG>value\n and <TAG>value</TAG>
  const re = new RegExp(`<${tag}>([^<\n\r]*)`, 'i')
  return block.match(re)?.[1]?.trim() ?? ''
}

export function parseOFX(text: string): RawRow[] {
  // Find all STMTTRN blocks
  const blocks = text.split(/<STMTTRN>/i).slice(1)
  const rows: RawRow[] = []

  for (const block of blocks) {
    const end = block.search(/<\/STMTTRN>/i)
    const content = end >= 0 ? block.slice(0, end) : block

    const dateRaw   = extractTag(content, 'DTPOSTED')
    const amountRaw = extractTag(content, 'TRNAMT')
    const memo      = extractTag(content, 'MEMO') || extractTag(content, 'NAME')

    const date   = parseOFXDate(dateRaw)
    const amount = parseFloat(amountRaw.replace(',', '.'))

    if (!date || isNaN(amount)) continue

    rows.push({ date, description: memo, amount })
  }

  return rows
}

// ── CSV ──────────────────────────────────────────────────────────────────────

const DATE_ALIASES    = ['data', 'date', 'dt', 'data_lancamento', 'data lancamento', 'data_movimento', 'data_transacao', 'fecha']
const DESC_ALIASES    = ['descricao', 'description', 'historico', 'memo', 'complemento', 'lancamento', 'lançamento', 'histórico', 'descrição']
const AMOUNT_ALIASES  = ['valor', 'amount', 'value', 'vlr', 'vl', 'montante']
const DEBIT_ALIASES   = ['debito', 'débito', 'debit', 'saida', 'saída']
const CREDIT_ALIASES  = ['credito', 'crédito', 'credit', 'entrada']

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]/g, '_').trim()
}

function findCol(headers: string[], aliases: string[]): string | null {
  for (const h of headers) {
    const n = normalize(h)
    if (aliases.some(a => n === a || n.includes(a))) return h
  }
  return null
}

function parseBRDate(s: string): string {
  // Try yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  // Try dd/MM/yyyy or dd-MM-yyyy
  const m = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return s
}

function parseAmount(s: string): number {
  if (!s) return NaN
  // Remove currency symbols and spaces
  let clean = s.replace(/[R$\s]/g, '').trim()
  // Handle BR format: 1.234,56 → 1234.56
  if (/\d{1,3}(\.\d{3})*,\d{2}$/.test(clean)) {
    clean = clean.replace(/\./g, '').replace(',', '.')
  } else {
    clean = clean.replace(',', '.')
  }
  return parseFloat(clean)
}

export function parseCSV(text: string): ParseCSVResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
  })

  const headers = result.meta.fields ?? []
  const dataRows = result.data

  const dateCol   = findCol(headers, DATE_ALIASES)
  const descCol   = findCol(headers, DESC_ALIASES)
  const amountCol = findCol(headers, AMOUNT_ALIASES)
  const debitCol  = findCol(headers, DEBIT_ALIASES)
  const creditCol = findCol(headers, CREDIT_ALIASES)

  // If we have debit/credit columns instead of a single amount column
  const hasDebitCredit = !amountCol && (debitCol || creditCol)

  if (!dateCol || !descCol || (!amountCol && !hasDebitCredit)) {
    return { needsMapping: true, headers, rows: dataRows }
  }

  const rows: RawRow[] = []
  for (const row of dataRows) {
    const date = parseBRDate(row[dateCol] ?? '')
    const description = row[descCol] ?? ''

    let amount: number
    if (hasDebitCredit) {
      const credit = creditCol ? parseAmount(row[creditCol] ?? '') : NaN
      const debit  = debitCol  ? parseAmount(row[debitCol]  ?? '') : NaN
      amount = (!isNaN(credit) && credit !== 0) ? credit : (!isNaN(debit) && debit !== 0) ? -Math.abs(debit) : NaN
    } else {
      amount = parseAmount(row[amountCol!] ?? '')
    }

    if (!date || isNaN(amount)) continue
    rows.push({ date, description, amount })
  }

  return { needsMapping: false, rows }
}

export function applyCSVMapping(
  rawRows: Record<string, string>[],
  mapping: { dateCol: string; descCol: string; amountCol: string }
): RawRow[] {
  const rows: RawRow[] = []
  for (const row of rawRows) {
    const date        = parseBRDate(row[mapping.dateCol] ?? '')
    const description = row[mapping.descCol] ?? ''
    const amount      = parseAmount(row[mapping.amountCol] ?? '')
    if (!date || isNaN(amount)) continue
    rows.push({ date, description, amount })
  }
  return rows
}
