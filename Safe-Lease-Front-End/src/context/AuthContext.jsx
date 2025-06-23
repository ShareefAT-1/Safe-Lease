import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../hooks/useAuth';


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [backendToken, setBackendToken] = useState(null);
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); 

    const clearAuthData = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        localStorage.removeItem('user_role');
        localStorage.removeItem('profilePic');
        localStorage.removeItem('user_is_logged_in');

        setUser(null);
        setBackendToken(null);
        setIsAuthenticated(false);
    }, []); 

    const loadUserFromLocalStorage = useCallback(async () => {
        try {
            const storedBackendToken = localStorage.getItem('token');
            const storedUserId = localStorage.getItem('user_id');
            const storedUsername = localStorage.getItem('username');
            const storedUserRole = localStorage.getItem('user_role');
            const storedProfilePic = localStorage.getItem('profilePic');
            const storedIsLoggedIn = localStorage.getItem('user_is_logged_in'); 

            if (storedBackendToken && storedUserId && storedIsLoggedIn === 'true') {
                setBackendToken(storedBackendToken);
                setUser({
                    id: storedUserId,
                    username: storedUsername,
                    role: storedUserRole,
                    profilePic: storedProfilePic,
                });
                setIsAuthenticated(true);
            } else {
                clearAuthData(); 
                console.log("No backend user, not authenticated.");
            }
        } catch (error) {
            console.error("Failed to load user from localStorage:", error);
            clearAuthData();
        } finally {
            setLoading(false); 
        }
    }, [clearAuthData]);

    const saveAuthData = async (newBackendToken, userData) => {
        if (!userData || !userData._id || !userData.name || !userData.role) {
            console.error("Invalid user data provided to saveAuthData:", userData);
            toast.error("Authentication data is incomplete. Please try again.");
            clearAuthData();
            return;
        }

        localStorage.setItem('token', newBackendToken);
        localStorage.setItem('user_id', userData._id);
        localStorage.setItem('username', userData.name);
        localStorage.setItem('user_role', userData.role);
        localStorage.setItem('profilePic', userData.profilePic || '');
        localStorage.setItem('user_is_logged_in', 'true');
        
        setBackendToken(newBackendToken);
        setUser({
            id: userData._id,
            username: userData.name,
            role: userData.role,
            profilePic: userData.profilePic || '',
        });
        setIsAuthenticated(true);
        toast.success('Logged in successfully!');
    };

    useEffect(() => {
        loadUserFromLocalStorage();
    }, [loadUserFromLocalStorage]);

    const getBackendToken = useCallback(() => {
        return localStorage.getItem('token');
    }, []);

    const contextValue = {
        user,
        isAuthenticated,
        loading,
        backendToken,
        login: saveAuthData, 
        logout: clearAuthData,
        getBackendToken,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};