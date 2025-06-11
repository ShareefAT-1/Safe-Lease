import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import './index.css'; 
import App from './App.jsx';

import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <AuthProvider> 
        <App /> 
      </AuthProvider>
      <Toaster position="top-right" /> 
    </BrowserRouter>
  </StrictMode>
);