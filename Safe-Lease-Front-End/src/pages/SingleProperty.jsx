import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const SingleProperty = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/properties/${id}`)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => console.error("Error fetching product:", err));
  }, [id]);

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <section className="p-6 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        {product.propertyName}
      </h2>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.propertyName}
            className="w-full h-96 object-cover rounded-t-lg"
          />
        )}
        <div className="p-6">
          <p className="text-lg text-gray-800 mb-4">{product.description}</p>
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
    </section>
  );
};

export default SingleProperty;
