export type UrgencyLevel = 'critical' | 'warning' | 'attention' | 'ok'

/**
 * Calculate days until a given date from today
 * Returns negative number if date is in the past (expired)
 */
export function getDaysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Get urgency level based on days remaining
 * - critical: expired or ≤7 days
 * - warning: 8-30 days
 * - attention: 31-60 days
 * - ok: >60 days
 */
export function getUrgencyLevel(daysRemaining: number | null): UrgencyLevel {
  if (daysRemaining === null) return 'ok'
  if (daysRemaining <= 7) return 'critical'
  if (daysRemaining <= 30) return 'warning'
  if (daysRemaining <= 60) return 'attention'
  return 'ok'
}

/**
 * Get urgency level directly from a date string
 */
export function getUrgencyFromDate(dateStr: string | undefined): UrgencyLevel {
  const days = getDaysUntil(dateStr)
  return getUrgencyLevel(days)
}

/**
 * Format days remaining as human-readable text
 */
export function formatDaysRemaining(daysRemaining: number | null): string {
  if (daysRemaining === null) return 'No expiration'
  if (daysRemaining < 0) {
    const overdue = Math.abs(daysRemaining)
    return overdue === 1 ? '1 day overdue' : `${overdue} days overdue`
  }
  if (daysRemaining === 0) return 'Expires today'
  if (daysRemaining === 1) return '1 day'
  return `${daysRemaining} days`
}

/**
 * Group credentials by week for timeline display
 */
export function getWeekLabel(daysRemaining: number): string {
  if (daysRemaining < 0) return 'Overdue'
  if (daysRemaining <= 7) return 'This week'
  if (daysRemaining <= 14) return 'Next week'
  if (daysRemaining <= 21) return 'In 2 weeks'
  if (daysRemaining <= 28) return 'In 3 weeks'
  if (daysRemaining <= 35) return 'In 4 weeks'
  if (daysRemaining <= 60) return 'In 5-8 weeks'
  return 'Later'
}

/**
 * Calculate priority score for sorting (higher = more urgent)
 * Formula: (1 / daysRemaining) × accountsAffected
 */
export function calculatePriorityScore(
  daysRemaining: number | null,
  accountsAffected: number
): number {
  if (daysRemaining === null) return 0
  if (daysRemaining <= 0) return 10000 * accountsAffected // Expired items get highest priority
  return (1 / daysRemaining) * accountsAffected * 100
}
