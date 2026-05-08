import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [countersStarted, setCountersStarted] = useState(false);
  const [counts, setCounts] = useState({ students: 0, positions: 0, companies: 0, classes: 0 });
  const statsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !countersStarted) {
        setCountersStarted(true);
        animateCounters();
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [countersStarted]);

  function animateCounters() {
    const targets = { students: 10000, positions: 2500, companies: 200, classes: 100 };
    const keys = Object.keys(targets);
    keys.forEach(key => {
      const target = targets[key];
      let current = 0;
      const step = Math.ceil(target / 60);
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        setCounts(prev => ({ ...prev, [key]: current }));
        if (current >= target) clearInterval(interval);
      }, 25);
    });
  }

  const faqs = [
    { q: 'How do I apply for an internship?', a: 'Fill out the application form with your details, upload your resume, and submit. You\'ll receive updates via email.' },
    { q: 'How long does the review process take?', a: 'Applications are typically reviewed within 3-5 business days.' },
    { q: 'Can I apply for multiple positions?', a: 'Yes! You can apply for different positions, but only once per position.' },
    { q: 'What file formats are accepted for resumes?', a: 'We accept PDF, DOC, and DOCX files. Maximum file size is 5MB. PDF is recommended.' },
  ];

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">IP</span>
            <span className="logo-text">InternPort</span>
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#positions">Positions</a>
            <a href="#faq">FAQ</a>
            <Link to="/apply" className="btn-outline">Apply Now</Link>
            <Link to="/login" className="btn-primary-sm">Login</Link>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
        {menuOpen && (
          <div className="mobile-menu open">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <Link to="/apply" onClick={() => setMenuOpen(false)}>Apply Now</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          </div>
        )}
      </nav>

      <section className="hero">
        <div className="hero-bg">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="grid-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">🚀 Now accepting applications</div>
          <h1 className="hero-title">
            Find Your Perfect<br />
            <span className="gradient-text">Internship</span><br />
            Opportunity
          </h1>
          <p className="hero-sub">Platform magang khusus mahasiswa dengan rekomendasi personalisasi, fitur lengkap, dan pengembangan diri. Launch your career today.</p>
          <div className="hero-search">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Position, skills, keywords..." />
              <select>
                <option value="">All Positions</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>UI/UX Designer</option>
                <option>Data Analyst</option>
                <option>Content Writer</option>
                <option>Marketing</option>
                <option>HR Generalist</option>
              </select>
              <button className="btn-search" onClick={() => navigate('/apply')}>Apply Now</button>
            </div>
            <div className="search-tags">
              <span>Popular:</span>
              <button className="tag" onClick={() => navigate('/apply?pos=Frontend Developer')}>Frontend Dev</button>
              <button className="tag" onClick={() => navigate('/apply?pos=UI/UX Designer')}>UI/UX</button>
              <button className="tag" onClick={() => navigate('/apply?pos=Data Analyst')}>Data Analyst</button>
              <button className="tag" onClick={() => navigate('/apply?pos=Marketing')}>Marketing</button>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="fc-icon">💼</div>
            <div>
              <div className="fc-title">Frontend Developer</div>
              <div className="fc-sub">PT TechNova • Jakarta</div>
            </div>
            <span className="badge-new">New</span>
          </div>
          <div className="floating-card card-2">
            <div className="fc-icon">🎨</div>
            <div>
              <div className="fc-title">UI/UX Designer</div>
              <div className="fc-sub">StartupX • Bandung</div>
            </div>
          </div>
          <div className="floating-card card-3">
            <div className="fc-icon">📊</div>
            <div>
              <div className="fc-title">Data Analyst</div>
              <div className="fc-sub">DataCorp • Remote</div>
            </div>
            <span className="badge-hot">Hot</span>
          </div>
        </div>
      </section>

      <section className="stats" ref={statsRef}>
        <div className="stats-inner">
          {[
            { key: 'students', label: 'Students Registered' },
            { key: 'positions', label: 'Internship Positions' },
            { key: 'companies', label: 'Trusted Companies' },
            { key: 'classes', label: 'Development Classes' },
          ].map((item, i) => (
            <>
              {i > 0 && <div key={`d${i}`} className="stat-divider" />}
              <div key={item.key} className="stat-item">
                <span className="stat-num">{counts[item.key].toLocaleString()}</span>
                <span className="stat-plus">+</span>
                <div className="stat-label">{item.label}</div>
              </div>
            </>
          ))}
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-inner">
          <div className="section-label">Why InternPort?</div>
          <h2 className="section-title">Everything you need to<br /><span className="gradient-text">launch your career</span></h2>
          <div className="features-grid">
            {[
              { icon: '🎯', title: 'Smart Matching', color: '#3B5BDB22', c: '#4C6EF5', desc: 'AI-powered recommendations based on your major, skills, and interests.' },
              { icon: '⚡', title: 'One-Click Apply', color: '#0CA67822', c: '#0CA678', desc: 'Simple application form. Upload your resume, fill in your details, done in minutes.' },
              { icon: '📊', title: 'Track Status', color: '#F0309422', c: '#F03094', desc: 'Real-time application status: Pending, Selected, or Rejected — always know where you stand.' },
              { icon: '🏢', title: 'Top Companies', color: '#F59F0022', c: '#F59F00', desc: '200+ trusted companies from startups to Fortune 500s actively looking for interns like you.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.color, color: f.c }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="positions" id="positions">
        <div className="section-inner">
          <div className="section-label">Open Roles</div>
          <h2 className="section-title">Popular <span className="gradient-text">Positions</span> Today</h2>
          <div className="positions-grid">
            {[
              { icon: '💻', title: 'Frontend Developer', desc: 'React, Vue, HTML/CSS', count: 24, pos: 'Frontend Developer' },
              { icon: '⚙️', title: 'Backend Developer', desc: 'Node.js, Python, Go', count: 18, pos: 'Backend Developer' },
              { icon: '🎨', title: 'UI/UX Designer', desc: 'Figma, Adobe XD', count: 15, pos: 'UI/UX Designer' },
              { icon: '📊', title: 'Data Analyst', desc: 'Python, SQL, Tableau', count: 12, pos: 'Data Analyst' },
              { icon: '✍️', title: 'Content Writer', desc: 'SEO, Copywriting', count: 20, pos: 'Content Writer' },
              { icon: '📣', title: 'Marketing', desc: 'Digital, Social Media', count: 16, pos: 'Marketing' },
            ].map(p => (
              <div key={p.title} className="pos-card" onClick={() => navigate(`/apply?pos=${p.pos}`)}>
                <span className="pos-icon">{p.icon}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <span className="pos-count">{p.count} openings</span>
              </div>
            ))}
          </div>
          <div className="cta-center">
            <Link to="/apply" className="btn-primary-lg">Apply for an Internship →</Link>
          </div>
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="section-inner">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <button className={`faq-q${openFaq === i ? ' open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className="faq-arrow">›</span>
                </button>
                <div className={`faq-a${openFaq === i ? ' open' : ''}`}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon">IP</div>
              <span className="logo-text" style={{ color: 'white' }}>InternPort</span>
            </div>
            <p>The premier platform for student internship opportunities.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Platform</h4>
              <Link to="/apply">Apply</Link>
              <a href="#features">Features</a>
              <a href="#positions">Positions</a>
            </div>
            <div>
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/admin/dashboard">Admin</Link>
              <Link to="/student/dashboard">Student</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 InternPort. Built with PERN Stack (PostgreSQL + Express + React + Node.js)</p>
        </div>
      </footer>
    </>
  );
}
