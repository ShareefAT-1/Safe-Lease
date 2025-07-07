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

// Import the LandlordRequests component that you've been working on
import LandlordRequests from "./components/Agreement/LandlordRequests";
import CreateAgreementPage from "./pages/CreateAgreementPage";

// You can likely remove these test components once you're confident
// import TestLandlordRequests from "./pages/TestLandlordRequests";
// import TestRequestAgreement from "./pages/TestRequestAgreement";

import LandlordChatsPage from "./pages/LandlordChatsPage";

import LandlordDashboard from "./pages/LandlordDashboard";
import TenantDashboard from "./pages/TenantDashboard";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties" element={<AllProducts />} />
        <Route path="/property/:id" element={<SingleProperty />} />
        <Route path="/create-property" element={<PropertyForm />} />

        {/* Tenant creates a NEW agreement request for a specific property/landlord */}
        {/* --- CRUCIAL CHANGE: Path updated to /create-agreement/ --- */}
        <Route path="/create-agreement/:propertyId/:landlordId" element={<CreateAgreementPage />} />

        {/* Landlord views all their requests */}
        <Route path="/landlord/requests" element={<LandlordRequests />} />

        {/* Landlord finalizes/negotiates an EXISTING agreement */}
        <Route path="/agreements/finalize/:id" element={<CreateAgreementPage />} />


        <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
        <Route path="/tenant-dashboard" element={<TenantDashboard />} />

        {/* You can remove these test routes if they are no longer needed */}
        {/* <Route path="/test/request-agreement" element={<TestRequestAgreement />} /> */}

        <Route path="/landlord-chats" element={<LandlordChatsPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;