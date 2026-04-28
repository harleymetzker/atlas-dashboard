import { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

const PRICE_MONTHLY = 'price_1TOpZxFVyybhsLH94Wr4qQGd'
const PRICE_ANNUAL  = 'price_1TOpZxFVyybhsLH9ikBgu5Qj'

async function getAuthUser(authHeader?: string) {
  const m = authHeader?.match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  const { data, error } = await supabase.auth.getUser(m[1])
  if (error || !data.user) return null
  return data.user
}

function getPeriodEndTs(subscription: Stripe.Subscription): number | null {
  const item = subscription.items?.data?.[0] as any
  const ts = item?.current_period_end ?? (subscription as any).current_period_end
  return typeof ts === 'number' && Number.isFinite(ts) ? ts : null
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const user = await getAuthUser(event.headers['authorization'] || event.headers['Authorization'])
  if (!user) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

  let body: { newPlan?: string } = {}
  try { body = JSON.parse(event.body || '{}') } catch {}
  const newPlan = body.newPlan
  if (newPlan !== 'monthly' && newPlan !== 'annual') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid newPlan. Use "monthly" or "annual".' }) }
  }
  const newPriceId = newPlan === 'monthly' ? PRICE_MONTHLY : PRICE_ANNUAL

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('[change-plan] profile fetch failed:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
  if (!profile?.stripe_subscription_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'User has no active subscription' }) }
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
    const itemId = subscription.items.data[0]?.id
    if (!itemId) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Subscription has no item' }) }
    }

    // proration_behavior: 'none' faz a nova price valer no próximo invoice (fim do período atual).
    const updated = await stripe.subscriptions.update(profile.stripe_subscription_id, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: 'none',
    })

    const periodEnd = getPeriodEndTs(updated)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changed: true, effective_at: periodEnd }),
    }
  } catch (err) {
    console.error('[change-plan] Stripe error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: (err as Error).message }) }
  }
}
