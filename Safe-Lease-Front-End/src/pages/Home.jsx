import React from "react";
import Features from "../components/Features";

const Home = () => {
  return (
    <section className="text-center py-20 bg-blue-50">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
        Welcome to SafeLease
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Your trusted platform for secure property leases.
      </p>
      <button className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
        Get Started
      </button>
      <div>
        <Features/>
      </div>
    </section>
  );
}

export default Home;
