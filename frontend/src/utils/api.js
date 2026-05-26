import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear storage and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rg_token');
      localStorage.removeItem('rg_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Samples ───────────────────────────────────────────────────────────
export const samplesAPI = {
  getAll:   (params) => api.get('/samples', { params }),
  getById:  (id)     => api.get(`/samples/${id}`),
  create:   (data)   => api.post('/samples', data),
  update:   (id, data) => api.put(`/samples/${id}`, data),
  delete:   (id)     => api.delete(`/samples/${id}`),
};

// ── Stats ─────────────────────────────────────────────────────────────
export const statsAPI = {
  summary:    ()       => api.get('/stats/summary'),
  resistance: (params) => api.get('/stats/resistance', { params }),
  hotspots:   ()       => api.get('/stats/hotspots'),
  trends:     ()       => api.get('/stats/trends'),
};

// ── Pathogens reference ───────────────────────────────────────────────
export const pathogensAPI = {
  getAll: () => api.get('/pathogens'),
};

export default api;
