import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs text-white/50 uppercase tracking-widest">{label}</label>}
    <input
      ref={ref}
      {...props}
      className={`bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors w-full ${className}`}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
))
Input.displayName = 'Input'
