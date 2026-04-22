import { Handler } from '@netlify/functions'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { priceId } = JSON.parse(event.body || '{}')

    if (!priceId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'priceId is required' }) }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://atlasconsultoria.app/assinatura-confirmada',
      cancel_url: 'https://atlasconsultoria.app/#precos',
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    console.error('Stripe error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao criar sessão de checkout' }),
    }
  }
}
