import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const navItems = [
  {
    section: 'MAIN',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10', badge: null, color: '#6366f1' },
    ]
  },
  {
    section: 'EMPLOYEES',
    links: [
      { to: '/admin/employees', label: 'Employees', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 1 0-8 4 4 0 0 1 0 8z', badge: null, color: '#3b82f6', roles: ['superadmin', 'hr', 'employee', 'it_admin'] },
      { to: '/admin/employees/new', label: 'Add Employee', icon: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M12.5 7a4 4 0 1 1 0 .001 M20 8v6 M23 11h-6', badge: 'New', color: '#10b981', roles: ['superadmin', 'hr'] },
    ]
  },
]

const SIDEBAR_W = 268

export default function Sidebar({ open = true, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const userRole = user?.role
  const handleLogout = () => { logout(); navigate('/login') }
  const initials = (user?.full_name || user?.username || 'A').slice(0, 2).toUpperCase()
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .sb-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);
          z-index: 98; opacity: 0; pointer-events: none;
          transition: opacity 0.3s;
        }
        .sb-overlay.open { opacity: 1; pointer-events: auto; }

        .sidebar-root {
          position: fixed; top: 0; left: 0;
          width: ${SIDEBAR_W}px; height: 100vh;
          display: flex; flex-direction: column;
          z-index: 100;
          transform: translateX(-100%);
          transition: transform 0.32s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;

          /* Glass-dark background */
          background: linear-gradient(160deg, #0c1540 0%, #0d1b4b 50%, #0a1230 100%);
          box-shadow: 4px 0 40px rgba(0,0,0,0.5);
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .sidebar-root.open { transform: translateX(0); }

        /* Background decorations */
        .sidebar-root::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 60% 40% at 15% 5%, rgba(99,102,241,0.20) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 90%, rgba(59,130,246,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 30%, rgba(139,92,246,0.08) 0%, transparent 55%);
        }
        .sidebar-root::after {
          content: '';
          position: absolute; pointer-events: none; z-index: 0;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent);
        }

        .sb-inner {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; height: 100%;
          overflow-y: auto; overflow-x: hidden;
        }
        .sb-inner::-webkit-scrollbar { width: 3px; }
        .sb-inner::-webkit-scrollbar-track { background: transparent; }
        .sb-inner::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }

        /* ── Logo ── */
        .sb-logo {
          display: flex; align-items: center; gap: 13px;
          padding: 22px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0; position: relative;
        }
        .sb-logo-box {
          width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.15));
          border: 1px solid rgba(99,102,241,0.25);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          overflow: hidden;
        }
        .sb-logo-box img { width: 36px; height: 36px; object-fit: contain; }
        .sb-logo-name { font-size: 15px; font-weight: 800; color: #fff; line-height: 1.2; letter-spacing: -0.015em; }
        .sb-logo-sub  { font-size: 10px; color: rgba(255,255,255,0.32); margin-top: 2px; letter-spacing: 0.05em; }
        .sb-logo-live {
          margin-left: auto;
          display: flex; align-items: center; gap: 5px;
          background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.25);
          border-radius: 20px; padding: 4px 9px;
          font-size: 10px; font-weight: 700; color: #6ee7b7;
        }
        .sb-logo-live-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #34d399;
          box-shadow: 0 0 4px #34d399; animation: sbpulse 2s ease-in-out infinite;
        }
        @keyframes sbpulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── Greeting card ── */
        .sb-greeting {
          margin: 16px 14px 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 100%);
          border: 1px solid rgba(99,102,241,0.20);
          border-radius: 16px; padding: 14px 16px;
          flex-shrink: 0; position: relative; overflow: hidden;
        }
        .sb-greeting::before {
          content: ''; position: absolute;
          top: -20px; right: -20px; width: 80px; height: 80px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%);
        }
        .sb-greeting-row { display: flex; align-items: center; justify-content: space-between; }
        .sb-greeting-hi { font-size: 11px; color: rgba(255,255,255,0.42); font-weight: 500; margin-bottom: 4px; }
        .sb-greeting-name { font-size: 17px; color: #fff; font-weight: 800; letter-spacing: -0.015em; }
        .sb-greeting-emoji { font-size: 22px; line-height: 1; }
        .sb-greeting-role {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 9px; font-size: 10px; font-weight: 700; letter-spacing: 0.09em;
          background: linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.25));
          color: #c4b5fd; border: 1px solid rgba(139,92,246,0.25);
          border-radius: 20px; padding: 3px 11px; text-transform: uppercase;
        }

        /* ── Search ── */
        .sb-search {
          margin: 12px 14px 0;
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 10px 13px;
          flex-shrink: 0; transition: all 0.2s;
        }
        .sb-search:focus-within {
          border-color: rgba(99,102,241,0.35);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
        .sb-search input {
          background: none; border: none; outline: none;
          color: rgba(255,255,255,0.75); font-size: 12.5px;
          width: 100%; font-family: inherit;
        }
        .sb-search input::placeholder { color: rgba(255,255,255,0.2); font-size: 12.5px; }

        /* ── Nav ── */
        .sb-nav { flex: 1; padding: 14px 10px 6px; }
        .sb-section { margin-bottom: 4px; }

        .sb-section-label {
          font-size: 9px; font-weight: 800; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(255,255,255,0.18);
          padding: 0 10px; margin-bottom: 5px;
          display: flex; align-items: center; gap: 8px;
        }
        .sb-section-label::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(to right, rgba(255,255,255,0.06), transparent);
        }
        .sb-section-links { margin-bottom: 16px; }

        .sb-link {
          display: flex; align-items: center; gap: 12px;
          padding: 9px 10px; border-radius: 12px;
          color: rgba(255,255,255,0.48);
          font-size: 13px; font-weight: 500;
          text-decoration: none; margin-bottom: 2px;
          transition: all 0.18s; position: relative;
        }
        .sb-link:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.88);
          padding-left: 14px;
        }
        .sb-link.active {
          background: linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.08) 100%);
          color: #fff; font-weight: 600;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .sb-link.active::before {
          content: '';
          position: absolute; left: 0; top: 22%; bottom: 22%;
          width: 3px; border-radius: 0 3px 3px 0;
          background: linear-gradient(to bottom, #818cf8, #6366f1);
          box-shadow: 0 0 8px rgba(99,102,241,0.6);
        }

        .sb-link-icon {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.18s;
        }
        .sb-link:hover .sb-link-icon {
          background: rgba(255,255,255,0.10);
          border-color: rgba(255,255,255,0.10);
        }
        .sb-link.active .sb-link-icon {
          background: rgba(99,102,241,0.30);
          border-color: rgba(99,102,241,0.25);
          box-shadow: 0 2px 8px rgba(99,102,241,0.25);
        }

        .sb-badge {
          margin-left: auto; font-size: 9px; font-weight: 700;
          background: linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.15));
          color: #6ee7b7; border: 1px solid rgba(16,185,129,0.25);
          padding: 2px 8px; border-radius: 20px;
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        /* ── Status strip ── */
        .sb-status-strip {
          margin: 0 14px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 10px 14px;
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .sb-status-item { display: flex; align-items: center; gap: 6px; }
        .sb-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .sb-status-txt { font-size: 10.5px; color: rgba(255,255,255,0.35); font-weight: 500; }
        .sb-status-val { font-size: 10.5px; font-weight: 700; }
        .sb-status-div { width: 1px; height: 18px; background: rgba(255,255,255,0.07); }

        /* ── Footer ── */
        .sb-footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 12px 14px 16px; flex-shrink: 0;
        }
        .sb-user {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 13px; border-radius: 13px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 8px;
          transition: background 0.18s;
        }
        .sb-user:hover { background: rgba(255,255,255,0.07); }
        .sb-avatar {
          width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 800; font-size: 13px;
          box-shadow: 0 3px 12px rgba(99,102,241,0.45);
          border: 2px solid rgba(99,102,241,0.35);
        }
        .sb-avatar-ring {
          position: relative;
        }
        .sb-avatar-ring::after {
          content: '';
          position: absolute; bottom: 0; right: 0;
          width: 10px; height: 10px; border-radius: 50%;
          background: #22c55e; border: 2px solid #0d1b4b;
        }
        .sb-uname { color: #fff; font-size: 12.5px; font-weight: 700; line-height: 1.2; }
        .sb-urole { color: rgba(255,255,255,0.3); font-size: 10.5px; margin-top: 2px; font-weight: 500; }
        .sb-chevron { margin-left: auto; color: rgba(255,255,255,0.2); }

        .sb-logout {
          display: flex; align-items: center; gap: 11px;
          width: 100%; padding: 10px 13px; border-radius: 12px;
          color: rgba(255,255,255,0.38);
          font-size: 13px; font-weight: 500;
          background: none; border: none; cursor: pointer;
          font-family: inherit; transition: all 0.18s; text-align: left;
        }
        .sb-logout-icon {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.12);
          transition: all 0.18s;
        }
        .sb-logout:hover { color: #fca5a5; }
        .sb-logout:hover .sb-logout-icon { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.25); }

        .sb-version {
          text-align: center; font-size: 10px; color: rgba(255,255,255,0.12);
          margin-top: 10px; letter-spacing: 0.04em;
        }
      `}</style>

      <div className={`sb-overlay ${open ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sidebar-root ${open ? 'open' : ''}`}>
        <div className="sb-inner">



          {/* ── Nav ── */}
          <nav className="sb-nav">
            {navItems.map(({ section, links }) => (
              <div key={section} className="sb-section">
                <div className="sb-section-label">{section}</div>
                <div className="sb-section-links">
                  {links.filter(({ roles }) => !roles || roles.includes(userRole)).map(({ to, label, icon, badge, color }) => (
                    <NavLink key={to} to={to}
                      className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}>
                      {({ isActive }) => (
                        <>
                          <span className="sb-link-icon" style={isActive ? { background: `${color}28`, borderColor: `${color}40` } : {}}>
                            <Icon d={icon} size={15} />
                          </span>
                          {label}
                          {badge && <span className="sb-badge">{badge}</span>}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>


          {/* ── Footer ── */}
          <div className="sb-footer">
            <button className="sb-logout" onClick={handleLogout}>
              <div className="sb-logout-icon">
                <svg width="14" height="14" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9"/>
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
