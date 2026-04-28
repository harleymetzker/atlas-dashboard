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

function planFromPriceId(priceId: string | null | undefined): 'monthly' | 'annual' | null {
  if (priceId === PRICE_MONTHLY) return 'monthly'
  if (priceId === PRICE_ANNUAL) return 'annual'
  return null
}

// Stripe API 2026-03-25.dahlia movou current_period_end pra dentro de items.data[i].
// Fallback pra current_period_end no objeto raiz garante compatibilidade com APIs antigas.
function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const item = subscription.items?.data?.[0] as any
  const ts = item?.current_period_end ?? (subscription as any).current_period_end
  if (typeof ts !== 'number' || !Number.isFinite(ts)) return null
  return new Date(ts * 1000).toISOString()
}

function mapStatusFromStripe(s: Stripe.Subscription.Status): string | null {
  if (s === 'active' || s === 'trialing') return 'active'
  if (s === 'past_due' || s === 'unpaid') return 'past_due'
  if (s === 'canceled' || s === 'incomplete_expired') return 'canceled'
  return null
}

// Dispara email de boas-vindas via Edge Function. Falhas são logadas mas não interrompem o webhook.
async function sendWelcomeEmail(email: string, plano: 'monthly' | 'annual' | null) {
  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    console.error('[stripe-webhook] Missing VITE_SUPABASE_URL or SUPABASE_ANON_KEY for welcome email')
    return
  }
  try {
    const res = await fetch(`${url}/functions/v1/send-welcome-subscriber`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, plano }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[stripe-webhook] Failed to send welcome email:', { email, status: res.status, body })
      return
    }
    console.log('[stripe-webhook] Welcome email dispatched for', email, 'plan:', plano)
  } catch (err) {
    console.error('[stripe-webhook] Failed to send welcome email:', { email, error: (err as Error).message })
  }
}

async function findAuthUserByEmail(email: string) {
  const target = email.toLowerCase()
  const perPage = 1000
  let page = 1
  // Paginated search (admin.listUsers não tem filtro nativo por email)
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const match = data.users.find(u => u.email?.toLowerCase() === target)
    if (match) return match
    if (data.users.length < perPage) return null
    page++
    if (page > 50) return null // safety cap
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    console.error('[stripe-webhook] Missing signature header or STRIPE_WEBHOOK_SECRET env var')
    return { statusCode: 400, body: 'Missing signature or secret' }
  }

  // Stripe exige o body raw (sem reparse). Netlify pode entregar base64 quando isBase64Encoded=true.
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf-8')
    : (event.body || '')

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', (err as Error).message)
    return { statusCode: 400, body: `Webhook signature failed: ${(err as Error).message}` }
  }

  console.log('[stripe-webhook] Event received:', stripeEvent.type, stripeEvent.id)

  try {
    switch (stripeEvent.type) {

      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        const email = session.customer_email || session.customer_details?.email || null
        const customerId = typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id ?? null
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id ?? null

        if (!email || !customerId || !subscriptionId) {
          console.error('[stripe-webhook] checkout.session.completed missing fields', {
            email, customerId, subscriptionId,
          })
          break
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const plan = planFromPriceId(priceId)
        const periodEnd = getPeriodEnd(subscription)

        console.log('[stripe-webhook] Processing checkout.session.completed:', {
          email, customerId, subscriptionId, plan, periodEnd,
        })

        const existing = await findAuthUserByEmail(email)

        if (!existing) {
          const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
          })
          if (createErr || !created.user) {
            console.error('[stripe-webhook] Failed to create auth user:', createErr)
            break
          }

          const insertPayload: Record<string, unknown> = {
            user_id: created.user.id,
            email,
            account_type: 'subscriber',
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_plan: plan,
            onboarding_completed: false,
          }
          if (periodEnd) insertPayload.subscription_current_period_end = periodEnd

          const { data: insertData, error: insertErr } = await supabase
            .from('profiles')
            .insert(insertPayload)
            .select('user_id, status, subscription_status')

          if (insertErr) {
            console.error('[stripe-webhook] Profile insert failed:', insertErr)
          } else {
            console.log('[stripe-webhook] checkout.session.completed insert rows:', insertData?.length, insertData)
            await sendWelcomeEmail(email, plan)
          }
        } else {
          const updatePayload: Record<string, unknown> = {
            account_type: 'subscriber',
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_plan: plan,
          }
          if (periodEnd) updatePayload.subscription_current_period_end = periodEnd

          const { data: updData, error: updErr } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('user_id', existing.id)
            .select('user_id, status, subscription_status')

          if (updErr) {
            console.error('[stripe-webhook] Profile update (re-subscription) failed:', updErr)
          } else {
            console.log('[stripe-webhook] checkout.session.completed update rows:', updData?.length, updData)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const plan = planFromPriceId(priceId)
        const periodEnd = getPeriodEnd(subscription)
        const newStatus = mapStatusFromStripe(subscription.status)

        console.log('[stripe-webhook] Processing customer.subscription.updated:', {
          subscriptionId: subscription.id,
          stripeStatus: subscription.status,
          mappedStatus: newStatus,
          plan,
          periodEnd,
        })

        const update: Record<string, unknown> = {
          subscription_status: subscription.status,
          subscription_plan: plan,
        }
        if (periodEnd) update.subscription_current_period_end = periodEnd
        if (newStatus) update.status = newStatus

        const { data, error } = await supabase
          .from('profiles')
          .update(update)
          .eq('stripe_subscription_id', subscription.id)
          .select('user_id, status, subscription_status')

        if (error) console.error('[stripe-webhook] subscription.updated update failed:', error)
        else console.log('[stripe-webhook] subscription.updated rows:', data?.length, data)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription
        console.log('[stripe-webhook] Processing customer.subscription.deleted:', {
          subscriptionId: subscription.id,
        })

        const { data, error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'canceled', status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)
          .select('user_id, status, subscription_status')

        if (error) console.error('[stripe-webhook] subscription.deleted update failed:', error)
        else console.log('[stripe-webhook] subscription.deleted rows:', data?.length, data)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id ?? null
        if (!customerId) {
          console.error('[stripe-webhook] invoice.payment_failed without customer id')
          break
        }
        console.log('[stripe-webhook] Processing invoice.payment_failed:', { customerId })

        const { data, error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due', status: 'past_due' })
          .eq('stripe_customer_id', customerId)
          .select('user_id, status, subscription_status')

        if (error) console.error('[stripe-webhook] invoice.payment_failed update failed:', error)
        else console.log('[stripe-webhook] invoice.payment_failed rows:', data?.length, data)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id ?? null
        if (!customerId) {
          console.error('[stripe-webhook] invoice.payment_succeeded without customer id')
          break
        }
        console.log('[stripe-webhook] Processing invoice.payment_succeeded:', { customerId })

        const { data, error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'active', status: 'active' })
          .eq('stripe_customer_id', customerId)
          .select('user_id, status, subscription_status')

        if (error) console.error('[stripe-webhook] invoice.payment_succeeded update failed:', error)
        else console.log('[stripe-webhook] invoice.payment_succeeded rows:', data?.length, data)
        break
      }

      default:
        console.log('[stripe-webhook] Unhandled event type:', stripeEvent.type)
    }
  } catch (err) {
    // Erro interno após validar assinatura: log e devolve 200 pra evitar retry/duplicação no Stripe.
    console.error('[stripe-webhook] Handler error:', err)
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true }),
  }
}
