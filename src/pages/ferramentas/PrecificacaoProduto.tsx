import { useState, useEffect, useMemo } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useDreDefaults } from '../../hooks/useDreDefaults'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../lib/calculations'

interface PricingProduct {
  id: string
  name: string
  cmv: number
  meta_lucro: number
  impostos: number
  taxas_cartao: number
  marketing: number
  comissoes: number
  logistica: number
  rh: number
  ocupacao: number
  administrativo: number
  preco_liquido_sugerido: number
  preco_final_sugerido: number
  markup: number
  margem_lucro_calculada: number
}

const defaultForm = {
  name: '',
  cmv: '',
  meta_lucro: '',
  impostos: '',
  taxas_cartao: '',
  marketing: '',
  comissoes: '',
  logistica: '',
  rh: '',
  ocupacao: '',
  administrativo: '',
}

function n(v: string) { return parseFloat(v) || 0 }

function PctInput({ label, value, onChange, badge }: {
  label: string
  value: string
  onChange: (v: string) => void
  badge?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs text-white/40 uppercase tracking-widest">{label}</label>
        {badge && (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
            {badge}
          </span>
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

export function PrecificacaoProduto() {
  const { user } = useAuth()
  const { defaults, loading: loadingDefaults } = useDreDefaults()
  const [form, setForm] = useState(defaultForm)
  const [products, setProducts] = useState<PricingProduct[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const dreBadge = defaults.hasData ? defaults.referenciaMes : undefined

  // Pre-fill DRE defaults when loaded
  useEffect(() => {
    if (!defaults.hasData || loadingDefaults) return
    setForm(f => ({
      ...f,
      impostos: f.impostos || defaults.impostos.toFixed(2),
      taxas_cartao: f.taxas_cartao || defaults.taxas_cartao.toFixed(2),
      marketing: f.marketing || defaults.marketing.toFixed(2),
      comissoes: f.comissoes || defaults.comissoes.toFixed(2),
      rh: f.rh || defaults.rh.toFixed(2),
      ocupacao: f.ocupacao || defaults.ocupacao.toFixed(2),
      administrativo: f.administrativo || defaults.administrativo.toFixed(2),
    }))
  }, [defaults.hasData, loadingDefaults])

  useEffect(() => { loadProducts() }, [user])

  async function loadProducts() {
    if (!user) return
    const { data } = await supabase.from('pricing_products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data as PricingProduct[])
  }

  const calc = useMemo(() => {
    const cmv = n(form.cmv)
    const metaLucro = n(form.meta_lucro)
    const impostos = n(form.impostos)
    const taxasCartao = n(form.taxas_cartao)
    const marketing = n(form.marketing)
    const comissoes = n(form.comissoes)
    const logistica = n(form.logistica)
    const rh = n(form.rh)
    const ocupacao = n(form.ocupacao)
    const administrativo = n(form.administrativo)

    const metaMargemBruta = metaLucro + rh + ocupacao + administrativo + marketing + comissoes + taxasCartao + logistica
    const divisor = 1 - metaMargemBruta / 100
    const precoLiquido = divisor > 0 && cmv > 0 ? cmv / divisor : 0
    const impostoDivisor = 1 - impostos / 100
    const precoFinal = impostoDivisor > 0 && precoLiquido > 0 ? precoLiquido / impostoDivisor : 0
    const markup = cmv > 0 && precoFinal > 0 ? precoFinal / cmv : 0

    return { metaMargemBruta, precoLiquido, precoFinal, markup }
  }, [form])

  function setStr(key: keyof typeof defaultForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function setPct(key: keyof typeof defaultForm) {
    return (v: string) => setForm(f => ({ ...f, [key]: v }))
  }

  function handleEdit(p: PricingProduct) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      cmv: String(p.cmv),
      meta_lucro: String(p.meta_lucro),
      impostos: String(p.impostos),
      taxas_cartao: String(p.taxas_cartao),
      marketing: String(p.marketing),
      comissoes: String(p.comissoes),
      logistica: String(p.logistica),
      rh: String(p.rh),
      ocupacao: String(p.ocupacao),
      administrativo: String(p.administrativo),
    })
  }

  function handleReset() {
    setEditingId(null)
    setForm({
      ...defaultForm,
      impostos: defaults.impostos.toFixed(2),
      taxas_cartao: defaults.taxas_cartao.toFixed(2),
      marketing: defaults.marketing.toFixed(2),
      comissoes: defaults.comissoes.toFixed(2),
      rh: defaults.rh.toFixed(2),
      ocupacao: defaults.ocupacao.toFixed(2),
      administrativo: defaults.administrativo.toFixed(2),
    })
  }

  async function handleSave() {
    if (!user || !form.name.trim()) return
    setSaving(true)

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      cmv: n(form.cmv),
      meta_lucro: n(form.meta_lucro),
      impostos: n(form.impostos),
      taxas_cartao: n(form.taxas_cartao),
      marketing: n(form.marketing),
      comissoes: n(form.comissoes),
      logistica: n(form.logistica),
      rh: n(form.rh),
      ocupacao: n(form.ocupacao),
      administrativo: n(form.administrativo),
      preco_liquido_sugerido: calc.precoLiquido,
      preco_final_sugerido: calc.precoFinal,
      markup: calc.markup,
      margem_lucro_calculada: n(form.meta_lucro),
      updated_at: new Date().toISOString(),
    }

    if (editingId) {
      await supabase.from('pricing_products').update(payload).eq('id', editingId)
    } else {
      const { data: existing } = await supabase
        .from('pricing_products').select('id').eq('user_id', user.id).eq('name', payload.name).maybeSingle()
      if (existing) {
        if (!confirm(`Já existe um produto com o nome "${payload.name}". Deseja atualizar?`)) { setSaving(false); return }
        await supabase.from('pricing_products').update(payload).eq('id', existing.id)
      } else {
        await supabase.from('pricing_products').insert(payload)
      }
    }

    await loadProducts()
    handleReset()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este produto?')) return
    await supabase.from('pricing_products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    if (editingId === id) handleReset()
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Precificação de Produto</h2>
        <p className="text-sm text-white/30 mt-1">Calcule o preço correto considerando todos os seus custos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
          <div className="space-y-5">
            <Input label="Nome do produto" value={form.name} onChange={setStr('name')} placeholder="Ex: Produto X" />

            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Custos do Produto</p>
              <div className="space-y-4">
                <Input label="CMV — Custo da Mercadoria (R$)" type="number" value={form.cmv} onChange={setStr('cmv')} placeholder="0,00" min="0" step="0.01" />
                <PctInput label="Meta de Lucro" value={form.meta_lucro} onChange={setPct('meta_lucro')} />
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs text-white/30 uppercase tracking-widest">Custos Operacionais</p>
                {defaults.hasData && !loadingDefaults && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                    Baseado em {defaults.referenciaMes}
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <PctInput label="Impostos sobre Faturamento" value={form.impostos} onChange={setPct('impostos')} badge={dreBadge} />
                <PctInput label="Taxas de Cartão" value={form.taxas_cartao} onChange={setPct('taxas_cartao')} badge={dreBadge} />
                <PctInput label="Marketing e Anúncios" value={form.marketing} onChange={setPct('marketing')} badge={dreBadge} />
                <PctInput label="Comissões de Venda" value={form.comissoes} onChange={setPct('comissoes')} badge={dreBadge} />
                <PctInput label="Logística" value={form.logistica} onChange={setPct('logistica')} />
                <PctInput label="RH — % média" value={form.rh} onChange={setPct('rh')} badge={dreBadge} />
                <PctInput label="Ocupação — % média" value={form.ocupacao} onChange={setPct('ocupacao')} badge={dreBadge} />
                <PctInput label="Administrativo — % média" value={form.administrativo} onChange={setPct('administrativo')} badge={dreBadge} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {editingId && <Button variant="secondary" onClick={handleReset} className="flex-1">Cancelar</Button>}
              <Button onClick={handleSave} loading={saving} disabled={!form.name.trim()} className="flex-1">
                {editingId ? 'Atualizar Produto' : 'Salvar Produto'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-5">Resultado</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Meta Margem Bruta</span>
              <span className="text-sm font-semibold text-white tabular-nums">{calc.metaMargemBruta.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Preço Líquido Sugerido</span>
              <span className="text-sm font-semibold text-white tabular-nums">{formatCurrency(calc.precoLiquido)}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-y border-white/10">
              <span className="text-sm font-semibold text-white">Preço Final Sugerido</span>
              <span className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(calc.precoFinal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Mark-up</span>
              <span className="text-sm font-semibold text-white tabular-nums">
                {calc.markup > 0 ? `${calc.markup.toFixed(2)}x` : '—'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Saved Products */}
      {products.length > 0 && (
        <Card>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-5">Produtos Salvos</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-white/30 uppercase tracking-widest">
                  <th className="text-left pb-4">Nome</th>
                  <th className="text-right pb-4">Preço Final</th>
                  <th className="text-right pb-4">Mark-up</th>
                  <th className="text-right pb-4">Meta Lucro</th>
                  <th className="text-right pb-4">CMV</th>
                  <th className="text-right pb-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map(p => (
                  <tr key={p.id} className="group text-white/70">
                    <td className="py-3 font-medium text-white">{p.name}</td>
                    <td className="py-3 text-right tabular-nums text-emerald-400 font-semibold">{formatCurrency(p.preco_final_sugerido)}</td>
                    <td className="py-3 text-right tabular-nums">{p.markup.toFixed(2)}x</td>
                    <td className="py-3 text-right tabular-nums">{p.meta_lucro.toFixed(1)}%</td>
                    <td className="py-3 text-right tabular-nums">{formatCurrency(p.cmv)}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
