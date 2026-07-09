import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axios'

const IconLock   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconEyeOff = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
const IconEyeOn  = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconCheck  = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>

export default function ResetPassword() {
  const { token } = useParams()
  const navigate  = useNavigate()

  const [form,     setForm]     = useState({ password: '', confirm: '' })
  const [showP,    setShowP]    = useState(false)
  const [showC,    setShowC]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8)               s++
    if (/[A-Z]/.test(p))             s++
    if (/[0-9]/.test(p))             s++
    if (/[^A-Za-z0-9]/.test(p))      s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][strength]

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match.'); return }
    if (form.password.length < 8)       { toast.error('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password/', {
        token, password: form.password, confirm_password: form.confirm,
      })
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset failed. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f0f4ff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .rp-wrap { width: 100%; max-width: 420px; margin: 24px; }
        .rp-card { background: #fff; border-radius: 22px; overflow: hidden; box-shadow: 0 0 0 1px rgba(13,27,75,0.07), 0 20px 56px rgba(13,27,75,0.12); }
        .rp-topbar { height: 4px; background: linear-gradient(90deg,#0d1b4b,#3b82f6,#6366f1); }
        .rp-body { padding: 32px 34px 28px; }
        .rp-logo { display:flex; align-items:center; gap:11px; margin-bottom:24px; padding-bottom:18px; border-bottom:1px solid #f1f5f9; }
        .rp-logo-box { width:44px; height:44px; border-radius:11px; background:linear-gradient(135deg,#f8faff,#eef2ff); border:1.5px solid #e8ecf4; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(13,27,75,0.10); overflow:hidden; }
        .rp-logo-box img { width:36px; height:36px; object-fit:contain; }
        .rp-logo-name { font-size:16px; font-weight:800; color:#0d1b4b; }
        .rp-logo-sub  { font-size:11px; color:#94a3b8; margin-top:2px; }
        .rp-title { font-size:21px; font-weight:800; color:#0d1b4b; margin-bottom:4px; letter-spacing:-0.02em; }
        .rp-sub   { font-size:13px; color:#94a3b8; margin-bottom:22px; line-height:1.55; }
        .fg { margin-bottom:14px; }
        .fl { display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:6px; }
        .iw { position:relative; display:flex; align-items:center; }
        .ii { position:absolute; left:13px; color:#94a3b8; display:flex; pointer-events:none; }
        .fi { width:100%; padding:12px 40px 12px 40px; border:1.5px solid #e5e7eb; border-radius:11px; font-size:14px; color:#111827; background:#fafafa; outline:none; transition:all 0.2s; font-family:inherit; }
        .fi::placeholder { color:#d1d5db; }
        .fi:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.12); background:#fff; }
        .eye { position:absolute; right:12px; background:none; border:none; cursor:pointer; color:#9ca3af; display:flex; padding:4px; border-radius:6px; transition:all 0.18s; }
        .eye:hover { color:#0d1b4b; }
        .strength-bar { display:flex; gap:4px; margin-top:8px; }
        .sb-seg { flex:1; height:3px; border-radius:2px; background:#e5e7eb; transition:background 0.3s; }
        .strength-lbl { font-size:11px; font-weight:600; margin-top:5px; }
        .btn { width:100%; padding:13px; background:linear-gradient(135deg,#0d1b4b,#1a2d6b); color:#fff; border:none; border-radius:11px; font-size:15px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; margin-top:6px; font-family:inherit; box-shadow:0 4px 14px rgba(13,27,75,0.28); transition:all 0.2s; }
        .btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 22px rgba(13,27,75,0.32); }
        .btn:disabled { opacity:0.6; cursor:not-allowed; }
        .spin { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; animation:sp 0.7s linear infinite; flex-shrink:0; }
        @keyframes sp { to { transform:rotate(360deg); } }
        .done-wrap { display:flex; flex-direction:column; align-items:center; text-align:center; padding:12px 0 8px; }
        .done-icon { width:64px; height:64px; border-radius:50%; background:#f0fdf4; border:2px solid #bbf7d0; display:flex; align-items:center; justify-content:center; margin-bottom:16px; color:#16a34a; }
        .done-title { font-size:20px; font-weight:800; color:#0d1b4b; margin-bottom:6px; }
        .done-sub   { font-size:13px; color:#6b7280; line-height:1.6; margin-bottom:22px; }
        .back-link  { width:100%; padding:13px; background:#0d1b4b; color:#fff; border:none; border-radius:11px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; box-shadow:0 4px 14px rgba(13,27,75,0.22); transition:all 0.2s; }
        .back-link:hover { background:#162057; transform:translateY(-1px); }
        .rp-foot { text-align:center; padding:12px 34px 18px; font-size:10.5px; color:#d1d5db; border-top:1px solid #f3f4f6; }
      `}</style>

      <div className="rp-wrap">
        <div className="rp-card">
          <div className="rp-topbar" />
          <div className="rp-body">
            <div className="rp-logo">
              <div className="rp-logo-box"><img src="/static/img/logo1.png" alt="Zayron" /></div>
              <div>
                <div className="rp-logo-name">Zayron Infotech</div>
                <div className="rp-logo-sub">HR Onboarding Portal</div>
              </div>
            </div>

            {!done ? (
              <>
                <h1 className="rp-title">Set New Password</h1>
                <p className="rp-sub">Enter a strong new password for your account.</p>

                <form onSubmit={handleSubmit}>
                  <div className="fg">
                    <label className="fl">New Password</label>
                    <div className="iw">
                      <span className="ii"><IconLock /></span>
                      <input type={showP ? 'text' : 'password'} className="fi" placeholder="Enter new password"
                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        required autoFocus />
                      <button type="button" className="eye" onClick={() => setShowP(v => !v)} tabIndex={-1}>
                        {showP ? <IconEyeOff /> : <IconEyeOn />}
                      </button>
                    </div>
                    {form.password && (
                      <>
                        <div className="strength-bar">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="sb-seg" style={{ background: i <= strength ? strengthColor : '#e5e7eb' }} />
                          ))}
                        </div>
                        <p className="strength-lbl" style={{ color: strengthColor }}>{strengthLabel}</p>
                      </>
                    )}
                  </div>

                  <div className="fg">
                    <label className="fl">Confirm Password</label>
                    <div className="iw">
                      <span className="ii"><IconLock /></span>
                      <input type={showC ? 'text' : 'password'} className="fi" placeholder="Confirm new password"
                        value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                        required />
                      <button type="button" className="eye" onClick={() => setShowC(v => !v)} tabIndex={-1}>
                        {showC ? <IconEyeOff /> : <IconEyeOn />}
                      </button>
                    </div>
                    {form.confirm && form.confirm !== form.password && (
                      <p style={{ fontSize: 11, color: '#ef4444', marginTop: 5 }}>Passwords do not match</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading} className="btn">
                    {loading ? <><span className="spin" />Resetting...</> : <>Reset Password &rarr;</>}
                  </button>
                </form>
              </>
            ) : (
              <div className="done-wrap">
                <div className="done-icon"><IconCheck /></div>
                <h2 className="done-title">Password Reset!</h2>
                <p className="done-sub">Your password has been updated successfully.<br />You can now sign in with your new password.</p>
                <button className="back-link" onClick={() => navigate('/login')}>Back to Sign In &rarr;</button>
              </div>
            )}
          </div>
          <div className="rp-foot">© 2026 Zayron Infotech Pvt. Ltd. All rights reserved.</div>
        </div>
      </div>
    </>
  )
}
