import { useAuth } from '../../lib/auth'
import styles from './Header.module.css'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>Credentialing</h1>
      </div>
      <div className={styles.right}>
        <button className={styles.notificationButton} aria-label="Notifications">
          <NotificationIcon />
        </button>
        <div className={styles.userMenu}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'User'}</span>
            <span className={styles.userCompany}>{user?.company || ''}</span>
          </div>
          <button className={styles.logoutButton} onClick={logout} aria-label="Logout">
            <LogoutIcon />
          </button>
        </div>
      </div>
    </header>
  )
}

function NotificationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 17c1.1 0 2-.9 2-2H8c0 1.1.9 2 2 2z" />
      <path d="M16 11V8a6 6 0 10-12 0v3l-1.3 2.6a.5.5 0 00.45.73h13.7a.5.5 0 00.45-.73L16 11z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 6l3 3-3 3M7 9h8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3H5a2 2 0 00-2 2v8a2 2 0 002 2h7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
