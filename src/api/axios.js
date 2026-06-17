// import axios from 'axios';
// import { toast } from 'react-toastify';

// const AUTH_USER_STORAGE_KEY = 'goldfit_auth_user';
// const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || '/api',
//   withCredentials: true,
//   headers: { 'Content-Type': 'application/json' },
// });

// api.interceptors.request.use((config) => {
//   if (!USE_MOCK_AUTH) {
//     return config;
//   }

//   try {
//     const storedUser = JSON.parse(window.localStorage.getItem(AUTH_USER_STORAGE_KEY) || 'null');
//     if (storedUser?.id) {
//       config.headers['x-user-id'] = String(storedUser.id);
//       config.headers['x-role'] = storedUser.role || 'user';
//     }
//   } catch (error) {
//     console.error('Failed to read saved auth user:', error);
//   }

//   return config;
// });

// // Response interceptor — handle 401 globally
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       toast.error('Session expired. Please log in again.', { toastId: 'session-expired' });
//       // Redirect to login without a hard reload
//      if (
//   error.response?.status === 401 &&
//   window.location.pathname !== '/login'
// ) {
//   toast.error('Session expired. Please log in again.', {
//     toastId: 'session-expired',
//   });

//   window.location.replace('/login');
// }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
import axios from 'axios';
import { toast } from 'react-toastify';

const AUTH_USER_STORAGE_KEY = 'goldfit_auth_user';
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Request interceptor
api.interceptors.request.use(
  (config) => {
    if (USE_MOCK_AUTH) {
      try {
        const storedUser = JSON.parse(
          window.localStorage.getItem(AUTH_USER_STORAGE_KEY) || 'null'
        );

        if (storedUser?.id) {
          config.headers['x-user-id'] = String(storedUser.id);
          config.headers['x-role'] = storedUser.role || 'user';
        }
      } catch (error) {
        console.error('Failed to read saved auth user:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor (clean & fixed)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const isLoginPage = window.location.pathname === '/login';

      toast.error('Session expired. Please log in again.', {
        toastId: 'session-expired',
      });

      if (!isLoginPage) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;