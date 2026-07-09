import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import PageLoader from '../../components/PageLoader'
import api from '../../api/axios'

const DEPT_COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ec4899','#8b5cf6','#ef4444','#14b8a6']

function Avatar({ name, size = 38 }) {
  const initials = name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
  const colors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ec4899','#8b5cf6']
  const color = colors[(name?.charCodeAt(0)||0) % colors.length]
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:size*0.36, flexShrink:0, boxShadow:`0 2px 8px ${color}44` }}>
      {initials}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending:    { bg:'#fef3c7', color:'#d97706', label:'Pending' },
    nda_signed: { bg:'#ede9fe', color:'#7c3aed', label:'NDA Signed' },
    completed:  { bg:'#d1fae5', color:'#059669', label:'Completed' },
  }
  const s = map[status] || { bg:'#f3f4f6', color:'#6b7280', label: status }
  return <span style={{ background:s.bg, color:s.color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700 }}>{s.label}</span>
}

function TypeBadge({ type }) {
  const map = {
    permanent: { bg:'#dbeafe', color:'#1d4ed8' },
    contract:  { bg:'#fce7f3', color:'#be185d' },
    intern:    { bg:'#d1fae5', color:'#065f46' },
  }
  const s = map[type] || { bg:'#f3f4f6', color:'#6b7280' }
  return <span style={{ background:s.bg, color:s.color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700 }}>{type}</span>
}

function KpiCard({ icon, value, label, color, sub, trend, to }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => to && navigate(to)}
      style={{ background:'#fff', borderRadius:16, padding:'22px 20px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f8', position:'relative', overflow:'hidden', cursor: to ? 'pointer' : 'default', transition:'all 0.18s' }}
      onMouseEnter={e => { if(to){ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${color}22` }}}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* color top bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color, borderRadius:'16px 16px 0 0' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>{label}</div>
          <div style={{ fontSize:36, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{value}</div>
          {sub && <div style={{ fontSize:12, color, marginTop:6, fontWeight:600 }}>{sub}</div>}
          {trend && (
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
              <span style={{ fontSize:11, color: trend > 0 ? '#059669' : '#dc2626', fontWeight:700, background: trend > 0 ? '#d1fae5' : '#fee2e2', borderRadius:20, padding:'2px 8px' }}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this month
              </span>
            </div>
          )}
        </div>
        <div style={{ background:color+'15', borderRadius:14, width:50, height:50, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{icon}</div>
      </div>
    </div>
  )
}

function ProgressRow({ label, value, total, color }) {
  const pct = total ? Math.round((value/total)*100) : 0
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:600, color:'#374151' }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color }}>{value} <span style={{ color:'#9ca3af', fontWeight:400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height:8, background:'#f1f5f9', borderRadius:6, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:6, transition:'width 0.8s ease' }}/>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/employees/dashboard/stats/').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader text="Loading Dashboard..." />

  const total = stats?.total || 0
  const completionRate = total ? Math.round((stats.completed / total) * 100) : 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <Layout title="Dashboard">
      <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

        {/* ── WELCOME BANNER ── */}
        <div style={{
          background:'linear-gradient(135deg, #0d1b4b 0%, #1e3a8a 55%, #4f46e5 100%)',
          borderRadius:20, padding:'28px 36px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          position:'relative', overflow:'hidden',
          boxShadow:'0 8px 32px rgba(13,27,75,0.22)',
        }}>
          {/* bg decoration */}
          <div style={{ position:'absolute', top:-40, right:120, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-60, right:0, width:280, height:280, borderRadius:'50%', background:'rgba(99,102,241,0.12)', pointerEvents:'none' }} />

          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:12, color:'#93c5fd', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>
              {greeting} 👋
            </div>
            <div style={{ fontSize:28, fontWeight:900, color:'#fff', marginBottom:6, letterSpacing:'-0.02em' }}>
              Welcome, {user?.full_name || user?.username}
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)', marginBottom:16 }}>
              Here's what's happening with your team today
            </div>
          </div>

        </div>

        {/* ── KPI CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          <KpiCard icon="👥" value={total} label="Total Employees" color="#1e40af" sub="All staff members" to="/admin/employees" />
          <KpiCard icon="⏳" value={stats?.pending ?? 0} label="Pending Onboarding" color="#d97706" sub="Awaiting action" to="/admin/employees" />
          <KpiCard icon="📝" value={stats?.nda_signed ?? 0} label="NDA Signed" color="#7c3aed" sub="Step 2 complete" />
          <KpiCard icon="✅" value={stats?.completed ?? 0} label="Fully Onboarded" color="#059669" sub={`${completionRate}% completion`} />
        </div>

        {/* ── EMPLOYEE TYPE CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[
            { icon:'🏢', label:'Permanent', value: stats?.permanent ?? 0, color:'#0ea5e9', sub:'Full-time employees' },
            { icon:'📋', label:'Contract', value: stats?.contract ?? 0, color:'#ec4899', sub:'Contract workers' },
            { icon:'🎓', label:'Interns', value: stats?.intern ?? 0, color:'#10b981', sub:'Trainee / Intern staff' },
          ].map(c => (
            <div key={c.label} style={{ background:'#fff', borderRadius:16, padding:'20px 22px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f8', display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:54, height:54, borderRadius:14, background:c.color+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize:28, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{c.value}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginTop:3 }}>{c.label}</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{c.sub}</div>
              </div>
              <div style={{ marginLeft:'auto', width:3, height:40, borderRadius:3, background:c.color, flexShrink:0 }} />
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:20 }}>

          {/* Recent Employees */}
          <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f8', overflow:'hidden' }}>
            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>Recent Employees</h2>
                <p style={{ fontSize:12, color:'#9ca3af', margin:'3px 0 0' }}>Latest additions to the team</p>
              </div>
              <Link to="/admin/employees" style={{ fontSize:12, color:'#2563eb', fontWeight:600, textDecoration:'none', background:'#eff6ff', padding:'6px 14px', borderRadius:20, border:'1px solid #dbeafe' }}>View all →</Link>
            </div>
            <div>
              {(stats?.recent_employees || []).length === 0 && (
                <div style={{ padding:'32px', textAlign:'center', color:'#9ca3af', fontSize:13 }}>No employees yet</div>
              )}
              {stats?.recent_employees?.map((emp, i) => (
                <Link key={emp.id} to={`/admin/employees/${emp.id}`}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 24px', textDecoration:'none', borderBottom: i < (stats.recent_employees.length-1) ? '1px solid #f9fafb' : 'none', transition:'background 0.12s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8faff'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <Avatar name={emp.name} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'#0f172a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{emp.name}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{emp.department || '—'} · {emp.email}</div>
                  </div>
                  <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                    <TypeBadge type={emp.employee_type} />
                    <StatusBadge status={emp.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Onboarding Progress */}
            <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f8', padding:'20px 22px' }}>
              <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:'0 0 18px' }}>Onboarding Progress</h2>
              <ProgressRow label="Total Invited" value={total} total={total} color="#1e40af" />
              <ProgressRow label="Pending" value={stats?.pending ?? 0} total={total} color="#d97706" />
              <ProgressRow label="NDA Signed" value={stats?.nda_signed ?? 0} total={total} color="#7c3aed" />
              <ProgressRow label="Completed" value={stats?.completed ?? 0} total={total} color="#059669" />
            </div>

            {/* Department Breakdown */}
            {stats?.by_department?.length > 0 && (
              <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f8', padding:'20px 22px' }}>
                <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:'0 0 16px' }}>By Department</h2>
                {stats.by_department.slice(0,5).map((d,i) => (
                  <div key={d.department} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:11 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:DEPT_COLORS[i%DEPT_COLORS.length], flexShrink:0 }} />
                    <span style={{ fontSize:12, color:'#374151', fontWeight:500, flex:1 }}>{d.department}</span>
                    <div style={{ flex:2, height:6, background:'#f1f5f9', borderRadius:6, overflow:'hidden' }}>
                      <div style={{ width:`${(d.count/total)*100}%`, height:'100%', background:DEPT_COLORS[i%DEPT_COLORS.length], borderRadius:6 }}/>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:DEPT_COLORS[i%DEPT_COLORS.length], minWidth:20, textAlign:'right' }}>{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f8', padding:'22px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <div>
              <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>Quick Actions</h2>
              <p style={{ fontSize:12, color:'#9ca3af', margin:'3px 0 0' }}>Frequently used HR actions</p>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {[
              { icon:'👤', label:'Add Employee', sub:'Invite & onboard', to:'/admin/employees/new', color:'#1e40af' },
              { icon:'👥', label:'All Employees', sub:'View & manage team', to:'/admin/employees', color:'#0ea5e9' },
              { icon:'📋', label:'Project Tracker', sub:'Track tasks & projects', to:'/admin/projects', color:'#7c3aed' },
              { icon:'📊', label:'Reports', sub:'Export & analytics', to:'/admin/reports', color:'#059669' },
            ].map(a => (
              <Link key={a.to} to={a.to}
                style={{ textDecoration:'none', background:'#f8faff', border:'1.5px solid #e8ecff', borderRadius:14, padding:'18px 16px', display:'flex', flexDirection:'column', gap:10, transition:'all 0.18s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=a.color+'10'; e.currentTarget.style.borderColor=a.color+'50'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e=>{ e.currentTarget.style.background='#f8faff'; e.currentTarget.style.borderColor='#e8ecff'; e.currentTarget.style.transform='' }}
              >
                <div style={{ width:42, height:42, borderRadius:12, background:a.color+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{a.label}</div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{a.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
