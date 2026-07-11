import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const STATUS_COLOR = { draft: '#94a3b8', submitted: '#f59e0b', approved: '#10b981', rejected: '#ef4444' }

export default function TimesheetApproval() {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('submitted')
  const [selected, setSelected] = useState(null)
  const [comment, setComment] = useState('')
  const [acting, setActing] = useState(false)

  const load = () => {
    setLoading(true)
    api.get(`/timesheets/approval/?status=${filter}`)
      .then(r => setSheets(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const act = async (sheetId, action) => {
    setActing(true)
    try {
      await api.post(`/timesheets/approval/${sheetId}/`, { action, comment })
      toast.success(`Timesheet ${action}d successfully. Email sent to employee.`)
      setSelected(null); setComment(''); load()
    } catch { toast.error('Action failed') } finally { setActing(false) }
  }

  const taskTotal = entry => DAYS.reduce((s, d) => s + (Number(entry[d]) || 0), 0)
  const weekTotal = entries => (entries || []).reduce((s, e) => s + taskTotal(e), 0)
  const dayTotal = (entries, day) => (entries || []).reduce((s, e) => s + (Number(e[day]) || 0), 0)

  return (
    <Layout title="Timesheet Approval">

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #e2e8f0' }}>
        {['submitted', 'approved', 'rejected', ''].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '9px 20px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: 'none', borderBottom: filter === s ? '2px solid #2563eb' : '2px solid transparent',
            color: filter === s ? '#2563eb' : '#64748b', marginBottom: -2,
          }}>{s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner-dark spinner" /></div>
      ) : sheets.length === 0 ? (
        <div className="empty-state"><p>No timesheets found.</p></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Employee</th><th>Week</th><th>Total Hrs</th><th>Submitted</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sheets.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: '#94a3b8', fontSize: 13 }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{s.employee_name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.employee_email}</div>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 600 }}>{s.week_start}</td>
                    <td style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{weekTotal(s.entries)} hrs</td>
                    <td style={{ fontSize: 12, color: '#64748b' }}>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: STATUS_COLOR[s.status] + '20', color: STATUS_COLOR[s.status], border: `1px solid ${STATUS_COLOR[s.status]}40` }}>
                        {s.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(s); setComment('') }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 920, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

            {/* Modal header */}
            <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#1e40af)', padding: '20px 28px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>{selected.employee_name}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>Week of {selected.week_start} · {weekTotal(selected.entries)} total hours</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Timesheet table */}
              <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                <table style={{ minWidth: 800, borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr style={{ background: '#1e3a8a', color: 'white' }}>
                      <th style={th}>S.No</th><th style={th}>Client</th><th style={th}>Project</th><th style={th}>WBS</th><th style={th}>Task</th>
                      {DAY_LABELS.map(d => <th key={d} style={th}>{d}</th>)}
                      <th style={th}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.entries || []).map((e, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={td}>{i + 1}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{e.client}</td>
                        <td style={td}>{e.project}</td>
                        <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>{e.wbs}</td>
                        <td style={td}>{e.task_name}</td>
                        {DAYS.map(d => <td key={d} style={td}>{e[d] || 0}</td>)}
                        <td style={{ ...td, fontWeight: 700, color: '#1e40af' }}>{taskTotal(e)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f0f4ff', fontWeight: 700 }}>
                      <td colSpan="5" style={{ ...td, textAlign: 'right', color: '#374151' }}>Day Total</td>
                      {DAYS.map(d => <td key={d} style={{ ...td, color: '#1e40af' }}>{dayTotal(selected.entries, d)}</td>)}
                      <td style={{ ...td, color: '#1e40af' }}>{weekTotal(selected.entries)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Approve / Reject */}
              {selected.status === 'submitted' && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>HR Comment (optional)</div>
                  <textarea
                    className="form-control" rows={2} placeholder="Add a comment..."
                    value={comment} onChange={e => setComment(e.target.value)}
                    style={{ marginBottom: 14, resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => act(selected.id, 'approve')} disabled={acting}
                      style={{ flex: 1, padding: '11px 0', background: 'linear-gradient(135deg,#059669,#10b981)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => act(selected.id, 'reject')} disabled={acting}
                      style={{ flex: 1, padding: '11px 0', background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}

              {selected.status !== 'submitted' && (
                <div style={{ textAlign: 'center', padding: 14, borderRadius: 10, background: STATUS_COLOR[selected.status] + '15', color: STATUS_COLOR[selected.status], fontWeight: 700, fontSize: 14 }}>
                  {selected.status === 'approved' ? '✓ Approved' : '✗ Rejected'}{selected.hr_comment ? ` — "${selected.hr_comment}"` : ''}
                  {selected.approved_by ? ` by ${selected.approved_by}` : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

const th = { padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.1)' }
const td = { padding: '8px 12px', fontSize: 13, textAlign: 'center', borderBottom: '1px solid #f1f5f9' }
