import { useState, useEffect, useRef } from 'react'

function formatDisplay(raw: string): string {
  if (!raw) return ''
  const [intPart, decPart] = raw.split('.')
  const intNum = parseInt(intPart || '0', 10)
  const intFormatted = isNaN(intNum) ? '' : intNum.toLocaleString('pt-BR')
  return decPart !== undefined ? `${intFormatted},${decPart}` : intFormatted
}

interface CurrencyInputProps {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  badge?: string
}

export function CurrencyInput({ label, value, onChange, placeholder = '0', badge }: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatDisplay(value))
  const lastEmitted = useRef(value)

  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value
      setDisplay(formatDisplay(value))
    }
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value

    if (!input) {
      setDisplay('')
      lastEmitted.current = ''
      onChange('')
      return
    }

    // Keep only digits and comma (pt-BR decimal separator)
    const stripped = input.replace(/[^\d,]/g, '')

    const commaIdx = stripped.indexOf(',')
    let intStr: string
    let decStr: string | undefined

    if (commaIdx !== -1) {
      intStr = stripped.slice(0, commaIdx)
      decStr = stripped.slice(commaIdx + 1, commaIdx + 3)
    } else {
      intStr = stripped
    }

    const intNum = parseInt(intStr, 10)
    const intFormatted = !intStr ? '' : isNaN(intNum) ? '' : intNum.toLocaleString('pt-BR')

    const newDisplay = decStr !== undefined ? `${intFormatted},${decStr}` : intFormatted
    const jsValue = decStr !== undefined ? `${intStr || '0'}.${decStr}` : intStr || ''

    setDisplay(newDisplay)
    lastEmitted.current = jsValue
    onChange(jsValue)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {(label || badge) && (
        <div className="flex items-center gap-2 flex-wrap">
          {label && <label className="text-xs text-white/60 uppercase tracking-widest">{label}</label>}
          {badge && (
            <span className="text-[10px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-1.5 py-0.5 rounded-md">{badge}</span>
          )}
        </div>
      )}
      <div className="flex items-center bg-white/5 border border-white/15 rounded-xl overflow-hidden focus-within:border-white/50 transition-colors">
        <input
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none tabular-nums"
        />
        <span className="pr-4 text-sm text-white/50">R$</span>
      </div>
    </div>
  )
}
