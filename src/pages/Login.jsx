import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const IconUser   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconLock   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconEyeOff = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
const IconEyeOn  = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconShield = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconBack   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
const IconCheck  = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
const IconMail   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>

export default function Login() {
  const { loginWithTokens } = useAuth()
  const navigate = useNavigate()

  const [step,        setStep]        = useState('credentials')
  const [loading,     setLoading]     = useState(false)
  const [showPass,    setShowPass]    = useState(false)
  const [form,        setForm]        = useState({ username: '', password: '' })
  const [tempToken,   setTempToken]   = useState('')
  const [qrCode,      setQrCode]      = useState('')
  const [otp,         setOtp]         = useState('')
  const [setupMode,   setSetupMode]   = useState(false)
  const [username,    setUsername]    = useState('')
  const [forgotEmail, setForgotEmail] = useState('')

  const handleCredentials = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-credentials/', { username: form.username, password: form.password })
      setTempToken(data.temp_token); setUsername(form.username)
      if (data.status === 'setup_required') { setQrCode(data.qr_code); setSetupMode(true); setStep('setup') }
      else { setSetupMode(false); setStep('otp') }
    } catch (err) { toast.error(err.response?.data?.detail || 'Invalid credentials.') }
    finally { setLoading(false) }
  }

  const handleOTP = async e => {
    if (e) e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp/', { temp_token: tempToken, otp, setup_mode: setupMode })
      loginWithTokens(data); toast.success('Signed in!'); navigate('/admin/dashboard')
    } catch (err) { toast.error(err.response?.data?.detail || 'Invalid OTP.'); setOtp('') }
    finally { setLoading(false) }
  }

  const handleForgotPassword = async e => {
    e.preventDefault(); if (!forgotEmail) return; setLoading(true)
    try {
      await api.post('/auth/forgot-password/', { email: forgotEmail })
      toast.success('Reset link sent! Check your email.')
      setStep('forgot_sent')
    }
    catch (err) { toast.error(err.response?.data?.detail || 'Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const resetToLogin = () => { setStep('credentials'); setOtp(''); setTempToken(''); setQrCode(''); setForgotEmail('') }
  const handleOtpChange = e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; overflow: hidden; }
        body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

        .lp { height: 100vh; display: flex; overflow: hidden; }

        /* ═══════════════ LEFT PANEL ═══════════════ */
        .lp-left {
          width: 46%; position: relative; overflow: hidden; flex-shrink: 0;
          background: #050d24;
          display: flex; flex-direction: column;
          padding: 40px 48px;
        }

        /* layered background */
        .lp-bg {
          position: absolute; inset: 0; overflow: hidden;
        }
        .lp-bg-grad {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(37,99,235,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(99,102,241,0.15) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 60% 80%, rgba(14,165,233,0.10) 0%, transparent 55%),
            linear-gradient(160deg, #080f28 0%, #0a1535 40%, #060d20 100%);
        }
        .lp-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 44px 44px;
        }
        .lp-bg-noise {
          position: absolute; inset: 0; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
        }

        /* floating glow rings */
        .lp-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(59,130,246,0.12);
          animation: ringpulse 6s ease-in-out infinite;
        }
        .lp-ring1 { width: 420px; height: 420px; bottom: -140px; right: -140px; animation-delay: 0s; }
        .lp-ring2 { width: 280px; height: 280px; bottom: -60px; right: -60px; border-color: rgba(99,102,241,0.18); animation-delay: 1.5s; }
        .lp-ring3 { width: 200px; height: 200px; top: -60px; left: -60px; animation-delay: 3s; }
        @keyframes ringpulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }

        /* floating cards */
        .lp-card {
          position: absolute;
          background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .lp-card1 {
          width: 180px; height: 90px;
          top: 16%; right: 7%; transform: rotate(5deg);
          display: flex; align-items: center; justify-content: center; gap: 12px; padding: 14px;
        }
        .lp-card2 {
          width: 130px; height: 64px;
          top: 34%; right: 16%; transform: rotate(-3deg);
          display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px;
        }
        .lp-card3 {
          width: 150px; height: 72px;
          bottom: 26%; left: 5%; transform: rotate(2deg);
          display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px;
        }
        .lp-card-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;
        }
        .lp-card-icon.blue   { background: rgba(59,130,246,0.25); border: 1px solid rgba(59,130,246,0.3); }
        .lp-card-icon.purple { background: rgba(139,92,246,0.25); border: 1px solid rgba(139,92,246,0.3); }
        .lp-card-icon.cyan   { background: rgba(6,182,212,0.25); border: 1px solid rgba(6,182,212,0.3); }
        .lp-card-txt1 { font-size: 14px; font-weight: 800; color: #fff; }
        .lp-card-txt2 { font-size: 10px; color: rgba(255,255,255,0.45); margin-top: 1px; }

        /* dot grid decoration */
        .lp-dots {
          position: absolute; pointer-events: none;
          background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
          background-size: 18px 18px;
        }
        .lp-dots1 { width: 140px; height: 140px; top: 48%; left: 52%; opacity: 0.4; }
        .lp-dots2 { width: 100px; height: 100px; top: 6%; right: 30%; opacity: 0.25; }

        /* inner content */
        .lp-inner { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; }
        .lp-top   { flex: 1; display: flex; flex-direction: column; justify-content: center; }

        .lp-chip {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 40px; padding: 7px 18px;
          font-size: 10px; color: #93c5fd; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          width: fit-content; margin-bottom: 30px;
        }
        .lp-chip-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96,165,250,0.25);
          animation: chipblink 2s ease-in-out infinite;
        }
        @keyframes chipblink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .lp-eyebrow {
          font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.28);
          letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 14px;
        }

        .lp-heading {
          font-size: 40px; font-weight: 900; line-height: 1.08;
          letter-spacing: -0.035em; margin-bottom: 18px;
        }
        .lp-heading .w  { color: #ffffff; }
        .lp-heading .bl { color: #60a5fa; }
        .lp-heading .dm { color: rgba(255,255,255,0.45); font-weight: 700; }

        .lp-desc {
          font-size: 13.5px; color: rgba(255,255,255,0.38);
          line-height: 1.78; max-width: 310px; margin-bottom: 36px;
        }

        /* stat pills */
        .lp-stats { display: flex; gap: 10px; flex-wrap: wrap; }
        .lp-stat {
          display: flex; align-items: center; gap: 11px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; padding: 11px 16px;
          transition: background 0.2s;
        }
        .lp-stat:hover { background: rgba(255,255,255,0.075); }
        .lp-stat-ic {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .lp-stat-ic.b { background: rgba(59,130,246,0.22); }
        .lp-stat-ic.p { background: rgba(139,92,246,0.22); }
        .lp-stat-ic.g { background: rgba(16,185,129,0.22); }
        .lp-stat-v { font-size: 16px; font-weight: 800; color: #fff; line-height: 1.1; }
        .lp-stat-l { font-size: 10px; color: rgba(255,255,255,0.38); margin-top: 2px; letter-spacing: 0.02em; }

        /* bottom bar */
        .lp-bot {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.07);
        }
        .lp-bot-live { display: flex; align-items: center; gap: 8px; }
        .lp-bot-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
          animation: chipblink 2.5s ease-in-out infinite;
        }
        .lp-bot-txt  { font-size: 12px; color: rgba(255,255,255,0.38); font-weight: 500; }
        .lp-bot-copy { font-size: 10.5px; color: rgba(255,255,255,0.16); }

        /* ═══════════════ RIGHT PANEL ═══════════════ */
        .lp-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          background: #f4f7ff;
        }

        /* decorative background for right */
        .rp-deco {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }
        .rp-deco-orb1 {
          position: absolute; top: -150px; right: -150px;
          width: 450px; height: 450px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 65%);
        }
        .rp-deco-orb2 {
          position: absolute; bottom: -120px; left: -120px;
          width: 380px; height: 380px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%);
        }
        .rp-deco-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(13,27,75,0.055) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .rp-deco-line1 {
          position: absolute; top: 0; left: 50%; width: 1px; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.08) 30%, rgba(59,130,246,0.08) 70%, transparent);
        }

        /* the card */
        .fc {
          position: relative; z-index: 1;
          width: 100%; max-width: 432px;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(13,27,75,0.05),
            0 1px 2px rgba(13,27,75,0.04),
            0 8px 16px rgba(13,27,75,0.06),
            0 32px 72px rgba(13,27,75,0.11);
        }

        /* gradient top accent bar */
        .fc-bar {
          height: 3px;
          background: linear-gradient(90deg, #0d1b4b 0%, #3b82f6 45%, #8b5cf6 75%, #06b6d4 100%);
        }

        .fc-body { padding: 30px 34px 26px; }

        /* logo row */
        .fc-logo {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          margin-bottom: 26px; padding-bottom: 20px;
          border-bottom: 1px solid #f0f3fa; text-align: center;
        }
        .fc-logo-img {
          width: 72px; height: 72px; border-radius: 18px; flex-shrink: 0;
          background: linear-gradient(135deg, #eef2ff 0%, #f0f7ff 100%);
          border: 1.5px solid #e0e8ff;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
          box-shadow: 0 4px 18px rgba(59,130,246,0.18);
        }
        .fc-logo-img img { width: 58px; height: 58px; object-fit: contain; }
        .fc-logo-txt .name { font-size: 18px; font-weight: 800; color: #0d1b4b; letter-spacing: -0.02em; }
        .fc-logo-txt .sub  { font-size: 11px; color: #94a3b8; margin-top: 2px; font-weight: 500; }
        .fc-live-badge {
          display: flex; align-items: center; gap: 5px;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 1px solid #86efac;
          border-radius: 20px; padding: 5px 11px;
          font-size: 11px; font-weight: 700; color: #15803d;
        }
        .fc-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 4px rgba(34,197,94,0.7); animation: chipblink 2s infinite; }

        /* greeting */
        .fc-title   { font-size: 22px; font-weight: 800; color: #0d1b4b; margin-bottom: 3px; letter-spacing: -0.025em; }
        .fc-sub     { font-size: 12.5px; color: #94a3b8; margin-bottom: 22px; line-height: 1.55; font-weight: 400; }

        /* divider with text */
        .fc-divider {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 18px;
        }
        .fc-divider-line { flex: 1; height: 1px; background: #f0f3fa; }
        .fc-divider-txt  { font-size: 10.5px; font-weight: 600; color: #cbd5e1; letter-spacing: 0.06em; text-transform: uppercase; }

        /* inputs */
        .fg { margin-bottom: 14px; }
        .fl { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 7px; }
        .iw { position: relative; display: flex; align-items: center; }
        .ii { position: absolute; left: 14px; color: #c0cad8; display: flex; pointer-events: none; z-index: 1; transition: color 0.2s; }
        .iw:focus-within .ii { color: #3b82f6; }
        .fi {
          width: 100%; height: 46px; padding: 0 44px 0 42px;
          border: 1.5px solid #e8ecf4; border-radius: 12px;
          font-size: 14px; color: #111827; font-weight: 500;
          background: #fafbff; outline: none; transition: all 0.2s; font-family: inherit;
        }
        .fi::placeholder { color: #d1d5db; font-weight: 400; }
        .fi:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.10), 0 1px 3px rgba(59,130,246,0.08);
        }
        .fi:hover:not(:focus) { border-color: #d0d7e8; }
        .eye {
          position: absolute; right: 13px; background: none; border: none;
          cursor: pointer; color: #c0cad8; display: flex; padding: 5px;
          border-radius: 7px; transition: all 0.18s;
        }
        .eye:hover { color: #3b82f6; background: #eef2ff; }

        /* submit button */
        .btn {
          width: 100%; height: 48px;
          background: linear-gradient(135deg, #0d1b4b 0%, #1e3a8a 100%);
          color: #fff; border: none; border-radius: 12px;
          font-size: 14.5px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 8px; font-family: inherit; letter-spacing: 0.015em;
          box-shadow: 0 1px 2px rgba(13,27,75,0.1), 0 4px 12px rgba(13,27,75,0.22), 0 0 0 1px rgba(13,27,75,0.08);
          transition: all 0.22s; position: relative; overflow: hidden;
        }
        .btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%);
          pointer-events: none;
        }
        .btn::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at center top, rgba(255,255,255,0.10) 0%, transparent 60%);
          pointer-events: none;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1.5px);
          box-shadow: 0 2px 4px rgba(13,27,75,0.12), 0 8px 24px rgba(13,27,75,0.28), 0 0 0 1px rgba(13,27,75,0.1);
          background: linear-gradient(135deg, #111f58 0%, #1d4ed8 100%);
        }
        .btn:active:not(:disabled) { transform: translateY(0); }
        .btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* forgot link */
        .forgot-link {
          background: none; border: none; cursor: pointer; font-family: inherit;
          font-size: 11.5px; font-weight: 600; color: #3b82f6; padding: 0; transition: color 0.18s;
        }
        .forgot-link:hover { color: #1d4ed8; }

        /* feature strip */
        .feat-strip {
          display: flex; align-items: center; justify-content: center; gap: 0;
          margin-top: 18px; padding-top: 16px; border-top: 1px solid #f0f3fa;
        }
        .feat-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: #94a3b8; font-weight: 500; padding: 0 14px;
        }
        .feat-item:not(:last-child) { border-right: 1px solid #e8ecf4; }
        .feat-item span { font-size: 14px; }

        /* back button */
        .back-btn {
          display: inline-flex; align-items: center; gap: 5px; background: none; border: none;
          cursor: pointer; font-size: 12px; color: #6b7280; font-family: inherit;
          padding: 6px 10px 6px 0; margin-bottom: 14px; transition: color 0.18s; border-radius: 6px;
        }
        .back-btn:hover { color: #0d1b4b; }

        /* 2FA badge */
        .badge2fa {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, rgba(59,130,246,0.07), rgba(99,102,241,0.07));
          border: 1px solid rgba(59,130,246,0.18);
          border-radius: 8px; padding: 7px 13px; margin-bottom: 14px;
          font-size: 11.5px; color: #3b82f6; font-weight: 600;
        }

        /* QR box */
        .qr-box {
          background: linear-gradient(135deg, #f0f5ff 0%, #eef2ff 100%);
          border: 1.5px solid #c7d7fc; border-radius: 16px;
          padding: 20px; margin-bottom: 16px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          position: relative; overflow: hidden;
        }
        .qr-box::before {
          content: ''; position: absolute; top: -30px; right: -30px;
          width: 120px; height: 120px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
        }
        .qr-img { width: 148px; height: 148px; border-radius: 12px; border: 3px solid #fff; box-shadow: 0 4px 18px rgba(13,27,75,0.14); position: relative; z-index: 1; }
        .qr-lbl { font-size: 12px; color: #6366f1; font-weight: 600; text-align: center; }

        /* OTP input */
        .otp-in {
          width: 100%; height: 58px;
          border: 1.5px solid #e8ecf4; border-radius: 12px;
          font-size: 28px; font-weight: 800; color: #0d1b4b; background: #fafbff;
          outline: none; transition: all 0.2s;
          font-family: 'Courier New', monospace; letter-spacing: 0.45em; text-align: center;
        }
        .otp-in::placeholder { color: #dde3ef; font-size: 22px; letter-spacing: 0.18em; }
        .otp-in:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.10); background: #fff; }
        .otp-hint { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 12px; line-height: 1.6; }

        /* success icon */
        .success-icon {
          width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 2px solid #86efac;
          display: flex; align-items: center; justify-content: center; color: #16a34a;
          box-shadow: 0 4px 16px rgba(34,197,94,0.2);
        }

        /* spinner */
        .spin {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          animation: sp 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes sp { to { transform: rotate(360deg); } }

        /* card footer */
        .fc-foot {
          text-align: center; padding: 11px 34px 16px;
          font-size: 10.5px; color: #cbd5e1; border-top: 1px solid #f0f3fa;
          background: #fafbff;
        }

        /* responsive */
        @media (max-width: 900px) {
          .lp-left { width: 42%; padding: 32px 32px; }
          .lp-heading { font-size: 32px; }
        }
        @media (max-width: 660px) {
          .lp-left { display: none; }
          .lp-right { padding: 16px; }
          .fc { max-width: 100%; }
        }
      `}</style>

      <div className="lp">

        {/* ═══ LEFT ═══ */}
        <div className="lp-left">
          <div className="lp-bg">
            <div className="lp-bg-grad" />
            <div className="lp-bg-grid" />
            <div className="lp-bg-noise" />
            <div className="lp-ring lp-ring1" />
            <div className="lp-ring lp-ring2" />
            <div className="lp-ring lp-ring3" />
          </div>

          {/* floating accent cards */}
          <div className="lp-card lp-card1">
            <div className="lp-card-icon blue">📋</div>
            <div><div className="lp-card-txt1">100%</div><div className="lp-card-txt2">Paperless HR</div></div>
          </div>
          <div className="lp-card lp-card2">
            <div className="lp-card-icon purple">🔒</div>
            <div><div className="lp-card-txt1">2FA</div><div className="lp-card-txt2">Secured</div></div>
          </div>
          <div className="lp-card lp-card3">
            <div className="lp-card-icon cyan">⚡</div>
            <div><div className="lp-card-txt1">Fast</div><div className="lp-card-txt2">Onboarding</div></div>
          </div>

          <div className="lp-dots lp-dots1" />
          <div className="lp-dots lp-dots2" />

          <div className="lp-inner">
            <div className="lp-top">
              <div className="lp-chip"><span className="lp-chip-dot" />Zayron Suite</div>
              <p className="lp-eyebrow">HR Management System</p>
              <h1 className="lp-heading">
                <span className="w">Employee<br /></span>
                <span className="bl">Onboarding<br /></span>
                <span className="dm">Made Simple</span>
              </h1>
              <p className="lp-desc">
                A unified platform to onboard employees, manage NDAs, documents, and projects — all in one place.
              </p>
              <div className="lp-stats">
                <div className="lp-stat"><div className="lp-stat-ic b">📋</div><div><div className="lp-stat-v">100%</div><div className="lp-stat-l">Paperless</div></div></div>
                <div className="lp-stat"><div className="lp-stat-ic p">🔒</div><div><div className="lp-stat-v">Secure</div><div className="lp-stat-l">2FA Protected</div></div></div>
                <div className="lp-stat"><div className="lp-stat-ic g">⚡</div><div><div className="lp-stat-v">Fast</div><div className="lp-stat-l">Instant Setup</div></div></div>
              </div>
            </div>
            <div className="lp-bot">
              <div className="lp-bot-live"><div className="lp-bot-dot" /><span className="lp-bot-txt">System Online</span></div>
              <span className="lp-bot-copy">© 2026 Zayron Suite Pvt. Ltd.</span>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT ═══ */}
        <div className="lp-right">
          <div className="rp-deco">
            <div className="rp-deco-orb1" /><div className="rp-deco-orb2" />
            <div className="rp-deco-grid" /><div className="rp-deco-line1" />
          </div>

          <div className="fc">
            <div className="fc-bar" />
            <div className="fc-body">

              {/* Logo */}
              <div className="fc-logo">
                <div className="fc-logo-img"><img src="/static/img/logo1.png" alt="Zayron" /></div>
                <div className="fc-logo-txt">
                  <div className="name">Zayron Suite</div>
                </div>
              </div>

              {/* ── Step 1: Credentials ── */}
              {step === 'credentials' && (
                <>
                  <form onSubmit={handleCredentials} autoComplete="off">
                    {/* Hidden dummy fields — prevents Chrome password manager from attaching */}
                    <input type="text" name="fakeuser" style={{display:'none'}} readOnly tabIndex={-1} />
                    <input type="password" name="fakepass" style={{display:'none'}} readOnly tabIndex={-1} />
                    <div className="fg">
                      <label className="fl"><span>Username</span></label>
                      <div className="iw">
                        <span className="ii"><IconUser /></span>
                        <input type="text" className="fi" placeholder="Enter your username"
                          value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                          required autoFocus autoComplete="off" name="username_z" />
                      </div>
                    </div>
                    <div className="fg">
                      <label className="fl">
                        <span>Password</span>
                        <button type="button" className="forgot-link" onClick={() => setStep('forgot')}>Forgot password?</button>
                      </label>
                      <div className="iw">
                        <span className="ii"><IconLock /></span>
                        <input type="text" className="fi" placeholder="Enter your password"
                          value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          required autoComplete="off" name="password_z"
                          style={{ WebkitTextSecurity: showPass ? 'none' : 'disc', fontFamily: 'inherit' }} />
                        <button type="button" className="eye" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                          {showPass ? <IconEyeOff /> : <IconEyeOn />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn">
                      {loading ? <><span className="spin" />Verifying...</> : <>Sign In &rarr;</>}
                    </button>
                  </form>

                  <div className="feat-strip">
                    {[['🔒','Encrypted'],['⚡','Fast Access'],['📋','Paperless']].map(([i,l]) => (
                      <div key={l} className="feat-item"><span>{i}</span>{l}</div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Step 2: QR + OTP setup ── */}
              {step === 'setup' && (
                <>
                  <button className="back-btn" onClick={resetToLogin}><IconBack /> Back to login</button>
                  <div className="badge2fa"><IconShield /> 2FA Setup — Google Authenticator</div>
                  <h1 className="fc-title">Scan &amp; Verify</h1>
                  <p className="fc-sub">Scan the QR code with Google Authenticator, then enter the 6-digit code below.</p>
                  {qrCode && (
                    <div className="qr-box">
                      <img src={qrCode} alt="QR Code" className="qr-img" />
                      <p className="qr-lbl">Scan with Google Authenticator</p>
                    </div>
                  )}
                  <form onSubmit={handleOTP}>
                    <div className="fg">
                      <label className="fl"><span>6-Digit OTP</span></label>
                      <input type="text" inputMode="numeric" pattern="[0-9]*"
                        className="otp-in" placeholder="_ _ _ _ _ _"
                        value={otp} onChange={handleOtpChange} maxLength={6} autoComplete="one-time-code" />
                    </div>
                    <button type="submit" disabled={loading || otp.length !== 6} className="btn">
                      {loading ? <><span className="spin" />Verifying...</> : <>Verify &amp; Sign In &rarr;</>}
                    </button>
                  </form>
                </>
              )}

              {/* ── Step 3: OTP (returning user) ── */}
              {step === 'otp' && (
                <>
                  <button className="back-btn" onClick={resetToLogin}><IconBack /> Back to login</button>
                  <div className="badge2fa"><IconShield /> Two-Factor Authentication</div>
                  <h1 className="fc-title">Enter OTP Code</h1>
                  <p className="fc-sub">Open <strong>Google Authenticator</strong> and enter the 6-digit code for <strong>{username}</strong>.</p>
                  <form onSubmit={handleOTP}>
                    <div className="fg">
                      <label className="fl"><span>6-Digit OTP Code</span></label>
                      <input type="text" inputMode="numeric" pattern="[0-9]*"
                        className="otp-in" placeholder="_ _ _ _ _ _"
                        value={otp} onChange={handleOtpChange} maxLength={6} autoFocus autoComplete="one-time-code" />
                    </div>
                    <button type="submit" disabled={loading || otp.length !== 6} className="btn">
                      {loading ? <><span className="spin" />Verifying OTP...</> : <>Verify &amp; Sign In &rarr;</>}
                    </button>
                  </form>
                  <p className="otp-hint">Code refreshes every 30 seconds · Make sure your phone time is correct</p>
                </>
              )}

              {/* ── Forgot password ── */}
              {step === 'forgot' && (
                <>
                  <button className="back-btn" onClick={resetToLogin}><IconBack /> Back to login</button>
                  <div className="badge2fa">🔑 Password Reset</div>
                  <h1 className="fc-title">Forgot Password?</h1>
                  <p className="fc-sub">Enter your registered email and we'll send a reset link valid for 1 hour.</p>
                  <form onSubmit={handleForgotPassword}>
                    <div className="fg">
                      <label className="fl"><span>Email Address</span></label>
                      <div className="iw">
                        <span className="ii"><IconMail /></span>
                        <input type="text" className="fi" placeholder="Enter your email address"
                          value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                          required autoFocus autoComplete="off" />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn">
                      {loading ? <><span className="spin" />Sending...</> : <>Send Reset Link &rarr;</>}
                    </button>
                  </form>
                </>
              )}

              {/* ── Reset link sent ── */}
              {step === 'forgot_sent' && (
                <div style={{ textAlign: 'center', padding: '8px 0 10px' }}>
                  <div className="success-icon">
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <h2 className="fc-title" style={{ marginBottom: 8 }}>Check Your Email</h2>
                  <p className="fc-sub" style={{ marginBottom: 22 }}>
                    We sent a reset link to<br />
                    <strong style={{ color: '#0d1b4b' }}>{forgotEmail}</strong><br />
                    <span style={{ fontSize: 11 }}>Valid for 1 hour · Check spam if not received</span>
                  </p>
                  <button className="btn" onClick={resetToLogin}>Back to Sign In</button>
                </div>
              )}

            </div>
            <div className="fc-foot">© 2026 Zayron Suite Pvt. Ltd. All rights reserved.</div>
          </div>
        </div>
      </div>
    </>
  )
}
