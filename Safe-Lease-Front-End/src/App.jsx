import React from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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
    <div>
      <Navbar />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties" element={<AllProducts />} />
        <Route path="/property/:id" element={<SingleProperty />} />
        <Route path="/create-property" element={<PropertyForm />} />

        <Route path="/test/landlord-requests" element={<TestLandlordRequests />} />
        <Route path="/test/request-agreement" element={<TestRequestAgreement />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
