import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaKey, FaMapMarkerAlt, FaHandshake, FaUsers } from 'react-icons/fa';

const About = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section
      className="relative py-24 md:py-32 px-6 overflow-hidden min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: 'url("https://img.freepik.com/free-photo/mesmerizing-scenery-green-mountains-with-cloudy-sky-surface_181624-27189.jpg?uid=R201428338&ga=GA1.1.944180072.1748070275&semt=ais_hybrid&w=740")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Optional: for parallax effect
      }}
    >
      {/* Dark overlay for text readability over the background image (maintains existing readability) */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      {/* Decorative Background Elements (These will be between the image and the main content) */}
      <div className="absolute top-10 left-10 w-60 h-60 bg-indigo-300 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse z-10" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse delay-1000 z-10" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse delay-2000 z-10" />

      {/* Main Content Container with enhanced transparency and text color adjustments */}
      <div
        className="relative max-w-5xl mx-auto text-center backdrop-blur-md bg-black/30 p-8 md:p-16 lg:p-20 rounded-3xl shadow-2xl z-20" // Changed bg-white/80 to bg-black/30
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Text colors adjusted for better contrast over a darker, transparent background */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-extrabold text-blue-200 mb-6" // Changed to text-blue-100
          >
            Discover the <span className="text-blue-400">Peace of Mind</span> with SafeLease
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-500 leading-relaxed mb-8" // Changed to text-blue-200
          >
            In the vibrant community of Veliancode and beyond, finding the right lease can be a journey filled with uncertainty. SafeLease was born from a simple yet powerful idea: to create a platform where trust and transparency are not just ideals, but the very foundation of every interaction.
          </motion.p>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* The individual feature cards can remain with their current backgrounds (bg-blue-50)
                as they provide structure within the transparent main div. */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center space-y-4">
              <FaShieldAlt className="text-blue-600 text-4xl" />
              <h3 className="font-semibold text-xl text-gray-400">Secure & Verified Listings</h3>
              <p className="text-blue-50 text-center">Every property and landlord on SafeLease undergoes a thorough verification process, ensuring a safer leasing experience for everyone.</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center space-y-4">
              <FaKey className="text-blue-600 text-4xl" />
              <h3 className="font-semibold text-xl text-gray-400">Transparent Agreements</h3>
              <p className="text-blue-50 text-center">Say goodbye to hidden clauses and unexpected terms. We promote clear and comprehensive lease agreements that protect both parties.</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center space-y-4">
              <FaMapMarkerAlt className="text-blue-600 text-4xl" />
              <h3 className="font-semibold text-xl text-gray-400">Connecting Local Communities</h3>
              <p className="text-blue-50 text-center">We're dedicated to serving the needs of tenants and landlords right here in Veliancode and across Kerala, fostering strong local connections.</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center space-y-4">
              <FaHandshake className="text-blue-600 text-4xl" />
              <h3 className="font-semibold text-xl text-gray-400">Dedicated Support</h3>
              <p className="text-blue-50 text-center">Our experienced team is here to assist you every step of the way, from finding the right property to navigating the lease process with ease.</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center space-y-4">
              <FaUsers className="text-blue-600 text-4xl" />
              <h3 className="font-semibold text-xl text-gray-400">Empowering Tenants & Landlords</h3>
              <p className="text-blue-50 text-center">We believe in creating a balanced ecosystem where both tenants and landlords can thrive with confidence and security.</p>
            </div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-500 leading-relaxed mt-10" // Changed to text-blue-200
          >
            Join the growing community of satisfied users who have found their perfect leases through SafeLease. We're more than just a platform; we're building a future where property leasing is seamless, secure, and stress-free right here in Veliancode and beyond.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;