// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Keep this import
import './index.css'; // Your global CSS
import App from './App.jsx';

// Import your AuthProvider and Toaster
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'; // You can keep this here or in App.jsx, but here is often preferred for global access.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* This is the ONE AND ONLY BrowserRouter */}
      <AuthProvider> {/* AuthProvider makes auth context available to all children */}
        <App /> {/* Your main application component */}
      </AuthProvider>
      <Toaster position="top-right" /> {/* Toaster for global notifications */}
    </BrowserRouter>
  </StrictMode>
);