import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { email, nome } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: "Email é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ATLAS <no-reply@atlasconsultoria.app>",
        to: [email],
        subject: "Você acabou de entrar no ATLAS.",
        html: `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; padding: 0;">
    <div style="background: #00EF61; padding: 24px 32px;">
      <span style="font-size: 22px; font-weight: 900; letter-spacing: 5px; color: #000;">ATLAS</span>
      <span style="font-size: 11px; color: rgba(0,0,0,0.5); margin-left: 10px; letter-spacing: 2px;">by Black Sheep</span>
    </div>
    <div style="padding: 40px 32px;">
      <h1 style="font-size: 20px; color: #000; margin: 0 0 24px 0; font-weight: 800;">Você acabou de entrar no ATLAS.</h1>
      <p style="font-size: 15px; color: #444; margin: 0 0 20px 0; line-height: 1.6;">O que acontece agora:</p>
      <table style="margin: 0 0 28px 0; border: none; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 12px 6px 0; font-size: 15px; color: #00EF61; font-weight: 800; vertical-align: top;">1.</td>
          <td style="padding: 6px 0; font-size: 15px; color: #222; line-height: 1.5;">Acesse o sistema: <a href="https://atlasconsultoria.app/app" style="color: #00EF61; text-decoration: none; font-weight: 700;">atlasconsultoria.app/app</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0; font-size: 15px; color: #00EF61; font-weight: 800; vertical-align: top;">2.</td>
          <td style="padding: 6px 0; font-size: 15px; color: #222; line-height: 1.5;">Faça login com: <strong style="color: #000;">${email}</strong></td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0; font-size: 15px; color: #00EF61; font-weight: 800; vertical-align: top;">3.</td>
          <td style="padding: 6px 0; font-size: 15px; color: #222; line-height: 1.5;">Use a senha que você criou no cadastro</td>
        </tr>
      </table>
      <p style="font-size: 15px; color: #444; margin: 0 0 32px 0;">Simples assim.</p>
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
