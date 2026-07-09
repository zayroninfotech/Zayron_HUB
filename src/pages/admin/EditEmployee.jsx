import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import PageLoader from '../../components/PageLoader'
import { BtnSpinner } from '../../components/BtnLoader'
import api from '../../api/axios'

const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Support', 'ITQA', 'Developer']

export default function EditEmployee() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', employee_type: '',
    department: '', designation: '', joining_date: '', status: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    api.get(`/employees/${id}/`).then(({ data }) => {
      setForm({
        name: data.name || '',
        email: data.email || '',
        mobile: data.mobile || '',
        employee_type: data.employee_type || '',
        department: data.department || '',
        designation: data.designation || '',
        joining_date: data.joining_date || '',
        status: data.status || '',
      })
    }).catch(() => toast.error('Failed to load employee')).finally(() => setLoading(false))
  }, [id])

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.mobile.trim()) errs.mobile = 'Mobile is required'
    if (!form.employee_type) errs.employee_type = 'Employee type is required'
    if (!form.department.trim()) errs.department = 'Department is required'
    if (!form.designation.trim()) errs.designation = 'Designation is required'
    if (!form.joining_date) errs.joining_date = 'Joining date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await api.put(`/employees/${id}/`, form)
      toast.success('Employee updated successfully!')
      navigate(`/admin/employees/${id}`)
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') { setErrors(d); toast.error('Please fix the errors.') }
      else toast.error('Failed to update employee.')
    } finally { setSaving(false) }
  }

  if (loading) return <PageLoader text="Loading Employee..." />

  const inp = (field) => ({
    value: form[field],
    onChange: e => set(field, e.target.value),
    style: { ...inputStyle, borderColor: errors[field] ? '#ef4444' : '#e2e8f0' }
  })

  return (
    <Layout title="Edit Employee">
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Edit Employee</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Update employee registration details</p>
          </div>
          <button onClick={() => navigate(`/admin/employees/${id}`)} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={card}>

            {/* Personal Info */}
            <div style={sectionHead}>
              <span style={sectionIcon}>👤</span>
              <span style={sectionTitle}>Personal Information</span>
            </div>
            <div style={grid2}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input placeholder="Employee full name" {...inp('name')} style={{ ...inp('name').style }} />
                {errors.name && <div style={errStyle}>{errors.name}</div>}
              </div>
              <div>
                <label style={labelStyle}>Mobile Number *</label>
                <input placeholder="10-digit mobile" {...inp('mobile')} style={{ ...inp('mobile').style }} />
                {errors.mobile && <div style={errStyle}>{errors.mobile}</div>}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email Address *</label>
              <input placeholder="Personal email" type="email" {...inp('email')} style={{ ...inp('email').style }} />
              {errors.email && <div style={errStyle}>{errors.email}</div>}
            </div>

            {/* Employment */}
            <div style={{ ...sectionHead, marginTop: 8 }}>
              <span style={sectionIcon}>🏢</span>
              <span style={sectionTitle}>Employment Details</span>
            </div>
            <div style={grid2}>
              <div>
                <label style={labelStyle}>Employee Type *</label>
                <select {...inp('employee_type')} style={{ ...inp('employee_type').style, cursor: 'pointer' }}>
                  <option value="">-- Select --</option>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
                {errors.employee_type && <div style={errStyle}>{errors.employee_type}</div>}
              </div>
              <div>
                <label style={labelStyle}>Joining Date *</label>
                <input type="date" {...inp('joining_date')} style={{ ...inp('joining_date').style }} />
                {errors.joining_date && <div style={errStyle}>{errors.joining_date}</div>}
              </div>
              <div>
                <label style={labelStyle}>Department *</label>
                <input list="dept-list" placeholder="Department" {...inp('department')} style={{ ...inp('department').style }} />
                <datalist id="dept-list">{DEPARTMENTS.map(d => <option key={d} value={d} />)}</datalist>
                {errors.department && <div style={errStyle}>{errors.department}</div>}
              </div>
              <div>
                <label style={labelStyle}>Designation *</label>
                <input placeholder="e.g. Software Engineer" {...inp('designation')} style={{ ...inp('designation').style }} />
                {errors.designation && <div style={errStyle}>{errors.designation}</div>}
              </div>
            </div>

            {/* Status */}
            <div style={{ ...sectionHead, marginTop: 8 }}>
              <span style={sectionIcon}>📋</span>
              <span style={sectionTitle}>Onboarding Status</span>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select {...inp('status')} style={{ ...inp('status').style, cursor: 'pointer', maxWidth: 280 }}>
                <option value="pending">Pending</option>
                <option value="nda_signed">NDA Signed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="submit" disabled={saving} style={{ flex: 1, background: '#1e40af', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 24px', fontSize: 15, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.8 : 1 }}>
              {saving && <BtnSpinner />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(`/admin/employees/${id}`)} style={{ padding: '13px 24px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

const card = {
  background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '24px 28px',
}
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginBottom: 16 }
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }
const inputStyle = { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#111827', background: '#f9fafb', outline: 'none', boxSizing: 'border-box', marginBottom: 16, fontFamily: 'inherit' }
const errStyle = { fontSize: 12, color: '#ef4444', marginTop: -12, marginBottom: 10 }
const sectionHead = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }
const sectionIcon = { fontSize: 15 }
const sectionTitle = { fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }
