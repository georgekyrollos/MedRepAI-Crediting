import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Button, Input, Card, Logo } from '../components/ui'
import styles from './Login.module.css'

export function Login() {
  const { isAuthenticated, login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate('/')
      } else {
        setError('Invalid email or password')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Logo size={48} />
            <span className={styles.logoText}>MedRepAI</span>
          </div>
          <h1 className={styles.title}>Credentialing Portal</h1>
          <p className={styles.subtitle}>
            Sign in to manage your credentials and facility access
          </p>
        </div>

        <Card padding="lg" className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              fullWidth
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              fullWidth
              autoComplete="current-password"
            />

            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={submitting}
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className={styles.footer}>
            <a href="#forgot" className={styles.link}>
              Forgot password?
            </a>
          </div>
        </Card>

        <p className={styles.help}>
          Need help?{' '}
          <a href="#support" className={styles.link}>
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}
