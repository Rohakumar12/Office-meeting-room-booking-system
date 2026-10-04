import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

// Endpoints that must never trigger a refresh attempt, otherwise a dead
// session would loop: refresh calls itself, and login/register are expected
// to fail with a 401.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

// One in-flight refresh shared by every request that hits a 401 at the same
// moment, so a page load firing five parallel calls performs one refresh, not
// five. Without this, rotation would immediately invalidate the tokens the
// other four responses were relying on.
let refreshPromise = null;

const isAuthEndpoint = (url = '') =>
  AUTH_ENDPOINTS.some((path) => url.includes(path));

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then((res) => res.data)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Response interceptor to handle unauthenticated redirects or errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Access token expired mid-session: refresh once, then replay the request.
    if (status === 401 && originalRequest && !originalRequest._retried) {
      if (!isAuthEndpoint(originalRequest.url)) {
        originalRequest._retried = true;
        try {
          await refreshAccessToken();
          return api(originalRequest);
        } catch {
          // Refresh token is gone or revoked - the session is genuinely over.
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.assign('/login');
          }
        }
      }
    }

    // Return structured error message
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject({
      ...error,
      customMessage: message,
      status,
      errors: error.response?.data?.errors,
    });
  }
);

export default api;
