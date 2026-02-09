import type { CredentialWithImpact } from '../../lib/types'
import { UrgencyBadge, Button, Card, CardTitle, CardContent } from '../ui'
import styles from './ActionQueue.module.css'

interface ActionQueueProps {
  items: CredentialWithImpact[]
  onUpload: (credential: CredentialWithImpact) => void
  onViewAll: () => void
}

export function ActionQueue({ items, onUpload, onViewAll }: ActionQueueProps) {
  if (items.length === 0) {
    return (
      <Card className={styles.card}>
        <div className={styles.header}>
          <CardTitle>Action Required</CardTitle>
        </div>
        <CardContent>
          <div className={styles.empty}>
            <CheckCircleIcon />
            <p>All caught up! No urgent actions needed.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <CardTitle>Action Required</CardTitle>
          <span className={styles.count}>{items.length} items need attention</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </div>
      <CardContent className={styles.content}>
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemMain}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemImpact}>
                    Blocks {item.impactScore} account{item.impactScore !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className={styles.itemActions}>
                  <UrgencyBadge
                    daysRemaining={item.daysRemaining}
                    showExpiredLabel={item.status === 'expired'}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onUpload(item)}
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="24" cy="24" r="20" opacity="0.2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="24" r="20" />
      <path d="M16 24l6 6 12-12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
