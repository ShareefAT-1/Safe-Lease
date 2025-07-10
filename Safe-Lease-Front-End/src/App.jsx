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

        <Route path="/create-agreement/:propertyId/:landlordId" element={<CreateAgreementPage />} />

        <Route path="/landlord/requests" element={<LandlordRequests />} />

        <Route path="/agreements/finalize/:id" element={<CreateAgreementPage />} />

        {/* NEW ROUTE FOR TENANT REQUESTS */}
        <Route path="/tenant/my-requests" element={<TenantRequests />} />
        {/* NEW ROUTE for single agreement view, useful for both roles */}
        <Route path="/agreement/:id" element={<SingleProperty />} /> {/* Re-using SingleProperty for now, or create a dedicated SingleAgreementView */}


        <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
        <Route path="/tenant-dashboard" element={<TenantDashboard />} />

        <Route path="/landlord-chats" element={<LandlordChatsPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;