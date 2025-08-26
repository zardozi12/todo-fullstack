import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL?.trim() || 'http://127.0.0.1:8999';

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        
        location.reload();
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;