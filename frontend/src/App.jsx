import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Apply from './pages/Apply';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplications from './pages/AdminApplications';
import StudentDashboard from './pages/StudentDashboard';

// Animated wrapper per route
function AnimatedPage({ children }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      {children}
    </div>
  );
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ minHeight: '100vh' }} />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/student/dashboard" replace />;
  return children;
}

function StudentRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ minHeight: '100vh' }} />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.is_admin) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
      <Route path="/apply" element={<AnimatedPage><Apply /></AnimatedPage>} />
      <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
      {/* Legacy admin login redirect */}
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/admin" element={<Navigate to="/login" replace />} />

      <Route path="/admin/dashboard" element={
        <AdminRoute><AnimatedPage><AdminDashboard /></AnimatedPage></AdminRoute>
      } />
      <Route path="/admin/applications" element={
        <AdminRoute><AnimatedPage><AdminApplications /></AnimatedPage></AdminRoute>
      } />

      <Route path="/student/dashboard" element={
        <StudentRoute><AnimatedPage><StudentDashboard /></AnimatedPage></StudentRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
