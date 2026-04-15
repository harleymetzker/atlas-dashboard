import type { SelectHTMLAttributes } from 'react'

interface OptionGroup {
  group: string
  options: { value: string; label: string }[]
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options?: { value: string; label: string }[]
  groups?: OptionGroup[]
  error?: string
}

export function Select({ label, options, groups, error, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-white/70 uppercase tracking-widest">{label}</label>}
      <select
        {...props}
        className={`bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/15'} rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/50 transition-colors w-full ${className}`}
      >
        {groups
          ? groups.map(g => (
              <optgroup key={g.group} label={g.group} className="bg-[#111] text-white/70">
                {g.options.map(o => (
                  <option key={o.value} value={o.value} className="bg-[#111] text-white">
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))
          : options?.map(o => (
              <option key={o.value} value={o.value} className="bg-[#111] text-white">
                {o.label}
              </option>
            ))}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
