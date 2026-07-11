import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ── Role module definitions ── */
const MODULES = {
  superadmin: [
    {
      key: 'employee', label: 'Employee',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      links: [
        { to: '/admin/employees', label: 'Employee', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
        { to: '/admin/employees/new', label: 'Employee Onboarding', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
      ],
    },
    {
      key: 'hr', label: 'HR',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      links: [
        { to: '/admin/employees', label: 'Employee', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
        { to: '/admin/reports', label: 'Reports', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
      ],
    },
    {
      key: 'projects', label: 'Projects',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg>,
      links: [
        { to: '/admin/projects', label: 'Project Management', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg> },
      ],
    },
    {
      key: 'reports', label: 'Reports',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      links: [
        { to: '/admin/reports', label: 'Reports', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
      ],
    },
  ],
  hr: [
    {
      key: 'hr', label: 'HR',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      links: [
        { to: '/admin/employees', label: 'Employee', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
        { to: '/admin/employees/new', label: 'Employee Onboarding', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
        { to: '/admin/reports', label: 'Reports', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
      ],
    },
    {
      key: 'projects', label: 'Projects',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg>,
      links: [
        { to: '/admin/projects', label: 'Project Management', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg> },
      ],
    },
  ],
  employee: [
    {
      key: 'employee', label: 'Employee',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      links: [
        { to: '/admin/employees', label: 'My Profile', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        { to: '/admin/projects', label: 'Projects', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg> },
      ],
    },
  ],
  it_admin: [
    {
      key: 'it', label: 'IT',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
      links: [
        { to: '/admin/projects', label: 'Project Management', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg> },
      ],
    },
  ],
}

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  hr: 'HR',
  employee: 'Employee',
  it_admin: 'IT Admin',
}

export default function Sidebar({ open = true, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const userRole = user?.role || 'employee'
  const modules = MODULES[userRole] || MODULES.employee

  // auto-select module whose links contain current path
  const activeModuleKey = (() => {
    for (const m of modules) {
      if (m.links.some(l => location.pathname.startsWith(l.to))) return m.key
    }
    return modules[0]?.key
  })()
  const [selectedKey, setSelectedKey] = useState(null)
  const currentKey = selectedKey || activeModuleKey

  const currentModule = modules.find(m => m.key === currentKey) || modules[0]
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .sb-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(3px);
          z-index: 98; opacity: 0; pointer-events: none;
          transition: opacity 0.25s;
        }
        .sb-overlay.open { opacity: 1; pointer-events: auto; }

        .sb-root {
          position: fixed; top: 0; left: 0; height: 100vh;
          display: flex; z-index: 100;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(.4,0,.2,1);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .sb-root.open { transform: translateX(0); }

        /* ── Left icon rail ── */
        .sb-rail {
          width: 68px; height: 100%;
          background: #0f172a;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column;
          align-items: center;
          padding: 20px 0 16px;
          gap: 6px;
          overflow-y: auto; overflow-x: hidden;
          flex-shrink: 0;
        }
        .sb-rail::-webkit-scrollbar { display: none; }

        .sb-rail-btn {
          width: 50px; height: 50px; border-radius: 14px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px; cursor: pointer; border: none;
          background: transparent; color: rgba(255,255,255,0.3);
          transition: all 0.18s; flex-shrink: 0; padding: 0;
          position: relative;
        }
        .sb-rail-btn:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.7);
        }
        .sb-rail-btn.active {
          background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15));
          color: #a5b4fc;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.3), 0 4px 12px rgba(99,102,241,0.2);
        }
        .sb-rail-btn.active::before {
          content: '';
          position: absolute; left: -1px; top: 25%; bottom: 25%;
          width: 3px; border-radius: 0 3px 3px 0;
          background: #6366f1;
        }
        .sb-rail-label {
          font-size: 8px; font-weight: 700; letter-spacing: 0.04em;
          text-align: center; line-height: 1; white-space: nowrap;
          text-transform: uppercase;
        }

        .sb-rail-divider {
          width: 32px; height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0; flex-shrink: 0;
        }

        .sb-rail-logout {
          margin-top: auto;
          width: 50px; height: 50px; border-radius: 14px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px; cursor: pointer; border: none;
          background: transparent; color: rgba(239,68,68,0.45);
          transition: all 0.18s; flex-shrink: 0;
        }
        .sb-rail-logout:hover {
          background: rgba(239,68,68,0.1);
          color: #f87171;
        }
        .sb-rail-logout-label {
          font-size: 8px; font-weight: 700; letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── Right panel ── */
        .sb-panel {
          width: 210px; height: 100%;
          background: #162032;
          display: flex; flex-direction: column;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.04);
        }

        /* User profile card */
        .sb-profile {
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .sb-profile-avatar {
          width: 46px; height: 46px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 16px; font-weight: 800;
          margin-bottom: 10px;
          box-shadow: 0 4px 14px rgba(99,102,241,0.4);
          border: 2px solid rgba(99,102,241,0.3);
        }
        .sb-profile-name {
          font-size: 13.5px; font-weight: 700; color: #f1f5f9;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-profile-role {
          font-size: 10px; font-weight: 600; color: #818cf8;
          text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px;
        }

        /* Section header */
        .sb-section-head {
          padding: 14px 16px 6px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.2);
          flex-shrink: 0;
        }

        .sb-panel-links {
          flex: 1; overflow-y: auto; padding: 4px 10px 10px;
        }
        .sb-panel-links::-webkit-scrollbar { width: 3px; }
        .sb-panel-links::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }

        .sb-plink {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 12px; border-radius: 10px;
          color: rgba(255,255,255,0.42);
          font-size: 13px; font-weight: 500;
          text-decoration: none; margin-bottom: 3px;
          transition: all 0.16s; position: relative;
        }
        .sb-plink:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.82);
          padding-left: 16px;
        }
        .sb-plink.active {
          background: rgba(99,102,241,0.15);
          color: #c7d2fe; font-weight: 600;
          border: 1px solid rgba(99,102,241,0.2);
        }
        .sb-plink.active::after {
          content: '';
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          width: 6px; height: 6px; border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 6px rgba(99,102,241,0.8);
        }
        .sb-plink-icon {
          flex-shrink: 0;
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.35);
          transition: all 0.16s;
        }
        .sb-plink:hover .sb-plink-icon {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
        }
        .sb-plink.active .sb-plink-icon {
          background: rgba(99,102,241,0.2);
          border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }

        .sb-panel-footer {
          padding: 10px 10px 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }
        .sb-version {
          text-align: center; font-size: 9px;
          color: rgba(255,255,255,0.08); letter-spacing: 0.04em;
          margin-top: 6px;
        }
      `}</style>

      <div className={`sb-overlay ${open ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sb-root ${open ? 'open' : ''}`}>

        {/* ── Left icon rail ── */}
        <div className="sb-rail">
          {/* Dashboard */}
          <button
            className={`sb-rail-btn ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
            onClick={() => { setSelectedKey(null); navigate('/admin/dashboard') }}
            title="Dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            <span className="sb-rail-label">Home</span>
          </button>

          <div className="sb-rail-divider" />

          {/* Module icons */}
          {modules.map(m => (
            <button
              key={m.key}
              className={`sb-rail-btn ${currentKey === m.key && location.pathname !== '/admin/dashboard' ? 'active' : ''}`}
              onClick={() => setSelectedKey(m.key)}
              title={m.label}
            >
              {m.icon}
              <span className="sb-rail-label">{m.label}</span>
            </button>
          ))}

          {/* Sign out */}
          <button className="sb-rail-logout" onClick={handleLogout} title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="sb-rail-logout-label">Exit</span>
          </button>
        </div>

        {/* ── Right panel ── */}
        <div className="sb-panel">

          {/* User profile */}
          <div className="sb-profile">
            <div className="sb-profile-avatar">
              {(user?.full_name || user?.username || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="sb-profile-name">{user?.full_name || user?.username || 'User'}</div>
            <div className="sb-profile-role">{ROLE_LABELS[userRole] || userRole}</div>
          </div>

          {/* Section label */}
          <div className="sb-section-head">{currentModule?.label}</div>

          {/* Links */}
          <div className="sb-panel-links">
            {currentModule?.links.map(({ to, label, icon }) => (
              <NavLink
                key={to} to={to}
                className={({ isActive }) => `sb-plink${isActive ? ' active' : ''}`}
              >
                <span className="sb-plink-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="sb-panel-footer">
            <div className="sb-version">© 2026 Zayron Suite Pvt. Ltd.</div>
          </div>
        </div>

      </aside>
    </>
  )
}
