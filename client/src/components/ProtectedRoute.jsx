// VANGUARD Protected Route Component
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  // CRITICAL: Show loading spinner while Firebase checks auth state
  // Never redirect during loading — this causes the loop
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0A1628', flexDirection: 'column', gap: 16
      }}>
        <div style={{
          width: 48, height: 48, border: '4px solid #1B6FD8',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#94A3B8', fontSize: 14 }}>Loading VANGUARD...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
