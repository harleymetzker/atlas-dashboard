import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useOpeningBalance(userId: string | undefined, yearMonth: string) {
  const [balance, setBalanceState] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setBalanceState(0)
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('opening_balances')
      .select('amount')
      .eq('user_id', userId)
      .eq('year_month', yearMonth)
      .maybeSingle()
      .then(({ data }) => {
        setBalanceState(data ? Number(data.amount) : 0)
        setLoading(false)
      })
  }, [userId, yearMonth])

  const setBalance = useCallback(async (value: number) => {
    setBalanceState(value)
    if (!userId) return
    await supabase
      .from('opening_balances')
      .upsert(
        { user_id: userId, year_month: yearMonth, amount: value, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,year_month' }
      )
  }, [userId, yearMonth])

  return { balance, setBalance, loading }
}
