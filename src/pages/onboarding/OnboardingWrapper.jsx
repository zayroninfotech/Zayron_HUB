import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import api from '../../api/axios'

export default function OnboardingWrapper({ children, requireNda = false }) {
  const { token } = useParams()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/employees/token/${token}/`)
      .then(r => setEmployee(r.data))
      .catch(() => setError('Invalid or expired onboarding link.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="loading-page">
      <span className="spinner-dark" style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid #e5e7eb', borderRadius: '50%', borderTopColor: '#1e40af', animation: 'spin 0.8s linear infinite' }} />
      <p>Loading onboarding...</p>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <h2 style={{ color: 'var(--danger)', marginBottom: 8 }}>Invalid Link</h2>
        <p style={{ color: 'var(--gray-500)' }}>{error}</p>
        <p style={{ color: 'var(--gray-400)', fontSize: 13, marginTop: 12 }}>Please check your email for the correct onboarding link or contact HR.</p>
      </div>
    </div>
  )

  if (requireNda && !employee.nda_status) {
    return <Navigate to={`/onboarding/${token}/nda`} replace />
  }

  if (employee.status === 'completed') {
    return <Navigate to={`/onboarding/${token}/complete`} replace />
  }

  return children(employee)
}
