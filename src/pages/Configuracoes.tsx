import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const GREEN = '#80EF00'

const SETOR_OPTIONS = ['Alimentação','Indústria','Serviços','Infoprodutos & Mentoria','SaaS & Tecnologia','Varejo','E-commerce']
const FATURAMENTO_OPTIONS = [
  'Até R$ 50.000',
  'R$ 50.001 a R$ 100.000',
  'R$ 100.001 a R$ 300.000',
  'R$ 300.001 a R$ 500.000',
  'R$ 500.001 a R$ 1.000.000',
  'Acima de R$ 1.000.000',
]
const FUNCIONARIOS_OPTIONS = ['Somente eu','2 a 5','6 a 10','11 a 20','21 a 50','Acima de 50']
const TEMPO_OPTIONS = ['Menos de 1 ano','1 a 3 anos','3 a 5 anos','5 a 10 anos','Acima de 10 anos']

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 12,
  padding: '12px 16px',
  fontSize: 14,
  color: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase',
  letterSpacing: 2,
  marginBottom: 8,
}

const sectionStyle: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: 32,
  marginBottom: 16,
}

interface ProfileData {
  nome: string
  empresa: string
  setor: string
  faturamento_medio: string
  num_funcionarios: string
  tempo_empresa: string
}

const emptyForm: ProfileData = {
  nome: '',
  empresa: '',
  setor: '',
  faturamento_medio: '',
  num_funcionarios: '',
  tempo_empresa: '',
}

interface SubscriptionInfo {
  account_type: 'mentee' | 'subscriber' | null
  subscription_plan: 'monthly' | 'annual' | null
  subscription_status: string | null
  subscription_current_period_end: string | null
  mentoria_type: string | null
  mentoria_end_date: string | null
}

const MENTORIA_LABEL: Record<string, string> = {
  mafia_black_sheep: 'MAFIA Black Sheep',
  mentoria_atlas: 'Mentoria ATLAS',
  outras_mentorias: 'Outras Mentorias',
  assinante: 'Assinante',
}

function formatBrDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) {
    const [yyyy, mm, dd] = iso.slice(0, 10).split('-')
    if (!yyyy || !mm || !dd) return '—'
    return `${dd}/${mm}/${yyyy}`
  }
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

async function authFetch(path: string, body?: unknown) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ''
  return fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

function ChangePlanModal({ currentPlan, periodEnd, onConfirm, onClose }: {
  currentPlan: 'monthly' | 'annual'
  periodEnd: string | null
  onConfirm: (newPlan: 'monthly' | 'annual') => Promise<{ ok: boolean; error?: string }>
  onClose: () => void
}) {
  const newPlan: 'monthly' | 'annual' = currentPlan === 'monthly' ? 'annual' : 'monthly'
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const planCard = (
    plan: 'monthly' | 'annual',
    highlighted: boolean,
  ) => {
    const title = plan === 'monthly' ? 'Mensal' : 'Anual'
    const price = plan === 'monthly' ? 'R$ 99/mês' : 'R$ 599/ano'
    const sub = plan === 'annual' ? 'R$ 49,92/mês · economize ~50%' : null
    return (
      <div
        key={plan}
        style={{
          flex: 1,
          padding: 16,
          borderRadius: 12,
          background: highlighted ? `${GREEN}10` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${highlighted ? `${GREEN}40` : 'rgba(255,255,255,0.1)'}`,
          minWidth: 0,
        }}
      >
        <p style={{ ...labelStyle, marginBottom: 6, color: highlighted ? GREEN : 'rgba(255,255,255,0.5)' }}>{title}</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{price}</p>
        {sub && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{sub}</p>}
      </div>
    )
  }

  async function handleConfirm() {
    setError('')
    setSaving(true)
    const res = await onConfirm(newPlan)
    setSaving(false)
    if (!res.ok) setError(res.error || 'Erro ao trocar plano.')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Trocar plano</h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Você está mudando do plano {currentPlan === 'monthly' ? 'mensal' : 'anual'} para o {newPlan === 'monthly' ? 'mensal' : 'anual'}.</p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {planCard(currentPlan, false)}
          {planCard(newPlan, true)}
        </div>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 24 }}>
          A mudança acontece no fim do período atual ({formatBrDate(periodEnd)}). Você não será cobrado agora.
        </p>

        {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 16 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer' }}>Cancelar</button>
          <button onClick={handleConfirm} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: GREEN, border: 'none', color: '#000', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Confirmando...' : 'Confirmar troca'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteAccountModal({ onConfirm, onClose }: {
  onConfirm: () => Promise<{ ok: boolean; error?: string }>
  onClose: () => void
}) {
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const enabled = confirmation === 'EXCLUIR'

  async function handleDelete() {
    if (!enabled) return
    setError('')
    setDeleting(true)
    const res = await onConfirm()
    if (!res.ok) {
      setError(res.error || 'Falha ao excluir conta. Tente novamente ou contate o suporte.')
      setDeleting(false)
    }
    // Em sucesso, o componente pai navega — não precisa setDeleting(false).
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#111', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Excluir minha conta</h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: 12 }}>
          Você está prestes a apagar <strong style={{ color: '#fff' }}>PERMANENTEMENTE</strong>:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            'Sua assinatura (cancelamento imediato no Stripe, sem reembolso)',
            'Todos os lançamentos do DRE e fluxo de caixa',
            'Todos os diagnósticos IA gerados',
            'Precificações de produtos e serviços',
            'Sua conta de acesso',
          ].map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              <span style={{ color: '#ef4444', flexShrink: 0 }}>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontStyle: 'italic' }}>
          Esta ação não pode ser desfeita.
        </p>

        <label style={{ ...labelStyle }}>Pra confirmar, digite EXCLUIR no campo abaixo:</label>
        <input
          type="text"
          value={confirmation}
          onChange={e => setConfirmation(e.target.value)}
          placeholder="Digite EXCLUIR"
          style={{ ...inputStyle, marginBottom: 16, letterSpacing: 2 }}
          autoComplete="off"
        />

        {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 16 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} disabled={deleting} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: deleting ? 'not-allowed' : 'pointer' }}>Cancelar</button>
          <button
            onClick={handleDelete}
            disabled={!enabled || deleting}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              background: enabled ? '#ef4444' : 'rgba(239,68,68,0.15)',
              border: 'none',
              color: enabled ? '#fff' : 'rgba(239,68,68,0.5)',
              fontSize: 13,
              fontWeight: 700,
              cursor: enabled && !deleting ? 'pointer' : 'not-allowed',
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? 'Excluindo...' : 'Excluir minha conta permanentemente'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CancelSubscriptionModal({ periodEnd, onConfirm, onClose }: {
  periodEnd: string | null
  onConfirm: () => Promise<{ ok: boolean; error?: string }>
  onClose: () => void
}) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    setError('')
    setSaving(true)
    const res = await onConfirm()
    setSaving(false)
    if (!res.ok) setError(res.error || 'Erro ao cancelar.')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Cancelar assinatura</h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: 12 }}>
          Tem certeza? Você manterá acesso até <strong style={{ color: '#fff' }}>{formatBrDate(periodEnd)}</strong> (fim do período pago).
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 24 }}>
          Seus dados ficam guardados se você decidir voltar.
        </p>

        {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 16 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer' }}>Voltar</button>
          <button onClick={handleConfirm} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Cancelando...' : 'Cancelar assinatura'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ChangePasswordModal({ email, onClose }: { email: string; onClose: () => void }) {
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    setError('')
    setSuccess('')
    if (nova.length < 8) { setError('A nova senha deve ter pelo menos 8 caracteres.'); return }
    if (nova !== confirmar) { setError('As senhas não coincidem.'); return }
    if (!atual) { setError('Informe sua senha atual.'); return }

    setSaving(true)
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password: atual })
    if (signErr) {
      setError('Senha atual incorreta.')
      setSaving(false)
      return
    }
    const { error: updErr } = await supabase.auth.updateUser({ password: nova })
    if (updErr) {
      setError(updErr.message)
      setSaving(false)
      return
    }
    setSuccess('Senha atualizada.')
    setSaving(false)
    setTimeout(onClose, 900)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Trocar senha</h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Mínimo 8 caracteres.</p>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Senha atual</label>
          <input type="password" value={atual} onChange={e => setAtual(e.target.value)} style={inputStyle} autoComplete="current-password" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nova senha</label>
          <input type="password" value={nova} onChange={e => setNova(e.target.value)} style={inputStyle} autoComplete="new-password" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Confirmar nova senha</label>
          <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} style={inputStyle} autoComplete="new-password" />
        </div>

        {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 16 }}>{error}</p>}
        {success && <p style={{ fontSize: 12, color: GREEN, marginBottom: 16 }}>{success}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: GREEN, border: 'none', color: '#000', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ChangeEmailModal({ emailAtual, onClose }: { emailAtual: string; onClose: () => void }) {
  const [novoEmail, setNovoEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    setError('')
    setSuccess('')
    if (!novoEmail || !/.+@.+\..+/.test(novoEmail)) { setError('Informe um email válido.'); return }
    if (novoEmail.toLowerCase() === emailAtual.toLowerCase()) { setError('O novo email é igual ao atual.'); return }
    if (!senha) { setError('Informe sua senha pra confirmar.'); return }

    setSaving(true)
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: emailAtual, password: senha })
    if (signErr) {
      setError('Senha incorreta.')
      setSaving(false)
      return
    }
    const { error: updErr } = await supabase.auth.updateUser({ email: novoEmail })
    if (updErr) {
      setError(updErr.message)
      setSaving(false)
      return
    }
    setSuccess(`Enviamos um email de confirmação para ${novoEmail}. Confirme pra finalizar a troca.`)
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Trocar email</h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Você precisa confirmar pelo email novo pra finalizar.</p>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email atual</label>
          <input type="email" value={emailAtual} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email novo</label>
          <input type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} style={inputStyle} autoComplete="email" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Senha (pra confirmar identidade)</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} style={inputStyle} autoComplete="current-password" />
        </div>

        {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 16 }}>{error}</p>}
        {success && <p style={{ fontSize: 12, color: GREEN, marginBottom: 16, lineHeight: 1.5 }}>{success}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}>
            {success ? 'Fechar' : 'Cancelar'}
          </button>
          {!success && (
            <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: GREEN, border: 'none', color: '#000', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Enviando...' : 'Trocar email'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function Configuracoes() {
  const { user, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const userId = user?.id ?? null
  const email = user?.email ?? ''

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProfileData>(emptyForm)
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null)
  const [showPwModal, setShowPwModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  function set(field: keyof ProfileData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function fetchProfile() {
    if (!userId) return
    const { data, error } = await supabase
      .from('profiles')
      .select('nome, empresa, setor, faturamento_medio, num_funcionarios, tempo_empresa, account_type, subscription_plan, subscription_status, subscription_current_period_end, mentoria_type, mentoria_end_date')
      .eq('user_id', userId)
      .single()
    if (error) {
      console.error('[Configuracoes] Failed to load profile:', error)
      return
    }
    if (data) {
      setForm({
        nome: data.nome ?? '',
        empresa: data.empresa ?? '',
        setor: data.setor ?? '',
        faturamento_medio: data.faturamento_medio ?? '',
        num_funcionarios: data.num_funcionarios ?? '',
        tempo_empresa: data.tempo_empresa ?? '',
      })
      setSubInfo({
        account_type: (data.account_type as SubscriptionInfo['account_type']) ?? null,
        subscription_plan: (data.subscription_plan as SubscriptionInfo['subscription_plan']) ?? null,
        subscription_status: data.subscription_status ?? null,
        subscription_current_period_end: data.subscription_current_period_end ?? null,
        mentoria_type: data.mentoria_type ?? null,
        mentoria_end_date: data.mentoria_end_date ?? null,
      })
    }
  }

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await fetchProfile()
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  function showFeedback(kind: 'success' | 'error', msg: string) {
    setFeedback({ kind, msg })
    setTimeout(() => setFeedback(null), 3500)
  }

  async function handleSavePersonal() {
    if (!userId) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        nome: form.nome || null,
        empresa: form.empresa || null,
        setor: form.setor || null,
        faturamento_medio: form.faturamento_medio || null,
        num_funcionarios: form.num_funcionarios || null,
        tempo_empresa: form.tempo_empresa || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
    setSaving(false)
    if (error) {
      showFeedback('error', `Erro ao salvar: ${error.message}`)
    } else {
      showFeedback('success', 'Dados atualizados.')
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await authFetch('/api/portal-session')
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        showFeedback('error', data.error || 'Não foi possível abrir o portal de pagamento.')
      } else {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      showFeedback('error', (err as Error).message)
    } finally {
      setPortalLoading(false)
    }
  }

  async function handleChangePlan(newPlan: 'monthly' | 'annual'): Promise<{ ok: boolean; error?: string }> {
    const res = await authFetch('/api/change-plan', { newPlan })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.changed) {
      return { ok: false, error: data.error || 'Erro ao trocar plano.' }
    }
    setShowPlanModal(false)
    const periodEndIso = data.effective_at
      ? new Date(data.effective_at * 1000).toISOString()
      : subInfo?.subscription_current_period_end ?? null
    showFeedback('success', `Plano alterado. Mudança efetiva em ${formatBrDate(periodEndIso)}.`)
    await fetchProfile()
    await refreshProfile()
    return { ok: true }
  }

  async function handleDeleteAccount(): Promise<{ ok: boolean; error?: string }> {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return { ok: false, error: 'Sessão expirou. Faça login novamente.' }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-my-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        return { ok: false, error: data.error || `Erro ${res.status}` }
      }
      // Sucesso — limpa sessão local e redireciona
      await supabase.auth.signOut()
      navigate('/login?msg=' + encodeURIComponent('Conta excluída.'))
      return { ok: true }
    } catch (err) {
      return { ok: false, error: (err as Error).message }
    }
  }

  async function handleCancelSub(): Promise<{ ok: boolean; error?: string }> {
    const res = await authFetch('/api/cancel-subscription')
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.canceled_at_period_end) {
      return { ok: false, error: data.error || 'Erro ao cancelar.' }
    }
    setShowCancelModal(false)
    const periodEndIso = data.current_period_end
      ? new Date(data.current_period_end * 1000).toISOString()
      : subInfo?.subscription_current_period_end ?? null
    showFeedback('success', `Assinatura cancelada. Acesso até ${formatBrDate(periodEndIso)}.`)
    await fetchProfile()
    await refreshProfile()
    return { ok: true }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>Configurações</h2>
        <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Gerencie sua conta e dados pessoais.</p>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: feedback.kind === 'success' ? `${GREEN}15` : 'rgba(239,68,68,0.08)',
          border: `1px solid ${feedback.kind === 'success' ? `${GREEN}30` : 'rgba(239,68,68,0.25)'}`,
          color: feedback.kind === 'success' ? GREEN : '#f87171',
          fontSize: 13,
        }}>
          {feedback.msg}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* ── Seção 1 — Dados de acesso ── */}
          <div style={sectionStyle}>
            <p style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginBottom: 4 }}>Dados de acesso</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Email e senha pra entrar no ATLAS.</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ ...labelStyle, marginBottom: 4 }}>Email</p>
                <p style={{ fontSize: 14, color: '#fff', wordBreak: 'break-all' }}>{email}</p>
              </div>
              <button onClick={() => setShowEmailModal(true)} style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                Trocar email
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingTop: 20, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ ...labelStyle, marginBottom: 4 }}>Senha</p>
                <p style={{ fontSize: 14, color: '#fff', letterSpacing: 4 }}>••••••••</p>
              </div>
              <button onClick={() => setShowPwModal(true)} style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                Trocar senha
              </button>
            </div>
          </div>

          {/* ── Seção 2 — Dados pessoais ── */}
          <div style={sectionStyle}>
            <p style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginBottom: 4 }}>Dados pessoais</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Suas informações de cadastro.</p>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Nome completo</label>
              <input type="text" value={form.nome} onChange={e => set('nome', e.target.value)} style={inputStyle} placeholder="Seu nome completo" autoComplete="name" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Empresa</label>
              <input type="text" value={form.empresa} onChange={e => set('empresa', e.target.value)} style={inputStyle} placeholder="Nome da sua empresa" autoComplete="organization" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Setor da empresa</label>
              <select value={form.setor} onChange={e => set('setor', e.target.value)} style={selectStyle}>
                <option value="" style={{ background: '#000' }}>Selecione...</option>
                {SETOR_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#000' }}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Faturamento médio mensal</label>
              <select value={form.faturamento_medio} onChange={e => set('faturamento_medio', e.target.value)} style={selectStyle}>
                <option value="" style={{ background: '#000' }}>Selecione...</option>
                {FATURAMENTO_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#000' }}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Número de funcionários</label>
              <select value={form.num_funcionarios} onChange={e => set('num_funcionarios', e.target.value)} style={selectStyle}>
                <option value="" style={{ background: '#000' }}>Selecione...</option>
                {FUNCIONARIOS_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#000' }}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Tempo de empresa</label>
              <select value={form.tempo_empresa} onChange={e => set('tempo_empresa', e.target.value)} style={selectStyle}>
                <option value="" style={{ background: '#000' }}>Selecione...</option>
                {TEMPO_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#000' }}>{s}</option>)}
              </select>
            </div>

            <button
              onClick={handleSavePersonal}
              disabled={saving}
              style={{
                background: GREEN,
                border: 'none',
                color: '#000',
                padding: '14px 28px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>

          {/* ── Seção 3 — Assinatura ── */}
          {subInfo?.account_type === 'subscriber' && (
            <div style={sectionStyle}>
              <p style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginBottom: 4 }}>Assinatura</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Gerencie seu plano e pagamento.</p>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 6 }}>Plano atual</p>
                    {subInfo.subscription_plan === 'annual' ? (
                      <>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Anual · R$ 599/ano</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>R$ 49,92/mês</p>
                      </>
                    ) : subInfo.subscription_plan === 'monthly' ? (
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Mensal · R$ 99/mês</p>
                    ) : (
                      <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: 0 }}>—</p>
                    )}
                  </div>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 6 }}>Próxima cobrança</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
                      {formatBrDate(subInfo.subscription_current_period_end)}
                    </p>
                  </div>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 6 }}>Status</p>
                    {subInfo.subscription_status === 'past_due' ? (
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, background: 'rgba(234,179,8,0.15)', color: '#eab308', fontSize: 12, fontWeight: 600 }}>Pagamento pendente</span>
                    ) : subInfo.subscription_status === 'canceled' ? (
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>Cancelada</span>
                    ) : (
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, background: `${GREEN}20`, color: GREEN, fontSize: 12, fontWeight: 600 }}>Ativo</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {subInfo.subscription_status === 'active' && subInfo.subscription_plan && (
                  <button
                    onClick={() => setShowPlanModal(true)}
                    style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, cursor: 'pointer' }}
                  >
                    Trocar plano
                  </button>
                )}
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, cursor: portalLoading ? 'not-allowed' : 'pointer', opacity: portalLoading ? 0.7 : 1 }}
                >
                  {portalLoading ? 'Abrindo...' : 'Atualizar cartão / Ver faturas'}
                </button>
                {subInfo.subscription_status === 'active' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}
                  >
                    Cancelar assinatura
                  </button>
                )}
              </div>
            </div>
          )}

          {subInfo?.account_type === 'mentee' && (
            <div style={sectionStyle}>
              <p style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginBottom: 4 }}>Assinatura</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Status da sua mentoria e como continuar com o ATLAS.</p>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 6 }}>Sua mentoria</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
                      {subInfo.mentoria_type ? (MENTORIA_LABEL[subInfo.mentoria_type] ?? subInfo.mentoria_type) : '—'}
                    </p>
                  </div>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 6 }}>Ativa até</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
                      {subInfo.mentoria_end_date ? formatBrDate(subInfo.mentoria_end_date) : 'Não definido'}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}30`, borderRadius: 14, padding: 20 }}>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: 16 }}>
                  Quando sua mentoria terminar, continue com ATLAS por <strong style={{ color: '#fff' }}>R$ 99/mês</strong> ou <strong style={{ color: '#fff' }}>R$ 599/ano (~50% off)</strong>.
                </p>
                <button
                  onClick={() => { window.location.href = '/#precos' }}
                  style={{ background: GREEN, border: 'none', color: '#000', padding: '12px 24px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Quero virar assinante
                </button>
              </div>
            </div>
          )}

          {/* ── Sair ── */}
          <div style={sectionStyle}>
            <p style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginBottom: 4 }}>Sair</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Encerra a sessão neste dispositivo.</p>
            <button
              onClick={signOut}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                padding: '12px 28px',
                borderRadius: 12,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Sair da conta
            </button>
          </div>
        </>
      )}

      {/* ── Seção 4 — Zona de perigo (só assinantes) ── */}
      {!loading && subInfo?.account_type === 'subscriber' && (
        <div
          style={{
            background: '#0a0a0a',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 20,
            padding: 32,
            marginTop: 32,
          }}
        >
          <p style={{ fontSize: 16, color: '#f87171', fontWeight: 700, marginBottom: 4 }}>Zona de perigo</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Ações irreversíveis. Tenha certeza antes de continuar.</p>

          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: 20 }}>
            <p style={{ ...labelStyle, color: '#f87171', marginBottom: 8 }}>Excluir minha conta</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, marginBottom: 16 }}>
              Apaga permanentemente: assinatura, lançamentos financeiros, DRE, fluxo de caixa, diagnósticos, configurações. Esta ação <strong style={{ color: '#fff' }}>NÃO</strong> pode ser desfeita.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                background: '#ef4444',
                border: 'none',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Excluir minha conta permanentemente
            </button>
          </div>
        </div>
      )}

      {showPwModal && <ChangePasswordModal email={email} onClose={() => setShowPwModal(false)} />}
      {showEmailModal && <ChangeEmailModal emailAtual={email} onClose={() => setShowEmailModal(false)} />}
      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
      {showPlanModal && subInfo?.subscription_plan && (
        <ChangePlanModal
          currentPlan={subInfo.subscription_plan}
          periodEnd={subInfo.subscription_current_period_end}
          onConfirm={handleChangePlan}
          onClose={() => setShowPlanModal(false)}
        />
      )}
      {showCancelModal && (
        <CancelSubscriptionModal
          periodEnd={subInfo?.subscription_current_period_end ?? null}
          onConfirm={handleCancelSub}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  )
}
