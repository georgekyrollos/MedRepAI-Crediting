import { forwardRef, useEffect, useRef, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'
import { Button } from './Button'

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  title: string
  description?: string
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, description, children, className, ...props }, ref) => {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!open) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }

      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    }, [open, onClose])

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose()
      }
    }

    if (!open) return null

    return createPortal(
      <div
        ref={overlayRef}
        className={styles.overlay}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div ref={ref} className={`${styles.modal} ${className || ''}`} {...props}>
          <div className={styles.header}>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 5L5 15M5 5l10 10" />
              </svg>
            </button>
          </div>
          {description && (
            <p id="modal-description" className={styles.description}>
              {description}
            </p>
          )}
          <div className={styles.content}>{children}</div>
        </div>
      </div>,
      document.body
    )
  }
)

Modal.displayName = 'Modal'

interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${styles.footer} ${className || ''}`} {...props}>
        {children}
      </div>
    )
  }
)

ModalFooter.displayName = 'ModalFooter'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'primary'}
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
