import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleShow = k => setShow(s => ({ ...s, [k]: !s[k] }))

  const strength = pwd => {
    if (!pwd) return 0
    let s = 0
    if (pwd.length >= 8) s++
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9]/.test(pwd)) s++
    if (/[^A-Za-z0-9]/.test(pwd)) s++
    return s
  }
  const str = strength(form.new_password)
  const strLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][str]
  const strColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'][str]

  const rules = [
    ['At least 8 characters', form.new_password.length >= 8],
    ['One uppercase letter', /[A-Z]/.test(form.new_password)],
    ['One number', /[0-9]/.test(form.new_password)],
    ['One special character', /[^A-Za-z0-9]/.test(form.new_password)],
  ]

  const submit = async e => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) { toast.error('Passwords do not match'); return }
    if (form.new_password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      await api.post('/auth/change-password/', form)
      toast.success('Password changed successfully!')
      navigate(-1)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const EyeIcon = ({ on }) => on ? (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  const fields = [
    { key: 'current_password', label: 'Current Password', showKey: 'current', placeholder: 'Enter your current password' },
    { key: 'new_password',     label: 'New Password',     showKey: 'new',     placeholder: 'Enter new password' },
    { key: 'confirm_password', label: 'Confirm New Password', showKey: 'confirm', placeholder: 'Re-enter new password' },
  ]

  return (
    <Layout title="Change Password">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header card */}
        <div style={{
          background: 'linear-gradient(135deg,#0d1b4b,#1e40af)',
          borderRadius: 20, padding: '32px 36px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 20,
          boxShadow: '0 8px 32px rgba(13,27,75,0.2)',
        }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Change Password</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Update your account password to keep it secure</div>
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '32px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f0f2f8' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {fields.map(({ key, label, showKey, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={show[showKey] ? 'text' : 'password'}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    required
                    placeholder={placeholder}
                    style={{
                      width: '100%', padding: '13px 46px 13px 16px',
                      border: '1.5px solid #e2e8f0', borderRadius: 12,
                      fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit', color: '#0f172a',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow(showKey)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    <EyeIcon on={show[showKey]} />
                  </button>
                </div>

                {/* Strength bar — only for new_password */}
                {key === 'new_password' && form.new_password && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 5, borderRadius: 4, background: i <= str ? strColor : '#e2e8f0', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: strColor, fontWeight: 700 }}>Password strength: {strLabel}</div>
                  </div>
                )}
              </div>
            ))}

            {/* Requirements */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Password requirements</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                {rules.map(([rule, met]) => (
                  <div key={rule} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: met ? '#10b981' : '#94a3b8', transition: 'color 0.2s' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: met ? '#d1fae5' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: met ? '#10b981' : '#cbd5e1', fontWeight: 800, transition: 'all 0.2s' }}>
                      {met ? '✓' : '○'}
                    </div>
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{ flex: 1, padding: '13px 0', background: '#f1f5f9', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ flex: 2, padding: '13px 0', background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1, boxShadow: '0 4px 16px rgba(37,99,235,0.3)', transition: 'opacity 0.15s' }}
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </Layout>
  )
}
