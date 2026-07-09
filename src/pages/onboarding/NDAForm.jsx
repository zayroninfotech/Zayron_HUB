import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const PERMANENT_NDA = `NON-DISCLOSURE AGREEMENT (PERMANENT EMPLOYEE)

This Employee Confidentiality, Non-Disclosure and Intellectual Property Agreement ("Agreement") is entered into between ZAYRON INFOTECH PRIVATE LIMITED, a company incorporated under the Companies Act, 2013, having its registered office at Hyderabad, Telangana, India (hereinafter referred to as the "Company"); and the undersigned employee (hereinafter referred to as the "Employee"). The Company and Employee are collectively referred to as the "Parties".

1. PURPOSE
The Company may disclose certain confidential, proprietary, technical, business, commercial, financial, operational, and client-related information to the Employee during the course of employment. The purpose of this Agreement is to protect such Confidential Information and Intellectual Property belonging to the Company, its clients, business partners, vendors, and affiliates.

2. CONFIDENTIAL INFORMATION
For the purpose of this Agreement, "Confidential Information" includes, but is not limited to:

Business Information: Business plans and strategies, financial information, pricing and commercial proposals, customer and vendor information, marketing plans and business opportunities, internal policies and procedures.

Technical Information: Software applications and source code, product designs and architecture, databases and configurations, APIs and integrations, technical documentation, research and development information, validation and compliance documents.

Client Information: Client requirements and specifications, contracts and agreements, project deliverables, customer data, regulatory documentation, validation records and reports.

Electronic Information: Emails and communications, passwords and access credentials, cloud infrastructure information, security configurations, internal systems and repositories.

Confidential Information may be disclosed in written, oral, electronic, visual, or any other form.

3. EMPLOYEE CONFIDENTIALITY OBLIGATIONS
The Employee agrees that he/she shall:
(a) Maintain the strict confidentiality of all Confidential Information.
(b) Use Confidential Information solely for legitimate Company business purposes.
(c) Not disclose, copy, reproduce, transfer, publish, distribute, or communicate Confidential Information to any third party without prior written authorization from the Company.
(d) Exercise reasonable care and diligence to prevent unauthorized access, disclosure, misuse, or loss of Confidential Information.
(e) Immediately notify the Company of any actual or suspected breach of confidentiality.

4. CLIENT CONFIDENTIALITY
The Employee acknowledges that the Company provides services to various clients and may have access to client-owned confidential information. The Employee shall not disclose, copy, use, or share any client information except as required for authorized project activities. The Employee shall continue to protect client information even after separation from the Company.

5. INTELLECTUAL PROPERTY RIGHTS
The Employee agrees that all work products created, developed, conceived, designed, authored, or contributed during employment shall be the exclusive property of the Company. This includes: software and source code, applications and systems, reports and documentation, SOPs and templates, validation deliverables, designs and inventions, business methodologies, training materials, databases and records. The Employee hereby assigns all rights, title, and interest in such intellectual property to the Company.

6. INFORMATION SECURITY
The Employee shall:
- Keep passwords and credentials secure.
- Use Company systems only for authorized business activities.
- Not install unauthorized software.
- Not transfer Company or Client data to personal devices or external storage without approval.
- Follow all Information Security, Data Privacy, and Cybersecurity policies issued by the Company.

7. COMPANY PROPERTY
All Company-issued assets including laptops, mobile devices, identity cards, access cards, documents, project files, software licenses, email accounts, and storage devices shall remain the sole property of the Company.

8. RETURN OF COMPANY PROPERTY
Upon resignation, termination, retirement, suspension, or upon request by the Company, the Employee shall immediately return all Company property and Confidential Information. The Employee shall not retain any copies in physical or electronic form.

9. CLIENT NON-SOLICITATION
The Employee agrees that during employment and for a period of six (6) months following the termination of employment, he/she shall not:
- Directly or indirectly solicit business from any client of the Company.
- Accept employment, consultancy, contract, outsourcing, freelance, or professional engagement with any Company client with whom the Employee had direct involvement during the preceding twelve (12) months.
- Use Company information, contacts, pricing, or relationships for personal gain.

In the event of a breach of this clause, the Employee shall be liable to compensate the Company with liquidated damages of INR 3,00,000/- (Rupees Three Lakhs Only), in addition to any other legal remedies available under applicable law.

10. NON-SOLICITATION OF EMPLOYEES
For a period of one (1) year following separation from the Company, the Employee shall not directly or indirectly encourage, induce, recruit, or solicit any employee, consultant, or contractor of the Company to terminate their association with the Company.

11. TERM OF AGREEMENT
This Agreement shall remain in effect throughout the Employee's employment and for a period of three (3) years following termination. The obligations relating to trade secrets, intellectual property, and proprietary information shall survive indefinitely.

12. BREACH AND REMEDIES
The Employee acknowledges that any breach of this Agreement may cause substantial and irreparable harm to the Company. The Company shall have the right to: initiate disciplinary action, terminate employment, recover damages and losses, seek injunctive relief, and initiate civil and/or criminal proceedings as permitted by law.

13. GOVERNING LAW AND JURISDICTION
This Agreement shall be governed by and construed in accordance with the laws of India. Any dispute arising out of this Agreement shall be subject to the exclusive jurisdiction of the competent courts located in Hyderabad, Telangana.

14. EMPLOYEE DECLARATION
I hereby declare that:
- I have carefully read and understood this Agreement.
- I agree to abide by all terms and conditions contained herein.
- I acknowledge my responsibility to protect Company and Client Confidential Information.
- I understand that violation of this Agreement may result in disciplinary action, termination of employment, and legal proceedings.`

const CONTRACT_NDA = `NON-DISCLOSURE AGREEMENT (CONTRACT EMPLOYEE)

This Employee Confidentiality, Non-Disclosure and Intellectual Property Agreement ("Agreement") is entered into between ZAYRON INFOTECH PRIVATE LIMITED, a company incorporated under the Companies Act, 2013, having its registered office at Hyderabad, Telangana, India (hereinafter referred to as the "Company"); and the undersigned contractor/consultant (hereinafter referred to as the "Employee"). The Company and Employee are collectively referred to as the "Parties".

1. PURPOSE
The Company may disclose certain confidential, proprietary, technical, business, commercial, financial, operational, and client-related information to the Employee during the course of engagement. The purpose of this Agreement is to protect such Confidential Information and Intellectual Property belonging to the Company, its clients, business partners, vendors, and affiliates.

2. CONFIDENTIAL INFORMATION
For the purpose of this Agreement, "Confidential Information" includes, but is not limited to:

Business Information: Business plans and strategies, financial information, pricing and commercial proposals, customer and vendor information, marketing plans and business opportunities, internal policies and procedures.

Technical Information: Software applications and source code, product designs and architecture, databases and configurations, APIs and integrations, technical documentation, research and development information, validation and compliance documents.

Client Information: Client requirements and specifications, contracts and agreements, project deliverables, customer data, regulatory documentation, validation records and reports.

Electronic Information: Emails and communications, passwords and access credentials, cloud infrastructure information, security configurations, internal systems and repositories.

Confidential Information may be disclosed in written, oral, electronic, visual, or any other form.

3. EMPLOYEE CONFIDENTIALITY OBLIGATIONS
The Employee agrees that he/she shall:
(a) Maintain the strict confidentiality of all Confidential Information.
(b) Use Confidential Information solely for legitimate Company business purposes.
(c) Not disclose, copy, reproduce, transfer, publish, distribute, or communicate Confidential Information to any third party without prior written authorization from the Company.
(d) Exercise reasonable care and diligence to prevent unauthorized access, disclosure, misuse, or loss of Confidential Information.
(e) Immediately notify the Company of any actual or suspected breach of confidentiality.

4. CLIENT CONFIDENTIALITY
The Employee acknowledges that the Company provides services to various clients and may have access to client-owned confidential information. The Employee shall not disclose, copy, use, or share any client information except as required for authorized project activities. The Employee shall continue to protect client information even after separation from the Company.

5. INTELLECTUAL PROPERTY RIGHTS
The Employee agrees that all work products created, developed, conceived, designed, authored, or contributed during engagement shall be the exclusive property of the Company. This includes: software and source code, applications and systems, reports and documentation, SOPs and templates, validation deliverables, designs and inventions, business methodologies, training materials, databases and records. The Employee hereby assigns all rights, title, and interest in such intellectual property to the Company.

6. INFORMATION SECURITY
The Employee shall:
- Keep passwords and credentials secure.
- Use Company systems only for authorized business activities.
- Not install unauthorized software.
- Not transfer Company or Client data to personal devices or external storage without approval.
- Follow all Information Security, Data Privacy, and Cybersecurity policies issued by the Company.

7. COMPANY PROPERTY
All Company-issued assets including laptops, mobile devices, identity cards, access cards, documents, project files, software licenses, email accounts, and storage devices shall remain the sole property of the Company.

8. RETURN OF COMPANY PROPERTY
Upon resignation, termination, retirement, suspension, or upon request by the Company, the Employee shall immediately return all Company property and Confidential Information. The Employee shall not retain any copies in physical or electronic form.

9. CLIENT NON-SOLICITATION
The Employee agrees that during engagement and for a period of six (6) months following the termination of engagement, he/she shall not:
- Directly or indirectly solicit business from any client of the Company.
- Accept employment, consultancy, contract, outsourcing, freelance, or professional engagement with any Company client with whom the Employee had direct involvement during the preceding twelve (12) months.
- Use Company information, contacts, pricing, or relationships for personal gain.

In the event of a breach of this clause, the Employee shall be liable to compensate the Company with liquidated damages of INR 3,00,000/- (Rupees Three Lakhs Only), in addition to any other legal remedies available under applicable law.

10. NON-SOLICITATION OF EMPLOYEES
For a period of one (1) year following separation from the Company, the Employee shall not directly or indirectly encourage, induce, recruit, or solicit any employee, consultant, or contractor of the Company to terminate their association with the Company.

11. TERM OF AGREEMENT
This Agreement shall remain in effect throughout the Employee's engagement and for a period of three (3) years following termination. The obligations relating to trade secrets, intellectual property, and proprietary information shall survive indefinitely.

12. BREACH AND REMEDIES
The Employee acknowledges that any breach of this Agreement may cause substantial and irreparable harm to the Company. The Company shall have the right to: initiate disciplinary action, terminate engagement, recover damages and losses, seek injunctive relief, and initiate civil and/or criminal proceedings as permitted by law.

13. GOVERNING LAW AND JURISDICTION
This Agreement shall be governed by and construed in accordance with the laws of India. Any dispute arising out of this Agreement shall be subject to the exclusive jurisdiction of the competent courts located in Hyderabad, Telangana.

14. EMPLOYEE DECLARATION
I hereby declare that:
- I have carefully read and understood this Agreement.
- I agree to abide by all terms and conditions contained herein.
- I acknowledge my responsibility to protect Company and Client Confidential Information.
- I understand that violation of this Agreement may result in disciplinary action, termination of engagement, and legal proceedings.`

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      {children}
      {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>⚠ {error}</div>}
    </div>
  )
}

const inp = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
  borderRadius: 8, fontSize: 14, color: '#1e293b', background: '#f8fafc',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

export default function NDAForm() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [form, setForm] = useState({
    full_name: '', address: '', mobile: '', aadhaar_number: '',
    emergency_contact: '', signed_date: new Date().toISOString().split('T')[0]
  })
  const [errors, setErrors] = useState({})

  useState(() => {
    api.get(`/employees/token/${token}/`).then(r => {
      const emp = r.data
      if (emp.nda_status) { navigate(`/onboarding/${token}/details`); return }
      if (emp.status === 'completed') { navigate(`/onboarding/${token}/complete`); return }
      setEmployee(emp)
      setForm(f => ({ ...f, full_name: emp.name, mobile: emp.mobile }))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [token])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Required'
    if (!form.address.trim()) errs.address = 'Required'
    if (!form.mobile.trim()) errs.mobile = 'Required'
    if (!/^\d{12}$/.test(form.aadhaar_number)) errs.aadhaar_number = 'Must be 12 digits'
    if (!form.emergency_contact.trim()) errs.emergency_contact = 'Required'
    if (!agreed) errs.agreed = 'You must agree to the NDA terms'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await api.post(`/ndas/submit/${token}/`, { ...form, signature: '' })
      toast.success('NDA submitted successfully!')
      navigate(`/onboarding/${token}/details`)
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') setErrors(d)
      toast.error(err.response?.data?.error || 'Submission failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e3a8a,#4f46e5)' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, opacity: 0.8 }}>Loading your onboarding...</p>
      </div>
    </div>
  )

  if (!employee) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e3a8a,#4f46e5)' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <h2 style={{ color: '#ef4444', marginBottom: 8 }}>Invalid Link</h2>
        <p style={{ color: '#64748b' }}>This onboarding link is invalid or has expired.</p>
      </div>
    </div>
  )

  const isPermanent = employee.employee_type === 'permanent'
  const ndaText = isPermanent ? PERMANENT_NDA : CONTRACT_NDA

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#312e81 100%)', padding: '0 0 60px' }}>

      {/* Top header */}
      <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '14px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <img src="/static/img/logo1.png" alt="Zayron" style={{ height: 36, width: 36, objectFit: 'contain', background: 'white', borderRadius: 8, padding: 3 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Zayron Infotech Pvt. Ltd.</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>Employee Onboarding Portal</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 0' }}>

        {/* Welcome banner */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 14 }}>
            <span style={{ fontSize: 14 }}>👋</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Welcome, <strong style={{ color: 'white' }}>{employee.name}</strong></span>
          </div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Employee Onboarding</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>Complete the steps below to finish your onboarding with Zayron Infotech.</p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, gap: 0 }}>
          {[{ n: 1, label: 'NDA Agreement', icon: '📋' }, { n: 2, label: 'Personal Details', icon: '👤' }, { n: 3, label: 'Complete', icon: '✅' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: s.n === 1 ? 'white' : 'rgba(255,255,255,0.15)',
                  border: s.n === 1 ? '2px solid white' : '2px solid rgba(255,255,255,0.25)',
                  color: s.n === 1 ? '#1e3a8a' : 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: s.n === 1 ? 18 : 15,
                  fontWeight: 700,
                  boxShadow: s.n === 1 ? '0 0 0 6px rgba(255,255,255,0.15)' : 'none',
                }}>{s.n === 1 ? s.icon : s.n}</div>
                <span style={{ fontSize: 11, fontWeight: s.n === 1 ? 700 : 400, color: s.n === 1 ? 'white' : 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ width: 80, height: 2, background: 'rgba(255,255,255,0.2)', margin: '0 10px', marginBottom: 18 }} />}
            </div>
          ))}
        </div>

        {/* Employee info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { icon: '👤', label: 'Employee Name', value: employee.name },
            { icon: '🏷️', label: 'Employment Type', value: isPermanent ? 'Permanent Employee' : 'Contract Employee' },
            { icon: '📅', label: 'Joining Date', value: employee.joining_date },
          ].map(c => (
            <div key={c.label} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 18px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>{c.value}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* NDA Document */}
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            {/* NDA header */}
            <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📋</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>Non-Disclosure Agreement</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
                  {isPermanent ? 'Permanent Employee NDA — 3 years post-employment, 1-year non-compete' : 'Contract Employee NDA — 3 years post-engagement, 6-month non-compete'}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', background: isPermanent ? 'rgba(99,102,241,0.3)' : 'rgba(236,72,153,0.3)', border: `1px solid ${isPermanent ? 'rgba(165,180,252,0.4)' : 'rgba(251,182,206,0.4)'}`, borderRadius: 8, padding: '5px 12px', fontSize: 12, color: 'white', fontWeight: 600 }}>
                {isPermanent ? '🔵 Permanent' : '🟣 Contract'}
              </div>
            </div>

            {/* NDA text */}
            <div style={{ padding: '0 28px 28px' }}>
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '20px 22px', maxHeight: 280, overflowY: 'auto', marginTop: 20, marginBottom: 20 }}>
                <pre style={{ fontFamily: 'inherit', fontSize: 13, lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap', margin: 0 }}>{ndaText}</pre>
              </div>

              {/* Info notice */}
              <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 24 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                  Please read the entire NDA carefully before filling in your details and submitting. This is a legally binding document.
                </div>
              </div>

              {/* Form fields */}
              <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <span style={{ fontSize: 16 }}>📝</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Your Information</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>— Fill in the details below to sign the NDA</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  <Field label="Full Name" error={errors.full_name}>
                    <input style={inp} value={form.full_name} onChange={e => set('full_name', e.target.value)} autoComplete="off" />
                  </Field>
                  <Field label="Mobile Number" error={errors.mobile}>
                    <input style={inp} value={form.mobile} onChange={e => set('mobile', e.target.value)} autoComplete="off" />
                  </Field>
                  <Field label="Aadhaar Number" error={errors.aadhaar_number}>
                    <input style={inp} placeholder="12-digit Aadhaar number" maxLength={12} value={form.aadhaar_number} onChange={e => set('aadhaar_number', e.target.value.replace(/\D/g, ''))} autoComplete="off" />
                  </Field>
                  <Field label="Emergency Contact Number" error={errors.emergency_contact}>
                    <input style={inp} placeholder="10-digit mobile number" value={form.emergency_contact} onChange={e => set('emergency_contact', e.target.value)} autoComplete="off" />
                  </Field>
                  <Field label="Date of Signing" error={errors.signed_date}>
                    <input type="date" style={inp} value={form.signed_date} onChange={e => set('signed_date', e.target.value)} />
                  </Field>
                </div>

                <Field label="Residential Address" error={errors.address}>
                  <textarea style={{ ...inp, height: 90, resize: 'vertical' }} placeholder="Full residential address (Door no., Street, City, State, PIN)" value={form.address} onChange={e => set('address', e.target.value)} />
                </Field>

                {/* Agreement */}
                <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '16px 18px', marginBottom: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                    <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors(er => ({ ...er, agreed: '' })) }}
                      style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: '#16a34a' }} />
                    <span style={{ fontSize: 14, color: '#166534', lineHeight: 1.7 }}>
                      I have read, understood, and agree to be <strong>legally bound</strong> by the terms and conditions of this Non-Disclosure Agreement with <strong>Zayron Infotech Pvt. Ltd.</strong>
                    </span>
                  </label>
                </div>
                {errors.agreed && <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 16 }}>⚠ {errors.agreed}</div>}
              </div>
            </div>

            {/* Footer / submit */}
            <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>🔒 This document is encrypted and securely stored.</div>
              <button type="submit" disabled={submitting} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 10, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                background: submitting ? '#94a3b8' : 'linear-gradient(135deg,#1e3a8a,#3b82f6)',
                color: 'white', fontSize: 15, fontWeight: 700,
                boxShadow: submitting ? 'none' : '0 4px 14px rgba(30,58,138,0.4)',
              }}>
                {submitting
                  ? <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                  : <>✓ Submit NDA &amp; Continue</>}
              </button>
            </div>
          </div>
        </form>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
          © 2026 Zayron Infotech Pvt. Ltd. · All rights reserved.
        </div>
      </div>
    </div>
  )
}
