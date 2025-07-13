// frontend/src/config/axios-config.js
import axios from "axios";
import { toast } from 'react-hot-toast';

const axiosbase = axios.create({
  // --- CRUCIAL CHANGE: Use the Vite environment variable here ---
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000", 
  withCredentials: true,
});

// Add a request interceptor to include the token
axiosbase.interceptors.request.use(
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

// Optional: Add a response interceptor to handle 401 errors (e.g., token expired)
axiosbase.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      localStorage.removeItem('user_role');
      localStorage.removeItem('profilePic');
      localStorage.removeItem('user_is_logged_in');
      
      window.location.href = '/login'; 
      toast.error("Your session has expired. Please log in again.");
    }
    return Promise.reject(error);
  }
);

export default axiosbase;
