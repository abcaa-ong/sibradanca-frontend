import { PropsWithChildren } from 'react'

type BadgeProps = PropsWithChildren<{
  dark?: boolean
  subtle?: boolean
  tone?: 'default' | 'pink' | 'blue'
}>

export function Badge({ children, dark = false, subtle = false, tone = 'default' }: BadgeProps) {
  const toneClass = tone === 'pink' ? 'badge-pink' : tone === 'blue' ? 'badge-blue' : 'badge-default'
  return <span className={`badge ${toneClass} ${dark ? 'badge-dark' : ''} ${subtle ? 'badge-subtle' : ''}`}>{children}</span>
}
