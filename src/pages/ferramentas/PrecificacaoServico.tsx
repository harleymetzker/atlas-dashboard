import { useState, useEffect, useMemo } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useDreDefaults } from '../../hooks/useDreDefaults'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { formatCurrency } from '../../lib/calculations'

interface PricingService {
  id: string
  name: string
  custo_mensal_pessoal: number
  num_profissionais: number
  dias_mes: number
  horas_dia: number
  fator_produtividade: number
  custo_variavel: number
  custo_fixo: number
  meta_faturamento: number
  impostos: number
  horas_disponiveis: number
  custo_hora: number
  preco_hora_sugerido: number
}

const defaultForm = {
  name: '',
  custo_mensal_pessoal: '',
  num_profissionais: '1',
  dias_mes: '22',
  horas_dia: '8',
  fator_produtividade: '80',
  custo_variavel: '',
  custo_fixo: '',
  meta_faturamento: '',
  impostos: '',
}

function n(v: string) { return parseFloat(v) || 0 }

function NumInput({ label, value, onChange, suffix, tooltip }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  suffix?: string; tooltip?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-white/40 uppercase tracking-widest">{label}</label>
        {tooltip && (
          <span className="text-[10px] text-white/25 normal-case" title={tooltip}>ⓘ</span>
        )}
      </div>
      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/30 transition-colors">
        <input
          type="number" min="0" step="0.01" value={value} onChange={onChange}
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none tabular-nums"
          placeholder="0"
        />
        {suffix && <span className="pr-4 text-sm text-white/30">{suffix}</span>}
      </div>
    </div>
  )
}

function PctInput({ label, value, onChange, badge }: {
  label: string; value: string; onChange: (v: string) => void; badge?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs text-white/40 uppercase tracking-widest">{label}</label>
        {badge && (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">{badge}</span>
        )}
      </div>
      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/30 transition-colors">
        <input
          type="number" min="0" max="100" step="0.01" value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none tabular-nums"
          placeholder="0"
        />
        <span className="pr-4 text-sm text-white/30">%</span>
      </div>
    </div>
  )
}

export function PrecificacaoServico() {
  const { user } = useAuth()
  const { defaults, loading: loadingDefaults } = useDreDefaults()
  const [form, setForm] = useState(defaultForm)
  const [services, setServices] = useState<PricingService[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const dreBadge = defaults.hasData ? defaults.referenciaMes : undefined

  useEffect(() => {
    if (!defaults.hasData || loadingDefaults) return
    setForm(f => ({
      ...f,
      impostos: f.impostos || defaults.impostos.toFixed(2),
      custo_variavel: f.custo_variavel || (defaults.taxas_cartao + defaults.marketing + defaults.comissoes).toFixed(2),
      custo_fixo: f.custo_fixo || (
        (defaults.rh + defaults.ocupacao + defaults.administrativo) / 100 * defaults.faturamentoLiquido
      ).toFixed(2),
    }))
  }, [defaults.hasData, loadingDefaults])

  useEffect(() => { loadServices() }, [user])

  async function loadServices() {
    if (!user) return
    const { data } = await supabase.from('pricing_services').select('*').order('created_at', { ascending: false })
    if (data) setServices(data as PricingService[])
  }

  const calc = useMemo(() => {
    const custoMensalPessoal = n(form.custo_mensal_pessoal)
    const numProf = n(form.num_profissionais) || 1
    const diasMes = n(form.dias_mes) || 22
    const horasDia = n(form.horas_dia) || 8
    const fatorProd = n(form.fator_produtividade) / 100
    const custoVariavel = n(form.custo_variavel) / 100
    const custoFixo = n(form.custo_fixo)
    const metaFaturamento = n(form.meta_faturamento)
    const impostos = n(form.impostos) / 100

    const horasDisponiveis = numProf * diasMes * horasDia * (11 / 12) * fatorProd
    const custoHora = horasDisponiveis > 0 ? custoMensalPessoal / horasDisponiveis : 0
    const impostoDivisor = 1 - impostos
    const custoVariavelDivisor = 1 - custoVariavel
    const precoHora = horasDisponiveis > 0 && impostoDivisor > 0 && custoVariavelDivisor > 0
      ? (((custoFixo + metaFaturamento) / horasDisponiveis) + custoHora) / custoVariavelDivisor / impostoDivisor
      : 0

    return { horasDisponiveis, custoHora, precoHora }
  }, [form])

  function setStr(key: keyof typeof defaultForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function handleEdit(s: PricingService) {
    setEditingId(s.id)
    setForm({
      name: s.name,
      custo_mensal_pessoal: String(s.custo_mensal_pessoal),
      num_profissionais: String(s.num_profissionais),
      dias_mes: String(s.dias_mes),
      horas_dia: String(s.horas_dia),
      fator_produtividade: String(s.fator_produtividade),
      custo_variavel: String(s.custo_variavel),
      custo_fixo: String(s.custo_fixo),
      meta_faturamento: String(s.meta_faturamento),
      impostos: String(s.impostos),
    })
  }

  function handleReset() {
    setEditingId(null)
    setForm({
      ...defaultForm,
      impostos: defaults.impostos.toFixed(2),
      custo_variavel: (defaults.taxas_cartao + defaults.marketing + defaults.comissoes).toFixed(2),
    })
  }

  async function handleSave() {
    if (!user || !form.name.trim()) return
    setSaving(true)

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      custo_mensal_pessoal: n(form.custo_mensal_pessoal),
      num_profissionais: n(form.num_profissionais),
      dias_mes: n(form.dias_mes),
      horas_dia: n(form.horas_dia),
      fator_produtividade: n(form.fator_produtividade),
      custo_variavel: n(form.custo_variavel),
      custo_fixo: n(form.custo_fixo),
      meta_faturamento: n(form.meta_faturamento),
      impostos: n(form.impostos),
      horas_disponiveis: calc.horasDisponiveis,
      custo_hora: calc.custoHora,
      preco_hora_sugerido: calc.precoHora,
      updated_at: new Date().toISOString(),
    }

    if (editingId) {
      await supabase.from('pricing_services').update(payload).eq('id', editingId)
    } else {
      const { data: existing } = await supabase
        .from('pricing_services').select('id').eq('user_id', user.id).eq('name', payload.name).maybeSingle()
      if (existing) {
        if (!confirm(`Já existe um serviço com o nome "${payload.name}". Deseja atualizar?`)) { setSaving(false); return }
        await supabase.from('pricing_services').update(payload).eq('id', existing.id)
      } else {
        await supabase.from('pricing_services').insert(payload)
      }
    }

    await loadServices()
    handleReset()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este serviço?')) return
    await supabase.from('pricing_services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
    if (editingId === id) handleReset()
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Precificação de Serviço</h2>
        <p className="text-sm text-white/30 mt-1">Calcule o preço/hora considerando equipe, produtividade e custos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
          <div className="space-y-5">
            <Input label="Nome do serviço" value={form.name} onChange={setStr('name')} placeholder="Ex: Consultoria X" />

            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Equipe e Capacidade</p>
              <div className="space-y-4">
                <CurrencyInput label="Custo Mensal do Pessoal (R$)" value={form.custo_mensal_pessoal} onChange={v => setForm(f => ({ ...f, custo_mensal_pessoal: v }))} />
                <div className="grid grid-cols-2 gap-3">
                  <NumInput label="Nº de Profissionais" value={form.num_profissionais} onChange={setStr('num_profissionais')} />
                  <NumInput label="Dias por Mês" value={form.dias_mes} onChange={setStr('dias_mes')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput label="Horas por Dia" value={form.horas_dia} onChange={setStr('horas_dia')} suffix="h" />
                  <PctInput
                    label="Fator de Produtividade"
                    value={form.fator_produtividade}
                    onChange={v => setForm(f => ({ ...f, fator_produtividade: v }))}
                  />
                </div>
                <p className="text-xs text-white/20">Fator de produtividade: % do tempo efetivamente dedicado ao serviço</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs text-white/30 uppercase tracking-widest">Custos e Metas</p>
                {defaults.hasData && !loadingDefaults && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                    Baseado em {defaults.referenciaMes}
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <PctInput label="Custo Variável Mensal — % média" value={form.custo_variavel} onChange={v => setForm(f => ({ ...f, custo_variavel: v }))} badge={dreBadge} />
                <CurrencyInput label="Custo Fixo Mensal (R$)" value={form.custo_fixo} onChange={v => setForm(f => ({ ...f, custo_fixo: v }))} badge={dreBadge} />
                <CurrencyInput label="Meta de Faturamento (R$)" value={form.meta_faturamento} onChange={v => setForm(f => ({ ...f, meta_faturamento: v }))} />
                <PctInput label="Impostos" value={form.impostos} onChange={v => setForm(f => ({ ...f, impostos: v }))} badge={dreBadge} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {editingId && <Button variant="secondary" onClick={handleReset} className="flex-1">Cancelar</Button>}
              <Button onClick={handleSave} loading={saving} disabled={!form.name.trim()} className="flex-1">
                {editingId ? 'Atualizar Serviço' : 'Salvar Serviço'}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-5">Resultado</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Horas disponíveis/mês</span>
              <span className="text-sm font-semibold text-white tabular-nums">
                {calc.horasDisponiveis > 0 ? `${calc.horasDisponiveis.toFixed(1)} h` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Custo por hora</span>
              <span className="text-sm font-semibold text-white tabular-nums">{formatCurrency(calc.custoHora)}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-y border-white/10">
              <span className="text-sm font-semibold text-white">Preço/Hora Sugerido</span>
              <span className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(calc.precoHora)}</span>
            </div>
          </div>
        </Card>
      </div>

      {services.length > 0 && (
        <Card>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-5">Serviços Salvos</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-white/30 uppercase tracking-widest">
                  <th className="text-left pb-4">Nome</th>
                  <th className="text-right pb-4">Preço/Hora</th>
                  <th className="text-right pb-4">Horas Disponíveis</th>
                  <th className="text-right pb-4">Custo/Hora</th>
                  <th className="text-right pb-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {services.map(s => (
                  <tr key={s.id} className="group text-white/70">
                    <td className="py-3 font-medium text-white">{s.name}</td>
                    <td className="py-3 text-right tabular-nums text-emerald-400 font-semibold">{formatCurrency(s.preco_hora_sugerido)}</td>
                    <td className="py-3 text-right tabular-nums">{s.horas_disponiveis.toFixed(1)} h</td>
                    <td className="py-3 text-right tabular-nums">{formatCurrency(s.custo_hora)}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
