import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ── Role module definitions ── */
const MODULES = {
  superadmin: [
    {
      key: 'employee', label: 'Employee',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      color: '#6366f1',
      links: [
        { to: '/admin/my-profile', label: 'My Profile', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      ],
    },
    {
      key: 'hr', label: 'HR',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      color: '#0ea5e9',
      links: [
        { to: '/admin/employees', label: 'Employee', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
        { to: '/admin/employees/new', label: 'Employee Onboarding', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
        { to: '/admin/timesheet-approval', label: 'Timesheet Approval', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg> },
      ],
    },
    {
      key: 'projects', label: 'Projects',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg>,
      color: '#8b5cf6',
      links: [
        { to: '/admin/projects', label: 'Project Management', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg> },
      ],
    },
  ],
  hr: [
    {
      key: 'hr', label: 'HR',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      color: '#0ea5e9',
      links: [
        { to: '/admin/employees', label: 'Employee', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
        { to: '/admin/employees/new', label: 'Employee Onboarding', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
        { to: '/admin/timesheet-approval', label: 'Timesheet Approval', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg> },
      ],
    },
    {
      key: 'projects', label: 'Projects',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg>,
      color: '#8b5cf6',
      links: [
        { to: '/admin/projects', label: 'Project Management', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg> },
      ],
    },
  ],
  employee: [
    {
      key: 'employee', label: 'Employee',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      color: '#10b981',
      links: [
        { to: '/admin/my-profile', label: 'My Profile', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        { to: '/admin/timesheet', label: 'Timesheet', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
        { to: '/admin/projects', label: 'Projects', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg> },
      ],
    },
  ],
  it_admin: [
    {
      key: 'it', label: 'IT',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
      color: '#f59e0b',
      links: [
        { to: '/admin/projects', label: 'Project Management', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg> },
      ],
    },
  ],
}

const ROLE_LABELS = { superadmin: 'Super Admin', hr: 'HR Manager', employee: 'Employee', it_admin: 'IT Admin' }
const ROLE_COLORS = { superadmin: '#6366f1', hr: '#0ea5e9', employee: '#10b981', it_admin: '#f59e0b' }

export default function Sidebar({ open = true, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const userRole = user?.role || 'employee'
  const modules = MODULES[userRole] || MODULES.employee

  const activeModuleKey = (() => {
    for (const m of modules) {
      if (m.links.some(l => location.pathname.startsWith(l.to))) return m.key
    }
    return modules[0]?.key
  })()
  const [selectedKey, setSelectedKey] = useState(null)
  const currentKey = selectedKey || activeModuleKey
  const currentModule = modules.find(m => m.key === currentKey) || modules[0]
  const roleColor = ROLE_COLORS[userRole] || '#6366f1'

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = (user?.full_name || user?.username || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .sb-overlay {
          position: fixed; inset: 0;
          background: rgba(2,6,23,0.6); backdrop-filter: blur(4px);
          z-index: 98; opacity: 0; pointer-events: none;
          transition: opacity 0.28s;
        }
        .sb-overlay.open { opacity: 1; pointer-events: auto; }

        .sb-root {
          position: fixed; top: 0; left: 0; height: 100vh;
          display: flex; z-index: 100;
          transform: translateX(-100%);
          transition: transform 0.32s cubic-bezier(.4,0,.2,1);
          font-family: 'Inter', system-ui, sans-serif;
          filter: drop-shadow(4px 0 32px rgba(0,0,0,0.4));
        }
        .sb-root.open { transform: translateX(0); }

        /* ── LEFT ICON RAIL ── */
        .sb-rail {
          width: 72px; height: 100%;
          background: linear-gradient(180deg, #0a0f1e 0%, #0d1424 50%, #0a0f1e 100%);
          border-right: 1px solid rgba(255,255,255,0.04);
          display: flex; flex-direction: column;
          align-items: center;
          padding: 16px 0 16px;
          gap: 2px;
          overflow-y: auto; overflow-x: hidden;
          flex-shrink: 0;
        }
        .sb-rail::-webkit-scrollbar { display: none; }

        /* Logo area */
        .sb-logo {
          width: 44px; height: 44px; border-radius: 14px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px; flex-shrink: 0;
          box-shadow: 0 4px 20px rgba(99,102,241,0.5);
          font-size: 18px; font-weight: 900; color: white;
          letter-spacing: -1px;
        }

        .sb-rail-sep { width: 36px; height: 1px; background: rgba(255,255,255,0.05); margin: 6px 0; flex-shrink: 0; }

        .sb-rail-btn {
          width: 52px; height: 52px; border-radius: 16px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; border: none;
          background: transparent; color: rgba(255,255,255,0.22);
          transition: all 0.2s cubic-bezier(.4,0,.2,1); flex-shrink: 0; padding: 0;
          position: relative;
        }
        .sb-rail-btn:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.75);
          transform: translateY(-1px);
        }
        .sb-rail-btn.active {
          background: rgba(99,102,241,0.18);
          color: #a5b4fc;
        }
        .sb-rail-btn.active::after {
          content: '';
          position: absolute; right: -1px; top: 20%; bottom: 20%;
          width: 3px; border-radius: 3px 0 0 3px;
          background: linear-gradient(180deg, #818cf8, #6366f1);
          box-shadow: -2px 0 8px rgba(99,102,241,0.6);
        }
        .sb-rail-label {
          font-size: 7.5px; font-weight: 700; letter-spacing: 0.06em;
          text-align: center; line-height: 1; white-space: nowrap;
          text-transform: uppercase;
        }

        .sb-rail-bottom { margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%; }

        .sb-util-btn {
          width: 44px; height: 44px; border-radius: 13px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; border: none;
          background: transparent; color: rgba(255,255,255,0.2);
          transition: all 0.18s; flex-shrink: 0; padding: 0;
        }
        .sb-util-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.65); }
        .sb-util-btn-label { font-size: 7px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }

        .sb-exit-btn {
          width: 44px; height: 44px; border-radius: 13px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; border: none;
          background: rgba(239,68,68,0.06); color: rgba(239,68,68,0.4);
          transition: all 0.18s; flex-shrink: 0;
        }
        .sb-exit-btn:hover { background: rgba(239,68,68,0.14); color: #f87171; transform: translateY(-1px); }
        .sb-exit-label { font-size: 7px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }

        /* ── RIGHT PANEL ── */
        .sb-panel {
          width: 218px; height: 100%;
          background: linear-gradient(180deg, #0f1829 0%, #111e30 100%);
          display: flex; flex-direction: column;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.04);
        }

        /* Profile block */
        .sb-profile {
          padding: 20px 16px 16px;
          background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .sb-profile::before {
          content: '';
          position: absolute; top: -20px; right: -20px;
          width: 80px; height: 80px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%);
          pointer-events: none;
        }
        .sb-avatar-wrap { display: flex; align-items: center; gap: 11px; margin-bottom: 12px; position: relative; }
        .sb-avatar {
          width: 44px; height: 44px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 15px; font-weight: 900;
          flex-shrink: 0; position: relative;
        }
        .sb-avatar-online {
          position: absolute; bottom: -2px; right: -2px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #22c55e; border: 2px solid #0f1829;
        }
        .sb-profile-name {
          font-size: 13px; font-weight: 700; color: #f0f4ff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;
        }
        .sb-profile-role-badge {
          display: inline-flex; align-items: center;
          padding: 2px 8px; border-radius: 20px;
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; margin-top: 2px;
        }

        /* Quick nav pills under profile */
        .sb-quick-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .sb-quick-pill {
          padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 600;
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.35);
          border: 1px solid rgba(255,255,255,0.07);
          cursor: pointer; transition: all 0.15s; white-space: nowrap;
          text-decoration: none; display: flex; align-items: center; gap: 4px;
        }
        .sb-quick-pill:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.7); }

        /* Section header */
        .sb-section-head {
          padding: 16px 16px 6px;
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0;
        }
        .sb-section-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .sb-section-label {
          font-size: 9.5px; font-weight: 800; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.18);
        }
        .sb-section-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }

        /* Links */
        .sb-panel-links { flex: 1; overflow-y: auto; padding: 4px 10px 10px; }
        .sb-panel-links::-webkit-scrollbar { width: 2px; }
        .sb-panel-links::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }

        .sb-plink {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 12px;
          color: rgba(255,255,255,0.35);
          font-size: 12.5px; font-weight: 500;
          text-decoration: none; margin-bottom: 2px;
          transition: all 0.18s cubic-bezier(.4,0,.2,1); position: relative;
          border: 1px solid transparent;
        }
        .sb-plink:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.78);
          border-color: rgba(255,255,255,0.06);
        }
        .sb-plink.active {
          background: rgba(99,102,241,0.14);
          color: #c7d2fe; font-weight: 600;
          border-color: rgba(99,102,241,0.22);
          box-shadow: 0 2px 12px rgba(99,102,241,0.12);
        }
        .sb-plink-icon {
          flex-shrink: 0; width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.3);
          transition: all 0.18s;
        }
        .sb-plink:hover .sb-plink-icon { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65); }
        .sb-plink.active .sb-plink-icon { background: rgba(99,102,241,0.22); color: #a5b4fc; }
        .sb-plink-arrow {
          margin-left: auto; opacity: 0; font-size: 12px;
          color: rgba(255,255,255,0.25); transition: opacity 0.15s, transform 0.15s;
        }
        .sb-plink:hover .sb-plink-arrow { opacity: 1; transform: translateX(2px); }
        .sb-plink.active .sb-plink-arrow { opacity: 1; color: #818cf8; }

        /* Footer */
        .sb-footer {
          padding: 12px 12px 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }
        .sb-footer-copyright {
          text-align: center; font-size: 9px;
          color: rgba(255,255,255,0.07); letter-spacing: 0.03em; margin-top: 8px;
        }
      `}</style>

      <div className={`sb-overlay ${open ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sb-root ${open ? 'open' : ''}`}>

        {/* ── LEFT RAIL ── */}
        <div className="sb-rail">

          <div className="sb-rail-sep" />

          {/* Module icons */}
          {modules.map(m => (
            <button
              key={m.key}
              className={`sb-rail-btn ${currentKey === m.key && location.pathname !== '/admin/dashboard' ? 'active' : ''}`}
              onClick={() => setSelectedKey(m.key)}
              title={m.label}
              style={currentKey === m.key && location.pathname !== '/admin/dashboard' ? { color: m.color } : {}}
            >
              {m.icon}
              <span className="sb-rail-label">{m.label}</span>
            </button>
          ))}

          {/* Bottom utilities */}
          <div className="sb-rail-bottom">
            <div className="sb-rail-sep" style={{ marginBottom: 4 }} />

            <button
              className="sb-util-btn"
              onClick={() => { navigate('/admin/change-password'); onClose && onClose() }}
              title="Change Password"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span className="sb-util-btn-label">Security</span>
            </button>

            <button className="sb-exit-btn" onClick={handleLogout} title="Sign Out">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="sb-exit-label">Exit</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="sb-panel">

          {/* Section heading */}
          <div className="sb-section-head">
            <div className="sb-section-dot" style={{ background: currentModule?.color || '#6366f1', boxShadow: `0 0 6px ${currentModule?.color || '#6366f1'}` }} />
            <span className="sb-section-label">{currentModule?.label}</span>
            <div className="sb-section-line" />
          </div>

          {/* Nav links */}
          <div className="sb-panel-links">
            {currentModule?.links.map(({ to, label, icon }) => (
              <NavLink
                key={to + label} to={to}
                className={({ isActive }) => `sb-plink${isActive ? ' active' : ''}`}
              >
                <span className="sb-plink-icon">{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                <span className="sb-plink-arrow">›</span>
              </NavLink>
            ))}
          </div>

          <div className="sb-footer">
            <button
              onClick={handleLogout}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, color: 'rgba(239,68,68,0.6)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.color = 'rgba(239,68,68,0.6)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
            <div className="sb-footer-copyright">© 2026 Zayron Suite Pvt. Ltd.</div>
          </div>
        </div>

      </aside>
    </>
  )
}
