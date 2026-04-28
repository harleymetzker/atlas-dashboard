import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const GREEN = '#80EF00'

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 12,
  padding: '12px 16px',
  fontSize: 14,
  color: '#fff',
  outline: 'none',
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

export function BemVindo() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    senha: '',
    confirmarSenha: '',
    nome: '',
    empresa: '',
    setor: '',
    faturamento_medio: '',
    num_funcionarios: '',
    tempo_empresa: '',
    termos: false,
  })

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (!session?.user) {
        navigate('/login?msg=' + encodeURIComponent('Sua sessão expirou. Faça login pra continuar.'))
        return
      }
      setUserId(session.user.id)
      setCheckingSession(false)
    })()
    return () => { mounted = false }
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.senha.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return }
    if (form.senha !== form.confirmarSenha) { setError('As senhas não coincidem.'); return }
    if (!form.termos) { setError('Você precisa aceitar os Termos de Uso.'); return }
    if (!form.setor || !form.faturamento_medio || !form.num_funcionarios || !form.tempo_empresa) {
      setError('Preencha todos os campos do questionário.')
      return
    }
    if (!userId) { setError('Sessão inválida. Faça login novamente.'); return }

    setLoading(true)
    try {
      const { error: pwError } = await supabase.auth.updateUser({ password: form.senha })
      if (pwError) {
        setError(pwError.message)
        setLoading(false)
        return
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome: form.nome || null,
          empresa: form.empresa || null,
          setor: form.setor || null,
          faturamento_medio: form.faturamento_medio || null,
          num_funcionarios: form.num_funcionarios || null,
          tempo_empresa: form.tempo_empresa || null,
          mentoria_type: 'assinante',
          termos_aceitos: true,
          onboarding_completed: true,
        })
        .eq('user_id', userId)

      if (profileError) {
        // Senha já foi salva — não desfaz. Mostra erro pro usuário.
        console.error('Profile update error:', profileError)
        setError('Sua senha foi salva, mas houve um erro ao salvar o perfil. Tente novamente ou contate o suporte.')
        setLoading(false)
        return
      }

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Tarja verde */}
        <div style={{
          background: GREEN,
          borderRadius: 12,
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          marginBottom: 24,
        }}>
          <img src="/logoBS.png" alt="Black Sheep" style={{ width: 100, height: 100, objectFit: 'contain' }} />
          <div style={{ width: 1, height: 32, background: 'rgba(0,0,0,0.2)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: 6, color: '#000', lineHeight: 1 }}>
              ATLAS
            </span>
            <span style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(0,0,0,0.5)', lineHeight: 1 }}>
              by Black Sheep
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Seção: Senha */}
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, marginBottom: 16 }}>
            <p style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginBottom: 4 }}>Defina sua senha de acesso</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Você vai usar essa senha junto com seu email pra entrar.</p>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Defina sua senha</label>
              <input
                type="password"
                required
                value={form.senha}
                onChange={e => set('senha', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                style={{ ...selectStyle }}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label style={labelStyle}>Confirmar senha</label>
              <input
                type="password"
                required
                value={form.confirmarSenha}
                onChange={e => set('confirmarSenha', e.target.value)}
                placeholder="Repita a senha"
                style={{ ...selectStyle }}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Seção: Questionário */}
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, marginBottom: 16 }}>
            <p style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginBottom: 4 }}>Conta um pouco sobre seu negócio</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Essas informações nos ajudam a personalizar sua experiência.</p>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Nome completo</label>
              <input
                type="text"
                required
                value={form.nome}
                onChange={e => set('nome', e.target.value)}
                placeholder="Seu nome completo"
                style={{ ...selectStyle }}
                autoComplete="name"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Empresa</label>
              <input
                type="text"
                required
                value={form.empresa}
                onChange={e => set('empresa', e.target.value)}
                placeholder="Nome da sua empresa"
                style={{ ...selectStyle }}
                autoComplete="organization"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Setor da empresa</label>
              <select required style={selectStyle} value={form.setor} onChange={e => set('setor', e.target.value)}>
                <option value="" style={{ background: '#000' }}>Selecione...</option>
                {['Alimentação','Indústria','Serviços','Infoprodutos & Mentoria','SaaS & Tecnologia','Varejo','E-commerce'].map(s => (
                  <option key={s} value={s} style={{ background: '#000' }}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Faturamento médio mensal</label>
              <select required style={selectStyle} value={form.faturamento_medio} onChange={e => set('faturamento_medio', e.target.value)}>
                <option value="" style={{ background: '#000' }}>Selecione...</option>
                {[
                  'Até R$ 50.000',
                  'R$ 50.001 a R$ 100.000',
                  'R$ 100.001 a R$ 300.000',
                  'R$ 300.001 a R$ 500.000',
                  'R$ 500.001 a R$ 1.000.000',
                  'Acima de R$ 1.000.000',
                ].map(s => <option key={s} value={s} style={{ background: '#000' }}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Número de funcionários</label>
              <select required style={selectStyle} value={form.num_funcionarios} onChange={e => set('num_funcionarios', e.target.value)}>
                <option value="" style={{ background: '#000' }}>Selecione...</option>
                {['Somente eu','2 a 5','6 a 10','11 a 20','21 a 50','Acima de 50'].map(s => (
                  <option key={s} value={s} style={{ background: '#000' }}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Tempo de empresa</label>
              <select required style={selectStyle} value={form.tempo_empresa} onChange={e => set('tempo_empresa', e.target.value)}>
                <option value="" style={{ background: '#000' }}>Selecione...</option>
                {['Menos de 1 ano','1 a 3 anos','3 a 5 anos','5 a 10 anos','Acima de 10 anos'].map(s => (
                  <option key={s} value={s} style={{ background: '#000' }}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Termos */}
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '20px 32px', marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div
                onClick={() => set('termos', !form.termos)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: form.termos ? GREEN : 'rgba(255,255,255,0.1)',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 3,
                  left: form.termos ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                Li e concordo com os{' '}
                <span style={{ color: GREEN, textDecoration: 'underline', cursor: 'pointer' }}>Termos de Uso</span>
              </span>
            </label>
          </div>

          {/* Erro */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'rgba(255,255,255,0.1)' : '#fff',
              color: '#000',
              border: 'none',
              borderRadius: 16,
              padding: '18px 0',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Salvando...
              </>
            ) : 'Acessar o Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
