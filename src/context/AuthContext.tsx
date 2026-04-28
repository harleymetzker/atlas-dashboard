import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, ADMIN_EMAIL, SUPER_ADMIN_EMAIL } from '../lib/supabase'

type ProfileStatus = 'pending' | 'active' | 'blocked' | 'canceled' | 'past_due' | null

interface AuthContextType {
  session: Session | null
  user: User | null
  isAdmin: boolean
  isSuperAdmin: boolean
  loading: boolean
  profileStatus: ProfileStatus
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const ADMIN_EMAILS = ['harley@hmtz.com.br', 'blacksheep@hmtz.com.br', ADMIN_EMAIL].filter(Boolean)

const REFRESH_INTERVAL_MS = 2 * 60 * 1000

// Resolve o status do profile pra uma sessão. Erros viram 'blocked' (fail-closed).
// Sem session → null. Admin → 'active'. Sem profile (legacy) → 'active'.
async function loadProfileStatus(currentSession: Session | null): Promise<ProfileStatus> {
  if (!currentSession?.user) return null
  const email = currentSession.user.email ?? ''
  if (ADMIN_EMAILS.includes(email)) return 'active'

  const { data, error } = await supabase
    .from('profiles')
    .select('status')
    .eq('user_id', currentSession.user.id)
    .maybeSingle()

  if (error) {
    console.error('[AuthContext] Failed to fetch profile:', error)
    return 'blocked'
  }
  if (!data) return 'active' // legacy user sem perfil
  return (data.status as ProfileStatus) ?? 'active'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Carrega o profile quando a sessão muda + re-check periódico a cada 2 min
  // enquanto houver sessão ativa (e usuário não-admin, que não tem profile).
  useEffect(() => {
    if (sessionLoading) return

    let cancelled = false

    const apply = async () => {
      setProfileLoading(true)
      const status = await loadProfileStatus(session)
      if (cancelled) return
      setProfileStatus(status)
      setProfileLoading(false)
    }

    apply()

    if (!session?.user) return
    const email = session.user.email ?? ''
    if (ADMIN_EMAILS.includes(email)) return

    const intervalId = setInterval(apply, REFRESH_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [session, sessionLoading])

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true)
    const status = await loadProfileStatus(session)
    setProfileStatus(status)
    setProfileLoading(false)
  }, [session])

  const loading = sessionLoading || profileLoading
  const user = session?.user ?? null
  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? '')
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, isSuperAdmin, loading, profileStatus, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
