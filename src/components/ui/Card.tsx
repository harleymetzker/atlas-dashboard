import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 ${onClick ? 'cursor-pointer hover:border-white/35 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
