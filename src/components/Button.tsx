import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline'
  large?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  large = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${large ? 'btn-large' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
