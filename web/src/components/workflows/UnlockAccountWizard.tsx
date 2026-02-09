import { useEffect, useState } from 'react'
import type { AccountDetail } from '../../lib/types'
import { getAccountDetail, uploadCredential } from '../../lib/api'
import { Modal, ModalFooter, Button, Badge, UrgencyBadge } from '../ui'
import { useToast } from '../../lib/toastContext'
import styles from './UnlockAccountWizard.module.css'

type WizardStep = 'review' | 'upload' | 'confirm' | 'done'

interface UnlockAccountWizardProps {
  accountId: string | null
  onClose: () => void
  onComplete: () => void
}

export function UnlockAccountWizard({
  accountId,
  onClose,
  onComplete,
}: UnlockAccountWizardProps) {
  const { addToast } = useToast()
  const [account, setAccount] = useState<AccountDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<WizardStep>('review')
  const [currentCredIndex, setCurrentCredIndex] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, File>>(new Map())
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!accountId) {
      setAccount(null)
      setStep('review')
      setCurrentCredIndex(0)
      setUploadedFiles(new Map())
      return
    }

    async function loadAccount(id: string) {
      setLoading(true)
      try {
        const data = await getAccountDetail(id)
        setAccount(data)
      } catch (error) {
        console.error('Failed to load account:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAccount(accountId)
  }, [accountId])

  const blockingCredentials = account?.blockingCredentials || []
  const currentCredential = blockingCredentials[currentCredIndex]
  const progress = blockingCredentials.length > 0
    ? Math.round((uploadedFiles.size / blockingCredentials.length) * 100)
    : 0

  const handleFileSelect = (credId: string, file: File) => {
    setUploadedFiles((prev) => new Map(prev).set(credId, file))
  }

  const handleNextCredential = () => {
    if (currentCredIndex < blockingCredentials.length - 1) {
      setCurrentCredIndex((prev) => prev + 1)
    } else {
      setStep('confirm')
    }
  }

  const handlePrevCredential = () => {
    if (currentCredIndex > 0) {
      setCurrentCredIndex((prev) => prev - 1)
    } else {
      setStep('review')
    }
  }

  const handleSubmitAll = async () => {
    setUploading(true)
    try {
      // Upload all files
      for (const [credId, file] of uploadedFiles) {
        await uploadCredential(credId, file)
      }
      setStep('done')
      addToast('success', `${uploadedFiles.size} documents submitted for verification`)
    } catch (error) {
      console.error('Upload failed:', error)
      addToast('error', 'Some uploads failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleComplete = () => {
    onComplete()
    onClose()
  }

  if (!accountId) return null

  return (
    <Modal
      open={!!accountId}
      onClose={onClose}
      title={getStepTitle(step, account?.name)}
      description={getStepDescription(step)}
      className={styles.modal}
    >
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading account data...</p>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          {step !== 'done' && blockingCredentials.length > 0 && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={styles.progressText}>
                {uploadedFiles.size} of {blockingCredentials.length} ready
              </span>
            </div>
          )}

          {/* Step: Review */}
          {step === 'review' && (
            <div className={styles.reviewStep}>
              <p className={styles.reviewIntro}>
                The following credentials are blocking access to {account?.name}:
              </p>
              <div className={styles.credentialChecklist}>
                {blockingCredentials.map((cred, idx) => (
                  <div key={cred.id} className={styles.checklistItem}>
                    <div className={styles.checklistCheck}>
                      {uploadedFiles.has(cred.id) ? (
                        <CheckIcon />
                      ) : (
                        <span className={styles.checkNumber}>{idx + 1}</span>
                      )}
                    </div>
                    <div className={styles.checklistContent}>
                      <span className={styles.checklistName}>{cred.name}</span>
                      <Badge variant={cred.status === 'expired' ? 'expired' : 'fail'}>
                        {cred.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <ModalFooter>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => setStep('upload')}>
                  Start Uploading
                </Button>
              </ModalFooter>
            </div>
          )}

          {/* Step: Upload */}
          {step === 'upload' && currentCredential && (
            <div className={styles.uploadStep}>
              <div className={styles.uploadHeader}>
                <Badge variant={currentCredential.status === 'expired' ? 'expired' : 'fail'}>
                  {currentCredential.status}
                </Badge>
                {currentCredential.expirationDate && (
                  <UrgencyBadge date={currentCredential.expirationDate} showExpiredLabel />
                )}
              </div>

              <h3 className={styles.uploadTitle}>{currentCredential.name}</h3>
              {currentCredential.description && (
                <p className={styles.uploadDescription}>{currentCredential.description}</p>
              )}

              <div className={styles.dropzone}>
                <input
                  type="file"
                  id={`file-${currentCredential.id}`}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(currentCredential.id, file)
                  }}
                  className={styles.fileInput}
                />
                <label htmlFor={`file-${currentCredential.id}`} className={styles.dropzoneLabel}>
                  {uploadedFiles.has(currentCredential.id) ? (
                    <>
                      <CheckCircleIcon />
                      <span className={styles.fileName}>
                        {uploadedFiles.get(currentCredential.id)?.name}
                      </span>
                      <span className={styles.fileHint}>Click to change file</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon />
                      <span>Click to upload or drag and drop</span>
                      <span className={styles.fileTypes}>PDF, JPG, PNG (max 10MB)</span>
                    </>
                  )}
                </label>
              </div>

              <div className={styles.stepIndicator}>
                Step {currentCredIndex + 1} of {blockingCredentials.length}
              </div>

              <ModalFooter>
                <Button variant="secondary" onClick={handlePrevCredential}>
                  Back
                </Button>
                <div className={styles.footerRight}>
                  {!uploadedFiles.has(currentCredential.id) && (
                    <Button variant="ghost" onClick={handleNextCredential}>
                      Skip
                    </Button>
                  )}
                  <Button
                    onClick={handleNextCredential}
                    disabled={!uploadedFiles.has(currentCredential.id)}
                  >
                    {currentCredIndex < blockingCredentials.length - 1 ? 'Next' : 'Review'}
                  </Button>
                </div>
              </ModalFooter>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className={styles.confirmStep}>
              <p className={styles.confirmIntro}>
                You're about to submit {uploadedFiles.size} document{uploadedFiles.size !== 1 ? 's' : ''} for verification:
              </p>
              <div className={styles.confirmList}>
                {blockingCredentials.map((cred) => (
                  <div key={cred.id} className={styles.confirmItem}>
                    {uploadedFiles.has(cred.id) ? (
                      <CheckIcon className={styles.confirmCheck} />
                    ) : (
                      <SkipIcon className={styles.confirmSkip} />
                    )}
                    <span className={uploadedFiles.has(cred.id) ? '' : styles.skipped}>
                      {cred.name}
                    </span>
                  </div>
                ))}
              </div>
              {uploadedFiles.size < blockingCredentials.length && (
                <p className={styles.confirmWarning}>
                  {blockingCredentials.length - uploadedFiles.size} credential{blockingCredentials.length - uploadedFiles.size !== 1 ? 's were' : ' was'} skipped.
                  You can upload {blockingCredentials.length - uploadedFiles.size !== 1 ? 'them' : 'it'} later.
                </p>
              )}
              <ModalFooter>
                <Button variant="secondary" onClick={() => setStep('upload')}>
                  Go Back
                </Button>
                <Button onClick={handleSubmitAll} disabled={uploadedFiles.size === 0 || uploading}>
                  {uploading ? 'Submitting...' : 'Submit All'}
                </Button>
              </ModalFooter>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className={styles.doneStep}>
              <div className={styles.doneIcon}>
                <CheckCircleIcon />
              </div>
              <h3 className={styles.doneTitle}>Submitted for Verification</h3>
              <p className={styles.doneText}>
                Your documents have been submitted and are pending review.
                You'll be notified when verification is complete.
              </p>
              <ModalFooter>
                <Button onClick={handleComplete}>Done</Button>
              </ModalFooter>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

function getStepTitle(step: WizardStep, accountName?: string): string {
  switch (step) {
    case 'review':
      return `Unlock ${accountName || 'Account'}`
    case 'upload':
      return 'Upload Documents'
    case 'confirm':
      return 'Review & Submit'
    case 'done':
      return 'Success!'
  }
}

function getStepDescription(step: WizardStep): string {
  switch (step) {
    case 'review':
      return 'Review the credentials needed to restore access'
    case 'upload':
      return 'Upload documents for each missing credential'
    case 'confirm':
      return 'Review your uploads before submitting'
    case 'done':
      return ''
  }
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 4L6 11l-3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 21l-5-5-5 5M16 16v10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 21v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 10l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SkipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="8" r="6" />
      <path d="M10 10L6 6M10 6L6 10" strokeLinecap="round" />
    </svg>
  )
}
