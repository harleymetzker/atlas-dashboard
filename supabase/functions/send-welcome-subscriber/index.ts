import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { email, plano } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: "Email é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: "https://atlasconsultoria.app/bem-vindo",
      },
    })

    if (linkError || !linkData?.properties?.action_link) {
      return new Response(JSON.stringify({ error: linkError?.message || "Falha ao gerar magic link" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const actionLink = linkData.properties.action_link
    const planoLabel = plano === "annual" ? "Plano Anual" : "Plano Mensal"

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ATLAS <no-reply@atlasconsultoria.app>",
        to: [email],
        subject: "Sua assinatura ATLAS está ativa.",
        html: `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; padding: 0;">
    <div style="background: #00EF61; padding: 24px 32px;">
      <span style="font-size: 22px; font-weight: 900; letter-spacing: 5px; color: #000;">ATLAS</span>
      <span style="font-size: 11px; color: rgba(0,0,0,0.5); margin-left: 10px; letter-spacing: 2px;">by Black Sheep</span>
    </div>
    <div style="padding: 40px 32px;">
      <h1 style="font-size: 20px; color: #000; margin: 0 0 24px 0; font-weight: 800;">Sua assinatura ATLAS está ativa.</h1>
      <p style="font-size: 15px; color: #444; margin: 0 0 20px 0; line-height: 1.6;">Pagamento confirmado. ${planoLabel} ativado.</p>
      <p style="font-size: 15px; color: #444; margin: 0 0 28px 0; line-height: 1.6;">Pra começar a usar agora, é só clicar no botão abaixo:</p>
      <p style="margin: 0 0 24px 0;">
        <a href="${actionLink}" style="display: inline-block; background: #00EF61; color: #000; padding: 16px 32px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; font-size: 14px;">Acessar Minha Conta</a>
      </p>
      <p style="font-size: 13px; color: #888; margin: 0 0 32px 0; line-height: 1.5;">O link acima dá acesso direto. Você define sua senha no primeiro acesso.</p>
      <div style="border-top: 1px solid #eee; padding-top: 24px;">
        <p style="font-size: 14px; color: #666; margin: 0 0 4px 0;">Bem-vindo ao rebanho dos que pensam diferente.</p>
        <p style="font-size: 14px; color: #000; font-weight: 800; margin: 0;">Time Black Sheep</p>
      </div>
    </div>
  </div>
`,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
