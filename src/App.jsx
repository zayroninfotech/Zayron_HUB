import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import EmployeeList from './pages/admin/EmployeeList'
import CreateEmployee from './pages/admin/CreateEmployee'
import EmployeeDetail from './pages/admin/EmployeeDetail'
import Reports from './pages/admin/Reports'
import ProjectList from './pages/admin/projects/ProjectList'
import ProjectDetail from './pages/admin/projects/ProjectDetail'
import ProjectAssign from './pages/admin/projects/ProjectAssign'
import EditEmployee from './pages/admin/EditEmployee'
import NDAForm from './pages/onboarding/NDAForm'
import DetailsForm from './pages/onboarding/DetailsForm'
import Completion from './pages/onboarding/Completion'
import ResetPassword from './pages/ResetPassword'
import MyProfile from './pages/employee/MyProfile'
import Timesheet from './pages/employee/Timesheet'
import TimesheetApproval from './pages/admin/TimesheetApproval'
import ChangePassword from './pages/ChangePassword'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} theme="colored" style={{ zIndex: 99999 }} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* All logged-in users */}
          <Route path="/admin/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
          <Route path="/admin/projects/assign" element={<ProtectedRoute><ProjectAssign /></ProtectedRoute>} />
          <Route path="/admin/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />

          {/* Admin / HR only */}
          <Route path="/admin/employees" element={<ProtectedRoute adminOnly><EmployeeList /></ProtectedRoute>} />
          <Route path="/admin/employees/new" element={<ProtectedRoute adminOnly><CreateEmployee /></ProtectedRoute>} />
          <Route path="/admin/employees/:id" element={<ProtectedRoute adminOnly><EmployeeDetail /></ProtectedRoute>} />
          <Route path="/admin/employees/:id/edit" element={<ProtectedRoute adminOnly><EditEmployee /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
          <Route path="/admin/timesheet-approval" element={<ProtectedRoute adminOnly><TimesheetApproval /></ProtectedRoute>} />

          {/* Employee routes */}
          <Route path="/admin/timesheet" element={<ProtectedRoute><Timesheet /></ProtectedRoute>} />
          <Route path="/admin/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

          {/* Password reset (public) */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Employee onboarding (public) */}
          <Route path="/onboarding/:token/nda" element={<NDAForm />} />
          <Route path="/onboarding/:token/details" element={<DetailsForm />} />
          <Route path="/onboarding/:token/complete" element={<Completion />} />
          <Route path="/onboarding/:token" element={<Navigate to="nda" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
