import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'

const ACTIONS = [
  {
    icon: '👤',
    label: 'Add Employee',
    sub: 'Invite & onboard a new team member',
    to: '/admin/employees/new',
    color: '#2563eb',
    gradient: 'linear-gradient(135deg,#1e40af,#2563eb)',
  },
  {
    icon: '👥',
    label: 'All Employees',
    sub: 'View and manage your team',
    to: '/admin/employees',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
  },
  {
    icon: '📋',
    label: 'Project Tracker',
    sub: 'Track tasks and project progress',
    to: '/admin/projects',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg,#6d28d9,#7c3aed)',
  },
  {
    icon: '🗓️',
    label: 'Timesheet Approval',
    sub: 'Review and approve timesheets',
    to: '/admin/timesheet-approval',
    color: '#059669',
    gradient: 'linear-gradient(135deg,#047857,#059669)',
  },
  {
    icon: '🧾',
    label: 'Employee Onboarding',
    sub: 'Start the onboarding process',
    to: '/admin/employees/new',
    color: '#d97706',
    gradient: 'linear-gradient(135deg,#b45309,#d97706)',
  },
  {
    icon: '📊',
    label: 'Reports',
    sub: 'Export HR reports and analytics',
    to: '/admin/reports',
    color: '#db2777',
    gradient: 'linear-gradient(135deg,#be185d,#db2777)',
  },
  {
    icon: '🔑',
    label: 'My Profile',
    sub: 'View your account and details',
    to: '/admin/my-profile',
    color: '#64748b',
    gradient: 'linear-gradient(135deg,#475569,#64748b)',
  },
  {
    icon: '🏗️',
    label: 'Project Assign',
    sub: 'Assign employees to projects',
    to: '/admin/projects/assign',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg,#0e7490,#0891b2)',
  },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <Layout title="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── WELCOME BANNER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0d1b4b 0%, #1e3a8a 55%, #4f46e5 100%)',
          borderRadius: 22, padding: '36px 42px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(13,27,75,0.28)',
        }}>
          <div style={{ position: 'absolute', top: -50, right: 140, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -70, right: 10, width: 320, height: 320, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 20, right: 220, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 12, color: '#93c5fd', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              {greeting} 👋
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Welcome back, {user?.full_name?.split(' ')[0] || user?.username}!
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              {today}
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'right' }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16, padding: '14px 22px', backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Role</div>
              <div style={{ fontSize: 15, color: '#a5b4fc', fontWeight: 800, textTransform: 'capitalize' }}>
                {user?.role?.replace('_', ' ') || 'User'}
              </div>
            </div>
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Quick Actions</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Jump to any section from here</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {ACTIONS.map(a => (
              <ActionCard key={a.to + a.label} action={a} onClick={() => navigate(a.to)} />
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}

function ActionCard({ action: a, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 18,
        padding: '24px 22px',
        cursor: 'pointer',
        border: '1.5px solid #f0f2f8',
        boxShadow: '0 2px 14px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 16px 40px ${a.color}22`
        e.currentTarget.style.borderColor = a.color + '40'
        e.currentTarget.querySelector('.action-bar').style.width = '100%'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,0.05)'
        e.currentTarget.style.borderColor = '#f0f2f8'
        e.currentTarget.querySelector('.action-bar').style.width = '0%'
      }}
    >
      {/* animated bottom bar */}
      <div className="action-bar" style={{
        position: 'absolute', bottom: 0, left: 0, height: 3,
        width: '0%', background: a.gradient,
        borderRadius: '0 0 18px 18px',
        transition: 'width 0.3s ease',
      }} />

      {/* icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 15,
        background: a.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
        boxShadow: `0 6px 20px ${a.color}35`,
      }}>
        {a.icon}
      </div>

      {/* text */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 5 }}>{a.label}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{a.sub}</div>
      </div>

      {/* arrow */}
      <div style={{
        marginTop: 'auto',
        width: 30, height: 30, borderRadius: 9,
        background: a.color + '12',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: a.color, fontSize: 16, fontWeight: 700,
        alignSelf: 'flex-end',
      }}>→</div>
    </div>
  )
}
