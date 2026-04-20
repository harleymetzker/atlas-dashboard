import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Copy .env.example to .env and fill in your values.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''

// Email com acesso exclusivo ao painel admin (sem dashboard financeiro)
export const SUPER_ADMIN_EMAIL = 'blacksheep@hmtz.com.br'
