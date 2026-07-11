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

  const borderColor = error ? '#ef4444' : focused ? '#6366f1' : '#e2e8f0'
  const boxShadow = focused
    ? error ? '0 0 0 3px rgba(239,68,68,0.10)' : '0 0 0 3px rgba(99,102,241,0.10)'
    : 'none'

  const baseStyle = {
    ...inputBase,
    borderColor,
    boxShadow,
    background: focused ? '#fff' : '#fafbfc',
  }

  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ position: 'relative' }}>
        {isSelect ? (
          <select value={value} onChange={onChange} {...sharedEvents}
            style={{ ...baseStyle, paddingTop: 24, paddingBottom: 8, cursor: 'pointer' }}>
            {children}
          </select>
        ) : (
          <input type={type} value={value} onChange={onChange} list={list}
            autoComplete="off" spellCheck={false} {...sharedEvents}
            style={{ ...baseStyle, paddingTop: 24, paddingBottom: 8 }} />
        )}
        <label style={{
          position: 'absolute', left: 16,
          top: floated ? 8 : '50%',
          transform: floated ? 'none' : 'translateY(-50%)',
          fontSize: floated ? 10 : 14,
          fontWeight: floated ? 700 : 400,
          color: error ? '#ef4444' : focused ? '#6366f1' : '#a0aec0',
          pointerEvents: 'none',
          transition: 'all 0.18s ease',
          whiteSpace: 'nowrap',
          letterSpacing: floated ? '0.05em' : 'normal',
          textTransform: floated ? 'uppercase' : 'none',
        }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </label>
        {list && <datalist id={list} />}
      </div>
      {error && <p style={hintStyle('#ef4444')}>⚠ {error}</p>}
      {hint && !error && <p style={hintStyle('#a0aec0')}>{hint}</p>}
    </div>
  )
}

const hintStyle = c => ({ margin: '5px 0 0 2px', fontSize: 11, color: c })

export default function CreateEmployee() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', mobile: '', employee_type: '', joining_date: '', employee_id: '' })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const clearForm = () => {
    setForm({ name: '', email: '', mobile: '', employee_type: '', joining_date: '', employee_id: '' })
    setErrors({})
  }

  const validate = () => {
    const errs = {}
    if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required'
    if (!form.name.trim()) errs.name = 'Full name is required'
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
      if (d && typeof d === 'object') { setErrors(d); toast.error('Please fix the errors and try again.') }
      else toast.error('Failed to create employee. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <Layout title="Add New Employee">
      <style>{`
        .ce-wrap { padding: 16px 24px 24px; }
        .ce-notice {
          display: flex; align-items: center; gap: 12px;
          background: linear-gradient(135deg,#eff6ff,#e0e7ff);
          border: 1px solid #c7d2fe; border-radius: 10px;
          padding: 10px 16px; margin-bottom: 14px;
        }
        .ce-notice-icon {
          width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg,#6366f1,#818cf8);
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .ce-section {
          display: flex; align-items: center; gap: 10px;
          margin: 14px 0 10px; padding-bottom: 8px;
          border-bottom: 1.5px solid #e2e8f0;
        }
        .ce-section-bar { width: 4px; height: 16px; border-radius: 2px; background: linear-gradient(180deg,#6366f1,#818cf8); flex-shrink: 0; }
        .ce-section-label { font-size: 11px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.09em; }
        .ce-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
        .ce-row { margin-bottom: 10px; }
        .ce-actions { display: flex; gap: 12px; margin-top: 18px; padding-top: 16px; border-top: 1.5px solid #f1f5f9; }
        .ce-submit {
          padding: 13px 40px; border-radius: 10px; border: none; cursor: pointer;
          background: linear-gradient(135deg,#4f46e5,#6366f1);
          color: white; font-size: 14px; font-weight: 700;
          box-shadow: 0 4px 16px rgba(99,102,241,0.30);
          transition: opacity 0.2s, transform 0.15s;
        }
        .ce-submit:hover { opacity: 0.92; transform: translateY(-1px); }
        .ce-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .ce-clear {
          padding: 13px 28px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; background: white;
          color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .ce-clear:hover { border-color: #cbd5e1; color: #334155; }
      `}</style>

      <div className="ce-wrap">


        <form onSubmit={handleSubmit}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FloatInput label="Employee ID" value={form.employee_id} onChange={e => set('employee_id', e.target.value)} error={errors.employee_id} required />
            <FloatInput label="Full Name As per Official ID" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} required />
            <FloatInput label="Mobile Number" value={form.mobile} onChange={e => set('mobile', e.target.value)} error={errors.mobile} required />
            <FloatInput label="Personal Email Address" type="email" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} required />
            <FloatInput label="Employee Type" value={form.employee_type} onChange={e => set('employee_type', e.target.value)} error={errors.employee_type} required>
              <option value="">-- Select --</option>
              <option value="permanent">Permanent Employee</option>
              <option value="contract">Contract Employee</option>
              <option value="intern">Intern</option>
            </FloatInput>
            <FloatInput label="Joining Date" type="date" value={form.joining_date} onChange={e => set('joining_date', e.target.value)} error={errors.joining_date} required />
          </div>

          <div className="ce-actions">
            <button type="submit" disabled={loading} className="ce-submit">
              {loading ? 'Creating...' : 'Submit'}
            </button>
            <button type="button" onClick={clearForm} className="ce-clear">Clear</button>
          </div>

        </form>
      </div>
    </Layout>
  )
}

const inputBase = {
  width: '100%',
  padding: '24px 16px 8px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 14,
  color: '#0f172a',
  background: '#fafbfc',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
  fontFamily: 'inherit',
  height: 60,
}
