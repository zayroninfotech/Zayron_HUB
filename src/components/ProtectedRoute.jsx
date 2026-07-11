import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ADMIN_ROLES = ['superadmin', 'admin', 'hr']

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !ADMIN_ROLES.includes(user?.role)) {
    return <Navigate to="/admin/dashboard" replace />
  }
  return children
}
