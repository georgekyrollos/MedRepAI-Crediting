import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import {
  getCredentialStats,
  getAccounts,
  getActionItems,
  getExpiringCredentials,
} from '../lib/api'
import type { CredentialStats, Account, CredentialWithImpact } from '../lib/types'
import { Button, Modal, ModalFooter } from '../components/ui'
import { ActionQueue, AccountHealthBar, UpcomingRenewals } from '../components/dashboard'
import { useToast } from '../lib/toastContext'
import styles from './Dashboard.module.css'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [stats, setStats] = useState<CredentialStats | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [actionItems, setActionItems] = useState<CredentialWithImpact[]>([])
  const [expiringCredentials, setExpiringCredentials] = useState<CredentialWithImpact[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadModal, setUploadModal] = useState<CredentialWithImpact | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, accountsData, actionData, expiringData] = await Promise.all([
          getCredentialStats(),
          getAccounts(),
          getActionItems(5),
          getExpiringCredentials(60),
        ])
        setStats(statsData)
        setAccounts(accountsData)
        setActionItems(actionData)
        setExpiringCredentials(expiringData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const passCount = accounts.filter((a) => a.accessStatus === 'pass').length
  const failCount = accounts.filter((a) => a.accessStatus === 'fail').length

  const handleUploadClick = (credential: CredentialWithImpact) => {
    setUploadModal(credential)
  }

  const handleUploadComplete = () => {
    setUploadModal(null)
    addToast('success', 'Document uploaded successfully. Pending verification.')
  }

  const handleStatClick = (filter: string) => {
    navigate(`/credentials?status=${filter}`)
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Hero / Welcome */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.welcome}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className={styles.heroText}>
            {failCount > 0
              ? `${failCount} accounts need attention. Let's fix them.`
              : 'All your accounts are in good standing.'}
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className={styles.statsGrid}>
        <button
          className={styles.statCard}
          onClick={() => handleStatClick('all')}
        >
          <div className={styles.statIcon}>
            <DocumentIcon />
          </div>
          <div className={styles.statValue}>{stats?.total || 0}</div>
          <div className={styles.statLabel}>Total Credentials</div>
        </button>

        <button
          className={`${styles.statCard} ${styles.positive}`}
          onClick={() => handleStatClick('verified')}
        >
          <div className={`${styles.statIcon} ${styles.positive}`}>
            <CheckIcon />
          </div>
          <div className={styles.statValue}>{stats?.compliant || 0}</div>
          <div className={styles.statLabel}>Compliant</div>
        </button>

        <button
          className={`${styles.statCard} ${styles.danger}`}
          onClick={() => handleStatClick('non-compliant')}
        >
          <div className={`${styles.statIcon} ${styles.danger}`}>
            <AlertIcon />
          </div>
          <div className={styles.statValue}>{stats?.nonCompliant || 0}</div>
          <div className={styles.statLabel}>Non-Compliant</div>
        </button>

        <button
          className={`${styles.statCard} ${styles.warning}`}
          onClick={() => handleStatClick('expiring')}
        >
          <div className={`${styles.statIcon} ${styles.warning}`}>
            <ClockIcon />
          </div>
          <div className={styles.statValue}>{stats?.expiringSoon || 0}</div>
          <div className={styles.statLabel}>Expiring Soon</div>
        </button>
      </div>

      {/* Action Queue - Full Width */}
      <ActionQueue
        items={actionItems}
        onUpload={handleUploadClick}
        onViewAll={() => navigate('/credentials?status=non-compliant')}
      />

      {/* Two Column Layout */}
      <div className={styles.twoColumn}>
        <AccountHealthBar
          passCount={passCount}
          failCount={failCount}
          onClickPass={() => navigate('/accounts?status=pass')}
          onClickFail={() => navigate('/accounts?status=fail')}
        />

        <UpcomingRenewals
          credentials={expiringCredentials}
          onCredentialClick={(cred) => navigate(`/credentials?highlight=${cred.id}`)}
        />
      </div>

      {/* Upload Modal */}
      <Modal
        open={!!uploadModal}
        onClose={() => setUploadModal(null)}
        title="Upload Document"
        description={`Upload your ${uploadModal?.name} documentation`}
      >
        <SimpleUploadForm
          onComplete={handleUploadComplete}
          onCancel={() => setUploadModal(null)}
        />
      </Modal>
    </div>
  )
}

function SimpleUploadForm({
  onComplete,
  onCancel,
}: {
  onComplete: () => void
  onCancel: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setUploading(false)
    onComplete()
  }

  return (
    <div className={styles.uploadForm}>
      <div className={styles.dropzone}>
        <input
          type="file"
          id="file-upload"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className={styles.fileInput}
        />
        <label htmlFor="file-upload" className={styles.dropzoneLabel}>
          {file ? (
            <span className={styles.fileName}>{file.name}</span>
          ) : (
            <>
              <UploadIcon />
              <span>Click to upload or drag and drop</span>
              <span className={styles.fileTypes}>PDF, JPG, PNG (max 10MB)</span>
            </>
          )}
        </label>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </ModalFooter>
    </div>
  )
}

// Icons
function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 21l-5-5-5 5M16 16v10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 21v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 10l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
