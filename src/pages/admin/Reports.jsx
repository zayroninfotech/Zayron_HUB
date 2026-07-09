import { useState } from 'react'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function Reports() {
  const [filters, setFilters] = useState({ employee_type: '', department: '', status: '' })
  const [exporting, setExporting] = useState(false)

  const exportReport = async (format) => {
    setExporting(true)
    try {
      const params = { format, ...filters }
      const res = await api.get('/employees/export/', { params, responseType: 'blob' })
      const ext = format === 'excel' ? 'xlsx' : 'pdf'
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = `employees_report.${ext}`; a.click()
      URL.revokeObjectURL(url)
      toast.success(`Report exported as ${ext.toUpperCase()}`)
    } catch { toast.error('Export failed.') }
    finally { setExporting(false) }
  }

  return (
    <Layout title="Reports & Export">
      <div style={{ maxWidth: 700 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h2>Generate Report</h2></div>
          <div className="card-body">
            <p style={{ color: 'var(--gray-500)', marginBottom: 20, fontSize: 14 }}>
              Apply filters below and export the employee report in your preferred format.
            </p>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Employee Type</label>
                <select className="form-control" value={filters.employee_type} onChange={e => setFilters(f => ({ ...f, employee_type: e.target.value }))}>
                  <option value="">All Types</option>
                  <option value="permanent">Permanent Employee</option>
                  <option value="contract">Contract Employee</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-control" placeholder="Filter by department" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Onboarding Status</label>
                <select className="form-control" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="nda_signed">NDA Signed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={() => exportReport('excel')} disabled={exporting}>
                {exporting ? <span className="spinner" /> : '📊'} Export Excel (.xlsx)
              </button>
              <button className="btn btn-secondary" onClick={() => exportReport('pdf')} disabled={exporting}>
                {exporting ? <span className="spinner-dark spinner" /> : '📄'} Export PDF
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Export Info</h2></div>
          <div className="card-body">
            <ul style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 2, paddingLeft: 20 }}>
              <li>Excel export includes: Name, Email, Mobile, Type, Department, Designation, Joining Date, Status</li>
              <li>PDF export includes a formatted table with company branding</li>
              <li>Apply filters to narrow down the exported data</li>
              <li>NDA PDFs can be downloaded individually from each employee's detail page</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
