import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdOutlineHouse, MdOutlineDashboardCustomize } from "react-icons/md";
import { FiPhoneCall } from "react-icons/fi"; // For the Contact Agent button

const SingleProperty = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:4000/properties/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching property:", err);
        setError("Oops! Couldn't load property details. Please try refreshing.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-xl text-gray-700 font-semibold">Discovering your dream property...</p>
          <div className="w-64 h-4 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-48 h-4 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-8 text-center">
        <FaTimesCircle className="text-red-600 text-6xl mb-4" />
        <h2 className="text-3xl font-bold text-red-800 mb-2">Error!</h2>
        <p className="text-red-700 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <img src="https://via.placeholder.com/150/cccccc/ffffff?text=Not+Found" alt="Property Not Found" className="mb-6 rounded-full shadow-lg" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Property Not Found</h2>
        <p className="text-gray-600 text-lg">It seems the property you are looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 md:px-8 lg:px-16 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-3xl overflow-hidden animate-fade-in-up">
        {/* Hero Image and Title Section */}
        <div className="relative h-[400px] md:h-[600px] lg:h-[700px] overflow-hidden group">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.propertyName}
              className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-in-out group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8 md:p-12">
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 drop-shadow-2xl leading-tight">
                {product.propertyName}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 drop-shadow-xl max-w-2xl">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 md:p-12">

          {/* Left Column: Details & Features */}
          <div className="lg:col-span-2 space-y-10">
            {/* Price & Availability */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-200">
              <div className="mb-4 sm:mb-0">
                <span className="block text-4xl md:text-5xl font-extrabold text-blue-700 mb-1 leading-none">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-lg text-gray-500 font-medium">Estimated Price</span>
              </div>
              <div
                className={`flex items-center gap-2 font-bold text-lg px-6 py-3 rounded-full shadow-lg transition-colors duration-300 transform hover:scale-105 ${
                  product.available
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {product.available ? (
                  <FaCheckCircle className="text-2xl" />
                ) : (
                  <FaTimesCircle className="text-2xl" />
                )}
                {product.available ? "Currently Available" : "Sold Out"}
              </div>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Detail label="Location" value={product.location} icon={<FaMapMarkerAlt />} />
              <Detail label="Property Type" value={product.type} icon={<MdOutlineHouse />} />
              <Detail label="Current Status" value={product.status} icon={<MdOutlineDashboardCustomize />} />
              <Detail label="Area Size" value={`${product.size?.toLocaleString() || 'N/A'} sqft`} icon={<FaRulerCombined />} />
              <Detail label="Bedrooms" value={product.rooms} icon={<FaBed />} />
              <Detail label="Bathrooms" value={product.bathrooms} icon={<FaBath />} />
            </div>

            {/* Features Section */}
            {product.features?.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 pb-3 border-blue-200">Exclusive Features</h3>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  {product.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-sm md:text-base font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-blue-200 hover:scale-105 cursor-pointer flex items-center gap-2"
                    >
                      <FaCheckCircle className="text-blue-500 text-lg" /> {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Call to Action / Agent Info (Placeholder) */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl text-center flex flex-col items-center justify-center h-full">
              <FiPhoneCall className="text-6xl mb-6 animate-pulse" />
              <h3 className="text-3xl font-extrabold mb-4">Interested in This Property?</h3>
              <p className="text-lg opacity-90 mb-6">Connect with our dedicated agent for more details and to schedule a visit.</p>
              <button
                type="button"
                className="w-full bg-white text-blue-700 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center gap-3"
              >
                <FiPhoneCall className="text-2xl" />
                Contact Agent
              </button>
            </div>
            {/* You could add more placeholder content here, like related properties or a map */}
          </div>
        </div>
      </div>
    </section>
  );
};

const Detail = ({ label, value, icon }) => (
  <div className="flex items-start space-x-4 bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100 transition-transform duration-200 hover:scale-[1.02] hover:shadow-md">
    <div className="text-3xl text-blue-500 flex-shrink-0 mt-1">{icon}</div>
    <div className="flex flex-col">
      <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">{label}</span>
      <span className="text-lg text-gray-700 font-medium">{value}</span>
    </div>
  </div>
);

export default SingleProperty;