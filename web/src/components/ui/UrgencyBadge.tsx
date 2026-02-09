import { forwardRef, type HTMLAttributes } from 'react'
import type { UrgencyLevel } from '../../lib/dateUtils'
import { getDaysUntil, getUrgencyLevel, formatDaysRemaining } from '../../lib/dateUtils'
import styles from './UrgencyBadge.module.css'

interface UrgencyBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Date string (ISO format) */
  date?: string
  /** Override: pass days directly instead of date */
  daysRemaining?: number | null
  /** Override: pass urgency level directly */
  urgency?: UrgencyLevel
  /** Show "Expired" for past dates instead of "X days overdue" */
  showExpiredLabel?: boolean
}

export const UrgencyBadge = forwardRef<HTMLSpanElement, UrgencyBadgeProps>(
  ({ date, daysRemaining: daysProp, urgency: urgencyProp, showExpiredLabel = false, className, ...props }, ref) => {
    // Calculate days from date if not provided directly
    const days = daysProp !== undefined ? daysProp : getDaysUntil(date)

    // Calculate urgency from days if not provided directly
    const urgency = urgencyProp || getUrgencyLevel(days)

    // Format display text
    let displayText: string
    if (days === null) {
      displayText = 'No expiration'
    } else if (days < 0 && showExpiredLabel) {
      displayText = 'Expired'
    } else {
      displayText = formatDaysRemaining(days)
    }

    const classNames = [
      styles.badge,
      styles[urgency],
      urgency === 'critical' && days !== null && days <= 0 ? styles.expired : '',
      className,
    ].filter(Boolean).join(' ')

    return (
      <span ref={ref} className={classNames} {...props}>
        {urgency === 'critical' && <span className={styles.dot} />}
        {displayText}
      </span>
    )
  }
)

UrgencyBadge.displayName = 'UrgencyBadge'
