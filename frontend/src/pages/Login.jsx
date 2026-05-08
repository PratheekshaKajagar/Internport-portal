import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || null;

  // Redirect already-logged-in users
  useEffect(() => {
    if (user) {
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        navigate(user.is_admin ? '/admin/dashboard' : '/student/dashboard', { replace: true });
      }
    }
  }, [user]);

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill all required fields.'); return; }
    if (mode === 'register' && !name) { setError('Please enter your full name.'); return; }
    if (mode === 'register' && password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login(email, password)
        : await register(name, email, password);
      if (result.ok) {
        // navigate handled by useEffect on user change
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background blobs */}
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: 4 }}>
            <div className="logo-icon" style={{ width: 52, height: 52, fontSize: 16, borderRadius: 14 }}>IP</div>
          </Link>
          <h2 style={{ fontFamily: "'Syne', 'Inter', system-ui, sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 6, color: 'var(--gray-800)' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
            {mode === 'login' ? 'Sign in to your InternPort account' : 'Join InternPort — find your perfect internship'}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => switchMode('login')}
          >Sign In</button>
          <button
            className={`auth-tab${mode === 'register' ? ' active' : ''}`}
            onClick={() => switchMode('register')}
          >Register</button>
        </div>

        {/* Fields */}
        <div className="auth-fields">
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name *</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Budi Santoso"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={mode === 'login' ? 'admin@internport.com' : 'you@university.ac.id'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password *</label>
            <input
              type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{
                position: 'absolute', right: 12, bottom: 11,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 16, color: 'var(--gray-400)', lineHeight: 1,
              }}
              tabIndex={-1}
            >{showPw ? '🙈' : '👁️'}</button>
          </div>
        </div>

        {error && (
          <div className="error-msg" style={{ marginBottom: 0 }}>{error}</div>
        )}

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 20 }}
        >
          {loading
            ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
            : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
        </button>

        {mode === 'login' && (
          <div className="auth-hint">
            <span>Demo Admin: </span>
            <button
              className="auth-hint-btn"
              onClick={() => { setEmail('admin@internport.com'); setPassword('admin123'); }}
            >Fill credentials</button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--gray-400)' }}>
          <Link to="/" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
        </p>

        <div className="auth-role-info">
          <span className="role-chip role-admin">👑 Admin</span>
          <span className="role-chip role-student">🎓 Student</span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Role is assigned by account type</span>
        </div>
      </div>
    </div>
  );
}
