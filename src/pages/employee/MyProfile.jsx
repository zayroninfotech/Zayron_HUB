import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function MyProfile() {
  const [emp, setEmp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/employees/me/').then(r => setEmp(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout title="My Profile">
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <span className="spinner-dark spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    </Layout>
  )

  if (!emp) return (
    <Layout title="My Profile">
      <div className="empty-state"><h3>Profile not found</h3><p>Your employee record could not be loaded.</p></div>
    </Layout>
  )

  const statusColor = { pending: '#f59e0b', nda_signed: '#3b82f6', completed: '#10b981' }
  const typeLabel = { permanent: 'Permanent Employee', contract: 'Contract Employee', intern: 'Intern' }

  return (
    <Layout title="My Profile">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#1e40af)', borderRadius: 16, padding: '28px 32px', marginBottom: 22, color: 'white', display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, border: '2px solid rgba(255,255,255,0.3)' }}>
          {(emp.name || 'U').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{emp.name}</h2>
          <div style={{ marginTop: 6, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{typeLabel[emp.employee_type] || emp.employee_type}</span>
            <span style={{ background: statusColor[emp.status] || '#6b7280', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{emp.status?.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Joining Date</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</div>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-body" style={{ padding: '22px 28px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>Personal Information</h3>
            <Row label="Email" value={emp.email} />
            <Row label="Mobile" value={emp.mobile} />
            <Row label="Employee ID" value={emp.employee_id} />
            <Row label="Department" value={emp.department} />
            <Row label="Designation" value={emp.designation} />
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ padding: '22px 28px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>Onboarding Status</h3>
            <Row label="Status" value={emp.status?.replace('_', ' ')} />
            <Row label="NDA" value={emp.nda_status ? '✓ Signed' : 'Pending'} />
            <Row label="Employee Type" value={typeLabel[emp.employee_type] || emp.employee_type} />
            <Row label="Joining Date" value={emp.joining_date} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{value || '—'}</span>
    </div>
  )
}
