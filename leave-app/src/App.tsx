import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import LoginPage from './pages/LoginPage.tsx'
import EmployeeDashboard from './pages/EmployeeDashboard.tsx'
import ApplyLeavePage from './pages/ApplyLeavePage.tsx'
import LeaveHistoryPage from './pages/LeaveHistoryPage.tsx'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Employee routes */}
        <Route
          path="/employee/dashboard"
          element={<ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>}
        />
        <Route
          path="/employee/apply"
          element={<ProtectedRoute requiredRole="employee"><ApplyLeavePage /></ProtectedRoute>}
        />
        <Route
          path="/employee/history"
          element={<ProtectedRoute requiredRole="employee"><LeaveHistoryPage /></ProtectedRoute>}
        />

        {/* Manager routes */}
        <Route
          path="/manager/dashboard"
          element={<ProtectedRoute requiredRole="manager"><div>Manager Dashboard</div></ProtectedRoute>}
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}
