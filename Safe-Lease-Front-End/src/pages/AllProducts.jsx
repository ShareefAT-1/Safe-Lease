import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:4000/properties");
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
          products.map(
            ({
              _id,
              imageUrl,
              propertyName,
              description,
              price,
              available,
              location,
              type,
              status,
              size,
              rooms,
              bathrooms,
            }) => (
              <Link
                to={`/property/${_id}`}
                key={_id}
                className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`View details of ${propertyName}`}
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={propertyName ?? "Property image"}
                    className="w-full h-64 object-cover rounded-t-lg"
                    loading="lazy"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">{propertyName}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
                  <div className="flex justify-between text-lg font-semibold">
                    <p className="text-blue-600">₹{price?.toLocaleString()}</p>
                    <p className={available ? "text-green-500" : "text-red-500"}>
                      {available ? "Available" : "Sold Out"}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <p>Location: {location ?? "N/A"}</p>
                    <p>Type: {type ?? "N/A"}</p>
                    <p>Status: {status ?? "N/A"}</p>
                    <p>Size: {size ? `${size} sqft` : "N/A"}</p>
                    <p>Rooms: {rooms ?? "N/A"}</p>
                    <p>Bathrooms: {bathrooms ?? "N/A"}</p>
                  </div>
                </div>
              </Link>
            )
          )
        ) : (
          <p className="text-center text-xl text-gray-500">No properties found.</p>
        )}
      </div>
    </section>
  );
};

export default AllProducts;
