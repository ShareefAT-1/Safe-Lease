// frontend/src/services/api.js
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', // Ensure this matches your backend port (4000)
  withCredentials: true, // Important for sending cookies/tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- CRITICAL FIX: Add a Request Interceptor to attach the JWT token ---
api.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem('token');

    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Optional: Add an interceptor to handle token expiration or errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.error('Unauthorized, please log in again.');
      // You might want to automatically redirect to login or trigger a logout here
      // Example:
      // localStorage.removeItem('token');
      // localStorage.removeItem('user_id');
      // localStorage.removeItem('user_role');
      // localStorage.removeItem('username');
      // localStorage.removeItem('profilePic');
      // localStorage.removeItem('user_is_logged_in');
      // window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default api;