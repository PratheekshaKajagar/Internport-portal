import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const STATUS_MAP = {
  pending:   { label: 'Under Review', icon: '⏳', cls: 'badge-pending' },
  selected:  { label: 'Selected 🎉', icon: '✅', cls: 'badge-selected' },
  rejected:  { label: 'Not Selected', icon: '❌', cls: 'badge-rejected' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.getMyApplications()
      .then(r => r.ok ? r.json() : [])
      .then(data => setApps(Array.isArray(data) ? data : []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const stats = {
    total: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    selected: apps.filter(a => a.status === 'selected').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="student-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link to="/" className="logo">
            <div className="logo-icon">IP</div>
            <span className="logo-text">InternPort</span>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-group-label">Dashboard</div>
          <a href="#overview" className="active"><span className="nav-icon">📊</span> Overview</a>
          <a href="#applications"><span className="nav-icon">📋</span> My Applications</a>
          <div className="nav-group-label" style={{ marginTop: 8 }}>Apply</div>
          <Link to="/apply"><span className="nav-icon">✏️</span> New Application</Link>
          <Link to="/" target="_blank"><span className="nav-icon">🌐</span> Browse Internships</Link>
        </nav>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div className="topbar-title">Student Dashboard</div>
          <div className="topbar-right">
            <Link to="/apply" className="btn-primary-sm" style={{ fontSize: 13, padding: '7px 14px' }}>
              + Apply Now
            </Link>
            <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{user?.name || user?.email}</span>
            <div className="admin-avatar" style={{ background: 'var(--green)' }}>
              {(user?.name || user?.email)?.[0]?.toUpperCase() || 'S'}
            </div>
          </div>
        </div>

        <div className="admin-content">
          {/* Welcome banner */}
          <div className="student-welcome" id="overview">
            <div className="welcome-text">
              <h2>Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋</h2>
              <p>Track your internship applications and stay updated on your status.</p>
            </div>
            <Link to="/apply" className="btn-primary-lg" style={{ fontSize: 14, padding: '12px 24px' }}>
              Apply for Internship →
            </Link>
          </div>

          {/* Stats */}
          <div className="stats-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {[
              { label: 'Total Applied', val: stats.total, icon: '📋', cls: 'blue' },
              { label: 'Under Review', val: stats.pending, icon: '⏳', cls: 'orange' },
              { label: 'Selected', val: stats.selected, icon: '✅', cls: 'green' },
              { label: 'Not Selected', val: stats.rejected, icon: '❌', cls: 'red' },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.cls}`}>
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-num">{s.val}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Applications list */}
          <div className="table-card" id="applications">
            <div className="table-header">
              <h3>My Applications</h3>
              <Link to="/apply" style={{ fontSize: 14, color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
                + New Application
              </Link>
            </div>

            {loading ? (
              <div className="spinner" style={{ margin: '40px auto' }} />
            ) : apps.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No Applications Yet</h3>
                <p>Start by applying for an internship position!</p>
                <Link to="/apply" className="btn-primary-lg" style={{ marginTop: 16, display: 'inline-block', fontSize: 14, padding: '10px 24px' }}>
                  Apply Now →
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Skills</th>
                      <th>Applied On</th>
                      <th>Last Updated</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(a => {
                      const s = STATUS_MAP[a.status] || STATUS_MAP.pending;
                      return (
                        <tr key={a.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{a.position}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {a.skills?.split(',').slice(0, 3).map(sk => (
                                <span key={sk} className="skill-tag" style={{ fontSize: 11 }}>{sk.trim()}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{formatDate(a.created_at)}</td>
                          <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{formatDate(a.updated_at)}</td>
                          <td>
                            <span className={`badge ${s.cls}`}>{s.icon} {s.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tips section */}
          <div className="table-card" style={{ marginTop: 24 }}>
            <div className="table-header"><h3>💡 Tips to Get Selected</h3></div>
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {[
                { icon: '📄', tip: 'Keep your resume updated with latest projects and skills.' },
                { icon: '✍️', tip: 'Write a compelling cover letter specific to the position.' },
                { icon: '🔗', tip: 'Add your GitHub or portfolio link to stand out.' },
                { icon: '⏰', tip: 'Apply early — positions fill up fast!' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{t.icon}</span>
                  <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.5 }}>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
