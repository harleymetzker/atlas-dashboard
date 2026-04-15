import { useState, useEffect } from 'react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { calcDRE } from '../lib/calculations'
import type { Entry } from '../types'

export interface DreDefaults {
  impostos: number       // % sobre faturamento bruto
  taxas_cartao: number   // % sobre faturamento líquido
  marketing: number
  comissoes: number
  rh: number
  ocupacao: number
  administrativo: number
  faturamentoLiquido: number  // R$ do mês de referência
  referenciaMes: string  // e.g. "março/2025"
  hasData: boolean
}

const EMPTY: DreDefaults = {
  impostos: 0,
  taxas_cartao: 0,
  marketing: 0,
  comissoes: 0,
  rh: 0,
  ocupacao: 0,
  administrativo: 0,
  faturamentoLiquido: 0,
  referenciaMes: '',
  hasData: false,
}

export function useDreDefaults(): { defaults: DreDefaults; loading: boolean } {
  const [defaults, setDefaults] = useState<DreDefaults>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      // Try up to 6 months back to find a month with DRE data
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

        const dre = calcDRE(data as Entry[])
        if (dre.faturamentoBruto === 0) continue

        const bruto = dre.faturamentoBruto
        const liquido = dre.faturamentoLiquido || 1

        setDefaults({
          impostos: (dre.impostos / bruto) * 100,
          taxas_cartao: (dre.taxasCartao / liquido) * 100,
          marketing: (dre.marketingAds / liquido) * 100,
          comissoes: (dre.comissoesVendas / liquido) * 100,
          rh: (dre.despesasRH / liquido) * 100,
          ocupacao: (dre.despesasOcupacao / liquido) * 100,
          administrativo: (dre.despesasAdmin / liquido) * 100,
          faturamentoLiquido: dre.faturamentoLiquido,
          referenciaMes: format(ref, 'MMMM/yyyy', { locale: ptBR }),
          hasData: true,
        })
        setLoading(false)
        return
      }

      setDefaults(EMPTY)
      setLoading(false)
    }

    load()
  }, [])

  return { defaults, loading }
}
