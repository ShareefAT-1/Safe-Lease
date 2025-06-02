import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-white py-24 px-6 overflow-hidden">
      {/* Soft background blob */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse" />
      
      <div className="relative max-w-3xl mx-auto text-center backdrop-blur-md bg-white/70 p-10 rounded-3xl shadow-xl">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-blue-700 mb-4"
        >
          About <span className="text-blue-500">SafeLease</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg text-gray-700 leading-relaxed"
        >
          SafeLease is your go-to platform for finding <span className="font-semibold">secure</span>, 
          <span className="font-semibold"> verified</span> property leases. We provide a transparent 
          and trustworthy service to connect tenants and landlords.
        </motion.p>
      </div>
    </section>
  );
};

export default About;
