import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Entry, EntryType } from '../types'

interface Filters {
  startDate?: string
  endDate?: string
  type?: EntryType
  dateField?: 'competence_date' | 'payment_date'
}

export function useEntries(filters: Filters = {}) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dateField = filters.dateField ?? 'competence_date'

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    let query = supabase.from('entries').select('*').order('payment_date', { ascending: false })
    if (filters.startDate) query = query.gte(dateField, filters.startDate)
    if (filters.endDate) query = query.lte(dateField, filters.endDate)
    if (filters.type) query = query.eq('type', filters.type)
    const { data, error } = await query
    if (error) setError(error.message)
    else setEntries(data || [])
    setLoading(false)
  }, [filters.startDate, filters.endDate, filters.type, dateField])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function addEntry(entry: Omit<Entry, 'id' | 'user_id' | 'created_at'>, meses?: number) {
    if (meses && meses > 1 && entry.recurrence_id) {
      const rows = Array.from({ length: meses }, (_, i) => {
        const addMonths = (dateStr: string, n: number) => {
          const d = new Date(dateStr + 'T12:00:00')
          d.setMonth(d.getMonth() + n)
          return d.toISOString().slice(0, 10)
        }
        return {
          ...entry,
          competence_date: addMonths(entry.competence_date, i),
          payment_date: addMonths(entry.payment_date, i),
        }
      })
      const { error } = await supabase.from('entries').insert(rows)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabase.from('entries').insert(entry)
      if (error) throw new Error(error.message)
    }
    await fetchEntries()
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (error) throw new Error(error.message)
    await fetchEntries()
  }

  async function updateEntry(id: string, updates: Partial<Omit<Entry, 'id' | 'user_id' | 'created_at'>>) {
    const { error } = await supabase.from('entries').update(updates).eq('id', id)
    if (error) throw new Error(error.message)
    await fetchEntries()
  }

  return { entries, loading, error, addEntry, deleteEntry, updateEntry, refetch: fetchEntries }
}
