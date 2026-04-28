import { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

async function getAuthUser(authHeader?: string) {
  const m = authHeader?.match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  const { data, error } = await supabase.auth.getUser(m[1])
  if (error || !data.user) return null
  return data.user
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const user = await getAuthUser(event.headers['authorization'] || event.headers['Authorization'])
  if (!user) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('[portal-session] profile fetch failed:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
  if (!profile?.stripe_customer_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'User has no Stripe customer' }) }
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: 'https://atlasconsultoria.app/configuracoes',
    })
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    console.error('[portal-session] Stripe error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: (err as Error).message }) }
  }
}
