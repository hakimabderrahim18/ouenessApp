import axios from 'axios';

// Resolved backend API URL:
// 1. Explicit environment variable VITE_API_BASE_URL if configured
// 2. Fallback to production Render backend (https://ouenessapp.onrender.com/api) when running on Vercel
// 3. Fallback to '/api' for local development (proxied by Vite)
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const raw = import.meta.env.VITE_API_BASE_URL.trim();
    return raw.endsWith('/api') ? raw : `${raw.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://ouenessapp.onrender.com/api';
  }
  return '/api';
};

const baseURL = getBaseURL();

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
