import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import { toast } from 'react-toastify'
import Layout from '../../../components/Layout'
import PageLoader from '../../../components/PageLoader'
import { BtnSpinner } from '../../../components/BtnLoader'

function Avatar({ name, size = 34 }) {
  const colors = ['#1e40af', '#7c3aed', '#0891b2', '#065f46', '#92400e', '#be185d']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function ProjectAssign() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [assigningId, setAssigningId] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  const load = async () => {
    try {
      const [projRes, empRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/projects/completed-employees/')
      ])
      setProjects(projRes.data)
      setEmployees(empRes.data)
      if (selectedProject) {
        const updated = projRes.data.find(p => p.id === selectedProject.id)
        if (updated) setSelectedProject(updated)
      }
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAssign = async (projectId, employeeId) => {
    setAssigningId(employeeId)
    try {
      await api.post(`/projects/${projectId}/assign/`, { employee_id: employeeId })
      toast.success('Employee assigned!')
      load()
    } catch { toast.error('Failed to assign') }
    finally { setAssigningId(null) }
  }

  const handleRemove = async (projectId, employeeId) => {
    setRemovingId(employeeId)
    try {
      await api.delete(`/projects/${projectId}/assign/`, { data: { employee_id: employeeId } })
      toast.success('Employee removed!')
      load()
    } catch { toast.error('Failed to remove') }
    finally { setRemovingId(null) }
  }

  if (loading) return <PageLoader text="Loading..." />

  const STATUS_COLOR = { active: '#2563eb', on_hold: '#f59e0b', completed: '#10b981' }
  const STATUS_LABEL = { active: 'Active', on_hold: 'On Hold', completed: 'Completed' }

  const assignedIds = new Set((selectedProject?.assigned_employees || []).map(e => e.id))
  const unassigned = employees.filter(e => !assignedIds.has(e.id))

  return (
    <Layout title="Project Assign">
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Project Assign</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Assign completed employees to projects. Only employees who completed full onboarding (NDA signed + details submitted) are shown.</p>
        </div>

        {employees.length === 0 && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, color: '#92400e', fontSize: 14 }}>No completed employees yet</div>
              <div style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>Employees must complete NDA signing and personal details before they can be assigned to projects.</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>

          {/* Left: Project list */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Select Project</div>
            {projects.length === 0 ? (
              <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 10, padding: 30, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                No projects yet.{' '}
                <span onClick={() => navigate('/admin/projects')} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>Create one →</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {projects.map(p => (
                  <div key={p.id} onClick={() => setSelectedProject(p)}
                    style={{ background: '#fff', border: `2px solid ${selectedProject?.id === p.id ? '#2563eb' : '#e5e7eb'}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{p.name}</div>
                      <span style={{ background: STATUS_COLOR[p.status] + '18', color: STATUS_COLOR[p.status], borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    {p.description && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '...' : ''}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                      {(p.assigned_employees || []).length > 0 ? (
                        <>
                          <div style={{ display: 'flex' }}>
                            {p.assigned_employees.slice(0, 4).map((emp, i) => (
                              <div key={emp.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                                <Avatar name={emp.name} size={24} />
                              </div>
                            ))}
                          </div>
                          <span style={{ fontSize: 11, color: '#6b7280' }}>{p.assigned_employees.length} assigned</span>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>No members assigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Employee assignment panel */}
          <div>
            {!selectedProject ? (
              <div style={{ background: '#f9fafb', border: '2px dashed #e5e7eb', borderRadius: 12, padding: 60, textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👈</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Select a project to manage assignments</div>
              </div>
            ) : (
              <div>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{selectedProject.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Current team members</div>
                    </div>
                    <button onClick={() => navigate(`/admin/projects/${selectedProject.id}`)}
                      style={{ background: '#f0f5ff', color: '#2563eb', border: '1px solid #dbeafe', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Open Project →
                    </button>
                  </div>

                  {/* Assigned employees */}
                  {(selectedProject.assigned_employees || []).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: 13 }}>No employees assigned yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedProject.assigned_employees.map(emp => (
                        <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f0f5ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '10px 14px' }}>
                          <Avatar name={emp.name} size={36} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#1e40af' }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{emp.department} · {emp.email}</div>
                          </div>
                          <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', borderRadius: 10, padding: '2px 8px', fontWeight: 600 }}>Completed</span>
                          <button onClick={() => handleRemove(selectedProject.id, emp.id)} disabled={removingId === emp.id}
                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {removingId === emp.id ? <BtnSpinner size={12} /> : '✕'} Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available to assign */}
                {unassigned.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                      Available Completed Employees
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {unassigned.map(emp => (
                        <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px' }}>
                          <Avatar name={emp.name} size={36} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{emp.department} · {emp.email}</div>
                          </div>
                          <button onClick={() => handleAssign(selectedProject.id, emp.id)} disabled={assigningId === emp.id}
                            style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {assigningId === emp.id ? <BtnSpinner size={12} /> : '+'} Assign
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {unassigned.length === 0 && employees.length > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 16, textAlign: 'center', color: '#166534', fontSize: 13, fontWeight: 600 }}>
                    ✓ All completed employees are assigned to this project
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
