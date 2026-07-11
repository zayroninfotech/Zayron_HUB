import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ICONS = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  employees: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  addEmployee: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  projects: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="16" y="13" width="6" height="8" rx="1"/></svg>,
  reports: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
}

// Super Admin: all sections
const superAdminNavItems = [
  {
    section: 'MAIN',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard', color: '#6366f1', icon: ICONS.dashboard },
    ]
  },
  {
    section: 'HR MANAGEMENT',
    links: [
      { to: '/admin/employees', label: 'Employees', color: '#3b82f6', icon: ICONS.employees },
      { to: '/admin/employees/new', label: 'Add Employee', color: '#10b981', badge: 'New', icon: ICONS.addEmployee },
    ]
  },
  {
    section: 'PROJECTS',
    links: [
      { to: '/admin/projects', label: 'Projects', color: '#8b5cf6', icon: ICONS.projects },
    ]
  },
  {
    section: 'REPORTS',
    links: [
      { to: '/admin/reports', label: 'Reports', color: '#f59e0b', icon: ICONS.reports },
    ]
  },
]

// HR: employee management + projects
const hrNavItems = [
  {
    section: 'MAIN',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard', color: '#6366f1', icon: ICONS.dashboard },
    ]
  },
  {
    section: 'HR MANAGEMENT',
    links: [
      { to: '/admin/employees', label: 'Employees', color: '#3b82f6', icon: ICONS.employees },
      { to: '/admin/employees/new', label: 'Add Employee', color: '#10b981', badge: 'New', icon: ICONS.addEmployee },
    ]
  },
  {
    section: 'PROJECTS',
    links: [
      { to: '/admin/projects', label: 'Projects', color: '#8b5cf6', icon: ICONS.projects },
    ]
  },
]

// Employee: dashboard + own profile + projects
const employeeNavItems = [
  {
    section: 'MAIN',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard', color: '#6366f1', icon: ICONS.dashboard },
    ]
  },
  {
    section: 'MY WORKSPACE',
    links: [
      { to: '/admin/employees', label: 'My Profile', color: '#3b82f6', icon: ICONS.profile },
      { to: '/admin/projects', label: 'Projects', color: '#8b5cf6', icon: ICONS.projects },
    ]
  },
]

// IT Admin: dashboard + projects only
const itAdminNavItems = [
  {
    section: 'MAIN',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard', color: '#6366f1', icon: ICONS.dashboard },
    ]
  },
  {
    section: 'IT MANAGEMENT',
    links: [
      { to: '/admin/projects', label: 'Projects', color: '#8b5cf6', icon: ICONS.projects },
    ]
  },
]

const SIDEBAR_W = 260

export default function Sidebar({ open = true, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const userRole = user?.role
  const navItems = userRole === 'superadmin' ? superAdminNavItems
    : userRole === 'hr' ? hrNavItems
    : userRole === 'it_admin' ? itAdminNavItems
    : employeeNavItems
  const handleLogout = () => { logout(); navigate('/login') }
  const displayName = user?.full_name || user?.username || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  const roleLabel = userRole ? userRole.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'User'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .sb-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.45);
          backdrop-filter: blur(3px);
          z-index: 98; opacity: 0; pointer-events: none;
          transition: opacity 0.28s ease;
        }
        .sb-overlay.open { opacity: 1; pointer-events: auto; }

        .sb-root {
          position: fixed; top: 0; left: 0;
          width: ${SIDEBAR_W}px; height: 100vh;
          z-index: 100;
          display: flex; flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(.4,0,.2,1);
          font-family: 'Inter', system-ui, sans-serif;
          background: #0f172a;
          border-right: 1px solid rgba(255,255,255,0.06);
          box-shadow: 8px 0 32px rgba(0,0,0,0.4);
        }
        .sb-root.open { transform: translateX(0); }

        /* scrollable body */
        .sb-body {
          flex: 1; display: flex; flex-direction: column;
          overflow-y: auto; overflow-x: hidden;
          padding: 0;
        }
        .sb-body::-webkit-scrollbar { width: 0; }

        /* ── Header / Logo ── */
        .sb-header {
          padding: 20px 18px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; gap: 12px;
          flex-shrink: 0;
        }
        .sb-logo-mark {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(99,102,241,0.5);
        }
        .sb-logo-mark svg { display: block; }
        .sb-brand { flex: 1; min-width: 0; }
        .sb-brand-name {
          font-size: 15px; font-weight: 800; color: #f1f5f9;
          letter-spacing: -0.02em; white-space: nowrap;
        }
        .sb-brand-sub {
          font-size: 10.5px; color: rgba(255,255,255,0.28);
          font-weight: 500; margin-top: 1px; letter-spacing: 0.02em;
        }
        .sb-live-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
          animation: sb-pulse 2.2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes sb-pulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0.05); }
        }

        /* ── User card ── */
        .sb-user-card {
          margin: 14px 14px 0;
          padding: 14px;
          background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%);
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 14px;
          display: flex; align-items: center; gap: 11px;
          flex-shrink: 0;
        }
        .sb-avatar {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 800; font-size: 14px;
          box-shadow: 0 0 0 2px rgba(99,102,241,0.4);
          position: relative;
        }
        .sb-avatar-online {
          position: absolute; bottom: 1px; right: 1px;
          width: 9px; height: 9px; border-radius: 50%;
          background: #22c55e; border: 2px solid #0f172a;
        }
        .sb-user-info { flex: 1; min-width: 0; }
        .sb-user-name {
          font-size: 13px; font-weight: 700; color: #f1f5f9;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-user-role {
          font-size: 10px; font-weight: 600; color: #a78bfa;
          text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px;
        }

        /* ── Nav ── */
        .sb-nav { flex: 1; padding: 18px 10px 8px; }

        .sb-section { margin-bottom: 20px; }
        .sb-section-title {
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; color: rgba(255,255,255,0.2);
          padding: 0 8px 8px; display: flex; align-items: center; gap: 8px;
        }
        .sb-section-title::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .sb-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 10px; border-radius: 11px;
          color: rgba(255,255,255,0.42);
          font-size: 13.5px; font-weight: 500;
          text-decoration: none; margin-bottom: 3px;
          transition: all 0.16s ease;
          position: relative;
        }
        .sb-link:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.82);
        }
        .sb-link.active {
          background: rgba(99,102,241,0.15);
          color: #c7d2fe;
          font-weight: 600;
        }
        .sb-link.active::after {
          content: '';
          position: absolute; right: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 3px 0 0 3px;
          background: #6366f1;
        }

        .sb-link-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.16s;
          color: rgba(255,255,255,0.35);
        }
        .sb-link:hover .sb-link-icon {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
        }
        .sb-link.active .sb-link-icon {
          background: rgba(99,102,241,0.25);
          border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }

        .sb-badge {
          margin-left: auto;
          font-size: 9px; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase;
          background: rgba(16,185,129,0.15);
          color: #6ee7b7;
          border: 1px solid rgba(16,185,129,0.2);
          padding: 2px 7px; border-radius: 20px;
        }

        /* ── Divider ── */
        .sb-divider {
          height: 1px; background: rgba(255,255,255,0.05);
          margin: 0 14px 14px;
        }

        /* ── Footer ── */
        .sb-footer { padding: 0 10px 18px; flex-shrink: 0; }

        .sb-logout {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 10px; border-radius: 11px;
          color: rgba(255,255,255,0.35);
          font-size: 13.5px; font-weight: 500;
          background: none; border: none; cursor: pointer;
          font-family: inherit; transition: all 0.16s; text-align: left;
        }
        .sb-logout:hover {
          background: rgba(239,68,68,0.08);
          color: #fca5a5;
        }
        .sb-logout-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.1);
          transition: all 0.16s;
        }
        .sb-logout:hover .sb-logout-icon {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.22);
        }

        .sb-version {
          text-align: center; font-size: 10px;
          color: rgba(255,255,255,0.1);
          margin-top: 12px; letter-spacing: 0.04em;
        }
      `}</style>

      <div className={`sb-overlay ${open ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sb-root ${open ? 'open' : ''}`}>
        <div className="sb-body">

          {/* Nav */}
          <nav className="sb-nav">
            {navItems.map(({ section, links }) => (
              <div key={section} className="sb-section">
                <div className="sb-section-title">{section}</div>
                {links.map(({ to, label, icon, badge, color }) => (
                  <NavLink key={to} to={to}
                    className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}>
                    {({ isActive }) => (
                      <>
                        <span className="sb-link-icon" style={isActive ? { background: `${color}22`, borderColor: `${color}44`, color } : {}}>
                          {icon}
                        </span>
                        {label}
                        {badge && <span className="sb-badge">{badge}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="sb-divider" />

          {/* Footer */}
          <div className="sb-footer">
            <button className="sb-logout" onClick={handleLogout}>
              <div className="sb-logout-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              Sign Out
            </button>
            <div className="sb-version">© 2026 Zayron Suite Pvt. Ltd.</div>
          </div>

        </div>
      </aside>
    </>
  )
}
