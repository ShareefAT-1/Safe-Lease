// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-hot-toast'; // Import toast for messages

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores logged-in user data
  const [token, setToken] = useState(null); // Stores the JWT token
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // To manage initial load and check local storage

  // Function to load user from localStorage
  const loadUserFromLocalStorage = useCallback(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('user_id');
      const storedUsername = localStorage.getItem('username');
      const storedUserRole = localStorage.getItem('user_role');
      const storedProfilePic = localStorage.getItem('profilePic');
      const storedIsLoggedIn = localStorage.getItem('user_is_logged_in'); // Our new consistent key

      if (storedToken && storedUserId && storedIsLoggedIn === 'true') {
        setToken(storedToken);
        setUser({
          id: storedUserId,
          username: storedUsername,
          role: storedUserRole,
          profilePic: storedProfilePic,
        });
        setIsAuthenticated(true);
      } else {
        // Clear anything stale if data is incomplete or not logged in
        clearAuthData();
      }
    } catch (error) {
      console.error("Failed to load user from localStorage:", error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to save user to localStorage (called by Login/Register)
  const saveAuthData = (newToken, userData) => {
    // Ensure user data is valid before storing
    if (!userData || !userData.id || !userData.name || !userData.role) {
        console.error("Invalid user data provided to saveAuthData:", userData);
        toast.error("Authentication data is incomplete. Please try again.");
        clearAuthData(); // Clear any partial data
        return;
    }

    localStorage.setItem('token', newToken);
    localStorage.setItem('user_id', userData.id);
    localStorage.setItem('username', userData.name);
    localStorage.setItem('user_role', userData.role);
    localStorage.setItem('profilePic', userData.profilePic || ''); // Use empty string for safety
    localStorage.setItem('user_is_logged_in', 'true'); // Consistent boolean string

    setToken(newToken);
    setUser({
      id: userData.id,
      username: userData.name,
      role: userData.role,
      profilePic: userData.profilePic || '', // Ensure no 'null' for img src
    });
    setIsAuthenticated(true);
  };

  // Function to clear user data from localStorage and state
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
    localStorage.removeItem('profilePic');
    localStorage.removeItem('user_is_logged_in');
    // Also remove old inconsistent keys
    localStorage.removeItem('user_access_token');
    localStorage.removeItem('user_isloggedin');
    localStorage.removeItem('user_isloggedintrue');
    localStorage.removeItem('usertoken');
    localStorage.removeItem('user'); // For the JSON.stringify(user) key

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    loadUserFromLocalStorage();
  }, [loadUserFromLocalStorage]);

  // Provide the state and functions to consumers
  const authContextValue = {
    user,
    token,
    isAuthenticated,
    loading,
    login: saveAuthData,
    logout: clearAuthData,
  };

  if (loading) {
    // You might want a better loading indicator here, e.g., a full-screen spinner
    return <div className="flex justify-center items-center h-screen text-gray-500">Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};