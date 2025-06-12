// src/App.jsx
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
import CreateAgreementPage from "./pages/CreateAgreementPage"; // <-- Import the new page

import TestLandlordRequests from "./pages/TestLandlordRequests";
import TestRequestAgreement from "./pages/TestRequestAgreement";


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

        {/* Test routes */}
        <Route path="/test/landlord-requests" element={<TestLandlordRequests />} />
        <Route path="/test/request-agreement" element={<TestRequestAgreement />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;