import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  // 1. Validar JWT do usuário (precisa estar logado)
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No auth header' }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const userId = user.id
  console.log('[delete-my-account] Starting deletion for user:', userId, user.email)

  // 2. Cliente admin pra operações privilegiadas
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 3. Buscar profile pra pegar stripe_subscription_id (se assinante)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_subscription_id, account_type')
    .eq('user_id', userId)
    .maybeSingle()

  // 4. Cancelar assinatura no Stripe IMEDIATAMENTE (sem refund) — só se for assinante
  if (profile?.stripe_subscription_id) {
    try {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
        apiVersion: '2023-10-16',
      })
      await stripe.subscriptions.cancel(profile.stripe_subscription_id, {
        invoice_now: false,
        prorate: false,
      })
      console.log('[delete-my-account] Stripe subscription canceled:', profile.stripe_subscription_id)
    } catch (err) {
      console.error('[delete-my-account] Stripe cancel failed (continuing anyway):', (err as Error).message)
      // NÃO interrompe — usuário ainda quer deletar a conta mesmo se Stripe falhar
    }
  }

  // 5. Deletar dados das 4 tabelas (usuário só tem acesso aos próprios via RLS, mas com service role contornamos pra garantir)
  const tables = ['entries', 'analyses', 'pricing_products', 'pricing_services']
  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).delete().eq('user_id', userId)
    if (error) {
      console.error(`[delete-my-account] Failed to delete from ${table}:`, error.message)
      // Continua tentando as outras tabelas — não aborta no erro
    } else {
      console.log(`[delete-my-account] Deleted rows from ${table} for user:`, userId)
    }
  }

  // 6. Deletar profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('user_id', userId)
  if (profileError) {
    console.error('[delete-my-account] Failed to delete profile:', profileError.message)
  }

  // 7. Deletar auth user (último passo — após isso o usuário não consegue mais autenticar)
  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (authDeleteError) {
    console.error('[delete-my-account] Failed to delete auth user:', authDeleteError.message)
    return new Response(JSON.stringify({ error: 'Failed to delete account: ' + authDeleteError.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  console.log('[delete-my-account] Account fully deleted:', userId)

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
