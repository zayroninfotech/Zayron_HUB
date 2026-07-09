import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import api from '../../api/axios'

function StatusBadge({ status }) {
  const labels = { pending: 'Pending', nda_signed: 'NDA Signed', completed: 'Completed' }
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>
}

function TypeBadge({ type }) {
  return <span className={`badge badge-${type}`}>{type === 'permanent' ? 'Permanent' : 'Contract'}</span>
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.q = search
      if (filterType) params.employee_type = filterType
      if (filterStatus) params.status = filterStatus
      const { data } = await api.get('/employees/', { params })
      setEmployees(data)
    } catch { toast.error('Failed to load employees.') }
    finally { setLoading(false) }
  }, [search, filterType, filterStatus])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const resendEmail = async (id, name) => {
    try {
      await api.post(`/employees/${id}/resend-email/`)
      toast.success(`Onboarding email resent to ${name}.`)
    } catch { toast.error('Failed to send email. Check email configuration.') }
  }

  const copyLink = (link) => {
    navigator.clipboard.writeText(link).then(() => toast.success('Onboarding link copied!')).catch(() => toast.error('Failed to copy.'))
  }

  const deleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/employees/${id}/`)
      toast.success(`${name} deleted successfully.`)
      fetchEmployees()
    } catch { toast.error('Failed to delete employee.') }
  }

  return (
    <Layout title="Employees">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Employees</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Manage and track all employees</p>
        </div>
        <Link to="/admin/employees/new" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Add Employee
        </Link>
      </div>
      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input className="form-control" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, width: 240 }} autoComplete="off" spellCheck={false} />
            </div>
            <select className="form-control" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 160 }}>
              <option value="">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
            </select>
            <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 180 }}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="nda_signed">NDA Signed</option>
              <option value="completed">Completed</option>
            </select>
            {(search || filterType || filterStatus) && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterType(''); setFilterStatus('') }}>Clear</button>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-500)' }}>{employees.length} employee{employees.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Type</th>
                <th>Department</th>
                <th>Joining Date</th>
                <th>NDA</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>
                  <span className="spinner-dark spinner" />
                </td></tr>
              )}
              {!loading && employees.length === 0 && (
                <tr><td colSpan="8">
                  <div className="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <h3>No employees found</h3>
                    <p>Add your first employee to get started.</p>
                  </div>
                </td></tr>
              )}
              {employees.map((emp, i) => (
                <tr key={emp.id}>
                  <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{i + 1}</td>
                  <td>
                    <Link to={`/admin/employees/${emp.id}`} style={{ fontWeight: 600, color: 'var(--gray-900)', display: 'block' }}>{emp.name}</Link>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{emp.email}</span>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{emp.mobile}</div>
                  </td>
                  <td><TypeBadge type={emp.employee_type} /></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{emp.department}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{emp.designation}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{new Date(emp.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    {emp.nda_status
                      ? <span className="badge badge-success">✓ Signed</span>
                      : <span className="badge badge-warning">Pending</span>}
                  </td>
                  <td><StatusBadge status={emp.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/admin/employees/${emp.id}`} className="btn btn-secondary btn-sm">View</Link>
                      <Link to={`/admin/employees/${emp.id}/edit`} className="btn btn-sm" style={{ background: '#f0f5ff', color: '#2563eb', border: '1px solid #dbeafe', borderRadius: 6, padding: '4px 12px', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </Link>
                      <button className="btn btn-secondary btn-sm" onClick={() => copyLink(emp.onboarding_link)} title="Copy link">🔗</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => resendEmail(emp.id, emp.name)} title="Resend email">📧</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteEmployee(emp.id, emp.name)} title="Delete employee">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
