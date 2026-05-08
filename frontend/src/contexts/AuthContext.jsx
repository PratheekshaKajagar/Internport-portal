import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('internport_token');
    if (token) {
      api.me()
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(u => setUser(u))
        .catch(() => {
          localStorage.removeItem('internport_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('internport_token', data.access_token);
      setUser({ email, is_admin: data.is_admin, name: data.name });
      return { ok: true, is_admin: data.is_admin };
    }
    return { ok: false, error: data.error || 'Invalid credentials' };
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('internport_token', data.access_token);
      setUser({ email, is_admin: false, name: data.name });
      return { ok: true };
    }
    return { ok: false, error: data.error || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('internport_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
