import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout({ title, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link to="/" className="logo">
            <div className="logo-icon">IP</div>
            <span className="logo-text">InternPort</span>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-group-label">Main</div>
          <Link to="/admin/dashboard" className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
            <span className="nav-icon">📊</span> Dashboard
          </Link>
          <Link to="/admin/applications" className={location.pathname === '/admin/applications' ? 'active' : ''}>
            <span className="nav-icon">📋</span> Applications
          </Link>
          <div className="nav-group-label" style={{ marginTop: 8 }}>Quick Access</div>
          <Link to="/" target="_blank"><span className="nav-icon">🌐</span> View Portal</Link>
          <Link to="/apply" target="_blank"><span className="nav-icon">📝</span> Apply Form</Link>
        </nav>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={logout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-right">
            <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{user?.email}</span>
            <div className="admin-avatar">{user?.email?.[0]?.toUpperCase() || 'A'}</div>
          </div>
        </div>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
