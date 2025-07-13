// frontend/src/App.jsx

import React from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllProducts from "./pages/AllProducts";
import SingleProperty from "./pages/SingleProperty";

import PropertyForm from "./components/PropertyForm";
import LandlordRequests from "./components/Agreement/LandlordRequests";
import CreateAgreementPage from "./pages/CreateAgreementPage";
import TenantRequests from "./components/TenantRequests";

import LandlordChatsPage from "./pages/LandlordChatsPage";

import LandlordDashboard from "./pages/LandlordDashboard";
import TenantDashboard from "./pages/TenantDashboard";

// NEW IMPORT: Import your dedicated SingleAgreementView component
import SingleAgreementView from "./pages/SingleAgreementView"; // Assuming you'll place it in the 'pages' folder

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        {/* --- FIX FOR DUPLICATE ATTRIBUTE ERROR --- */}
        <Route path="/register" element={<Register />} /> 
        <Route path="/properties" element={<AllProducts />} />
        <Route path="/property/:id" element={<SingleProperty />} />
        <Route path="/create-property" element={<PropertyForm />} />

        <Route path="/create-agreement/:propertyId/:landlordId" element={<CreateAgreementPage />} />

        <Route path="/landlord/requests" element={<LandlordRequests />} />

        <Route path="/agreements/finalize/:id" element={<CreateAgreementPage />} />

        {/* NEW ROUTE FOR TENANT REQUESTS */}
        <Route path="/tenant/my-requests" element={<TenantRequests />} />
        
        {/* --- Use SingleAgreementView for /agreement/:id --- */}
        <Route path="/agreement/:id" element={<SingleAgreementView />} /> 

        <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
        <Route path="/tenant-dashboard" element={<TenantDashboard />} />

        <Route path="/landlord-chats" element={<LandlordChatsPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;