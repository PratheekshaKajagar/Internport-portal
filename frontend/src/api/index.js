const BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('internport_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  return res;
}

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res;
  },

  register: async (name, email, password) => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return res;
  },

  me: () => apiFetch('/api/auth/me'),

  // Applications
  submitApplication: (formData) =>
    fetch(`${BASE}/api/applications`, {
      method: 'POST',
      body: formData,
    }),

  getApplications: (params) =>
    apiFetch(`/api/applications/admin?${new URLSearchParams(params)}`),

  getApplication: (id) => apiFetch(`/api/applications/admin/${id}`),

  updateStatus: (id, status) =>
    apiFetch(`/api/applications/admin/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),

  deleteApplication: (id) =>
    apiFetch(`/api/applications/admin/${id}`, { method: 'DELETE' }),

  // Stats
  getStats: () => apiFetch('/api/admin/stats'),

  // Student: my applications
  getMyApplications: () => apiFetch('/api/applications/mine'),
};

export default api;