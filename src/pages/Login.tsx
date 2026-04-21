import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div style={{
          background: '#00EF61',
          borderRadius: 12,
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          marginBottom: 24,
        }}>
          <img src="/blacksheep-logo.jpg" alt="Black Sheep" style={{ width: 100, height: 100, objectFit: 'contain' }} />
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

        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error && (
              <div className="text-sm text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                {error === 'Invalid login credentials' ? 'Email ou senha incorretos.' : error}
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/15 mt-8">
          Acesso restrito. Entre em contato com o administrador.
        </p>
      </div>
    </div>
  )
}
