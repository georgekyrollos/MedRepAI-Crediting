import { forwardRef, type HTMLAttributes } from 'react'
import styles from './Badge.module.css'

export type BadgeVariant = 'default' | 'verified' | 'pass' | 'missing' | 'fail' | 'expired' | 'pending' | 'warning'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const classNames = [styles.badge, styles[variant], className].filter(Boolean).join(' ')

    return (
      <span ref={ref} className={classNames} {...props}>
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export function getStatusBadgeVariant(status: string): BadgeVariant {
  switch (status.toLowerCase()) {
    case 'verified':
    case 'pass':
    case 'complete':
      return 'pass'
    case 'missing':
    case 'fail':
      return 'fail'
    case 'expired':
      return 'expired'
    case 'pending':
      return 'pending'
    case 'warning':
      return 'warning'
    default:
      return 'default'
  }
}
