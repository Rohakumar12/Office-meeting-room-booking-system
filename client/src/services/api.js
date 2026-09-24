import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle unauthenticated redirects or errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return structured error message
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    
    return Promise.reject({
      ...error,
      customMessage: message,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);

export default api;
