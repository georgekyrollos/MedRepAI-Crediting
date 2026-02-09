import { createPortal } from 'react-dom'
import { useToast, type ToastType } from '../../lib/toastContext'
import styles from './Toast.module.css'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return createPortal(
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  )
}

interface ToastItemProps {
  type: ToastType
  message: string
  onDismiss: () => void
}

function ToastItem({ type, message, onDismiss }: ToastItemProps) {
  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <div className={styles.icon}>
        <ToastIcon type={type} />
      </div>
      <span className={styles.message}>{message}</span>
      <button
        className={styles.dismiss}
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4L4 12M4 4l8 8" />
        </svg>
      </button>
    </div>
  )
}

function ToastIcon({ type }: { type: ToastType }) {
  switch (type) {
    case 'success':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 4.5L6.75 12.75 3 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'error':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="9" r="7" />
          <path d="M9 5.5v4M9 12.5h.01" strokeLinecap="round" />
        </svg>
      )
    case 'warning':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7.86 2.58L1.21 13.5a1.33 1.33 0 001.14 2h13.3a1.33 1.33 0 001.14-2L10.14 2.58a1.33 1.33 0 00-2.28 0z" />
          <path d="M9 6.5v3M9 12.5h.01" strokeLinecap="round" />
        </svg>
      )
    case 'info':
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="9" r="7" />
          <path d="M9 12.5V9M9 5.5h.01" strokeLinecap="round" />
        </svg>
      )
  }
}
