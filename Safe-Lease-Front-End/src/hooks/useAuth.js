// src/hooks/useAuth.js
import { createContext, useContext } from 'react';

// Create the AuthContext here. It is used by AuthProvider and the useAuth hook.
export const AuthContext = createContext(null);

// This custom hook provides access to the AuthContext values.
export const useAuth = () => useContext(AuthContext);