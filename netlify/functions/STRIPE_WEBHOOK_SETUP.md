# Stripe Webhook Setup

## Endpoint

Production URL: `https://atlasconsultoria.app/api/webhook/stripe`

Este caminho é redirecionado para `/.netlify/functions/stripe-webhook` via `netlify.toml`.

## Eventos a habilitar no Stripe Dashboard

Ao criar o webhook em **Developers → Webhooks → Add endpoint**, selecionar:

- `checkout.session.completed` — cria o usuário Supabase e o profile na primeira assinatura
- `customer.subscription.updated` — sincroniza mudança de plano e período de cobrança
- `customer.subscription.deleted` — marca assinatura como `canceled`
- `invoice.payment_failed` — marca assinatura como `past_due`
- `invoice.payment_succeeded` — marca assinatura como `active` (cobre reativação após past_due)

## Como obter o `STRIPE_WEBHOOK_SECRET`

1. Após criar o endpoint no Stripe Dashboard, abrir os detalhes do webhook.
2. Em **Signing secret**, clicar em **Reveal**.
3. Copiar o valor `whsec_...`.

## Configurar no Netlify

1. Site settings → **Environment variables** → **Add a variable**.
2. Key: `STRIPE_WEBHOOK_SECRET`
3. Value: o `whsec_...` copiado.
4. Salvar e fazer redeploy.

Variáveis já esperadas (não recriar):

- `STRIPE_SECRET_KEY` — usado na função pra invocar a Stripe API.
- `SUPABASE_SERVICE_ROLE_KEY` — usado pra criar usuários e atualizar profiles bypassando RLS.
- `VITE_SUPABASE_URL` — usado pra montar o cliente Supabase no servidor.

## Testar localmente (opcional)

Com a CLI do Stripe instalada:

```bash
stripe login
stripe listen --forward-to https://atlasconsultoria.app/api/webhook/stripe
stripe trigger checkout.session.completed
```

Os logs aparecem em **Netlify Functions → stripe-webhook** com prefixo `[stripe-webhook]`.
