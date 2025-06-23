import React, { useEffect, useState, useCallback } from "react";
import axiosbase from "../config/axios-config"; 
import { Link } from "react-router-dom";

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

  if (loading) {
    return (
      <section className="p-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">All Properties</h2>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg bg-gray-200 animate-pulse h-80"
              aria-busy="true"
              aria-label="Loading property"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">All Properties</h2>
        <p className="text-center text-red-600 text-lg">{error}</p>
      </section>
    );
  }

  return (
    <section className="p-6 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">All Properties</h2>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {products.length ? (
          products.map((property) => {

            const _id = property._id;
            const displayTitle = property.title || property.propertyName || "Untitled Property";
            const displayDescription = property.description || "";
            const displayPrice = property.price;
            const displayAvailable = typeof property.available === "boolean" ? property.available : true;

            let displayLocation = "N/A";
            if (property.address && typeof property.address === "object") {
              displayLocation = [property.address.city, property.address.state].filter(Boolean).join(", ") || "N/A";
            } else if (property.location) {
              displayLocation = property.location;
            } else if (property.city || property.state) {
              displayLocation = [property.city, property.state].filter(Boolean).join(", ") || "N/A";
            }
            
            const displayType = property.propertyType || property.type || "N/A";
            const displayStatus = property.listingType || property.status || (displayAvailable ? "Available" : "Not Available");
            const displaySize = property.area || property.size;
            const displayBedrooms = property.bedrooms || property.rooms;
            const displayBathrooms = property.bathrooms;

            let displayImageUrl = '';
            if (property.image && typeof property.image === 'string') {
                if (property.image.startsWith('uploads/')) {
                    displayImageUrl = `${axiosbase.defaults.baseURL}/${property.image}`;
                } else if (property.image.startsWith('uploads\\')) {
                    displayImageUrl = `${axiosbase.defaults.baseURL}/${property.image.replace(/\\/g, '/')}`;
                } else {
                    displayImageUrl = property.image;
                }
            } else if (property.imageUrl && typeof property.imageUrl === 'string') {
                displayImageUrl = property.imageUrl;
            }

            return (
              <Link
                to={`/property/${_id}`}
                key={_id}
                className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`View details of ${displayTitle}`}
              >
                {displayImageUrl ? (
                  <img
                    src={displayImageUrl}
                    alt={displayTitle}
                    className="w-full h-64 object-cover rounded-t-lg"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/cccccc/ffffff?text=No+Image"; }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center text-gray-600 rounded-t-lg">
                    No Image Available
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">{displayTitle}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{displayDescription}</p>
                  <div className="flex justify-between text-lg font-semibold">
                    <p className="text-blue-600">₹{displayPrice?.toLocaleString()}</p>
                    <p className={displayAvailable ? "text-green-500" : "text-red-500"}>
                      {displayAvailable ? "Available" : "Sold Out"}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <p>Location: {displayLocation}</p>
                    <p>Type: {displayType}</p>
                    <p>Status: {displayStatus}</p>
                    <p>Size: {displaySize ? `${displaySize} sqft` : "N/A"}</p>
                    <p>Rooms: {displayBedrooms ?? "N/A"}</p>
                    <p>Bathrooms: {displayBathrooms ?? "N/A"}</p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-center text-xl text-gray-500 col-span-full">No properties found.</p>
        )}
      </div>
    </section>
  );
};

export default AllProducts;