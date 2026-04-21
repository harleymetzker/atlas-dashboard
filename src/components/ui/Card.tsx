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
      className={`bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 ${onClick ? 'cursor-pointer hover:border-white/20 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
