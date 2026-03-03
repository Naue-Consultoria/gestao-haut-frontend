import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('haut_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('haut_token');
      localStorage.removeItem('haut_user');
      window.location.href = '/login';
    }
    if (error.response?.status === 403 && error.response?.data?.error === 'MUST_CHANGE_PASSWORD') {
      window.location.href = '/alterar-senha';
    }
    return Promise.reject(error);
  }
);

export default api;
