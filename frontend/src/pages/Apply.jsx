import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const POSITIONS = [
  'Frontend Developer', 'Backend Developer', 'UI/UX Designer',
  'Data Analyst', 'Content Writer', 'Marketing', 'HR Generalist',
  'Graphic Designer', 'Mobile Developer'
];

export default function Apply() {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', position: searchParams.get('pos') || '',
    skills: '', cover_letter: ''
  });
  const [resume, setResume] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef();

  // Pre-fill from logged-in user
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Auth guard — wait until auth is resolved
  if (authLoading) {
    return <div className="spinner" style={{ minHeight: '100vh' }} />;
  }

  // Not logged in → show a gate screen
  if (!user) {
    return (
      <>
        <nav className="nav">
          <div className="nav-inner">
            <Link to="/" className="logo">
              <span className="logo-icon">IP</span>
              <span className="logo-text">InternPort</span>
            </Link>
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/login" className="btn-primary-sm">Login</Link>
            </div>
          </div>
        </nav>
        <div className="form-page">
          <div className="form-container" style={{ maxWidth: 480 }}>
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
              <h2 style={{ fontFamily: "'Syne', 'Inter', system-ui, sans-serif", fontWeight: 800, fontSize: 26, marginBottom: 10, color: 'var(--gray-800)' }}>
                Login Required
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
                You need to be logged in to apply for internships.<br />
                Create a free account — it only takes a minute!
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to={`/login?redirect=/apply${searchParams.get('pos') ? `?pos=${encodeURIComponent(searchParams.get('pos'))}` : ''}`}
                  className="btn-primary-lg"
                  style={{ fontSize: 15, padding: '12px 28px' }}
                >
                  Sign In / Register →
                </Link>
                <Link to="/" style={{
                  padding: '12px 24px', borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--gray-200)', color: 'var(--gray-700)',
                  textDecoration: 'none', fontWeight: 600, fontSize: 15,
                }}>
                  ← Back to Home
                </Link>
              </div>
              <p style={{ marginTop: 28, fontSize: 13, color: 'var(--gray-400)' }}>
                Already applied?{' '}
                <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
                  Login to track your application
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) { setErrorMsg('Only PDF, DOC, DOCX files allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setErrorMsg('File size must be under 5MB'); return; }
    setResume(file);
    setErrorMsg('');
  };

  const submit = async () => {
    setErrorMsg('');
    if (!form.name || !form.email || !form.phone || !form.position || !form.skills || !resume) {
      setErrorMsg('⚠️ Please fill all required fields and upload your resume.');
      return;
    }
    setStatus('loading');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('resume', resume);
      const res = await api.submitApplication(fd);
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg('⚠️ ' + (data.error || 'Submission failed'));
      }
    } catch {
      setStatus('error');
      setErrorMsg('⚠️ Cannot connect to server.');
    }
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">IP</span>
            <span className="logo-text">InternPort</span>
          </Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/student/dashboard" style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-600)', padding: '8px 14px', textDecoration: 'none' }}>
              My Applications
            </Link>
            <div className="admin-avatar" style={{ background: 'var(--green)', width: 34, height: 34, fontSize: 13, borderRadius: 10, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'default' }}>
              {(user.name || user.email)?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <div className="form-page">
        <div className="form-container">
          <div className="form-header">
            <div className="section-label">🚀 Start your journey</div>
            <h1>Apply for an Internship</h1>
            <p>Fill in the form below. We'll review and get back to you within 3–5 business days.</p>
          </div>

          <div className="app-form">
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 56 }}>✅</div>
                <h3 style={{ fontFamily: "'Syne', 'Inter', system-ui, sans-serif", fontWeight: 800, marginTop: 16, marginBottom: 8, fontSize: 22 }}>
                  Application Submitted!
                </h3>
                <p style={{ color: 'var(--gray-500)', marginBottom: 28 }}>
                  We'll review and get back to you soon.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/student/dashboard" className="btn-primary-lg" style={{ fontSize: 14, padding: '11px 24px' }}>
                    Track My Application →
                  </Link>
                  <Link to="/" style={{
                    padding: '11px 20px', borderRadius: 'var(--radius)',
                    border: '1.5px solid var(--gray-200)', color: 'var(--gray-700)',
                    textDecoration: 'none', fontWeight: 600, fontSize: 14,
                  }}>
                    ← Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Locked fields notice */}
                {(user.name || user.email) && (
                  <div style={{
                    background: '#EEF2FF', border: '1px solid #C5D0FF',
                    borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                    fontSize: 13, color: 'var(--blue)', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    🔒 Name and email are auto-filled from your account.
                  </div>
                )}

                <div className="form-grid" style={{ opacity: status === 'loading' ? 0.6 : 1, pointerEvents: status === 'loading' ? 'none' : 'auto' }}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      value={form.name}
                      onChange={set('name')}
                      placeholder="e.g. Budi Santoso"
                      readOnly={!!user.name}
                      style={user.name ? { background: 'var(--gray-50)', color: 'var(--gray-500)' } : {}}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@university.ac.id"
                      readOnly={!!user.email}
                      style={user.email ? { background: 'var(--gray-50)', color: 'var(--gray-500)' } : {}}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+62 812 3456 7890" />
                  </div>
                  <div className="form-group">
                    <label>Position Applied *</label>
                    <select value={form.position} onChange={set('position')}>
                      <option value="">Select a position...</option>
                      {POSITIONS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group full">
                    <label>Skills / Tech Stack *</label>
                    <input value={form.skills} onChange={set('skills')} placeholder="e.g. React, Node.js, Figma, Python (comma-separated)" />
                  </div>
                  <div className="form-group full">
                    <label>Cover Letter</label>
                    <textarea value={form.cover_letter} onChange={set('cover_letter')} placeholder="Tell us why you're a great fit..." />
                  </div>
                  <div className="form-group full">
                    <label>Resume / CV *</label>
                    <div
                      className={`upload-zone${dragover ? ' dragover' : ''}`}
                      onClick={() => fileInputRef.current.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                      onDragLeave={() => setDragover(false)}
                      onDrop={(e) => { e.preventDefault(); setDragover(false); handleFile(e.dataTransfer.files[0]); }}
                    >
                      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
                      <div className="upload-icon">📄</div>
                      <div className="upload-text">Drop your file here or <span>browse</span></div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>PDF, DOC, DOCX — max 5MB</div>
                      {resume && <div className="upload-filename">✓ {resume.name}</div>}
                    </div>
                  </div>
                </div>

                {errorMsg && <div className="error-msg">{errorMsg}</div>}

                <button className="submit-btn" onClick={submit} disabled={status === 'loading'} style={{ marginTop: 24 }}>
                  {status === 'loading' ? 'Submitting...' : 'Submit Application →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
