import { useEffect, useState } from 'react'
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
  const { user, signOut } = useAuth()
  const userId = user?.id ?? null
  const email = user?.email ?? ''

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProfileData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null)
  const [showPwModal, setShowPwModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  function set(field: keyof ProfileData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('nome, empresa, setor, faturamento_medio, num_funcionarios, tempo_empresa')
        .eq('user_id', userId)
        .single()
      if (cancelled) return
      if (error) {
        console.error('[Configuracoes] Failed to load profile:', error)
      } else if (data) {
        setForm({
          nome: data.nome ?? '',
          empresa: data.empresa ?? '',
          setor: data.setor ?? '',
          faturamento_medio: data.faturamento_medio ?? '',
          num_funcionarios: data.num_funcionarios ?? '',
          tempo_empresa: data.tempo_empresa ?? '',
        })
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
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

      {showPwModal && <ChangePasswordModal email={email} onClose={() => setShowPwModal(false)} />}
      {showEmailModal && <ChangeEmailModal emailAtual={email} onClose={() => setShowEmailModal(false)} />}
    </div>
  )
}
