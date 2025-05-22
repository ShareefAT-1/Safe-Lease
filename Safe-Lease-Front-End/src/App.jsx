import React from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 
import Navbar from "./components/Navbar";
// import Hero from "./components/Hero";
// import Features from "./components/Features";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllProducts from "./pages/AllProducts";
import SingleProperty from "./pages/SingleProperty";
import PropertyForm from "./components/PropertyForm";

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
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
