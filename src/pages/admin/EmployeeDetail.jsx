import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const Field = ({ label, value }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{value || '—'}</div>
  </div>
)

function StatusBadge({ status }) {
  const map = {
    pending:    { label: 'Pending',    bg: '#fef9c3', color: '#854d0e' },
    nda_signed: { label: 'NDA Signed', bg: '#dbeafe', color: '#1e40af' },
    completed:  { label: 'Completed',  bg: '#dcfce7', color: '#166534' },
  }
  const s = map[status] || { label: status, bg: '#f1f5f9', color: '#475569' }
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{s.label}</span>
}

const TABS = ['My Profile', 'NDA Document', 'Personal Info', 'Documents']

export default function EmployeeDetail() {
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [nda, setNda] = useState(null)
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('My Profile')

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
    try { await api.post(`/employees/${id}/resend-email/`); toast.success('Onboarding email resent.') }
    catch { toast.error('Failed to send email.') }
  }
  const resendCredentials = async () => {
    try { await api.post(`/documents/resend-credentials/${id}/`); toast.success('Login credentials email sent.') }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to send credentials email.') }
  }
  const regeneratePdf = async () => {
    try { await api.post(`/ndas/employee/${id}/regenerate/`); toast.success('NDA PDF regenerated.') }
    catch { toast.error('Failed to regenerate PDF.') }
  }
  const downloadNda = async () => {
    try {
      const res = await api.get(`/ndas/employee/${id}/download/`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = `NDA_${employee?.name || id}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Failed to download NDA PDF.') }
  }
  const downloadDoc = (url, name) => {
    const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.download = name; a.click()
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
      <div style={{ padding: 40, textAlign: 'center' }}><h3>Employee not found</h3><Link to="/admin/employees">← Back</Link></div>
    </Layout>
  )

  return (
    <Layout title={employee.name} actions={
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={resendEmail} className="btn btn-secondary">📧 Resend Onboarding</button>
        <button onClick={resendCredentials} className="btn btn-secondary">🔑 Resend Credentials</button>
        <Link to="/admin/employees" className="btn btn-secondary">← Back</Link>
      </div>
    }>
      <style>{`
        .ed-wrap { padding: 20px 28px 40px; }

        /* Hero */
        .ed-hero {
          background: linear-gradient(135deg,#1e3a8a 0%,#1e40af 60%,#3b82f6 100%);
          border-radius: 14px; padding: 24px 28px;
          display: flex; align-items: center; gap: 20;
          color: white; margin-bottom: 0;
        }
        .ed-avatar {
          width: 62px; height: 62px; border-radius: 50%; flex-shrink: 0;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 800; color: white;
          border: 2px solid rgba(255,255,255,0.3);
          overflow: hidden;
        }

        /* Tab bar */
        .ed-tabbar {
          display: flex; gap: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 6px; margin: 16px 0;
          overflow-x: auto;
        }
        .ed-tab {
          padding: 9px 20px; border-radius: 8px; border: none; background: none;
          font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer;
          white-space: nowrap; transition: all 0.18s;
        }
        .ed-tab:hover { background: #f8fafc; color: #334155; }
        .ed-tab.active {
          background: linear-gradient(135deg,#4f46e5,#6366f1);
          color: white;
          box-shadow: 0 2px 8px rgba(99,102,241,0.28);
        }

        /* Panel */
        .ed-panel {
          background: #fff; border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 24px;
        }
        .ed-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px; }
        .ed-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0 32px; }
        .ed-section-title {
          font-size: 11px; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 16px; padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
        }
        .ed-empty { text-align: center; padding: 40px 0; color: #94a3b8; font-size: 14px; }
        .doc-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 8px;
          border: 1.5px solid #e2e8f0; background: #f8fafc;
          color: #475569; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.15s;
        }
        .doc-btn:hover { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
      `}</style>

      <div className="ed-wrap">

        {/* Hero */}
        <div className="ed-hero" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="ed-avatar">
            {details?.photograph_url
              ? <img src={details.photograph_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : employee.name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 4 }}>{employee.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
              {[employee.designation, employee.department].filter(Boolean).join(' · ') || 'No designation yet'}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <span style={{ background: 'rgba(255,255,255,0.18)', color: 'white', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                {employee.employee_type}
              </span>
              <StatusBadge status={employee.status} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Joining Date</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
              {new Date(employee.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="ed-tabbar">
          {TABS.map(t => (
            <button key={t} className={`ed-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {/* Tab panels */}
        {tab === 'My Profile' && (
          <div className="ed-panel">
            <div className="ed-section-title">Registration Details</div>
            <div className="ed-grid2">
              <Field label="Employee ID" value={employee.employee_id} />
              <Field label="Email" value={employee.email} />
              <Field label="Mobile" value={employee.mobile} />
              <Field label="Employee Type" value={employee.employee_type === 'permanent' ? 'Permanent Employee' : employee.employee_type === 'contract' ? 'Contract Employee' : employee.employee_type} />
              <Field label="Department" value={employee.department} />
              <Field label="Designation" value={employee.designation} />
              <Field label="Onboarding Status" value={<StatusBadge status={employee.status} />} />
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Onboarding Link</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-control" value={employee.onboarding_link} readOnly style={{ fontSize: 12 }} />
                <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(employee.onboarding_link); toast.success('Copied!') }}>Copy</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'NDA Document' && (
          <div className="ed-panel">
            <div className="ed-section-title">NDA Document</div>
            {!nda ? (
              <div className="ed-empty">NDA not yet submitted by the employee.</div>
            ) : (
              <>
                <div className="ed-grid2">
                  <Field label="Signed Name" value={nda.full_name} />
                  <Field label="Signed Date" value={nda.signed_date} />
                  <Field label="Mobile" value={nda.mobile} />
                  <Field label="Aadhaar No." value={nda.aadhaar_number} />
                </div>
                <Field label="Address" value={nda.address} />
                <Field label="Emergency Contact" value={nda.emergency_contact} />
                {nda.signature && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Digital Signature</div>
                    <img src={nda.signature} alt="Signature" style={{ maxWidth: 200, border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, background: 'white' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button onClick={downloadNda} className="btn btn-primary btn-sm">⬇ Download PDF</button>
                  <button onClick={regeneratePdf} className="btn btn-secondary btn-sm">↺ Regenerate PDF</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'Personal Info' && (
          <div className="ed-panel">
            <div className="ed-section-title">Personal Information</div>
            {!details ? (
              <div className="ed-empty">Employee hasn't completed onboarding yet.</div>
            ) : (
              <div className="ed-grid3">
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
                <Field label="Emergency Contact Name" value={details.emergency_contact_name} />
                <Field label="Emergency Contact" value={details.emergency_contact} />
              </div>
            )}
            {details?.address && <div style={{ marginTop: 8 }}><Field label="Address" value={details.address} /></div>}
            {details?.previous_experience && <Field label="Previous Experience" value={details.previous_experience} />}
          </div>
        )}

        {tab === 'Documents' && (
          <div className="ed-panel">
            <div className="ed-section-title">Uploaded Documents</div>
            {!details ? (
              <div className="ed-empty">No documents available.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { label: 'Photo', url: details.photograph_url },
                  { label: 'Resume', url: details.resume_url },
                  { label: 'Aadhaar Copy', url: details.aadhaar_copy_url },
                  { label: 'PAN Copy', url: details.pan_copy_url },
                  { label: 'Certificates', url: details.educational_certificates_url },
                ].filter(d => d.url).map(doc => (
                  <button key={doc.label} className="doc-btn" onClick={() => downloadDoc(doc.url, doc.label)}>
                    ⬇ {doc.label}
                  </button>
                ))}
                {!details.photograph_url && !details.resume_url && !details.aadhaar_copy_url && !details.pan_copy_url && (
                  <div className="ed-empty" style={{ width: '100%' }}>No documents uploaded yet.</div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}
