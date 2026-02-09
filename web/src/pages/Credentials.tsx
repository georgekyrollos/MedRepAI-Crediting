import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getEnrichedCredentials, uploadCredential } from '../lib/api'
import type { CredentialWithImpact } from '../lib/types'
import { useToast } from '../lib/toastContext'
import {
  Card,
  Table,
  Badge,
  Button,
  Input,
  Modal,
  ModalFooter,
  UrgencyBadge,
} from '../components/ui'
import type { Column } from '../components/ui'
import styles from './Credentials.module.css'

type FilterTab = 'all' | 'documents' | 'policies'
type StatusFilter = 'all' | 'verified' | 'non-compliant' | 'expiring'

export function Credentials() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()

  const [credentials, setCredentials] = useState<CredentialWithImpact[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadModal, setUploadModal] = useState<CredentialWithImpact | null>(null)
  const [uploading, setUploading] = useState(false)

  // Handle URL params for filtering
  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'verified') setStatusFilter('verified')
    else if (status === 'non-compliant') setStatusFilter('non-compliant')
    else if (status === 'expiring') setStatusFilter('expiring')
  }, [searchParams])

  useEffect(() => {
    async function loadData() {
      try {
        const credsData = await getEnrichedCredentials()
        setCredentials(credsData)
      } catch (error) {
        console.error('Failed to load credentials:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredCredentials = useMemo(() => {
    let filtered = credentials

    // Category filter
    if (activeTab !== 'all') {
      filtered = filtered.filter((c) => c.category === activeTab)
    }

    // Status filter
    if (statusFilter === 'verified') {
      filtered = filtered.filter((c) => c.status === 'verified')
    } else if (statusFilter === 'non-compliant') {
      filtered = filtered.filter((c) => c.status === 'missing' || c.status === 'expired')
    } else if (statusFilter === 'expiring') {
      filtered = filtered.filter(
        (c) => c.status === 'verified' && c.daysRemaining !== null && c.daysRemaining <= 30
      )
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      )
    }

    // Sort by priority (highest first)
    return filtered.sort((a, b) => b.priorityScore - a.priorityScore)
  }, [credentials, activeTab, statusFilter, searchQuery])

  const handleUpload = async (file: File) => {
    if (!uploadModal) return

    setUploading(true)
    try {
      await uploadCredential(uploadModal.id, file)
      // Refresh data
      const updatedCreds = await getEnrichedCredentials()
      setCredentials(updatedCreds)
      setUploadModal(null)
      addToast('success', 'Document uploaded successfully. Pending verification.')
    } catch (error) {
      console.error('Upload failed:', error)
      addToast('error', 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const columns: Column<CredentialWithImpact>[] = [
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (cred) => (
        <Badge variant={getStatusVariant(cred.status)}>
          {cred.status}
        </Badge>
      ),
    },
    {
      key: 'name',
      header: 'Requirement',
      sortable: true,
      render: (cred) => (
        <div className={styles.credentialName}>
          <span className={styles.name}>{cred.name}</span>
          {cred.description && (
            <span className={styles.description}>{cred.description}</span>
          )}
        </div>
      ),
    },
    {
      key: 'expirationDate',
      header: 'Expiration',
      sortable: true,
      width: '130px',
      render: (cred) =>
        cred.expirationDate ? (
          <UrgencyBadge
            date={cred.expirationDate}
            showExpiredLabel={cred.status === 'expired'}
          />
        ) : (
          <span className={styles.noExpiration}>-</span>
        ),
    },
    {
      key: 'impact',
      header: 'Impact',
      width: '140px',
      render: (cred) => (
        <div className={styles.impact}>
          <span className={styles.impactCount}>
            {cred.impactScore} account{cred.impactScore !== 1 ? 's' : ''}
          </span>
          {cred.affectedAccountNames.length > 0 && (
            <span className={styles.impactNames} title={cred.affectedAccountNames.join(', ')}>
              {cred.affectedAccountNames.slice(0, 2).join(', ')}
              {cred.affectedAccountNames.length > 2 && (
                <span className={styles.more}>+{cred.affectedAccountNames.length - 2}</span>
              )}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      render: (cred) => (
        <div className={styles.actions}>
          {cred.status === 'verified' && cred.documentUrl ? (
            <Button variant="ghost" size="sm">
              View
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setUploadModal(cred)
              }}
            >
              Upload
            </Button>
          )}
        </div>
      ),
    },
  ]

  const highlightRow = (cred: CredentialWithImpact): 'danger' | 'warning' | null => {
    if (cred.status === 'expired' || cred.status === 'missing') return 'danger'
    if (cred.status === 'pending') return 'warning'
    return null
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading credentials...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Credentials</h1>
          <p className={styles.subtitle}>
            Manage your credentialing requirements for facility access
          </p>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className={styles.statusFilters}>
        <button
          className={`${styles.filterPill} ${statusFilter === 'all' ? styles.active : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button
          className={`${styles.filterPill} ${statusFilter === 'non-compliant' ? styles.active : ''} ${styles.danger}`}
          onClick={() => setStatusFilter('non-compliant')}
        >
          Non-Compliant
        </button>
        <button
          className={`${styles.filterPill} ${statusFilter === 'expiring' ? styles.active : ''} ${styles.warning}`}
          onClick={() => setStatusFilter('expiring')}
        >
          Expiring Soon
        </button>
        <button
          className={`${styles.filterPill} ${statusFilter === 'verified' ? styles.active : ''} ${styles.success}`}
          onClick={() => setStatusFilter('verified')}
        >
          Verified
        </button>
      </div>

      <Card padding="sm">
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({credentials.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents ({credentials.filter((c) => c.category === 'documents').length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'policies' ? styles.active : ''}`}
              onClick={() => setActiveTab('policies')}
            >
              Policies ({credentials.filter((c) => c.category === 'policies').length})
            </button>
          </div>

          <div className={styles.search}>
            <Input
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredCredentials}
          keyField="id"
          highlightRow={highlightRow}
          emptyMessage="No credentials found"
        />
      </Card>

      <Modal
        open={!!uploadModal}
        onClose={() => setUploadModal(null)}
        title="Upload Document"
        description={`Upload your ${uploadModal?.name} documentation`}
      >
        <UploadForm
          onUpload={handleUpload}
          uploading={uploading}
          onCancel={() => setUploadModal(null)}
        />
      </Modal>
    </div>
  )
}

function UploadForm({
  onUpload,
  uploading,
  onCancel,
}: {
  onUpload: (file: File) => void
  uploading: boolean
  onCancel: () => void
}) {
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = () => {
    if (file) {
      onUpload(file)
    }
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

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 21l-5-5-5 5M16 16v10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 21v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 10l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
