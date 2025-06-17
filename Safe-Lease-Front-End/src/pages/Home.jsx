import React from "react";
import { motion } from "framer-motion";
import Features from "../components/Features";
import bg from "../assets/pexels-timrael-2474690.jpg";

const Home = () => {
  return (
    <section
      className="py-24 bg-cover bg-center bg-no-repeat text-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div> 

      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto px-4"
      >
        <h1
          className="text-4xl md:text-5xl font-extrabold text-blue-100 leading-tight mb-6"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
        >
          Welcome to <span className="text-blue-400">SafeLease</span>
        </h1>
        <p
          className="text-lg md:text-xl text-blue-200 mb-8"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
        >
          Your trusted platform for{" "}
          <span className="font-semibold">secure</span> and{" "}
          <span className="font-semibold">smart</span> property leasing.
        </p>
        <button className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full shadow-md hover:bg-blue-700 transition duration-300">
          Get Started
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mt-20 max-w-6xl mx-auto px-4"
      >
        <Features />
      </motion.div>
    </section>
  );
};

export default Home;