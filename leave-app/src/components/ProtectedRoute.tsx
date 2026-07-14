import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'employee' | 'manager'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // No token means not authenticated - redirect to login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // If a specific role is required, check it
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
