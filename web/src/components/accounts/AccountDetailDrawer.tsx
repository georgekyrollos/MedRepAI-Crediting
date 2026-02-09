import { useEffect, useState } from 'react'
import type { AccountDetail, Credential } from '../../lib/types'
import { getAccountDetail } from '../../lib/api'
import { Drawer, DrawerSection, Button, Badge, UrgencyBadge } from '../ui'
import styles from './AccountDetailDrawer.module.css'

interface AccountDetailDrawerProps {
  accountId: string | null
  onClose: () => void
  onUploadCredential: (credential: Credential) => void
  onStartUnlockWizard: (accountId: string) => void
}

export function AccountDetailDrawer({
  accountId,
  onClose,
  onUploadCredential,
  onStartUnlockWizard,
}: AccountDetailDrawerProps) {
  const [account, setAccount] = useState<AccountDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!accountId) {
      setAccount(null)
      return
    }

    async function loadAccount(id: string) {
      setLoading(true)
      try {
        const data = await getAccountDetail(id)
        setAccount(data)
      } catch (error) {
        console.error('Failed to load account detail:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAccount(accountId)
  }, [accountId])

  const hasBlockingCredentials = !!(account && account.blockingCredentials.length > 0)

  return (
    <Drawer
      open={!!accountId}
      onClose={onClose}
      title={account?.name || 'Loading...'}
      subtitle={account ? `${account.city}, ${account.state} · ${account.locationCount} locations` : undefined}
      footer={
        hasBlockingCredentials ? (
          <Button onClick={() => accountId && onStartUnlockWizard(accountId)}>
            Fix This Account
          </Button>
        ) : undefined
      }
    >
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading account details...</p>
        </div>
      ) : account ? (
        <>
          {/* Account Status */}
          <div className={styles.statusBanner}>
            <Badge variant={account.accessStatus === 'pass' ? 'pass' : 'fail'}>
              {account.accessStatus === 'pass' ? 'Access Granted' : 'Access Blocked'}
            </Badge>
            <span className={styles.statusText}>
              {account.accessStatus === 'pass'
                ? 'All credentials are compliant'
                : `${account.blockingCredentials.length} credential${account.blockingCredentials.length !== 1 ? 's' : ''} blocking access`}
            </span>
          </div>

          {/* Blocking Credentials */}
          {hasBlockingCredentials && (
            <DrawerSection title="Why This Account Fails">
              <div className={styles.credentialList}>
                {account.blockingCredentials.map((cred) => (
                  <div key={cred.id} className={styles.credentialItem}>
                    <div className={styles.credentialInfo}>
                      <Badge variant={cred.status === 'expired' ? 'expired' : 'fail'}>
                        {cred.status}
                      </Badge>
                      <span className={styles.credentialName}>{cred.name}</span>
                    </div>
                    <div className={styles.credentialActions}>
                      {cred.expirationDate && (
                        <UrgencyBadge date={cred.expirationDate} showExpiredLabel />
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onUploadCredential(cred)}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </DrawerSection>
          )}

          {/* Compliant Credentials */}
          {account.compliantCredentials.length > 0 && (
            <DrawerSection
              title="Compliant Credentials"
              collapsible
              defaultCollapsed={hasBlockingCredentials}
            >
              <div className={styles.credentialList}>
                {account.compliantCredentials.map((cred) => (
                  <div key={cred.id} className={`${styles.credentialItem} ${styles.compliant}`}>
                    <div className={styles.credentialInfo}>
                      <Badge variant={cred.status === 'verified' ? 'pass' : 'pending'}>
                        {cred.status}
                      </Badge>
                      <span className={styles.credentialName}>{cred.name}</span>
                    </div>
                    {cred.expirationDate && (
                      <UrgencyBadge date={cred.expirationDate} />
                    )}
                  </div>
                ))}
              </div>
            </DrawerSection>
          )}

          {/* Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Requirements</span>
              <span className={styles.summaryValue}>{account.totalRequiredCredentials}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Compliant</span>
              <span className={`${styles.summaryValue} ${styles.pass}`}>
                {account.compliantCredentials.length}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Blocking</span>
              <span className={`${styles.summaryValue} ${styles.fail}`}>
                {account.blockingCredentials.length}
              </span>
            </div>
          </div>
        </>
      ) : null}
    </Drawer>
  )
}
