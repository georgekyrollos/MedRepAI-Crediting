import { useEffect, useState } from 'react'
import type { Credential, Account } from '../../lib/types'
import { getCredentialWithAccounts } from '../../lib/api'
import { Drawer, DrawerSection, Button, Badge, UrgencyBadge } from '../ui'
import styles from './CredentialDetailDrawer.module.css'

interface CredentialDetailDrawerProps {
  credentialId: string | null
  onClose: () => void
  onUpload: (credential: Credential) => void
}

export function CredentialDetailDrawer({
  credentialId,
  onClose,
  onUpload,
}: CredentialDetailDrawerProps) {
  const [credential, setCredential] = useState<Credential | null>(null)
  const [affectedAccounts, setAffectedAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!credentialId) {
      setCredential(null)
      setAffectedAccounts([])
      return
    }

    async function loadData(id: string) {
      setLoading(true)
      try {
        const data = await getCredentialWithAccounts(id)
        if (data) {
          setCredential(data.credential)
          setAffectedAccounts(data.affectedAccounts)
        }
      } catch (error) {
        console.error('Failed to load credential detail:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData(credentialId)
  }, [credentialId])

  const needsAction = credential && (credential.status === 'missing' || credential.status === 'expired')
  const passingAccounts = affectedAccounts.filter((a) => a.accessStatus === 'pass')
  const failingAccounts = affectedAccounts.filter((a) => a.accessStatus === 'fail')

  return (
    <Drawer
      open={!!credentialId}
      onClose={onClose}
      title={credential?.name || 'Loading...'}
      subtitle={credential?.description}
      footer={
        needsAction && credential && (
          <Button onClick={() => onUpload(credential)}>
            Upload Document
          </Button>
        )
      }
    >
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading credential details...</p>
        </div>
      ) : credential ? (
        <>
          {/* Status Banner */}
          <div className={styles.statusBanner}>
            <div className={styles.statusInfo}>
              <Badge variant={getStatusVariant(credential.status)}>
                {credential.status}
              </Badge>
              {credential.expirationDate && (
                <UrgencyBadge
                  date={credential.expirationDate}
                  showExpiredLabel={credential.status === 'expired'}
                />
              )}
            </div>
            <span className={styles.category}>
              {credential.category === 'documents' ? 'Document' : 'Policy'}
            </span>
          </div>

          {/* Accounts Requiring This */}
          <DrawerSection title={`Accounts Requiring This (${affectedAccounts.length})`}>
            {affectedAccounts.length === 0 ? (
              <p className={styles.emptyMessage}>No accounts require this credential.</p>
            ) : (
              <div className={styles.accountList}>
                {/* Show failing accounts first */}
                {failingAccounts.length > 0 && (
                  <div className={styles.accountGroup}>
                    <span className={styles.groupLabel}>
                      Would unlock ({failingAccounts.length})
                    </span>
                    {failingAccounts.map((account) => (
                      <div key={account.id} className={styles.accountItem}>
                        <div className={styles.accountInfo}>
                          <span className={styles.accountName}>{account.name}</span>
                          <span className={styles.accountMeta}>
                            {account.city}, {account.state}
                          </span>
                        </div>
                        <Badge variant="fail">Blocked</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Passing accounts */}
                {passingAccounts.length > 0 && (
                  <div className={styles.accountGroup}>
                    <span className={styles.groupLabel}>
                      Already passing ({passingAccounts.length})
                    </span>
                    {passingAccounts.map((account) => (
                      <div key={account.id} className={`${styles.accountItem} ${styles.passing}`}>
                        <div className={styles.accountInfo}>
                          <span className={styles.accountName}>{account.name}</span>
                          <span className={styles.accountMeta}>
                            {account.city}, {account.state}
                          </span>
                        </div>
                        <Badge variant="pass">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DrawerSection>

          {/* Document Section */}
          <DrawerSection title="Document">
            {credential.documentUrl ? (
              <div className={styles.documentPreview}>
                <div className={styles.docIcon}>
                  <DocumentIcon />
                </div>
                <div className={styles.docInfo}>
                  <span className={styles.docName}>
                    {credential.name.slice(0, 30)}...
                  </span>
                  <span className={styles.docMeta}>Uploaded document</span>
                </div>
                <div className={styles.docActions}>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onUpload(credential)}>
                    Replace
                  </Button>
                </div>
              </div>
            ) : (
              <div className={styles.noDocument}>
                <p>No document uploaded yet.</p>
                <Button variant="primary" onClick={() => onUpload(credential)}>
                  Upload Document
                </Button>
              </div>
            )}
          </DrawerSection>
        </>
      ) : null}
    </Drawer>
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'verified':
      return 'pass' as const
    case 'missing':
    case 'expired':
      return 'fail' as const
    case 'pending':
      return 'pending' as const
    default:
      return 'default' as const
  }
}

function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
