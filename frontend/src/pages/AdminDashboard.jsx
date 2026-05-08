import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import Toast from '../components/Toast';
import api from '../api';

const API = import.meta.env.VITE_API_URL || '';

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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const toastRef = useRef();

  const loadData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.getStats(),
        api.getApplications({ page: 1, limit: 6 })
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApps(data.items || []);
      }
    } catch {
      toastRef.current?.show('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const viewApp = async (id) => {
    try {
      const res = await api.getApplication(id);
      if (res.ok) setModal(await res.json());
    } catch {}
  };

  const updateStatus = async (id, status) => {
    const res = await api.updateStatus(id, status);
    if (res.ok) {
      toastRef.current?.show(`Status updated to "${status}"`, 'success');
      loadData();
      setModal(null);
    } else {
      toastRef.current?.show('Update failed', 'error');
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="stats-cards">
            {[
              { label: 'Total Applications', val: stats?.total ?? '—', icon: '📋', cls: 'blue' },
              { label: 'Pending Review', val: stats?.pending ?? '—', icon: '⏳', cls: 'orange' },
              { label: 'Selected', val: stats?.selected ?? '—', icon: '✅', cls: 'green' },
              { label: 'Rejected', val: stats?.rejected ?? '—', icon: '❌', cls: 'red' },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.cls}`}>
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-num">{s.val}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Position bars */}
          <div className="table-card" style={{ marginBottom: 24 }}>
            <div className="table-header"><h3>Applications by Position</h3></div>
            <div style={{ padding: 24 }}>
              {!stats?.positions?.length ? (
                <p style={{ color: 'var(--gray-400)', textAlign: 'center' }}>No applications yet</p>
              ) : (() => {
                const max = Math.max(...stats.positions.map(p => p.count));
                return stats.positions.map(p => (
                  <div key={p.position} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                    <div style={{ width: 160, fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', flexShrink: 0 }}>{p.position}</div>
                    <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${(p.count / max * 100)}%`, background: 'var(--blue)', height: '100%', borderRadius: 999, transition: 'width 0.8s ease' }} />
                    </div>
                    <div style={{ width: 28, fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>{p.count}</div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Recent applications */}
          <div className="table-card">
            <div className="table-header">
              <h3>Recent Applications</h3>
              <Link to="/admin/applications" style={{ fontSize: 14, color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr><th>Applicant</th><th>Position</th><th>Applied</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {apps.length === 0 ? (
                    <tr><td colSpan={5}>
                      <div className="empty-state"><div className="empty-icon">📭</div><h3>No Applications Yet</h3><p>Applications will appear here once submitted.</p></div>
                    </td></tr>
                  ) : apps.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div className="applicant-name">{a.name}</div>
                        <div className="applicant-email">{a.email}</div>
                      </td>
                      <td><span style={{ fontWeight: 600 }}>{a.position}</span></td>
                      <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{formatDate(a.created_at)}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn btn-view" onClick={() => viewApp(a.id)}>View</button>
                          {a.status !== 'selected' && <button className="action-btn btn-select" onClick={() => updateStatus(a.id, 'selected')}>Select</button>}
                          {a.status !== 'rejected' && <button className="action-btn btn-reject" onClick={() => updateStatus(a.id, 'rejected')}>Reject</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
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
              ...(modal.cover_letter ? [{ label: 'Cover', val: modal.cover_letter }] : []),
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
