import { useState, useEffect } from 'react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { calcDRE } from '../lib/calculations'
import type { Entry, DRE } from '../types'

export interface DreSnapshot {
  dre: DRE
  referenciaMes: string
}

export function useDreSnapshot(): { snapshot: DreSnapshot | null; loading: boolean } {
  const [snapshot, setSnapshot] = useState<DreSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      for (let i = 0; i < 6; i++) {
        const ref = subMonths(new Date(), i + 1)
        const startDate = format(startOfMonth(ref), 'yyyy-MM-dd')
        const endDate = format(endOfMonth(ref), 'yyyy-MM-dd')

        const { data } = await supabase
          .from('entries')
          .select('*')
          .gte('competence_date', startDate)
          .lte('competence_date', endDate)

        if (!data || data.length === 0) continue

        const entries = (data as Entry[]).filter(e => e.competence_date !== null && e.competence_date !== undefined)
        const dre = calcDRE(entries)
        if (dre.faturamentoBruto === 0) continue

        setSnapshot({
          dre,
          referenciaMes: format(ref, 'MMMM/yyyy', { locale: ptBR }),
        })
        setLoading(false)
        return
      }

      setSnapshot(null)
      setLoading(false)
    }

    load()
  }, [])

  return { snapshot, loading }
}
