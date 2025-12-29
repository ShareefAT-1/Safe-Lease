import React from "react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 py-12 shadow-inner relative overflow-hidden">

      {/* <motion.div
        className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400"
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      /> */}

    
<motion.div
  className="absolute top-0 left-0 right-0 h-[4px] w-full overflow-hidden pointer-events-none"
  animate={{
    backgroundColor: [
      "rgb(66,135,245)",   
      "rgb(120,66,245)",  
      "rgb(66,245,162)",  
      "rgb(245,66,162)",  
      "rgb(66,135,245)",  
    ],
    backgroundPosition: ["0% 50%", "100% 50%"]
  }}
  transition={{
    backgroundColor: {
      duration: 12,        
      repeat: Infinity,
      ease: "easeInOut",  
      repeatType: "mirror"
    },
    backgroundPosition: {
      duration: 18,       
      repeat: Infinity,
      ease: "linear"
    }
  }}
  style={{ backgroundSize: "250% 250%" }}
/>




      <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-black text-gray-900 mb-3 relative inline-block">
            SafeLease
            <motion.span
              className="absolute -bottom-1 left-0 h-[2px] w-full bg-blue-500/50 rounded-full blur-sm"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            />
          </h3>

          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Your trusted platform for secure and smart property leasing.  
            Making rentals safe and simple.
          </p>

          <p className="mt-5 text-xs text-gray-400">&copy; 2025 SafeLease. All rights reserved.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-black text-gray-900 mb-4 relative inline-block">
            Quick Links
            <motion.span
              className="absolute -bottom-1 left-0 h-[2px] w-full bg-purple-500/40 rounded-full blur-sm"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: 0.25, duration: 0.7 }}
            />
          </h3>

          <ul className="space-y-3 text-sm">
            {[
              "Privacy Policy",
              "Terms of Service",
              "Contact",
              "About Us",
              "Careers",
              "Blog"
            ].map((link, i) => (
              <li key={i}>
                <a
                  href={`/${link.toLowerCase().replace(/\s/g, "-")}`}
                  className="hover:text-blue-600 transition-all duration-300 relative"
                >
                  {link}
                  <motion.span
                    className="absolute -bottom-0.5 left-0 h-[1px] w-full bg-blue-600/60"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-black text-gray-900 mb-2">Subscribe</h3>
          <p className="text-sm text-gray-500 mb-5 font-medium">Get the latest updates & offers.</p>

          <form className="flex shadow-lg rounded-xl overflow-hidden">
            <input
              type="email"
              placeholder="Your email"
              className="px-4 py-3 border border-gray-300 focus:outline-none w-full text-sm text-gray-900"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              type="submit"
              className="bg-blue-600 text-white px-5 py-3 text-sm font-bold whitespace-nowrap"
            >
              Subscribe 🚀
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col items-center md:items-start"
        >
          <h3 className="text-xl font-black text-gray-900 mb-4 relative inline-block">
            Connect with Us
            <motion.span
              className="absolute -bottom-1 left-0 h-[2px] w-full bg-emerald-500/30 rounded-full blur-sm"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            />
          </h3>

          <div className="flex gap-5 text-2xl text-gray-500 mb-6">
            {["🌐", "🐦", "📘", "🔗"].map((icon, i) => (
              <motion.a
                href="#"
                key={i}
                whileHover={{ y: -6, scale: 1.25, rotate: 5 }}
                transition={{ type: "spring", stiffness: 170 }}
                aria-label="social icon"
              >
                {icon}
              </motion.a>
            ))}
          </div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <p className="text-sm text-gray-500">
              Email:{" "}
              <a href="mailto:support@safelease.com" className="text-blue-600 font-extrabold hover:underline">
                support@safelease.com
              </a>
            </p>
            <p className="text-sm text-gray-500">
              Phone:{" "}
              <a href="tel:+1234567890" className="text-blue-600 font-extrabold hover:underline">
                +1 234 567 890
              </a>
            </p>
          </motion.div>
        </motion.div>

      </div>
    </footer>
  );
}
