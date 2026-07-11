import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function weekStart(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7)
  return d.toISOString().slice(0, 10)
}

function weekDates(start) {
  const d = new Date(start)
  return DAYS.map((_, i) => {
    const nd = new Date(d)
    nd.setDate(d.getDate() + i)
    return nd.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  })
}

// ── Tab: Setup ─────────────────────────────────────────────────────────────────
function SetupTab() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ client: '', project: '', wbs: '', milestone: '', task_name: '' })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const load = () => api.get('/timesheets/tasks/').then(r => setTasks(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    const required = ['client', 'project', 'wbs', 'milestone', 'task_name']
    if (required.some(k => !form[k])) { toast.error('Fill all fields'); return }
    try {
      if (editing) {
        await api.put(`/timesheets/tasks/${editing}/`, form)
        toast.success('Task updated')
      } else {
        await api.post('/timesheets/tasks/', form)
        toast.success('Task created')
      }
      setForm({ client: '', project: '', wbs: '', milestone: '', task_name: '' })
      setEditing(null); setShowForm(false); load()
    } catch { toast.error('Failed to save task') }
  }

  const deleteTask = async id => {
    if (!window.confirm('Delete this task?')) return
    await api.delete(`/timesheets/tasks/${id}/`).catch(() => {})
    load()
  }

  const startEdit = t => {
    setForm({ client: t.client, project: t.project, wbs: t.wbs, milestone: t.milestone, task_name: t.task_name })
    setEditing(t.id); setShowForm(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ client: '', project: '', wbs: '', milestone: '', task_name: '' }) }}>+ Create</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1.5px solid #6366f1' }}>
          <div className="card-body" style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{editing ? 'Edit Task' : 'New Task'}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[['client', 'Client'], ['project', 'Project'], ['wbs', 'Project ID / WBS'], ['milestone', 'Milestone'], ['task_name', 'Task Name']].map(([k, l]) => (
                <input key={k} className="form-control" placeholder={l} value={form[k]} onChange={e => set(k, e.target.value)} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={submit}>{editing ? 'Update' : 'Save'}</button>
              <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Client</th><th>Project</th><th>Project ID / WBS</th><th>Milestone</th><th>Task Name</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && <tr><td colSpan="8"><div className="empty-state"><p>No tasks yet. Click Create to add.</p></div></td></tr>}
              {tasks.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{t.client}</td>
                  <td>{t.project}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.wbs}</td>
                  <td>{t.milestone}</td>
                  <td>{t.task_name}</td>
                  <td><span className={`badge badge-${t.status === 'active' ? 'completed' : 'pending'}`}>{t.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(t)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteTask(t.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Entry ─────────────────────────────────────────────────────────────────
function EntryTab() {
  const [tasks, setTasks] = useState([])
  const [sheet, setSheet] = useState(null)
  const [hours, setHours] = useState({})
  const [weekOffset, setWeekOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const week = weekStart(weekOffset)
  const dates = weekDates(week)

  const load = async () => {
    setLoading(true)
    try {
      const [tasksRes, sheetRes] = await Promise.all([
        api.get('/timesheets/tasks/'),
        api.get(`/timesheets/entry/?week=${week}`)
      ])
      setTasks(tasksRes.data.filter(t => t.status === 'active'))
      const s = sheetRes.data
      setSheet(s)
      const h = {}
      ;(s.entries || []).forEach(e => { h[e.task_id] = e })
      setHours(h)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [week])

  const setHour = (taskId, day, val) => {
    const num = Math.max(0, Math.min(24, Number(val) || 0))
    setHours(h => ({ ...h, [taskId]: { ...(h[taskId] || {}), task_id: taskId, [day]: num } }))
  }

  const dayTotal = day => tasks.reduce((s, t) => s + (Number(hours[t.id]?.[day]) || 0), 0)
  const taskTotal = task => DAYS.reduce((s, d) => s + (Number(hours[task.id]?.[d]) || 0), 0)
  const weekTotal = tasks.reduce((s, t) => s + taskTotal(t), 0)

  const save = async () => {
    setSaving(true)
    try {
      const entries = tasks.map(t => ({ task_id: t.id, client: t.client, project: t.project, wbs: t.wbs, task_name: t.task_name, ...DAYS.reduce((o, d) => ({ ...o, [d]: Number(hours[t.id]?.[d]) || 0 }), {}) }))
      const res = await api.post('/timesheets/entry/', { week_start: week, entries })
      setSheet(res.data)
      toast.success('Timesheet saved')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  const submit = async () => {
    if (!sheet?.id) { toast.error('Save first'); return }
    if (!window.confirm('Submit timesheet for approval?')) return
    setSubmitting(true)
    try {
      await save()
      const res = await api.post(`/timesheets/entry/${sheet.id}/submit/`)
      setSheet(res.data)
      toast.success('Timesheet submitted for approval!')
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to submit') } finally { setSubmitting(false) }
  }

  const isLocked = sheet?.status === 'submitted' || sheet?.status === 'approved'
  const statusColor = { draft: '#94a3b8', submitted: '#f59e0b', approved: '#10b981', rejected: '#ef4444' }

  return (
    <div>
      {/* Week navigator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(o => o - 1)}>← Prev</button>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Week of {week}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(o => o + 1)}>Next →</button>
        {sheet?.status && (
          <span style={{ marginLeft: 'auto', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: statusColor[sheet.status] + '20', color: statusColor[sheet.status], border: `1px solid ${statusColor[sheet.status]}40` }}>
            {sheet.status.toUpperCase()}
          </span>
        )}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner-dark spinner" /></div> : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: 900, borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#1e3a8a', color: 'white' }}>
                    <th style={th}>S.No</th>
                    <th style={th}>Client</th>
                    <th style={th}>Project</th>
                    <th style={th}>WBS</th>
                    <th style={th}>Task</th>
                    {DAY_LABELS.map((d, i) => <th key={d} style={th}>{d}<br /><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>{dates[i]}</span></th>)}
                    <th style={th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 && (
                    <tr><td colSpan="13" style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>No tasks in setup. Add tasks in the Setup tab first.</td></tr>
                  )}
                  {tasks.map((t, i) => (
                    <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={td}>{i + 1}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{t.client}</td>
                      <td style={td}>{t.project}</td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>{t.wbs}</td>
                      <td style={td}>{t.task_name}</td>
                      {DAYS.map(d => (
                        <td key={d} style={{ ...td, padding: 4 }}>
                          <input
                            type="number" min="0" max="24"
                            value={hours[t.id]?.[d] ?? 0}
                            onChange={e => setHour(t.id, d, e.target.value)}
                            disabled={isLocked}
                            style={{ width: 48, textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 2px', fontSize: 13, background: isLocked ? '#f1f5f9' : 'white' }}
                          />
                        </td>
                      ))}
                      <td style={{ ...td, fontWeight: 700, color: '#1e40af' }}>{taskTotal(t)}</td>
                    </tr>
                  ))}
                  {tasks.length > 0 && (
                    <tr style={{ background: '#f0f4ff', fontWeight: 700 }}>
                      <td colSpan="5" style={{ ...td, textAlign: 'right', color: '#374151' }}>Day Total</td>
                      {DAYS.map(d => <td key={d} style={{ ...td, color: '#1e40af' }}>{dayTotal(d)}</td>)}
                      <td style={{ ...td, color: '#1e40af' }}>{weekTotal}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!isLocked && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Draft'}</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting} style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}>
                {submitting ? 'Submitting...' : '✓ Submit for Approval'}
              </button>
            </div>
          )}
          {sheet?.status === 'approved' && (
            <div style={{ textAlign: 'center', padding: 16, background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, color: '#065f46', fontWeight: 600 }}>✓ This timesheet has been approved by HR</div>
          )}
          {sheet?.status === 'rejected' && (
            <div style={{ textAlign: 'center', padding: 16, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, color: '#991b1b', fontWeight: 600 }}>
              ✗ Rejected{sheet.hr_comment ? ` — "${sheet.hr_comment}"` : ''}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const th = { padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.1)' }
const td = { padding: '8px 12px', fontSize: 13, textAlign: 'center', borderBottom: '1px solid #f1f5f9' }

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Timesheet() {
  const [tab, setTab] = useState('setup')

  return (
    <Layout title="Timesheet">
      <div style={{ display: 'flex', gap: 4, marginBottom: 22, borderBottom: '2px solid #e2e8f0', paddingBottom: 0 }}>
        {[['setup', 'Time Sheet Setup'], ['entry', 'Time Sheet Entry']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '9px 22px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: 'none', borderBottom: tab === key ? '2px solid #2563eb' : '2px solid transparent',
            color: tab === key ? '#2563eb' : '#64748b', marginBottom: -2, borderRadius: 0,
          }}>{label}</button>
        ))}
      </div>
      {tab === 'setup' ? <SetupTab /> : <EntryTab />}
    </Layout>
  )
}
