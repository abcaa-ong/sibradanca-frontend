import { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{
  hover?: boolean
  className?: string
}>

export function Card({ children, hover = false, className = '' }: CardProps) {
  return <div className={`card ${hover ? 'card-hover' : ''} ${className}`.trim()}>{children}</div>
}
