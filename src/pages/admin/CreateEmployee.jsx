import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import api from '../../api/axios'

function FloatInput({ label, error, type = 'text', value, onChange, hint, children, list, required }) {
  const [focused, setFocused] = useState(false)
  const isSelect = !!children
  const isDate = type === 'date'
  const floated = focused || (value && value.length > 0) || isSelect || isDate

  const sharedEvents = {
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  }

  const borderColor = error ? '#ef4444' : focused ? '#6366f1' : '#d1d5db'
  const boxShadow = focused ? (error ? '0 0 0 3px rgba(239,68,68,0.10)' : '0 0 0 3px rgba(99,102,241,0.10)') : 'none'

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ position: 'relative' }}>
        {isSelect ? (
          <select
            value={value}
            onChange={onChange}
            {...sharedEvents}
            style={{ ...inputBase, borderColor, boxShadow, paddingTop: 22, paddingBottom: 6, cursor: 'pointer' }}
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
            {...sharedEvents}
            style={{ ...inputBase, borderColor, boxShadow, paddingTop: 22, paddingBottom: 6 }}
          />
        )}
        <label style={{
          position: 'absolute', left: 14,
          top: floated ? 7 : '50%',
          transform: floated ? 'none' : 'translateY(-50%)',
          fontSize: floated ? 10 : 14,
          fontWeight: floated ? 700 : 400,
          color: error ? '#ef4444' : focused ? '#6366f1' : '#9ca3af',
          pointerEvents: 'none',
          transition: 'all 0.18s ease',
          whiteSpace: 'nowrap',
          letterSpacing: floated ? '0.04em' : 'normal',
          textTransform: floated ? 'uppercase' : 'none',
        }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </label>
        {list && <datalist id={list} />}
      </div>
      {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4, paddingLeft: 2 }}>⚠ {error}</div>}
      {hint && !error && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, paddingLeft: 2 }}>{hint}</div>}
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

  const clearForm = () => {
    setForm({ name: '', email: '', mobile: '', employee_type: '', joining_date: '', employee_id: '' })
    setErrors({})
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
    <Layout title="Add New Employee">
      <div style={{ maxWidth: 780, margin: '32px auto', padding: '0 24px 48px' }}>

        {/* Email notice */}
        <div style={emailNotice}>
          <span style={{ fontSize: 18 }}>✉️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>Welcome Email Will Be Sent Automatically</div>
            <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>A unique onboarding link will be emailed to the employee right after registration.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Section */}
          <SectionHead title="Personal Information" />
          <div style={grid2}>
            <FloatInput label="Employee ID" value={form.employee_id} onChange={e => set('employee_id', e.target.value)} error={errors.employee_id} hint="Used as login username" required />
            <FloatInput label="Full Name As per official ID" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} required />
          </div>
          <div style={grid2}>
            <FloatInput label="Mobile Number" value={form.mobile} onChange={e => set('mobile', e.target.value)} error={errors.mobile} hint="10-digit number" required />
            <div />
          </div>
          <FloatInput label="Personal Email Address" type="email" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} hint="Onboarding link will be sent here" required />

          {/* Employment Section */}
          <SectionHead title="Employment Details" />
          <div style={grid2}>
            <FloatInput label="Employee Type" value={form.employee_type} onChange={e => set('employee_type', e.target.value)} error={errors.employee_type} required>
              <option value="">-- Select --</option>
              <option value="permanent">Permanent Employee</option>
              <option value="contract">Contract Employee</option>
              <option value="intern">Intern</option>
            </FloatInput>
            <FloatInput label="Joining Date" type="date" value={form.joining_date} onChange={e => set('joining_date', e.target.value)} error={errors.joining_date} required />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating...</> : 'Submit'}
            </button>
            <button type="button" onClick={clearForm} style={clearBtn}>Clear</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

function SectionHead({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 16px', paddingBottom: 10, borderBottom: '1.5px solid #e5e7eb' }}>
      <div style={{ width: 3, height: 16, borderRadius: 2, background: '#6366f1' }} />
      <span style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
    </div>
  )
}

const inputBase = {
  width: '100%',
  padding: '22px 14px 6px',
  border: '1.5px solid #d1d5db',
  borderRadius: 10,
  fontSize: 14,
  color: '#111827',
  background: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
  fontFamily: 'inherit',
  height: 58,
}

const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }

const emailNotice = {
  display: 'flex', gap: 12, alignItems: 'center',
  background: '#eff6ff', border: '1px solid #bfdbfe',
  borderRadius: 10, padding: '13px 16px', marginBottom: 8,
}

const submitBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '13px 36px', borderRadius: 10, border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
  color: 'white', fontSize: 14, fontWeight: 700,
  boxShadow: '0 4px 14px rgba(99,102,241,0.30)',
  transition: 'opacity 0.2s',
}

const clearBtn = {
  padding: '13px 28px', borderRadius: 10,
  border: '1.5px solid #d1d5db',
  background: 'white', color: '#6b7280',
  fontSize: 14, fontWeight: 600, cursor: 'pointer',
}
