import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); 

    const loadUserFromLocalStorage = useCallback(() => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedUserId = localStorage.getItem('user_id');
            const storedUsername = localStorage.getItem('username');
            const storedUserRole = localStorage.getItem('user_role');
            const storedProfilePic = localStorage.getItem('profilePic');
            const storedIsLoggedIn = localStorage.getItem('user_is_logged_in'); 

            if (storedToken && storedUserId && storedIsLoggedIn === 'true') {
                setToken(storedToken);
                setUser({
                    id: storedUserId, // This 'id' is what's stored in local storage
                    username: storedUsername,
                    role: storedUserRole,
                    profilePic: storedProfilePic,
                });
                setIsAuthenticated(true);
            } else {
                clearAuthData();
            }
        } catch (error) {
            console.error("Failed to load user from localStorage:", error);
            clearAuthData();
        } finally {
            setLoading(false);
        }
    }, []);

    const saveAuthData = (newToken, userData) => {
        // --- CORRECTED LINES BELOW ---
        if (!userData || !userData._id || !userData.name || !userData.role) { // <--- CHANGE userData.id to userData._id
            console.error("Invalid user data provided to saveAuthData:", userData);
            toast.error("Authentication data is incomplete. Please try again.");
            clearAuthData();
            return;
        }

        localStorage.setItem('token', newToken);
        localStorage.setItem('user_id', userData._id); // <--- CHANGE userData.id to userData._id
        localStorage.setItem('username', userData.name);
        localStorage.setItem('user_role', userData.role);
        localStorage.setItem('profilePic', userData.profilePic || '');
        localStorage.setItem('user_is_logged_in', 'true');

        setToken(newToken);
        setUser({
            id: userData._id, // <--- CHANGE userData.id to userData._id (for consistency in state)
            username: userData.name,
            role: userData.role,
            profilePic: userData.profilePic || '',
        });
        setIsAuthenticated(true);
    };
    // ... (rest of your AuthProvider code)
    // Make sure clearAuthData and useEffect are also present as you provided them.

    const clearAuthData = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        localStorage.removeItem('user_role');
        localStorage.removeItem('profilePic');
        localStorage.removeItem('user_is_logged_in');

        localStorage.removeItem('user_access_token');
        localStorage.removeItem('user_isloggedin');
        localStorage.removeItem('user_isloggedintrue');
        localStorage.removeItem('usertoken');
        localStorage.removeItem('user'); 

        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    useEffect(() => {
        loadUserFromLocalStorage();
    }, [loadUserFromLocalStorage]);

    const authContextValue = {
        user,
        token,
        isAuthenticated,
        loading,
        login: saveAuthData,
        logout: clearAuthData,
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-gray-500">Loading authentication...</div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};