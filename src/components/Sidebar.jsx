import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ── Role module definitions ── */
const MODULES = {
  superadmin: [
    {
      key: 'dashboard', label: 'Dashboard',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
      links: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
      ],
    },
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
      key: 'dashboard', label: 'Dashboard',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
      links: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
      ],
    },
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
      key: 'dashboard', label: 'Dashboard',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
      links: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
      ],
    },
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
      key: 'dashboard', label: 'Dashboard',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
      links: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
      ],
    },
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
          background: rgba(0,0,0,0.45); backdrop-filter: blur(2px);
          z-index: 98; opacity: 0; pointer-events: none;
          transition: opacity 0.28s;
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
          width: 64px; height: 100%;
          background: #111827;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
          align-items: center;
          padding: 16px 0;
          gap: 4px;
          overflow-y: auto; overflow-x: hidden;
          flex-shrink: 0;
        }
        .sb-rail::-webkit-scrollbar { display: none; }

        .sb-rail-logo {
          width: 40px; height: 40px; border-radius: 11px; margin-bottom: 16px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99,102,241,0.45);
        }

        .sb-rail-btn {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; border: none;
          background: transparent; color: rgba(255,255,255,0.35);
          transition: all 0.18s; flex-shrink: 0;
          padding: 0;
        }
        .sb-rail-btn:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.75);
        }
        .sb-rail-btn.active {
          background: rgba(99,102,241,0.2);
          color: #a5b4fc;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.35);
        }
        .sb-rail-btn-label {
          font-size: 8.5px; font-weight: 600; letter-spacing: 0.03em;
          text-align: center; line-height: 1; white-space: nowrap;
        }

        .sb-rail-logout {
          margin-top: auto;
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: none;
          background: transparent; color: rgba(239,68,68,0.5);
          transition: all 0.18s; flex-shrink: 0;
        }
        .sb-rail-logout:hover {
          background: rgba(239,68,68,0.1);
          color: #f87171;
        }

        /* ── Right panel ── */
        .sb-panel {
          width: 200px; height: 100%;
          background: #1a2234;
          display: flex; flex-direction: column;
          overflow: hidden;
        }

        .sb-panel-header {
          padding: 20px 16px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .sb-panel-role {
          font-size: 9px; font-weight: 700; letter-spacing: 0.15em;
          text-transform: uppercase; color: rgba(255,255,255,0.25);
          margin-bottom: 4px;
        }
        .sb-panel-section {
          font-size: 14px; font-weight: 800; color: #f1f5f9;
          letter-spacing: -0.01em;
        }

        .sb-panel-links {
          flex: 1; overflow-y: auto; padding: 10px 8px;
        }
        .sb-panel-links::-webkit-scrollbar { width: 0; }

        .sb-plink {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 9px;
          color: rgba(255,255,255,0.45);
          font-size: 13px; font-weight: 500;
          text-decoration: none; margin-bottom: 2px;
          transition: all 0.15s;
        }
        .sb-plink:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
        }
        .sb-plink.active {
          background: rgba(99,102,241,0.18);
          color: #c7d2fe; font-weight: 600;
        }
        .sb-plink-icon {
          flex-shrink: 0; opacity: 0.7;
        }
        .sb-plink.active .sb-plink-icon { opacity: 1; }

        .sb-panel-footer {
          padding: 12px 8px 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }
        .sb-version {
          text-align: center; font-size: 9.5px;
          color: rgba(255,255,255,0.1); letter-spacing: 0.03em;
          margin-top: 8px;
        }
      `}</style>

      <div className={`sb-overlay ${open ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sb-root ${open ? 'open' : ''}`}>

        {/* ── Left icon rail ── */}
        <div className="sb-rail">
          {/* Logo */}
          <div className="sb-rail-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>

          {/* Module icons */}
          {modules.map(m => (
            <button
              key={m.key}
              className={`sb-rail-btn ${currentKey === m.key ? 'active' : ''}`}
              onClick={() => setSelectedKey(m.key)}
              title={m.label}
            >
              {m.icon}
              <span className="sb-rail-btn-label">{m.label}</span>
            </button>
          ))}

          {/* Sign out */}
          <button className="sb-rail-logout" onClick={handleLogout} title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

        {/* ── Right panel ── */}
        <div className="sb-panel">
          <div className="sb-panel-header">
            <div className="sb-panel-role">{ROLE_LABELS[userRole] || userRole}</div>
            <div className="sb-panel-section">{currentModule?.label}</div>
          </div>

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
