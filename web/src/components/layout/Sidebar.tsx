import { NavLink } from 'react-router-dom'
import { Logo } from '../ui'
import styles from './Sidebar.module.css'

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/credentials', label: 'My Credentials', icon: CredentialsIcon },
  { path: '/accounts', label: 'Accounts', icon: AccountsIcon },
  { path: '/resources', label: 'Resource Center', icon: ResourcesIcon },
]

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Logo size={36} />
        <span className={styles.logoText}>MedRepAI</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon className={styles.navIcon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={styles.footer}>
        <div className={styles.helpLink}>
          <HelpIcon className={styles.navIcon} />
          <span>Help & Support</span>
        </div>
      </div>
    </aside>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 10.5L10 4l7 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CredentialsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="14" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8h6M7 11h4" strokeLinecap="round" />
    </svg>
  )
}

function AccountsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 17v-1a4 4 0 014-4h4a4 4 0 014 4v1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="7" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ResourcesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8h14" strokeLinecap="round" />
    </svg>
  )
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="7" />
      <path d="M8 8a2 2 0 013.5 1.5c0 1.5-2 2-2 3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="14" r="0.5" fill="currentColor" />
    </svg>
  )
}
