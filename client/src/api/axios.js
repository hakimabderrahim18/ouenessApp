import axios from 'axios';

// When deployed on Vercel, VITE_API_BASE_URL points to the Render backend API (e.g. https://loginaft-server.onrender.com/api)
// In local development, defaults to '/api' (proxied by Vite dev server to localhost:5000)
const rawBase = import.meta.env.VITE_API_BASE_URL || '';
const baseURL = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('loginaft_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        if (res.data?.accessToken) {
          localStorage.setItem('loginaft_token', res.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('loginaft_token');
        localStorage.removeItem('loginaft_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
