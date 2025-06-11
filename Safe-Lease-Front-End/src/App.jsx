// src/App.jsx
import React from "react";
// Remove BrowserRouter import:
import { Route, Routes } from "react-router-dom"; // ONLY import Route and Routes

// Remove Toaster import as it's now in main.jsx:
// import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// Remove AuthProvider import as it's now in main.jsx:
// import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllProducts from "./pages/AllProducts";
import SingleProperty from "./pages/SingleProperty";

import PropertyForm from "./components/PropertyForm";

import TestLandlordRequests from "./pages/TestLandlordRequests";
import TestRequestAgreement from "./pages/TestRequestAgreement";

function App() {
  return (
    // REMOVE the <Router> and <AuthProvider> wrappers from here
    // Use a React Fragment <>...</> or a simple <div> if you need a wrapper element
    <>
      <Navbar />
      {/* Remove Toaster from here if it's placed in main.jsx */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties" element={<AllProducts />} />
        <Route path="/property/:id" element={<SingleProperty />} />
        <Route path="/create-property" element={<PropertyForm />} />

        {/* Test routes */}
        <Route path="/test/landlord-requests" element={<TestLandlordRequests />} />
        <Route path="/test/request-agreement" element={<TestRequestAgreement />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;