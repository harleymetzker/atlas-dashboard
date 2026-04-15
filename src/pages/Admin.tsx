import { useState, useEffect } from 'react'
import { Trash2, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Card } from '../components/ui/Card'

interface UserRecord {
  id: string
  email: string
  created_at: string
}

export function Admin() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase.functions.invoke('admin-list-users')
    if (!error && data?.users) setUsers(data.users)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  async function createUser() {
    if (!email || !password) { setError('Preencha email e senha.'); return }
    if (password.length < 6) { setError('Senha deve ter ao menos 6 caracteres.'); return }
    setCreating(true)
    setError('')
    const { error } = await supabase.functions.invoke('admin-create-user', { body: { email, password } })
    if (error) setError(error.message)
    else { setModalOpen(false); setEmail(''); setPassword(''); fetchUsers() }
    setCreating(false)
  }

  async function deleteUser(userId: string, userEmail: string) {
    if (!confirm(`Excluir usuário ${userEmail}? Todos os dados financeiros serão apagados.`)) return
    await supabase.functions.invoke('admin-delete-user', { body: { userId } })
    fetchUsers()
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Gerenciar Usuários</h2>
          <p className="text-sm text-white/50 mt-1">Crie e remova acessos ao ATLAS</p>
        </div>
        <Button onClick={() => { setModalOpen(true); setError('') }}>
          <UserPlus size={16} /> Novo Usuário
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12 text-white/35">Carregando...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-white/35">Nenhum usuário cadastrado.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map(user => (
              <div key={user.id} className="group flex items-center justify-between py-4">
                <div>
                  <p className="text-sm text-white">{user.email}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => deleteUser(user.id, user.email)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="bg-white/3 border border-white/5 rounded-2xl p-6 max-w-lg">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Importante</h3>
        <p className="text-sm text-white/50 leading-relaxed">
          O painel admin não tem acesso aos dados financeiros dos usuários. Cada usuário vê apenas seus próprios lançamentos por isolamento via RLS no Supabase.
        </p>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Criar Usuário">
        <div className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@empresa.com" />
          <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={createUser} loading={creating} className="flex-1">Criar Acesso</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
