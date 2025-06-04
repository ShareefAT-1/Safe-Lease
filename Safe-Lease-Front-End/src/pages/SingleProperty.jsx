import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const SingleProperty = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/properties/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Error fetching product:", err));
  }, [id]);

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading property details...</p>
      </div>
    );
  }

  return (
    <section className="p-6 bg-gray-50 min-h-screen flex flex-col">
      <h2 className="text-4xl font-extrabold text-center mb-10 text-gray-900">
        {product.propertyName}
      </h2>

      <div className=" bg-white rounded-lg shadow-lg overflow-hidden md:flex md:space-x-6 h-[600px] md:h-[600px]">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.propertyName}
            className="md:w-1/2 w-full h-full object-cover"
          />
        )}

        <div className="p-8 md:w-1/2 flex flex-col justify-between h-full">
          <div className="flex flex-col justify-start space-y-6">
            <p className="text-gray-700 text-lg">{product.description}</p> 

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">
                ₹{product.price.toLocaleString()}
              </span>
              <span
                className={`font-semibold text-sm px-3 py-1 rounded-full ${
                  product.available
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.available ? "Available" : "Sold Out"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-gray-600 text-sm">
              <Detail label="Location" value={product.location} />
              <Detail label="Type" value={product.type} />
              <Detail label="Status" value={product.status} />
              <Detail label="Size" value={`${product.size} sqft`} />
              <Detail label="Rooms" value={product.rooms} />
              <Detail label="Bathrooms" value={product.bathrooms} />
            </div>

            {product.features?.length > 0 && (
              <div>
                <h4 className="text-gray-800 font-semibold mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition"
          >
            Contact Agent
          </button>
        </div>
      </div>
    </section>
  );
};

const Detail = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="font-semibold text-gray-800">{label}</span>
    <span>{value}</span>
  </div>
);

export default SingleProperty;
