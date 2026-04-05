import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader! } } }
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user || user.email !== ADMIN_EMAIL) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const { email, password } = await req.json()
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'email and password required' }), { status: 400, headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  return new Response(JSON.stringify({ user: { id: data.user.id, email: data.user.email } }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
