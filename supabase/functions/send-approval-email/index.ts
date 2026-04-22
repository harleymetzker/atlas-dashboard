import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

serve(async (req) => {
  try {
    const { email, nome } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: "Email é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
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
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #fff; background: #0c0c0c;">
            <div style="margin-bottom: 32px;">
              <span style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #00EF61;">ATLAS</span>
              <span style="font-size: 12px; color: #666; margin-left: 8px;">by Black Sheep</span>
            </div>
            <h1 style="font-size: 22px; color: #fff; margin-bottom: 24px;">Você acabou de entrar no ATLAS.</h1>
            <p style="font-size: 15px; color: #aaa; margin-bottom: 8px;">O que acontece agora:</p>
            <ol style="font-size: 15px; color: #aaa; padding-left: 20px; margin-bottom: 24px; line-height: 2;">
              <li>Acesse o sistema: <a href="https://atlasconsultoria.app" style="color: #00EF61; text-decoration: none;">atlasconsultoria.app</a></li>
              <li>Faça login com seu email e senha</li>
              <li>Deixa que o ATLAS faça o trabalho chato</li>
            </ol>
            <p style="font-size: 15px; color: #aaa; margin-bottom: 4px;">Simples assim.</p>
            <p style="font-size: 15px; color: #aaa; margin-top: 32px; margin-bottom: 4px;">Bem-vindo ao rebanho dos que pensam diferente.</p>
            <p style="font-size: 15px; color: #fff; font-weight: 700;">Time Black Sheep</p>
          </div>
        `,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
