import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@internport.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.is_admin) navigate('/admin/dashboard', { replace: true });
  }, [user]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo" style={{ justifyContent: 'center' }}>
            <div className="logo-icon" style={{ width: 56, height: 56, fontSize: 18, borderRadius: 14 }}>IP</div>
          </div>
          <h2>Admin Portal</h2>
          <p>Sign in to manage internship applications</p>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Email Address</label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@internport.com"
          />
        </div>
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label>Password</label>
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
          />
        </div>

        <button className="submit-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        {error && <div className="error-msg" style={{ marginTop: 16 }}>{error}</div>}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--gray-400)' }}>
          Default: admin@internport.com / admin123
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13 }}>
          <Link to="/" style={{ color: 'var(--blue)', textDecoration: 'none' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
