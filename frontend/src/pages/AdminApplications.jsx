import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import Toast from '../components/Toast';
import api from '../api';

const API = import.meta.env.VITE_API_URL || '';

const POSITIONS = ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Data Analyst', 'Content Writer', 'Marketing', 'HR Generalist', 'Graphic Designer', 'Mobile Developer'];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadge(status) {
  const map = {
    pending: <span className="badge badge-pending">⏳ Pending</span>,
    selected: <span className="badge badge-selected">✅ Selected</span>,
    rejected: <span className="badge badge-rejected">❌ Rejected</span>,
  };
  return map[status] || status;
}

export default function AdminApplications() {
  const [data, setData] = useState({ items: [], total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const toastRef = useRef();
  const searchTimer = useRef();

  const loadApps = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.getApplications({ search, status: statusFilter, position: positionFilter, page: p, limit: 12 });
      if (res.ok) setData(await res.json());
    } catch {
      toastRef.current?.show('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); loadApps(1); }, 400);
  }, [search, statusFilter, positionFilter]);

  const viewApp = async (id) => {
    const res = await api.getApplication(id);
    if (res.ok) setModal(await res.json());
  };

  const updateStatus = async (id, status) => {
    const res = await api.updateStatus(id, status);
    if (res.ok) {
      toastRef.current?.show(`Status updated to "${status}"`, 'success');
      loadApps(page);
      setModal(null);
    } else {
      toastRef.current?.show('Update failed', 'error');
    }
  };

  const deleteApp = async (id) => {
    if (!confirm('Delete this application permanently?')) return;
    const res = await api.deleteApplication(id);
    if (res.ok) {
      toastRef.current?.show('Application deleted', 'success');
      loadApps(page);
    } else {
      toastRef.current?.show('Delete failed', 'error');
    }
  };

  return (
    <AdminLayout title="All Applications">
      <div className="table-card">
        <div className="table-header">
          <h3>Applicants</h3>
          <div className="table-filters">
            <input
              className="filter-input" type="text"
              placeholder="🔍 Search name, email, skills..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="filter-select" value={positionFilter} onChange={e => setPositionFilter(e.target.value)}>
              <option value="">All Positions</option>
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="spinner" />
          ) : (
            <table>
              <thead>
                <tr><th>#</th><th>Applicant</th><th>Position</th><th>Skills</th><th>Applied</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state"><div className="empty-icon">📭</div><h3>No Applications Found</h3><p>Try adjusting your search filters.</p></div>
                  </td></tr>
                ) : data.items.map(a => {
                  const skillArr = (a.skills || '').split(',');
                  return (
                    <tr key={a.id}>
                      <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>#{a.id}</td>
                      <td>
                        <div className="applicant-name">{a.name}</div>
                        <div className="applicant-email">{a.email}</div>
                        <div className="applicant-email">📱 {a.phone}</div>
                      </td>
                      <td><span style={{ fontWeight: 600 }}>{a.position}</span></td>
                      <td>
                        <div className="skills-wrap">
                          {skillArr.slice(0, 3).map(s => <span key={s} className="skill-tag">{s.trim()}</span>)}
                          {skillArr.length > 3 && <span className="skill-tag">+{skillArr.length - 3}</span>}
                        </div>
                      </td>
                      <td style={{ color: 'var(--gray-400)', fontSize: 13, whiteSpace: 'nowrap' }}>{formatDate(a.created_at)}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn btn-view" onClick={() => viewApp(a.id)}>👁</button>
                          {a.status !== 'selected' && <button className="action-btn btn-select" onClick={() => updateStatus(a.id, 'selected')}>✓</button>}
                          {a.status !== 'rejected' && <button className="action-btn btn-reject" onClick={() => updateStatus(a.id, 'rejected')}>✗</button>}
                          <button className="action-btn btn-delete" onClick={() => deleteApp(a.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination">
          <div className="page-info">
            {data.total > 0
              ? `Showing ${(page - 1) * 12 + 1}–${Math.min(page * 12, data.total)} of ${data.total}`
              : '0 results'}
          </div>
          <div className="page-btns">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => { setPage(p); loadApps(p); }}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>{modal.name}</h3>
                <p style={{ color: 'var(--gray-400)', fontSize: 14, marginTop: 4 }}>{modal.position}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {statusBadge(modal.status)}
                <button className="modal-close" onClick={() => setModal(null)}>✕</button>
              </div>
            </div>
            {[
              { label: 'Email', val: <a href={`mailto:${modal.email}`} style={{ color: 'var(--blue)' }}>{modal.email}</a> },
              { label: 'Phone', val: modal.phone },
              { label: 'Applied', val: formatDate(modal.created_at) },
              { label: 'Skills', val: <div className="skills-wrap">{modal.skills?.split(',').map(s => <span key={s} className="skill-tag">{s.trim()}</span>)}</div> },
              ...(modal.cover_letter ? [{ label: 'Cover', val: <span style={{ lineHeight: 1.7, color: 'var(--gray-600)' }}>{modal.cover_letter}</span> }] : []),
              { label: 'Resume', val: modal.resume_path ? <a href={`${API}/uploads/${modal.resume_path}`} target="_blank" style={{ color: 'var(--blue)', fontWeight: 600 }}>📄 Download Resume</a> : '—' },
            ].map(r => (
              <div key={r.label} className="detail-row">
                <div className="detail-label">{r.label}</div>
                <div className="detail-value">{r.val}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
              {modal.status !== 'selected' && <button className="action-btn btn-select" style={{ padding: '10px 20px', fontSize: 14 }} onClick={() => updateStatus(modal.id, 'selected')}>✅ Mark Selected</button>}
              {modal.status !== 'rejected' && <button className="action-btn btn-reject" style={{ padding: '10px 20px', fontSize: 14 }} onClick={() => updateStatus(modal.id, 'rejected')}>❌ Mark Rejected</button>}
              {modal.status !== 'pending' && <button className="action-btn btn-view" style={{ padding: '10px 20px', fontSize: 14 }} onClick={() => updateStatus(modal.id, 'pending')}>⏳ Reset Pending</button>}
            </div>
          </div>
        </div>
      )}

      <Toast ref={toastRef} />
    </AdminLayout>
  );
}
