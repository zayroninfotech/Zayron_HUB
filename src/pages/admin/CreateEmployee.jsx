import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Support']

/* Floating label input */
function FloatInput({ label, error, type = 'text', value, onChange, hint, children, list, required }) {
  const [focused, setFocused] = useState(false)
  // label floats up when: focused, has value, is select (always has value), or is date (always shows format)
  const isSelect = !!children
  const isDate = type === 'date'
  const floated = focused || (value && value.length > 0) || isSelect || isDate

  const sharedEvents = {
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  }

  const borderColor = error ? '#ef4444' : focused ? '#6366f1' : '#e2e8f0'
  const boxShadow = focused ? (error ? '0 0 0 3px rgba(239,68,68,0.12)' : '0 0 0 3px rgba(99,102,241,0.12)') : 'none'

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ position: 'relative' }}>
        {isSelect ? (
          <select
            value={value}
            onChange={onChange}
            {...sharedEvents}
            style={{ ...inputBase, borderColor, boxShadow, paddingTop: 20, paddingBottom: 6, cursor: 'pointer' }}
          >
            {children}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            list={list}
            autoComplete="off"
            spellCheck={false}
            placeholder={focused ? (type === 'date' ? '' : '') : ''}
            {...sharedEvents}
            style={{ ...inputBase, borderColor, boxShadow, paddingTop: 20, paddingBottom: 6 }}
          />
        )}

        <label style={{
          position: 'absolute',
          left: 14,
          top: floated ? 7 : '50%',
          transform: floated ? 'none' : 'translateY(-50%)',
          fontSize: floated ? 11 : 14,
          fontWeight: floated ? 600 : 400,
          color: error ? '#ef4444' : focused ? '#6366f1' : '#94a3b8',
          pointerEvents: 'none',
          transition: 'all 0.18s ease',
          whiteSpace: 'nowrap',
        }}>
          {label}{required && <span style={{ color: error ? '#ef4444' : '#ef4444', marginLeft: 2 }}>*</span>}
        </label>

        {list && <datalist id={list}>{DEPARTMENTS.map(d => <option key={d} value={d} />)}</datalist>}
      </div>
      {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 5, paddingLeft: 2 }}>⚠ {error}</div>}
      {hint && !error && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, paddingLeft: 2 }}>{hint}</div>}
    </div>
  )
}

export default function CreateEmployee() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', employee_type: '', joining_date: '', employee_id: ''
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required'
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address'
    if (!form.mobile.trim()) errs.mobile = 'Mobile number is required'
    if (!form.employee_type) errs.employee_type = 'Please select employee type'
    if (!form.joining_date) errs.joining_date = 'Joining date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await api.post('/employees/', form)
      toast.success(`Employee created! Onboarding email sent to ${data.email}.`)
      navigate('/admin/employees')
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') {
        setErrors(d)
        toast.error('Please fix the errors and try again.')
      } else {
        toast.error('Failed to create employee. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Add New Employee" actions={
      <button onClick={() => navigate('/admin/employees')} style={backBtn}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Employees
      </button>
    }>

      {/* Hero banner */}
      <div style={heroBanner}>
        <div style={heroLeft}>
          <div style={heroIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>New Employee Registration</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: 5, fontSize: 13, lineHeight: 1.5 }}>
              Register a new employee and automatically trigger their onboarding workflow at Zayron Infotech Pvt. Ltd.
            </p>
          </div>
        </div>
        <div style={heroBadges}>
          {[
            { icon: '✉️', label: 'Welcome Email', sub: 'Auto-sent' },
            { icon: '📄', label: 'NDA Agreement', sub: 'Digital sign' },
            { icon: '✅', label: 'Onboarding', sub: 'Self-service' },
          ].map(s => (
            <div key={s.label} style={heroBadge}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 5, color: 'white' }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div>

        {/* Form card */}
        <div style={formCard}>
          {/* Email notice */}
          <div style={emailNotice}>
            <div style={emailNoticeIcon}>✉️</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>Welcome Email Will Be Sent Automatically</div>
              <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>A unique onboarding link will be emailed to the employee right after registration.</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Personal Section */}
            <SectionHead icon="👤" title="Personal Information" />
            <div style={grid2}>
              <FloatInput label="Employee ID" value={form.employee_id} onChange={e => set('employee_id', e.target.value)} error={errors.employee_id} hint="Used as login username" required />
              <FloatInput label="Full Name As per official ID" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} required />
            </div>
            <div style={grid2}>
              <FloatInput label="Mobile Number" value={form.mobile} onChange={e => set('mobile', e.target.value)} error={errors.mobile} hint="10-digit number" required />
              <div /></div>
            <FloatInput label="Personal Email Address" type="email" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} hint="Onboarding link will be sent here" required />

            {/* Employment Section */}
            <SectionHead icon="🏢" title="Employment Details" />
            <div style={grid2}>
              <FloatInput label="Employee Type" value={form.employee_type} onChange={e => set('employee_type', e.target.value)} error={errors.employee_type} required>
                <option value="">-- Select --</option>
                <option value="permanent">Permanent Employee</option>
                <option value="contract">Contract Employee</option>
                <option value="intern">Intern</option>
              </FloatInput>
              <FloatInput label="Joining Date" type="date" value={form.joining_date} onChange={e => set('joining_date', e.target.value)} error={errors.joining_date} required />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <button type="submit" disabled={loading} style={submitBtn}>
                {loading
                  ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Creating Employee...</>
                  : <>✉️ &nbsp;Create &amp; Send Onboarding Email</>}
              </button>
              <button type="button" onClick={() => navigate('/admin/employees')} style={cancelBtn}>Cancel</button>
            </div>
          </form>
        </div>

      </div>
    </Layout>
  )
}

function SectionHead({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, marginTop: 8, paddingBottom: 10, borderBottom: '2px solid #f1f5f9' }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</span>
    </div>
  )
}


/* Shared styles */
const inputBase = {
  width: '100%',
  padding: '20px 14px 6px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 14,
  color: '#1e293b',
  background: '#f8fafc',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
  fontFamily: 'inherit',
  height: 56,
}


const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }

const formCard = {
  background: 'white',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  padding: '28px 32px',
}

const emailNotice = {
  display: 'flex', gap: 12, alignItems: 'flex-start',
  background: '#eff6ff', border: '1px solid #bfdbfe',
  borderRadius: 10, padding: '13px 16px', marginBottom: 26,
}
const emailNoticeIcon = { fontSize: 20, flexShrink: 0 }

const heroBanner = {
  background: 'linear-gradient(135deg, #1e3a8a 0%, #4f46e5 60%, #6366f1 100%)',
  borderRadius: 16, padding: '26px 30px', marginBottom: 22,
  display: 'flex', alignItems: 'center', gap: 24, color: 'white',
  boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
}
const heroLeft = { display: 'flex', alignItems: 'center', gap: 18, flex: 1 }
const heroIcon = {
  width: 58, height: 58, borderRadius: 14,
  background: 'rgba(255,255,255,0.15)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
const heroBadges = { display: 'flex', gap: 12, flexShrink: 0 }
const heroBadge = {
  textAlign: 'center', background: 'rgba(255,255,255,0.12)',
  borderRadius: 12, padding: '10px 16px', minWidth: 90,
  backdropFilter: 'blur(4px)',
}

const backBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '9px 18px', borderRadius: 9,
  border: '1.5px solid #e2e8f0', background: 'white',
  color: '#475569', fontSize: 13, fontWeight: 500, cursor: 'pointer',
}

const submitBtn = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '13px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
  color: 'white', fontSize: 15, fontWeight: 600,
  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
}

const cancelBtn = {
  padding: '13px 24px', borderRadius: 10, border: '1.5px solid #e2e8f0',
  background: 'white', color: '#475569', fontSize: 14, fontWeight: 500, cursor: 'pointer',
}
