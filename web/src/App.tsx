import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { ToastProvider } from './lib/toastContext'
import { ToastContainer } from './components/ui'
import { AppLayout } from './components/layout'
import { Login, Dashboard, Credentials, Accounts } from './pages'
import './index.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="credentials" element={<Credentials />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="resources" element={<ResourcesPlaceholder />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  )
}

function ResourcesPlaceholder() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '8px' }}>
        Resource Center
      </h1>
      <p style={{ color: '#5B6475' }}>Coming soon.</p>
    </div>
  )
}
