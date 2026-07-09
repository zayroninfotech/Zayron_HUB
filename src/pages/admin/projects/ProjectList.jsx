import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import { toast } from 'react-toastify'
import Layout from '../../../components/Layout'
import PageLoader from '../../../components/PageLoader'
import { BtnSpinner } from '../../../components/BtnLoader'

const STATUS_COLOR = { active: '#2563eb', on_hold: '#f59e0b', completed: '#10b981' }
const STATUS_LABEL = { active: 'Active', on_hold: 'On Hold', completed: 'Completed' }

function Avatar({ name, size = 26 }) {
  const colors = ['#1e40af', '#7c3aed', '#0891b2', '#065f46', '#92400e']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div title={name} style={{ width: size, height: size, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, border: '2px solid #fff', flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function ProjectList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', status: 'active', start_date: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get('/projects/')
      setProjects(data)
    } catch { toast.error('Failed to load projects') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async e => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Project name is required'); return }
    setSaving(true)
    try {
      await api.post('/projects/', form)
      toast.success('Project created!')
      setShowModal(false)
      setForm({ name: '', description: '', status: 'active', start_date: '' })
      load()
    } catch { toast.error('Failed to create project') }
    finally { setSaving(false) }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this project and all its tasks?')) return
    try {
      await api.delete(`/projects/${id}/`)
      toast.success('Project deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <Layout title="Project Tracker">
      <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Project Tracker</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Manage and track all your projects</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
          + New Project
        </button>
      </div>

      {loading ? (
        <PageLoader text="Loading Projects..." />
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p>No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map(p => (
            <div key={p.id} onClick={() => navigate(`/admin/projects/${p.id}`)}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,64,175,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0, flex: 1 }}>{p.name}</h3>
                <button onClick={e => handleDelete(e, p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
              </div>
              {p.description && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>{p.description}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: STATUS_COLOR[p.status] + '18', color: STATUS_COLOR[p.status], borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                  {STATUS_LABEL[p.status]}
                </span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{p.done_count}/{p.task_count} tasks done</span>
              </div>
              {p.start_date && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>📅 Start: {p.start_date}</div>}
              {(p.assigned_employees || []).length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                  <div style={{ display: 'flex', marginRight: 4 }}>
                    {p.assigned_employees.slice(0, 5).map((emp, i) => (
                      <div key={emp.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                        <Avatar name={emp.name} />
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {p.assigned_employees.length} member{p.assigned_employees.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {p.task_count > 0 && (
                <div style={{ marginTop: 10, background: '#f3f4f6', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((p.done_count / p.task_count) * 100)}%`, background: '#10b981', height: '100%', transition: 'width 0.3s' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 440, maxWidth: '90vw' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>New Project</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Project Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }}
                  placeholder="Enter project name" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }}
                  placeholder="Brief description of the project" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }}>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={saving}
                  style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.8 : 1 }}>
                  {saving && <BtnSpinner />}
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </Layout>
  )
}
