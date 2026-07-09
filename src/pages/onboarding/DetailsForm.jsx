import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

function FileField({ label, name, value, onChange, accept, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span className="required">*</span>}</label>
      <div className="file-upload">
        <label className={`file-upload-label ${value ? 'has-file' : ''}`}>
          <span style={{ fontSize: 18 }}>{value ? '✓' : '📎'}</span>
          <span className={`file-upload-text ${value ? 'has-file' : ''}`}>
            {value ? value.name : `Click to upload ${label}`}
          </span>
          <input type="file" name={name} accept={accept} onChange={onChange} />
        </label>
      </div>
    </div>
  )
}

function FormGroup({ label, name, required: req, errors, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{req && <span className="required">*</span>}</label>
      {children}
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  )
}

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

export default function DetailsForm() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    father_name: '', date_of_birth: '', gender: '', blood_group: '',
    address: '',
    bank_name: '', account_number: '', ifsc_code: '',
    emergency_contact_name: '', emergency_contact: '',
  })

  const [files, setFiles] = useState({
    photograph: null, resume: null, aadhaar_copy: null, pan_copy: null, educational_certificates: null
  })

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const setFile = (k, file) => { setFiles(f => ({ ...f, [k]: file })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const errs = {}
    const required = ['father_name', 'date_of_birth', 'gender', 'blood_group', 'address', 'bank_name', 'account_number', 'ifsc_code', 'emergency_contact_name', 'emergency_contact']
    required.forEach(k => { if (!form[k].trim()) errs[k] = 'This field is required' })
    if (form.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code.toUpperCase())) errs.ifsc_code = 'Invalid IFSC format'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) { toast.error('Please fill all required fields correctly.'); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries({ ...form, ifsc_code: form.ifsc_code.toUpperCase() }).forEach(([k, v]) => fd.append(k, v))
      Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v) })
      await api.post(`/documents/submit/${token}/`, fd)
      toast.success('Details submitted successfully!')
      navigate(`/onboarding/${token}/complete`)
    } catch (err) {
      const d = err.response?.data
      const msg = d?.error || d?.detail || JSON.stringify(d) || err.message || 'Submission failed.'
      if (d && d.details) { setErrors(d.details); }
      toast.error(msg)
    } finally { setSubmitting(false) }
  }


  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="logo">
            <img src="/static/img/logo1.png" alt="Zayron Infotech" style={{ height: 40, width: 'auto' }} />
            <span style={{ marginLeft: 10, fontWeight: 700, color: '#1e40af', fontSize: 16 }}>Zayron Infotech Pvt. Ltd.</span>
          </div>
          <h1>Personal Details</h1>
          <p>Please provide your personal information and upload required documents.</p>
        </div>

        <Steps current={2} />

        <div className="onboarding-card">
          <div className="onboarding-card-header">
            <h2>Personal Information Form</h2>
            <p>All fields marked with * are required.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="onboarding-card-body">
              <div className="success-block">✓ NDA has been signed and submitted. Please complete your personal details below.</div>

              {/* Personal */}
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Information</h3>
              <div className="form-grid">
                <FormGroup errors={errors}label="Father's Name" name="father_name" required>
                  <input className="form-control" value={form.father_name} onChange={e => set('father_name', e.target.value)} autoComplete="off" spellCheck={false} />
                </FormGroup>
                <FormGroup errors={errors}label="Date of Birth" name="date_of_birth" required>
                  <input type="date" className="form-control" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
                </FormGroup>
                <FormGroup errors={errors}label="Gender" name="gender" required>
                  <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </FormGroup>
                <FormGroup errors={errors}label="Blood Group" name="blood_group" required>
                  <select className="form-control" value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                    <option value="">Select Blood Group</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </FormGroup>
              </div>
              <FormGroup errors={errors}label="Residential Address" name="address" required>
                <textarea className="form-control" rows={3} placeholder="Full residential address including city, state, PIN" value={form.address} onChange={e => set('address', e.target.value)} />
              </FormGroup>

              <hr style={{ margin: '20px 0', borderColor: 'var(--gray-100)' }} />

              {/* Bank */}
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee Bank Details</h3>
              <div className="form-grid">
                <FormGroup errors={errors}label="Bank Name" name="bank_name" required>
                  <input className="form-control" placeholder="e.g. State Bank of India" value={form.bank_name} onChange={e => set('bank_name', e.target.value)} autoComplete="off" spellCheck={false} />
                </FormGroup>
                <FormGroup errors={errors}label="Account Number" name="account_number" required>
                  <input className="form-control" placeholder="Bank account number" value={form.account_number} onChange={e => set('account_number', e.target.value.replace(/\D/g, ''))} style={{ fontFamily: 'monospace' }} autoComplete="off" spellCheck={false} />
                </FormGroup>
                <FormGroup errors={errors}label="IFSC Code" name="ifsc_code" required>
                  <input className="form-control" placeholder="e.g. SBIN0001234" maxLength={11} value={form.ifsc_code} onChange={e => set('ifsc_code', e.target.value.toUpperCase())} style={{ fontFamily: 'monospace' }} autoComplete="off" spellCheck={false} />
                </FormGroup>
              </div>

              <hr style={{ margin: '20px 0', borderColor: 'var(--gray-100)' }} />

              {/* Emergency */}
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Contact</h3>
              <div className="form-grid">
                <FormGroup errors={errors}label="Emergency Contact Name" name="emergency_contact_name" required>
                  <input className="form-control" placeholder="Full name of emergency contact" value={form.emergency_contact_name} onChange={e => set('emergency_contact_name', e.target.value)} autoComplete="off" spellCheck={false} />
                </FormGroup>
                <FormGroup errors={errors}label="Emergency Contact Number" name="emergency_contact" required>
                  <input className="form-control" placeholder="Mobile number" value={form.emergency_contact} onChange={e => set('emergency_contact', e.target.value)} autoComplete="off" spellCheck={false} />
                </FormGroup>
              </div>

              <hr style={{ margin: '20px 0', borderColor: 'var(--gray-100)' }} />

              {/* Documents */}
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Uploads</h3>
              <div className="warning-block">
                ⚠ Please upload clear, legible copies. Accepted formats: PDF, JPG, PNG (max 5MB each).
              </div>
              <div className="form-grid">
                <FileField label="Photograph" name="photograph" value={files.photograph} accept="image/*" onChange={e => setFile('photograph', e.target.files[0])} />
                <FileField label="Resume / CV" name="resume" value={files.resume} accept=".pdf,.doc,.docx" onChange={e => setFile('resume', e.target.files[0])} />
                <FileField label="Aadhaar Card Copy" name="aadhaar_copy" value={files.aadhaar_copy} accept=".pdf,image/*" onChange={e => setFile('aadhaar_copy', e.target.files[0])} />
                <FileField label="PAN Card Copy" name="pan_copy" value={files.pan_copy} accept=".pdf,image/*" onChange={e => setFile('pan_copy', e.target.files[0])} />
                <FileField label="Educational Certificates" name="educational_certificates" value={files.educational_certificates} accept=".pdf,.zip,image/*" onChange={e => setFile('educational_certificates', e.target.files[0])} />
              </div>
            </div>

            <div className="onboarding-card-footer">
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? <><span className="spinner" /> Submitting...</> : '✓ Submit & Complete Onboarding'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
