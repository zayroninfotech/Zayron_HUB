import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function MyProfile() {
  const [emp, setEmp] = useState(null)
  const [details, setDetails] = useState(null)
  const [nda, setNda] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/employees/me/').then(r => {
      setEmp(r.data)
      const id = r.data.id
      Promise.all([
        api.get(`/documents/employee/${id}/`).catch(() => null),
        api.get(`/ndas/employee/${id}/`).catch(() => null),
      ]).then(([det, n]) => {
        setDetails(det?.data || null)
        setNda(n?.data || null)
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const downloadDoc = (url, name) => {
    const a = document.createElement('a')
    a.href = url; a.target = '_blank'; a.download = name; a.click()
  }

  const typeLabel = { permanent: 'Permanent Employee', contract: 'Contract Employee', intern: 'Intern' }
  const statusColor = { pending: '#f59e0b', nda_signed: '#3b82f6', completed: '#10b981' }

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

  return (
    <Layout title="My Profile">

      {/* Header */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg,#1e3a8a,#1e40af)', color: 'white' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
            {details?.photograph_url
              ? <img src={details.photograph_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (emp.name || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: 'white', fontSize: 20, margin: 0 }}>{emp.name}</h2>
            <div style={{ color: 'rgba(255,255,255,0.75)', marginTop: 4, fontSize: 13 }}>{emp.designation || ''}{emp.department ? ` · ${emp.department}` : ''}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{typeLabel[emp.employee_type] || emp.employee_type}</span>
              <span style={{ background: statusColor[emp.status] || '#6b7280', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{emp.status?.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Joining Date</div>
            <div style={{ color: 'white', fontWeight: 600 }}>{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Registration Details */}
        <Section title="Registration Details">
          <div className="form-grid">
            <Field label="Email" value={emp.email} />
            <Field label="Mobile" value={emp.mobile} />
            <Field label="Employee ID" value={emp.employee_id} />
            <Field label="Employee Type" value={typeLabel[emp.employee_type] || emp.employee_type} />
            <Field label="Department" value={emp.department} />
            <Field label="Designation" value={emp.designation} />
            <Field label="Onboarding Status" value={emp.status?.replace('_', ' ')} />
          </div>
        </Section>

        {/* NDA Document */}
        <Section title="NDA Document">
          {!nda ? (
            <div style={{ color: '#94a3b8', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>NDA not yet submitted.</div>
          ) : (
            <>
              <div className="form-grid">
                <Field label="Signed Name" value={nda.full_name} />
                <Field label="Signed Date" value={nda.signed_date} />
                <Field label="Mobile" value={nda.mobile} />
                <Field label="Aadhaar No." value={nda.aadhaar_number} />
              </div>
              <Field label="Address" value={nda.address} />
              <Field label="Emergency Contact" value={nda.emergency_contact} />
              {nda.signature && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Digital Signature</div>
                  <img src={nda.signature} alt="Signature" style={{ maxWidth: 200, border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, background: 'white' }} />
                </div>
              )}
            </>
          )}
        </Section>
      </div>

      {/* Personal Information + Documents */}
      {details && (
        <Section title="Personal Information">
          <div className="form-grid-3">
            <Field label="Father's Name" value={details.father_name} />
            <Field label="Date of Birth" value={details.date_of_birth} />
            <Field label="Gender" value={details.gender} />
            <Field label="Blood Group" value={details.blood_group} />
            <Field label="Qualification" value={details.qualification} />
            <Field label="PAN Number" value={details.pan_number} />
            <Field label="Aadhaar Number" value={details.aadhaar_number} />
            <Field label="Bank Name" value={details.bank_name} />
            <Field label="Account Number" value={details.account_number} />
            <Field label="IFSC Code" value={details.ifsc_code} />
            <Field label="Emergency Contact" value={details.emergency_contact_name ? `${details.emergency_contact_name} – ${details.emergency_contact}` : details.emergency_contact} />
          </div>
          {details.address && <Field label="Address" value={details.address} />}
          {details.previous_experience && <Field label="Previous Experience" value={details.previous_experience} />}

          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' }}>Uploaded Documents</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                { label: 'Photo', url: details.photograph_url },
                { label: 'Resume', url: details.resume_url },
                { label: 'Aadhaar', url: details.aadhaar_copy_url },
                { label: 'PAN', url: details.pan_copy_url },
                { label: 'Certificates', url: details.educational_certificates_url },
              ].filter(d => d.url).map(doc => (
                <button key={doc.label} onClick={() => downloadDoc(doc.url, doc.label)} className="btn btn-secondary btn-sm">
                  ⬇ {doc.label}
                </button>
              ))}
              {!details.photograph_url && !details.resume_url && !details.aadhaar_copy_url && !details.pan_copy_url && (
                <span style={{ fontSize: 13, color: '#94a3b8' }}>No documents uploaded</span>
              )}
            </div>
          </div>
        </Section>
      )}

    </Layout>
  )
}

function Section({ title, children }) {
  return (
    <div className="card">
      <div className="card-body" style={{ padding: '22px 28px' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>{title}</h3>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{value || '—'}</div>
    </div>
  )
}
