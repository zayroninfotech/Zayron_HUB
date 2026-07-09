import { useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import SignatureCanvas from 'react-signature-canvas'
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

function Steps({ current }) {
  const steps = [
    { label: 'NDA Agreement', num: 1 },
    { label: 'Personal Details', num: 2 },
    { label: 'Complete', num: 3 },
  ]
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <>
          <div className="step" key={s.num}>
            <div className={`step-num ${s.num < current ? 'done' : s.num === current ? 'active' : 'pending'}`}>
              {s.num < current ? '✓' : s.num}
            </div>
            <span className={`step-label ${s.num > current ? 'pending' : ''}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-divider ${s.num < current ? 'done' : ''}`} key={`d${i}`} />}
        </>
      ))}
    </div>
  )
}

export default function NDAForm() {
  const { token } = useParams()
  const navigate = useNavigate()
  const sigRef = useRef(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [uploadedSig, setUploadedSig] = useState(null)
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
    <div className="loading-page">
      <div className="spinner-dark" style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderRadius: '50%', borderTopColor: '#1e40af', animation: 'spin 0.8s linear infinite' }} />
      <p>Loading...</p>
    </div>
  )

  if (!employee) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', maxWidth: 420 }}>
        <h2 style={{ color: 'var(--danger)' }}>Invalid Link</h2>
        <p style={{ color: 'var(--gray-500)', marginTop: 8 }}>This onboarding link is invalid or has expired.</p>
      </div>
    </div>
  )

  const ndaText = employee.employee_type === 'permanent' ? PERMANENT_NDA : CONTRACT_NDA

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="logo">
            <img src="/static/img/logo1.png" alt="Zayron Infotech" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
          </div>
          <h1>Employee Onboarding</h1>
          <p>Welcome, {employee.name}! Please complete your onboarding.</p>
        </div>

        <Steps current={1} />

        <div className="onboarding-card">
          <div className="onboarding-card-header">
            <h2>Non-Disclosure Agreement</h2>
            <p>Please read the NDA carefully, fill in your details, and sign below.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="onboarding-card-body">
              {/* Employee info summary */}
              <div className="info-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><strong>Name:</strong> {employee.name}</div>
                <div><strong>Type:</strong> {employee.employee_type === 'permanent' ? 'Permanent' : 'Contract'}</div>
                <div><strong>Joining Date:</strong> {employee.joining_date}</div>
              </div>

              {/* NDA Type */}
              <div className="nda-type-badge">
                📋 {employee.employee_type === 'permanent' ? 'Permanent Employee' : 'Contract Employee'} NDA
              </div>

              {/* NDA Content */}
              <div className="nda-content">{ndaText}</div>

              {/* Form fields */}
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--gray-800)' }}>Your Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input className="form-control" value={form.full_name} onChange={e => set('full_name', e.target.value)} autoComplete="off" spellCheck={false} />
                  {errors.full_name && <div className="form-error">{errors.full_name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number <span className="required">*</span></label>
                  <input className="form-control" value={form.mobile} onChange={e => set('mobile', e.target.value)} autoComplete="off" spellCheck={false} />
                  {errors.mobile && <div className="form-error">{errors.mobile}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar Number <span className="required">*</span></label>
                  <input className="form-control" placeholder="12-digit Aadhaar number" maxLength={12} value={form.aadhaar_number} onChange={e => set('aadhaar_number', e.target.value.replace(/\D/g, ''))} autoComplete="off" spellCheck={false} />
                  {errors.aadhaar_number && <div className="form-error">{errors.aadhaar_number}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact <span className="required">*</span></label>
                  <input className="form-control" placeholder="Emergency contact number" value={form.emergency_contact} onChange={e => set('emergency_contact', e.target.value)} autoComplete="off" spellCheck={false} />
                  {errors.emergency_contact && <div className="form-error">{errors.emergency_contact}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date <span className="required">*</span></label>
                  <input type="date" className="form-control" value={form.signed_date} onChange={e => set('signed_date', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address <span className="required">*</span></label>
                <textarea className="form-control" rows={3} placeholder="Full residential address" value={form.address} onChange={e => set('address', e.target.value)} />
                {errors.address && <div className="form-error">{errors.address}</div>}
              </div>

              {/* Agreement checkbox */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
                <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors(er => ({ ...er, agreed: '' })) }} style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer' }} />
                <span style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.6 }}>
                  I have read, understood, and agree to be legally bound by the terms and conditions of this Non-Disclosure Agreement with Zayron Infotech Pvt. Ltd.
                </span>
              </label>
              {errors.agreed && <div className="form-error" style={{ marginTop: -14, marginBottom: 14 }}>{errors.agreed}</div>}

            </div>

            <div className="onboarding-card-footer">
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? <><span className="spinner" /> Submitting NDA...</> : '✓ Submit NDA & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
