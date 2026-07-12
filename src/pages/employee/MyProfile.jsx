import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const TABS = ['My Profile', 'NDA Document', 'Personal Info', 'Documents']

const typeLabel = { permanent: 'Permanent Employee', contract: 'Contract Employee', intern: 'Intern' }
const statusMap = {
  pending:    { label: 'Pending',    bg: '#fef9c3', color: '#854d0e' },
  nda_signed: { label: 'NDA Signed', bg: '#dbeafe', color: '#1e40af' },
  completed:  { label: 'Completed',  bg: '#dcfce7', color: '#166534' },
}

function StatusBadge({ status }) {
  const s = statusMap[status] || { label: status, bg: '#f1f5f9', color: '#475569' }
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{s.label}</span>
}

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  )
}

export default function MyProfile() {
  const [emp, setEmp] = useState(null)
  const [details, setDetails] = useState(null)
  const [nda, setNda] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('My Profile')

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
    const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.download = name; a.click()
  }

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
      <style>{`
        .mp-wrap { padding: 20px 28px 40px; }
        .mp-hero {
          background: linear-gradient(135deg,#1e3a8a 0%,#1e40af 60%,#3b82f6 100%);
          border-radius: 14px; padding: 24px 28px;
          display: flex; align-items: center; gap: 20px;
          color: white; margin-bottom: 0;
        }
        .mp-avatar {
          width: 62px; height: 62px; border-radius: 50%; flex-shrink: 0;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 800; color: white;
          border: 2px solid rgba(255,255,255,0.3); overflow: hidden;
        }
        .mp-tabbar {
          display: flex; gap: 0;
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 12px; padding: 6px; margin: 16px 0;
          overflow-x: auto;
        }
        .mp-tab {
          padding: 9px 20px; border-radius: 8px; border: none; background: none;
          font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer;
          white-space: nowrap; transition: all 0.18s;
        }
        .mp-tab:hover { background: #f8fafc; color: #334155; }
        .mp-tab.active {
          background: linear-gradient(135deg,#4f46e5,#6366f1);
          color: white; box-shadow: 0 2px 8px rgba(99,102,241,0.28);
        }
        .mp-panel { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; }
        .mp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px; }
        .mp-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0 32px; }
        .mp-sec-title {
          font-size: 11px; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 16px; padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
        }
        .mp-empty { text-align: center; padding: 40px 0; color: #94a3b8; font-size: 14px; }
        .mp-doc-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 8px;
          border: 1.5px solid #e2e8f0; background: #f8fafc;
          color: #475569; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.15s;
        }
        .mp-doc-btn:hover { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
      `}</style>

      <div className="mp-wrap">

        {/* Hero */}
        <div className="mp-hero">
          <div className="mp-avatar">
            {details?.photograph_url
              ? <img src={details.photograph_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (emp.name || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 4 }}>{emp.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
              {[emp.designation, emp.department].filter(Boolean).join(' · ') || 'No designation yet'}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <span style={{ background: 'rgba(255,255,255,0.18)', color: 'white', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                {typeLabel[emp.employee_type] || emp.employee_type}
              </span>
              <StatusBadge status={emp.status} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Joining Date</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
              {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mp-tabbar">
          {TABS.map(t => (
            <button key={t} className={`mp-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {/* My Profile */}
        {tab === 'My Profile' && (
          <div className="mp-panel">
            <div className="mp-sec-title">Registration Details</div>
            <div className="mp-grid2">
              <Field label="Employee ID" value={emp.employee_id} />
              <Field label="Email" value={emp.email} />
              <Field label="Mobile" value={emp.mobile} />
              <Field label="Employee Type" value={typeLabel[emp.employee_type] || emp.employee_type} />
              <Field label="Department" value={emp.department} />
              <Field label="Designation" value={emp.designation} />
              <Field label="Onboarding Status" value={<StatusBadge status={emp.status} />} />
            </div>
          </div>
        )}

        {/* NDA Document */}
        {tab === 'NDA Document' && (
          <div className="mp-panel">
            <div className="mp-sec-title">NDA Document</div>
            {!nda ? (
              <div className="mp-empty">NDA not yet submitted.</div>
            ) : (
              <>
                <div className="mp-grid2">
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
              </>
            )}
          </div>
        )}

        {/* Personal Info */}
        {tab === 'Personal Info' && (
          <div className="mp-panel">
            <div className="mp-sec-title">Personal Information</div>
            {!details ? (
              <div className="mp-empty">Personal details not yet submitted.</div>
            ) : (
              <div className="mp-grid3">
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

        {/* Documents */}
        {tab === 'Documents' && (
          <div className="mp-panel">
            <div className="mp-sec-title">Uploaded Documents</div>
            {!details ? (
              <div className="mp-empty">No documents available.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { label: 'Photo', url: details.photograph_url },
                  { label: 'Resume', url: details.resume_url },
                  { label: 'Aadhaar Copy', url: details.aadhaar_copy_url },
                  { label: 'PAN Copy', url: details.pan_copy_url },
                  { label: 'Certificates', url: details.educational_certificates_url },
                ].filter(d => d.url).map(doc => (
                  <button key={doc.label} className="mp-doc-btn" onClick={() => downloadDoc(doc.url, doc.label)}>
                    ⬇ {doc.label}
                  </button>
                ))}
                {!details.photograph_url && !details.resume_url && !details.aadhaar_copy_url && !details.pan_copy_url && (
                  <div className="mp-empty" style={{ width: '100%' }}>No documents uploaded yet.</div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  )
}
