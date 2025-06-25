import React, { useEffect, useState, useCallback } from "react";
import axiosbase from "../config/axios-config";
import { Link } from "react-router-dom";

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="h-56 bg-gray-300"></div>
    <div className="p-6">
      <div className="h-6 w-3/4 bg-gray-300 rounded mb-4"></div>
      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-5/6 bg-gray-200 rounded mb-4"></div>
      <div className="h-8 w-1/2 bg-gray-300 rounded mb-6"></div>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="h-5 w-16 bg-gray-200 rounded"></div>
        <div className="h-5 w-16 bg-gray-200 rounded"></div>
        <div className="h-5 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

const Icons = {
  bed: <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>,
  bath: <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>,
  size: <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>,
  location: <svg className="w-5 h-5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
};

const PropertyCard = ({ property }) => {
  const { _id } = property;
  const title = property.title || property.propertyName || "Untitled Property";
  const description = property.description || "";
  const price = property.price;
  const isAvailable = typeof property.available === "boolean" ? property.available : true;

  let location = "N/A";
  if (property.address && typeof property.address === "object") {
    location = [property.address.city, property.address.state].filter(Boolean).join(", ") || "N/A";
  } else if (property.location) {
    location = property.location;
  } else if (property.city || property.state) {
    location = [property.city, property.state].filter(Boolean).join(", ") || "N/A";
  }
  
  const status = property.listingType || property.status || "For Sale";
  const size = property.area || property.size;
  const bedrooms = property.bedrooms || property.rooms;
  const bathrooms = property.bathrooms;

  let imageUrl = 'https://placehold.co/600x400/e2e8f0/4a5568?text=No+Image';
  if (property.image && typeof property.image === 'string') {
      if (property.image.startsWith('uploads/')) {
          imageUrl = `${axiosbase.defaults.baseURL}/${property.image}`;
      } else if (property.image.startsWith('uploads\\')) {
          imageUrl = `${axiosbase.defaults.baseURL}/${property.image.replace(/\\/g, '/')}`;
      } else {
          imageUrl = property.image;
      }
  } else if (property.imageUrl && typeof property.imageUrl === 'string') {
      imageUrl = property.imageUrl;
  }

  return (
    <Link
      to={`/property/${_id}`}
      className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:-translate-y-2"
      aria-label={`View details for ${title}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-56 object-cover rounded-t-xl group-hover:scale-110 transition-transform duration-300 ease-in-out"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e2e8f0/4a5568?text=Image+Error"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className={`absolute top-4 left-4 px-3 py-1 text-sm font-semibold text-white rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
            {isAvailable ? "Available" : "Sold"}
        </div>
        <div className="absolute bottom-4 right-4 text-white">
            <span className="text-2xl font-bold">₹{price?.toLocaleString() || 'N/A'}</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <p className="font-semibold text-blue-600 uppercase tracking-wider">{status}</p>
            <div className="flex items-center">
              {Icons.location}
              <span>{location}</span>
            </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2 truncate" title={title}>{title}</h3>
        <p className="text-gray-600 mb-6 h-12 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center text-sm text-gray-800 pt-4 border-t border-gray-200">
            {bedrooms && <div className="flex items-center">{Icons.bed}<span>{bedrooms} Beds</span></div>}
            {bathrooms && <div className="flex items-center">{Icons.bath}<span>{bathrooms} Baths</span></div>}
            {size && <div className="flex items-center">{Icons.size}<span>{size} sqft</span></div>}
        </div>
      </div>
    </Link>
  );
};

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosbase.get("/properties");
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch properties. Please try again later.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-red-500 text-lg bg-red-100 p-4 rounded-lg">{error}</p>;
    }

    if (products.length === 0) {
      return <p className="text-center text-xl text-gray-500 col-span-full">No properties found.</p>;
    }

    return (
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
        {products.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>
    );
  };

  return (
    <section className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Discover Our Properties</h1>
        <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
          Explore a curated selection of premier properties tailored to your lifestyle.
        </p>
      </div>
      {renderContent()}
    </section>
  );
};

export default AllProducts;