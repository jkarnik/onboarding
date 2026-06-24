import type { ButtonHTMLAttributes, ReactNode } from 'react'

const STYLES = {
  primary: { background: 'var(--blue)', color: '#fff', border: '1px solid var(--blue)' },
  ghost: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' },
  danger: { background: 'var(--red)', color: '#fff', border: '1px solid var(--red)' },
} as const

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof STYLES
  children: ReactNode
}

export function Button({ variant = 'primary', children, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        ...STYLES[variant],
        padding: '8px 14px', borderRadius: 'var(--radius)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
