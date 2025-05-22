import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
const AllProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/properties")
      .then((res) => {
        setProducts(res.data);
        console.log("Fetched products:", res.data); 
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  return (
    <section className="p-6 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">All Properties</h2>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <Link to={`/property/${product._id}`} key={product._id}>
              <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl} 
                    alt={product.propertyName}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">{product.propertyName}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between text-lg font-semibold">
                    <p className="text-blue-600">₹{product.price}</p>
                    <p
                      className={`${
                        product.available ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {product.available ? "Available" : "Sold Out"}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <p>Location: {product.location}</p>
                    <p>Type: {product.type}</p>
                    <p>Status: {product.status}</p>
                    <p>Size: {product.size} sqft</p>
                    <p>Rooms: {product.rooms}</p>
                    <p>Bathrooms: {product.bathrooms}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-xl text-gray-500">No properties found.</p>
        )}
      </div>
    </section>
  );
};

export default AllProducts;
