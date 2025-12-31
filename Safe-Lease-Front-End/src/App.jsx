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
import SingleAgreementView from "./pages/SingleAgreementView";
import UserProfile from "./pages/UserProfile";
import MyProperties from "./pages/MyProperties";
import LandlordProperties from "./pages/LandlordProperties";
import TenantChatsPage from "./pages/TenantChatsPage";
import EditProperty from "./pages/EditProperty";

import TenantSignAgreementPage from "./pages/TenantSignAgreementPage";

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
        <Route path="/tenant/my-requests" element={<TenantRequests />} />
        <Route path="/agreement/:id" element={<SingleAgreementView />} />
        <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
        <Route path="/tenant-dashboard" element={<TenantDashboard />} />
        <Route path="/landlord-chats" element={<LandlordChatsPage />} />
        <Route path="/tenant-chats" element={<TenantChatsPage />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/my-properties" element={<MyProperties />} />
        <Route path="/edit-property/:id" element={<EditProperty />} />
        <Route
          path="/landlord/:landlordId/properties"
          element={<LandlordProperties />}
        />


        <Route path="/agreement/sign/:id" element={<TenantSignAgreementPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
