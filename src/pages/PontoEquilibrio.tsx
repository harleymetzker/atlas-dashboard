import { useState } from 'react'
import { CurrencyInput } from '../components/ui/CurrencyInput'

function fmt(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function NumInput({
  label,
  value,
  onChange,
  suffix = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  suffix?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/60 uppercase tracking-widest">{label}</label>
      <div className="flex items-center bg-white/5 border border-white/15 rounded-xl overflow-hidden focus-within:border-white/50 transition-colors">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none tabular-nums"
          placeholder="0"
        />
        {suffix && <span className="pr-4 text-sm text-white/50">{suffix}</span>}
      </div>
    </div>
  )
}

const VAR_FIELDS = [
  { key: 'impostos',   label: 'Impostos' },
  { key: 'appsRate',   label: 'Taxas de Apps' },
  { key: 'cartao',     label: 'Taxas de Cartão' },
  { key: 'cmv',        label: 'CMV' },
  { key: 'comissoes',  label: 'Comissões' },
  { key: 'marketing',  label: 'Marketing' },
  { key: 'varOther1',  label: 'Outros 1' },
  { key: 'varOther2',  label: 'Outros 2' },
] as const

const FIX_FIELDS = [
  { key: 'time',        label: 'Despesas com Time' },
  { key: 'prolabore',   label: 'Pró-labore' },
  { key: 'ocupacao',    label: 'Ocupação' },
  { key: 'admin',       label: 'Despesas Administrativas' },
  { key: 'parcelas',    label: 'Parcelamentos / Empréstimos' },
  { key: 'fixOther1',   label: 'Outros 1' },
  { key: 'fixOther2',   label: 'Outros 2' },
] as const

type VarKey = typeof VAR_FIELDS[number]['key']
type FixKey = typeof FIX_FIELDS[number]['key']

type VarState = Record<VarKey, string>
type FixState = Record<FixKey, string>

const initVar: VarState = { impostos: '', appsRate: '', cartao: '', cmv: '', comissoes: '', marketing: '', varOther1: '', varOther2: '' }
const initFix: FixState = { time: '', prolabore: '', ocupacao: '', admin: '', parcelas: '', fixOther1: '', fixOther2: '' }

const SCENARIOS = [
  { pct: 0.8,  label: '80%' },
  { pct: 1.0,  label: '100%' },
  { pct: 1.2,  label: '120%' },
  { pct: 1.5,  label: '150%' },
  { pct: 2.0,  label: '200%' },
]

export function PontoEquilibrio() {
  const [varFields, setVarFields] = useState<VarState>(initVar)
  const [fixFields, setFixFields] = useState<FixState>(initFix)

  const setVar = (key: VarKey) => (v: string) => setVarFields(prev => ({ ...prev, [key]: v }))
  const setFix = (key: FixKey) => (v: string) => setFixFields(prev => ({ ...prev, [key]: v }))

  const totalVar = VAR_FIELDS.reduce((s, f) => s + (parseFloat(varFields[f.key]) || 0), 0)
  const margem   = Math.max(0, 100 - totalVar)
  const totalFix = FIX_FIELDS.reduce((s, f) => s + (parseFloat(fixFields[f.key]) || 0), 0)
  const pe       = margem > 0 ? totalFix / (margem / 100) : 0

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Logo */}
        <div className="text-center mb-12">
          <img src="/logo2.png" alt="ATLAS" className="h-20 mx-auto mb-2 block" />
          <p className="text-xs text-white/35 uppercase tracking-widest">Calculadora de Ponto de Equilíbrio</p>
        </div>

        {/* Custos Variáveis */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-5">
            Custos Variáveis <span className="text-white/35">(%)</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {VAR_FIELDS.map(f => (
              <NumInput key={f.key} label={f.label} value={varFields[f.key]} onChange={setVar(f.key)} suffix="%" />
            ))}
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-white/60 uppercase tracking-widest">Total variáveis</span>
              <span className="text-sm font-bold tabular-nums text-white">{totalVar.toFixed(2)}%</span>
            </div>
            <div className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-white/60 uppercase tracking-widest">Margem de contribuição</span>
              <span className={`text-sm font-bold tabular-nums ${margem > 0 ? 'text-brand-green' : 'text-red-400'}`}>{margem.toFixed(2)}%</span>
            </div>
          </div>
        </section>

        {/* Custos Fixos */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-5">
            Custos Fixos <span className="text-white/35">(R$/mês)</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {FIX_FIELDS.map(f => (
              <CurrencyInput key={f.key} label={f.label} value={fixFields[f.key]} onChange={setFix(f.key)} />
            ))}
          </div>
          <div className="mt-5 bg-white/5 border border-white/15 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-white/60 uppercase tracking-widest">Total custos fixos</span>
            <span className="text-sm font-bold tabular-nums text-white">{fmt(totalFix)}</span>
          </div>
        </section>

        {/* Resultado */}
        <section className="mb-10">
          <div className="bg-white/5 border border-white/15 rounded-2xl p-8 text-center mb-6">
            <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Faturamento mínimo mensal</p>
            <p className="text-4xl font-black tabular-nums text-white">
              {pe > 0 ? fmt(pe) : '—'}
            </p>
            {pe > 0 && (
              <p className="text-xs text-white/35 mt-2">
                Ponto de Equilíbrio = {fmt(totalFix)} ÷ {margem.toFixed(1)}%
              </p>
            )}
          </div>

          {/* Simulação */}
          {pe > 0 && (
            <div className="relative">
              <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 640 }}>
                <thead>
                  <tr className="text-xs text-white/50 uppercase tracking-widest">
                    <th className="text-left pb-4">Cenário</th>
                    <th className="text-right pb-4">Faturamento</th>
                    <th className="text-right pb-4">Custos Variáveis</th>
                    <th className="text-right pb-4">Custos Fixos</th>
                    <th className="text-right pb-4">Lucro / Prejuízo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {SCENARIOS.map(({ pct, label }) => {
                    const fat      = pe * pct
                    const custoVar = fat * (totalVar / 100)
                    const lucro    = fat - custoVar - totalFix
                    return (
                      <tr key={label} className={pct === 1 ? 'bg-white/5' : ''}>
                        <td className="py-3 text-white/70">{label} do PE</td>
                        <td className="py-3 text-right tabular-nums text-white/80">{fmt(fat)}</td>
                        <td className="py-3 text-right tabular-nums text-white/70">{fmt(custoVar)}</td>
                        <td className="py-3 text-right tabular-nums text-white/70">{fmt(totalFix)}</td>
                        <td className={`py-3 text-right tabular-nums font-semibold ${lucro >= 0 ? 'text-brand-green' : 'text-red-400'}`}>
                          {fmt(lucro)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
              <div aria-hidden className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-6" style={{ background: 'linear-gradient(to left, #000, transparent)' }} />
            </div>
          )}
        </section>

        {/* Rodapé */}
        <footer className="text-center text-xs text-white/35 pt-6 border-t border-white/5 space-y-1">
          <p>Ferramenta gratuita by ATLAS · by Black Sheep</p>
          <a
            href="https://atlasconsultoria.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white/60 transition-colors underline underline-offset-2"
          >
            Conheça o ATLAS
          </a>
        </footer>

      </div>
    </div>
  )
}
