import type { RawRow } from './parseExtrato'
import type { ImportRow } from '../components/import/ImportCategorizacao'

const VERSION = 1

export interface SavedImportProgress {
  fileName: string
  rawRows: RawRow[]
  rows: ImportRow[]
}

interface StoredPayload extends SavedImportProgress {
  version: number
  savedAt: number
}

function key(userId: string): string {
  return `atlas:import-progress:${userId}`
}

export function saveImportProgress(
  userId: string,
  fileName: string,
  rawRows: RawRow[],
  rows: ImportRow[],
): void {
  if (!userId) return
  try {
    const payload: StoredPayload = {
      version: VERSION,
      fileName,
      rawRows,
      rows,
      savedAt: Date.now(),
    }
    localStorage.setItem(key(userId), JSON.stringify(payload))
  } catch (err) {
    console.warn('[importPersistence] save failed:', (err as Error).message)
  }
}

export function loadImportProgress(userId: string): SavedImportProgress | null {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(key(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredPayload>
    if (!parsed || parsed.version !== VERSION || !Array.isArray(parsed.rawRows) || !Array.isArray(parsed.rows)) {
      try { localStorage.removeItem(key(userId)) } catch { /* ignore */ }
      return null
    }
    return {
      fileName: parsed.fileName ?? 'Extrato',
      rawRows: parsed.rawRows,
      rows: parsed.rows,
    }
  } catch (err) {
    console.warn('[importPersistence] load failed (clearing):', (err as Error).message)
    try { localStorage.removeItem(key(userId)) } catch { /* ignore */ }
    return null
  }
}

export function clearImportProgress(userId: string): void {
  if (!userId) return
  try {
    localStorage.removeItem(key(userId))
  } catch (err) {
    console.warn('[importPersistence] clear failed:', (err as Error).message)
  }
}
