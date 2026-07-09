import { useState } from 'react'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

const SIDEBAR_W = 260

export default function Layout({ title, actions, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useAuth()
  const initials = (user?.full_name || user?.username || 'A').slice(0, 2).toUpperCase()
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <>
      <style>{`
        .layout-wrap {
          display: flex; min-height: 100vh;
          background: #f0f2f8;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* push main content when sidebar open */
        .layout-main {
          flex: 1;
          margin-left: ${SIDEBAR_W}px;
          display: flex; flex-direction: column;
          min-width: 0;
          transition: margin-left 0.3s cubic-bezier(.4,0,.2,1);
        }
        .layout-main.closed { margin-left: 0; }

        /* ── TOPBAR ── */
        .topbar {
          position: sticky; top: 0; z-index: 50;
          height: 62px;
          background: #fff;
          border-bottom: 1px solid #e4e8f0;
          box-shadow: 0 1px 8px rgba(13,27,75,0.07);
          display: flex; align-items: center;
          padding: 0 24px; gap: 14px;
        }

        /* hamburger */
        .ham-btn {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: #f1f5f9; border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #475569;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s, transform 0.2s;
        }
        .ham-btn:hover { background: #e2e8f0; color: #0d1b4b; }
        .ham-btn:active { transform: scale(0.93); }

        /* breadcrumb area */
        .topbar-title-wrap { flex: 1; min-width: 0; }
        .topbar-title {
          font-size: 17px; font-weight: 700;
          color: #0f172a; line-height: 1.2;
          letter-spacing: -0.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .topbar-date { font-size: 11px; color: #94a3b8; margin-top: 1px; }

        /* divider */
        .topbar-div { width: 1px; height: 30px; background: #e4e8f0; flex-shrink: 0; }

        /* notification */
        .notif-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: none; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #94a3b8;
          position: relative; flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .notif-btn:hover { background: #f1f5f9; color: #475569; }
        .notif-dot {
          position: absolute; top: 8px; right: 8px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #ef4444; border: 2px solid #fff;
        }

        /* user pill */
        .user-pill {
          display: flex; align-items: center; gap: 10px;
          background: #f8fafc; border: 1px solid #e4e8f0;
          border-radius: 12px; padding: 6px 14px 6px 7px;
          cursor: default; user-select: none; flex-shrink: 0;
        }
        .user-pill-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 12px; font-weight: 800;
          box-shadow: 0 2px 8px rgba(79,70,229,0.3);
          flex-shrink: 0;
        }
        .user-pill-name { font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.2; white-space: nowrap; }
        .user-pill-role { font-size: 10px; color: #94a3b8; margin-top: 1px; white-space: nowrap; }

        @media (max-width: 768px) {
          .layout-main { margin-left: 0 !important; }
          .user-pill-name, .user-pill-role { display: none; }
          .user-pill { padding: 6px 7px; }
        }
      `}</style>

      <div className="layout-wrap">

        {/* ── SIDEBAR ── */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* ── MAIN ── */}
        <div className={`layout-main${sidebarOpen ? '' : ' closed'}`}>

          {/* TOPBAR */}
          <header className="topbar">

            {/* Hamburger toggle */}
            <button className="ham-btn" onClick={() => setSidebarOpen(v => !v)}
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
              {sidebarOpen ? (
                /* X / close icon */
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                /* hamburger 3-line icon */
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>

            {/* Sidebar open/close status indicator */}
            <div style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: sidebarOpen ? '#22c55e' : '#94a3b8',
              boxShadow: sidebarOpen ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
            }} />

            {/* Divider */}
            <div className="topbar-div" />

            {/* Page title */}
            <div className="topbar-title-wrap">
              <div className="topbar-title">{title}</div>
              <div className="topbar-date">{today}</div>
            </div>

            {/* Actions */}
            {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}

            {/* Notification */}
            <button className="notif-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notif-dot" />
            </button>

            {/* Divider */}
            <div className="topbar-div" />

            {/* User pill */}
            <div className="user-pill">
              <div className="user-pill-avatar">{initials}</div>
              <div>
                <div className="user-pill-name">{user?.full_name || user?.username}</div>
                <div className="user-pill-role">{user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</div>
              </div>
            </div>

          </header>

          {/* Page content */}
          <main className="page-content">{children}</main>
        </div>
      </div>
    </>
  )
}
