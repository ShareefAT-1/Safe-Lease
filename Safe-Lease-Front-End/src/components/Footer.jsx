import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 py-10 shadow-inner">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* 1. About / Description */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">SafeLease</h3>
          <p className="text-sm text-gray-500">
            Your trusted platform for secure and smart property leasing. Making rentals safe and simple.
          </p>
          <p className="mt-4 text-xs text-gray-400">&copy; 2025 SafeLease. All rights reserved.</p>
        </div>

        {/* 2. Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/privacy" className="hover:text-blue-600 transition">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-blue-600 transition">Terms of Service</a></li>
            <li><a href="/contact" className="hover:text-blue-600 transition">Contact</a></li>
            <li><a href="/about" className="hover:text-blue-600 transition">About Us</a></li>
            <li><a href="/careers" className="hover:text-blue-600 transition">Careers</a></li>
            <li><a href="/blog" className="hover:text-blue-600 transition">Blog</a></li>
          </ul>
        </div>

        {/* 3. Newsletter */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Subscribe to Newsletter</h3>
          <p className="text-sm text-gray-500 mb-4">
            Get the latest updates and offers.
          </p>
          <form className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* 4. Social + Contact Info */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Connect with Us</h3>
          <div className="flex space-x-4 mb-4 text-gray-400 text-xl">
            <a href="#" className="hover:text-blue-600" aria-label="Website">🌐</a>
            <a href="#" className="hover:text-blue-600" aria-label="Twitter">🐦</a>
            <a href="#" className="hover:text-blue-600" aria-label="Facebook">📘</a>
            <a href="#" className="hover:text-blue-600" aria-label="LinkedIn">🔗</a>
          </div>
          
          <div className="mt-16 gap-4">
             <p className="text-sm text-gray-500">
            Email: <a href="mailto:support@safelease.com" className="hover:text-blue-600">support@safelease.com</a>
          </p>
          <p className="text-sm text-gray-500">
            Phone: <a href="tel:+1234567890" className="hover:text-blue-600">+1 234 567 890</a>
          </p>
          </div>
         
        </div>
      </div>
    </footer>
  );
}
