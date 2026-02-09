import { useMemo, useState } from 'react'
import type { CredentialWithImpact } from '../../lib/types'
import { getWeekLabel } from '../../lib/dateUtils'
import { UrgencyBadge, Card, CardTitle, CardContent } from '../ui'
import styles from './UpcomingRenewals.module.css'

interface UpcomingRenewalsProps {
  credentials: CredentialWithImpact[]
  onCredentialClick: (credential: CredentialWithImpact) => void
}

interface RenewalGroup {
  label: string
  credentials: CredentialWithImpact[]
}

export function UpcomingRenewals({ credentials, onCredentialClick }: UpcomingRenewalsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['This week', 'Next week']))

  const groups = useMemo(() => {
    const groupMap = new Map<string, CredentialWithImpact[]>()

    credentials.forEach((cred) => {
      if (cred.daysRemaining === null) return
      const label = getWeekLabel(cred.daysRemaining)
      const existing = groupMap.get(label) || []
      groupMap.set(label, [...existing, cred])
    })

    // Order groups chronologically
    const order = ['Overdue', 'This week', 'Next week', 'In 2 weeks', 'In 3 weeks', 'In 4 weeks', 'In 5-8 weeks', 'Later']
    const result: RenewalGroup[] = []

    order.forEach((label) => {
      const creds = groupMap.get(label)
      if (creds && creds.length > 0) {
        result.push({ label, credentials: creds })
      }
    })

    return result
  }, [credentials])

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  if (groups.length === 0) {
    return (
      <Card className={styles.card}>
        <CardTitle className={styles.title}>Upcoming Renewals</CardTitle>
        <CardContent>
          <div className={styles.empty}>
            <CalendarIcon />
            <p>No renewals in the next 60 days</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={styles.card}>
      <CardTitle className={styles.title}>Upcoming Renewals</CardTitle>
      <CardContent className={styles.content}>
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.label)
          const isUrgent = group.label === 'Overdue' || group.label === 'This week'

          return (
            <div key={group.label} className={styles.group}>
              <button
                className={`${styles.groupHeader} ${isUrgent ? styles.urgent : ''}`}
                onClick={() => toggleGroup(group.label)}
                aria-expanded={isExpanded}
              >
                <div className={styles.groupInfo}>
                  <span className={styles.groupLabel}>{group.label}</span>
                  <span className={styles.groupCount}>
                    {group.credentials.length} credential{group.credentials.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <svg
                  className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>

              {isExpanded && (
                <div className={styles.groupContent}>
                  {group.credentials.map((cred) => (
                    <button
                      key={cred.id}
                      className={styles.credentialItem}
                      onClick={() => onCredentialClick(cred)}
                    >
                      <span className={styles.credentialName}>{cred.name}</span>
                      <UrgencyBadge daysRemaining={cred.daysRemaining} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function CalendarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="10" width="36" height="32" rx="4" opacity="0.2" fill="currentColor" stroke="none" />
      <rect x="6" y="10" width="36" height="32" rx="4" />
      <path d="M6 18h36" />
      <path d="M16 6v8M32 6v8" strokeLinecap="round" />
    </svg>
  )
}
