import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Drawer.module.css'

interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  width?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
}

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  ({ open, onClose, title, subtitle, width = 'md', footer, children, className, ...props }, ref) => {
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
        aria-labelledby="drawer-title"
      >
        <div
          ref={ref}
          className={`${styles.drawer} ${styles[width]} ${className || ''}`}
          {...props}
        >
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2 id="drawer-title" className={styles.title}>
                {title}
              </h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close drawer"
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
          <div className={styles.content}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>,
      document.body
    )
  }
)

Drawer.displayName = 'Drawer'

interface DrawerSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function DrawerSection({
  title,
  collapsible = false,
  defaultCollapsed = false,
  children,
  className,
  ...props
}: DrawerSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div className={`${styles.section} ${className || ''}`} {...props}>
      <button
        className={`${styles.sectionHeader} ${collapsible ? styles.collapsible : ''}`}
        onClick={() => collapsible && setCollapsed(!collapsed)}
        disabled={!collapsible}
        type="button"
      >
        <h3 className={styles.sectionTitle}>{title}</h3>
        {collapsible && (
          <svg
            className={`${styles.chevron} ${collapsed ? styles.collapsed : ''}`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        )}
      </button>
      {!collapsed && <div className={styles.sectionContent}>{children}</div>}
    </div>
  )
}
