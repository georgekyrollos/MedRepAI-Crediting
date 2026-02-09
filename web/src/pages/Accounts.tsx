import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAccounts, getInvitations, uploadCredential } from '../lib/api'
import type { Account, Credential } from '../lib/types'
import { useToast } from '../lib/toastContext'
import { Card, Table, Badge, Button, Input, Pagination, Modal, ModalFooter } from '../components/ui'
import type { Column } from '../components/ui'
import { AccountDetailDrawer } from '../components/accounts'
import { UnlockAccountWizard } from '../components/workflows'
import styles from './Accounts.module.css'

type FilterTab = 'registered' | 'invitations'
type StatusFilter = 'all' | 'pass' | 'fail'
const PAGE_SIZE = 10

export function Accounts() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()

  const [accounts, setAccounts] = useState<Account[]>([])
  const [invitations, setInvitations] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('registered')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Drawer and wizard state
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [wizardAccountId, setWizardAccountId] = useState<string | null>(null)
  const [uploadModal, setUploadModal] = useState<Credential | null>(null)
  const [uploading, setUploading] = useState(false)

  // Handle URL params for filtering
  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'pass') setStatusFilter('pass')
    else if (status === 'fail') setStatusFilter('fail')
  }, [searchParams])

  useEffect(() => {
    async function loadData() {
      try {
        const [accountsData, invitationsData] = await Promise.all([
          getAccounts(),
          getInvitations(),
        ])
        setAccounts(accountsData)
        setInvitations(invitationsData)
      } catch (error) {
        console.error('Failed to load accounts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const currentData = activeTab === 'registered' ? accounts : invitations

  const filteredData = useMemo(() => {
    let filtered = currentData

    // Status filter
    if (statusFilter === 'pass') {
      filtered = filtered.filter((a) => a.accessStatus === 'pass')
    } else if (statusFilter === 'fail') {
      filtered = filtered.filter((a) => a.accessStatus === 'fail')
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.city?.toLowerCase().includes(query) ||
          a.state?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [currentData, statusFilter, searchQuery])

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, statusFilter, searchQuery])

  const handleRowClick = (account: Account) => {
    setSelectedAccountId(account.id)
  }

  const handleUploadCredential = (credential: Credential) => {
    setSelectedAccountId(null) // Close drawer
    setUploadModal(credential)
  }

  const handleStartUnlockWizard = (accountId: string) => {
    setSelectedAccountId(null) // Close drawer
    setWizardAccountId(accountId)
  }

  const handleUpload = async (file: File) => {
    if (!uploadModal) return

    setUploading(true)
    try {
      await uploadCredential(uploadModal.id, file)
      setUploadModal(null)
      addToast('success', 'Document uploaded successfully. Pending verification.')
    } catch (error) {
      console.error('Upload failed:', error)
      addToast('error', 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleWizardComplete = () => {
    // Could refresh data here if needed
    setWizardAccountId(null)
  }

  const columns: Column<Account>[] = [
    {
      key: 'name',
      header: 'Account Name',
      sortable: true,
      render: (account) => (
        <div className={styles.accountCell}>
          <span className={styles.accountName}>{account.name}</span>
          <span className={styles.accountMeta}>
            {account.locationCount} location{account.locationCount !== 1 ? 's' : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      width: '150px',
      render: (account) =>
        account.city && account.state
          ? `${account.city}, ${account.state}`
          : '-',
    },
    {
      key: 'accessStatus',
      header: 'Access Status',
      sortable: true,
      width: '120px',
      render: (account) => (
        <Badge variant={account.accessStatus === 'pass' ? 'pass' : 'fail'}>
          {account.accessStatus}
        </Badge>
      ),
    },
    {
      key: 'registrationStatus',
      header: 'Registration',
      sortable: true,
      width: '130px',
      render: (account) => (
        <Badge
          variant={
            account.registrationStatus === 'complete' ? 'pass' : 'pending'
          }
        >
          {account.registrationStatus}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (account) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedAccountId(account.id)
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading accounts...</p>
      </div>
    )
  }

  const passCount = accounts.filter((a) => a.accessStatus === 'pass').length
  const failCount = accounts.filter((a) => a.accessStatus === 'fail').length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Accounts</h1>
          <p className={styles.subtitle}>
            View your registered health systems and pending invitations
          </p>
        </div>
        <Button variant="secondary">
          <ExportIcon />
          Export
        </Button>
      </div>

      {/* Status Filter Pills */}
      <div className={styles.statusFilters}>
        <button
          className={`${styles.filterPill} ${statusFilter === 'all' ? styles.active : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All ({currentData.length})
        </button>
        <button
          className={`${styles.filterPill} ${statusFilter === 'fail' ? styles.active : ''} ${styles.danger}`}
          onClick={() => setStatusFilter('fail')}
        >
          Failing ({currentData.filter((a) => a.accessStatus === 'fail').length})
        </button>
        <button
          className={`${styles.filterPill} ${statusFilter === 'pass' ? styles.active : ''} ${styles.success}`}
          onClick={() => setStatusFilter('pass')}
        >
          Passing ({currentData.filter((a) => a.accessStatus === 'pass').length})
        </button>
      </div>

      <Card padding="sm">
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'registered' ? styles.active : ''}`}
              onClick={() => setActiveTab('registered')}
            >
              Registered Accounts ({accounts.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'invitations' ? styles.active : ''}`}
              onClick={() => setActiveTab('invitations')}
            >
              Invitations ({invitations.length})
            </button>
          </div>

          <div className={styles.search}>
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={paginatedData}
          keyField="id"
          onRowClick={handleRowClick}
          emptyMessage={
            activeTab === 'invitations'
              ? 'No pending invitations'
              : 'No accounts found'
          }
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Accounts</span>
          <span className={styles.summaryValue}>{accounts.length}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Pass</span>
          <span className={`${styles.summaryValue} ${styles.pass}`}>
            {passCount}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Fail</span>
          <span className={`${styles.summaryValue} ${styles.fail}`}>
            {failCount}
          </span>
        </div>
      </div>

      {/* Account Detail Drawer */}
      <AccountDetailDrawer
        accountId={selectedAccountId}
        onClose={() => setSelectedAccountId(null)}
        onUploadCredential={handleUploadCredential}
        onStartUnlockWizard={handleStartUnlockWizard}
      />

      {/* Unlock Account Wizard */}
      <UnlockAccountWizard
        accountId={wizardAccountId}
        onClose={() => setWizardAccountId(null)}
        onComplete={handleWizardComplete}
      />

      {/* Upload Modal */}
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

function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 10v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 5L8 2 5 5M8 2v8" strokeLinecap="round" strokeLinejoin="round" />
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
