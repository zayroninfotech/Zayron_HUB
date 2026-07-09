import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const Section = ({ title, children }) => (
  <div className="card" style={{ marginBottom: 20 }}>
    <div className="card-header"><h2>{title}</h2></div>
    <div className="card-body">{children}</div>
  </div>
)

const Field = ({ label, value }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, color: 'var(--gray-800)', fontWeight: 500 }}>{value || '—'}</div>
  </div>
)

function StatusBadge({ status }) {
  const labels = { pending: 'Pending', nda_signed: 'NDA Signed', completed: 'Completed' }
  return <span className={`badge badge-${status}`} style={{ fontSize: 13, padding: '5px 14px' }}>{labels[status] || status}</span>
}

export default function EmployeeDetail() {
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [nda, setNda] = useState(null)
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/employees/${id}/`),
      api.get(`/ndas/employee/${id}/`).catch(() => null),
      api.get(`/documents/employee/${id}/`).catch(() => null),
    ]).then(([empRes, ndaRes, detRes]) => {
      setEmployee(empRes.data)
      if (ndaRes) setNda(ndaRes.data)
      if (detRes) setDetails(detRes.data)
    }).catch(() => toast.error('Failed to load employee.')).finally(() => setLoading(false))
  }, [id])

  const resendEmail = async () => {
    try {
      await api.post(`/employees/${id}/resend-email/`)
      toast.success('Onboarding email resent.')
    } catch { toast.error('Failed to send email. Check email configuration.') }
  }

  const regeneratePdf = async () => {
    try {
      await api.post(`/ndas/employee/${id}/regenerate/`)
      toast.success('NDA PDF regenerated.')
    } catch { toast.error('Failed to regenerate PDF.') }
  }

  const downloadNda = async () => {
    try {
      const res = await api.get(`/ndas/employee/${id}/download/`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `NDA_${employee?.name || id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Failed to download NDA PDF.') }
  }

  const downloadDoc = (url, name) => {
    const a = document.createElement('a')
    a.href = url; a.target = '_blank'; a.download = name; a.click()
  }

  if (loading) return (
    <Layout title="Employee Detail">
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <span className="spinner-dark spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    </Layout>
  )

  if (!employee) return (
    <Layout title="Employee Detail">
      <div className="empty-state"><h3>Employee not found</h3><Link to="/admin/employees">← Back to list</Link></div>
    </Layout>
  )

  return (
    <Layout title={employee.name} actions={
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={resendEmail} className="btn btn-secondary">📧 Resend Email</button>
        <Link to="/admin/employees" className="btn btn-secondary">← Back</Link>
      </div>
    }>
      {/* Header */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #1e3a8a, #1e40af)', color: 'white' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, flexShrink: 0 }}>
            {details?.photograph_url
              ? <img src={details.photograph_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : employee.name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: 'white', fontSize: 20, margin: 0 }}>{employee.name}</h2>
            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{employee.designation} · {employee.department}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <span className={`badge badge-${employee.employee_type}`}>{employee.employee_type}</span>
              <StatusBadge status={employee.status} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Joining Date</div>
            <div style={{ color: 'white', fontWeight: 600 }}>{new Date(employee.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Basic Info */}
        <Section title="Registration Details">
          <div className="form-grid">
            <Field label="Email" value={employee.email} />
            <Field label="Mobile" value={employee.mobile} />
            <Field label="Employee Type" value={employee.employee_type === 'permanent' ? 'Permanent Employee' : 'Contract Employee'} />
            <Field label="Department" value={employee.department} />
            <Field label="Designation" value={employee.designation} />
            <Field label="Onboarding Status" value={<StatusBadge status={employee.status} />} />
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Onboarding Link</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-control" value={employee.onboarding_link} readOnly style={{ fontSize: 12 }} />
              <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(employee.onboarding_link); toast.success('Copied!') }}>Copy</button>
            </div>
          </div>
        </Section>

        {/* NDA */}
        <Section title="NDA Document">
          {!nda ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <p>NDA not yet submitted by the employee.</p>
            </div>
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
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Digital Signature</div>
                  <img src={nda.signature} alt="Signature" style={{ maxWidth: 200, border: '1px solid var(--gray-200)', borderRadius: 8, padding: 8, background: 'white' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={downloadNda} className="btn btn-primary btn-sm">⬇ Download PDF</button>
                <button onClick={regeneratePdf} className="btn btn-secondary btn-sm">↺ Regenerate PDF</button>
              </div>
            </>
          )}
        </Section>
      </div>

      {/* Employee Details */}
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
            <Field label="Emergency Contact" value={`${details.emergency_contact_name} – ${details.emergency_contact}`} />
          </div>
          {details.address && <Field label="Address" value={details.address} />}
          {details.previous_experience && <Field label="Previous Experience" value={details.previous_experience} />}

          {/* Documents */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--gray-700)' }}>Uploaded Documents</h3>
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
                <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>No documents uploaded</span>
              )}
            </div>
          </div>
        </Section>
      )}
    </Layout>
  )
}
