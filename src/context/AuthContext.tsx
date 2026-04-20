import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, ADMIN_EMAIL, SUPER_ADMIN_EMAIL } from '../lib/supabase'

type ProfileStatus = 'pending' | 'active' | 'blocked' | null

interface AuthContextType {
  session: Session | null
  user: User | null
  isAdmin: boolean
  isSuperAdmin: boolean
  loading: boolean
  profileStatus: ProfileStatus
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const ADMIN_EMAILS = ['harley@hmtz.com.br', 'blacksheep@hmtz.com.br', ADMIN_EMAIL].filter(Boolean)

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

  // Load profile status whenever session changes
  useEffect(() => {
    if (sessionLoading) return
    if (!session?.user) {
      setProfileStatus(null)
      return
    }
    const email = session.user.email ?? ''
    if (ADMIN_EMAILS.includes(email)) {
      setProfileStatus('active')
      return
    }
    setProfileLoading(true)
    supabase
      .from('profiles')
      .select('status')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        // No profile = legacy user = treat as active
        setProfileStatus((data?.status as ProfileStatus) ?? 'active')
        setProfileLoading(false)
      })
  }, [session, sessionLoading])

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
    <AuthContext.Provider value={{ session, user, isAdmin, isSuperAdmin, loading, profileStatus, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
