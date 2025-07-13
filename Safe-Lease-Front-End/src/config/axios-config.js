// frontend/src/config/axios-config.js
import axios from "axios";
import { toast } from 'react-hot-toast'; // --- ADD THIS IMPORT ---

const axiosbase = axios.create({
  baseURL: "http://localhost:4000", // Ensure this matches your backend URL
  withCredentials: true, // Important if your backend relies on cookies/sessions
});

// Add a request interceptor to include the token
axiosbase.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token'); 
    
    // If a token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor to handle 401 errors (e.g., token expired)
axiosbase.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the error is a 401 Unauthorized response
    if (error.response && error.response.status === 401) {
      // Clear authentication data (log out the user)
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      localStorage.removeItem('user_role');
      localStorage.removeItem('profilePic');
      localStorage.removeItem('user_is_logged_in');
      
      // Redirect to login page or show a message
      window.location.href = '/login'; 
      toast.error("Your session has expired. Please log in again.");
    }
    return Promise.reject(error);
  }
);

export default axiosbase;