import { useState, useEffect, useMemo } from 'react'
import { Trash2, CheckCircle2, XCircle, Clock, Pencil } from 'lucide-react'
import { format, subMonths, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'

const GREEN = '#80EF00'

interface Profile {
  id: string
  user_id: string
  email: string
  nome: string | null
  status: 'pending' | 'active' | 'blocked'
  mentoria_type: string | null
  setor: string | null
  faturamento_medio: string | null
  num_funcionarios: string | null
  tempo_empresa: string | null
  created_at: string
  updated_at: string
}

type Tab = 'resumo' | 'mafia_black_sheep' | 'mentoria_atlas' | 'outras_mentorias' | 'assinante' | 'sem_categoria'

const TABS: { id: Tab; label: string }[] = [
  { id: 'resumo',           label: 'Resumo Geral' },
  { id: 'mafia_black_sheep',label: 'MAFIA Black Sheep' },
  { id: 'mentoria_atlas',   label: 'Mentoria ATLAS' },
  { id: 'outras_mentorias', label: 'Outras Mentorias' },
  { id: 'assinante',        label: 'Assinaturas' },
  { id: 'sem_categoria',    label: 'Sem Categoria' },
]

function StatusBadge({ status }: { status: Profile['status'] }) {
  if (status === 'active')  return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${GREEN}20`, color: GREEN, fontWeight: 600 }}>Ativo</span>
  if (status === 'pending') return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(234,179,8,0.15)', color: '#eab308', fontWeight: 600 }}>Aguardando</span>
  return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 600 }}>Bloqueado</span>
}

const MENTORIA_OPTIONS = [
  { value: 'mafia_black_sheep', label: 'MAFIA Black Sheep' },
  { value: 'mentoria_atlas',    label: 'Mentoria ATLAS' },
  { value: 'outras_mentorias',  label: 'Outras Mentorias' },
  { value: 'assinante',         label: 'Assinante' },
]

function EditMentoriaModal({ profile, onSave, onClose }: {
  profile: Profile
  onSave: (userId: string, mentoria: string) => Promise<void>
  onClose: () => void
}) {
  const [selected, setSelected] = useState(profile.mentoria_type ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    await onSave(profile.user_id, selected)
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 380 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Editar Mentoria</h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>{profile.email}</p>

        <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
          Mentoria
        </label>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', appearance: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          <option value="" style={{ background: '#000' }}>Selecione...</option>
          {MENTORIA_OPTIONS.map(o => (
            <option key={o.value} value={o.value} style={{ background: '#000' }}>{o.label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!selected || saving}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: selected ? '#fff' : 'rgba(255,255,255,0.1)', border: 'none', color: '#000', fontSize: 13, fontWeight: 700, cursor: selected ? 'pointer' : 'not-allowed' }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function UserRow({ profile, onApprove, onBlock, onDelete, onEdit }: {
  profile: Profile
  onApprove: (userId: string) => void
  onBlock: (userId: string) => void
  onDelete: (userId: string, email: string) => void
  onEdit?: (profile: Profile) => void
}) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            {profile.nome && <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{profile.nome}</span>}
            <span style={{ fontSize: 13, color: profile.nome ? 'rgba(255,255,255,0.45)' : '#fff', fontWeight: profile.nome ? 400 : 500 }}>{profile.email}</span>
            <StatusBadge status={profile.status} />
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {profile.setor && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{profile.setor}</span>}
            {profile.faturamento_medio && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{profile.faturamento_medio}</span>}
            {profile.num_funcionarios && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{profile.num_funcionarios} func.</span>}
            {profile.tempo_empresa && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{profile.tempo_empresa}</span>}
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              {format(new Date(profile.created_at), "dd/MM/yyyy")}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {onEdit && (
            <button
              onClick={() => onEdit(profile)}
              title="Editar mentoria"
              style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Pencil size={13} /> Editar
            </button>
          )}
          {profile.status !== 'active' && (
            <button
              onClick={() => onApprove(profile.user_id)}
              title="Aprovar"
              style={{ padding: '6px 12px', borderRadius: 8, background: `${GREEN}15`, border: `1px solid ${GREEN}30`, color: GREEN, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <CheckCircle2 size={13} /> Aprovar
            </button>
          )}
          {profile.status !== 'blocked' && (
            <button
              onClick={() => onBlock(profile.user_id)}
              title="Bloquear"
              style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <XCircle size={13} /> Bloquear
            </button>
          )}
          <button
            onClick={() => onDelete(profile.user_id, profile.email)}
            title="Excluir"
            style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

function MentoriaTab({ profiles, onApprove, onBlock, onDelete, onEdit }: {
  profiles: Profile[]
  onApprove: (userId: string) => void
  onBlock: (userId: string) => void
  onDelete: (userId: string, email: string) => void
  onEdit?: (profile: Profile) => void
}) {
  const pending = profiles.filter(p => p.status === 'pending')
  const rest    = profiles.filter(p => p.status !== 'pending')

  if (profiles.length === 0) {
    return <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '48px 0' }}>Nenhum usuário nesta mentoria.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {pending.length > 0 && (
        <div style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Clock size={14} color="#eab308" />
            <span style={{ fontSize: 11, color: '#eab308', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Aguardando Aprovação — {pending.length}
            </span>
          </div>
          {pending.map(p => (
            <UserRow key={p.user_id} profile={p} onApprove={onApprove} onBlock={onBlock} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
      {rest.length > 0 && (
        <Card>
          {rest.map(p => (
            <UserRow key={p.user_id} profile={p} onApprove={onApprove} onBlock={onBlock} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </Card>
      )}
    </div>
  )
}

export function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('resumo')
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)

  async function fetchProfiles() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setProfiles(data as Profile[])
    setLoading(false)
  }

  useEffect(() => { fetchProfiles() }, [])

  async function handleApprove(userId: string) {
    await supabase.from('profiles')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
    setProfiles(prev => prev.map(p => p.user_id === userId ? { ...p, status: 'active' } : p))

    const profile = profiles.find(p => p.user_id === userId)
    if (profile) {
      try {
        await supabase.functions.invoke('send-approval-email', {
          body: { email: profile.email, nome: profile.nome }
        })
      } catch (e) {
        console.error('Erro ao enviar email de aprovação:', e)
      }
    }
  }

  async function handleBlock(userId: string) {
    await supabase.from('profiles')
      .update({ status: 'blocked', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
    setProfiles(prev => prev.map(p => p.user_id === userId ? { ...p, status: 'blocked' } : p))
  }

  async function handleEditMentoria(userId: string, mentoria: string) {
    await supabase.from('profiles')
      .update({ mentoria_type: mentoria, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
    setProfiles(prev => prev.map(p => p.user_id === userId ? { ...p, mentoria_type: mentoria } : p))
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Excluir usuário ${email}? Todos os dados serão apagados permanentemente.`)) return
    await supabase.functions.invoke('admin-delete-user', { body: { userId } })
    setProfiles(prev => prev.filter(p => p.user_id !== userId))
  }

  // Computed stats
  const totalActive  = profiles.filter(p => p.status === 'active').length
  const totalPending = profiles.filter(p => p.status === 'pending').length
  const totalBlocked = profiles.filter(p => p.status === 'blocked').length

  const setorRanking = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of profiles) if (p.setor) counts[p.setor] = (counts[p.setor] || 0) + 1
    const max = Math.max(...Object.values(counts), 1)
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count, pct: (count / max) * 100 }))
  }, [profiles])

  const faturRanking = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of profiles) if (p.faturamento_medio) counts[p.faturamento_medio] = (counts[p.faturamento_medio] || 0) + 1
    const max = Math.max(...Object.values(counts), 1)
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count, pct: (count / max) * 100 }))
  }, [profiles])

  const growthChart = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const ref = subMonths(now, 11 - i)
      const monthStr = format(startOfMonth(ref), 'yyyy-MM')
      const count = profiles.filter(p => p.status === 'active' && p.created_at.startsWith(monthStr)).length
      return { mes: format(ref, 'MMM/yy', { locale: ptBR }), ativos: count }
    })
  }, [profiles])

  const profilesByMentoria = (mentoria: string) =>
    mentoria === 'sem_categoria'
      ? profiles.filter(p => !p.mentoria_type)
      : profiles.filter(p => p.mentoria_type === mentoria)

  const tabStyle = (id: Tab): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: tab === id ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: tab === id ? '#fff' : 'rgba(255,255,255,0.4)',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  })

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Admin — ATLAS</h2>
        <p className="text-sm text-white/50 mt-1">Gerenciamento de usuários e cadastros</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4 }}>
        {TABS.map(t => (
          <button key={t.id} style={tabStyle(t.id)} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id !== 'resumo' && (
              <span style={{ marginLeft: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                {t.id === 'sem_categoria'
                  ? profiles.filter(p => !p.mentoria_type).length
                  : profiles.filter(p => p.mentoria_type === t.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/35">Carregando...</div>
      ) : (
        <>
          {/* ── TAB: RESUMO ── */}
          {tab === 'resumo' && (
            <div className="space-y-6">
              {/* Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Usuários Ativos', value: totalActive, color: GREEN },
                  { label: 'Pendentes de Aprovação', value: totalPending, color: '#eab308' },
                  { label: 'Bloqueados', value: totalBlocked, color: '#ef4444' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px' }}>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{label}</p>
                    <p style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ranking setores */}
                <Card>
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-5">Principais Setores</h3>
                  {setorRanking.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-4">Sem dados</p>
                  ) : (
                    <div className="space-y-3">
                      {setorRanking.map(({ name, count, pct }) => (
                        <div key={name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{name}</span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{count}</span>
                          </div>
                          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                            <div style={{ height: 4, width: `${pct}%`, background: GREEN, borderRadius: 2, transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Ranking faturamento */}
                <Card>
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-5">Faturamento Médio</h3>
                  {faturRanking.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-4">Sem dados</p>
                  ) : (
                    <div className="space-y-3">
                      {faturRanking.map(({ name, count, pct }) => (
                        <div key={name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{name}</span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{count}</span>
                          </div>
                          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                            <div style={{ height: 4, width: `${pct}%`, background: '#60a5fa', borderRadius: 2, transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Gráfico crescimento */}
              <Card>
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-6">Crescimento Mensal — Usuários Ativos</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={growthChart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      itemStyle={{ fontSize: 12 }}
                      formatter={(v) => [v, 'Usuários ativos']}
                    />
                    <Line type="monotone" dataKey="ativos" stroke={GREEN} strokeWidth={2} dot={{ fill: GREEN, r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {/* ── TABS DE MENTORIA ── */}
          {tab !== 'resumo' && (
            <MentoriaTab
              profiles={profilesByMentoria(tab)}
              onApprove={handleApprove}
              onBlock={handleBlock}
              onDelete={handleDelete}
              onEdit={tab === 'sem_categoria' ? setEditingProfile : undefined}
            />
          )}

          {/* Modal editar mentoria */}
          {editingProfile && (
            <EditMentoriaModal
              profile={editingProfile}
              onSave={handleEditMentoria}
              onClose={() => setEditingProfile(null)}
            />
          )}
        </>
      )}
    </div>
  )
}
