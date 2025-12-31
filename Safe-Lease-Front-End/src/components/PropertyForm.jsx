import React, { useState, useEffect } from "react";
import axiosbase from "../config/axios-config";

export default function PropertyForm({
  initialData = null,
  onSubmit,
  submitText = "Create Property",
}) {
  const [propertyData, setPropertyData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    price: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    available: true,
    listingType: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ PREFILL FORM FOR EDIT
  useEffect(() => {
    if (initialData) {
      setPropertyData({
        title: initialData.title || "",
        description: initialData.description || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        zipCode: initialData.zipCode || "",
        price: initialData.price || "",
        propertyType: initialData.propertyType || "",
        bedrooms: initialData.bedrooms || "",
        bathrooms: initialData.bathrooms || "",
        area: initialData.area || "",
        available: initialData.available ?? true,
        listingType: initialData.listingType || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPropertyData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();

      Object.entries(propertyData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }

      // ✅ EDIT MODE
      if (onSubmit) {
        await onSubmit(formData);
        return;
      }

      // ✅ CREATE MODE
      const token = localStorage.getItem("token");
      await axiosbase.post("/api/properties", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Property created successfully");
      setPropertyData({
        title: "",
        description: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        price: "",
        propertyType: "",
        bedrooms: "",
        bathrooms: "",
        area: "",
        available: true,
        listingType: "",
      });
      setImages([]);
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#071331,_#041028)] flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-xl"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {submitText}
          </h2>

          {message && (
            <p className="text-center mb-4 text-sm text-emerald-400">
              {message}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" name="title" value={propertyData.title} onChange={handleChange} placeholder="Title" />
            <input className="input" name="description" value={propertyData.description} onChange={handleChange} placeholder="Description" />
            <input className="input" name="address" value={propertyData.address} onChange={handleChange} placeholder="Address" />
            <input className="input" name="city" value={propertyData.city} onChange={handleChange} placeholder="City" />
            <input className="input" name="state" value={propertyData.state} onChange={handleChange} placeholder="State" />
            <input className="input" name="zipCode" value={propertyData.zipCode} onChange={handleChange} placeholder="Zip Code" />
            <input className="input" type="number" name="price" value={propertyData.price} onChange={handleChange} placeholder="Price" />
            <input className="input" type="number" name="area" value={propertyData.area} onChange={handleChange} placeholder="Area (sqft)" />
            <input className="input" type="number" name="bedrooms" value={propertyData.bedrooms} onChange={handleChange} placeholder="Bedrooms" />
            <input className="input" type="number" name="bathrooms" value={propertyData.bathrooms} onChange={handleChange} placeholder="Bathrooms" />

            <select className="input" name="propertyType" value={propertyData.propertyType} onChange={handleChange}>
              <option value="">Property Type</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
            </select>

            <select className="input" name="listingType" value={propertyData.listingType} onChange={handleChange}>
              <option value="">Listing Type</option>
              <option value="Sale">Sale</option>
              <option value="Lease">Lease</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-slate-300 mt-4">
            <input type="checkbox" name="available" checked={propertyData.available} onChange={handleChange} />
            Available
          </label>

          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange}
            className="mt-4 text-slate-300"
          />

          <button
            disabled={loading}
            className="mt-6 w-full py-3 rounded-xl bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-400 transition"
          >
            {loading ? "Uploading..." : submitText}
          </button>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          outline: none;
          color: white;
        }
        .input::placeholder {
          color: rgba(255,255,255,0.5);
        }
        .input:focus {
          border-color: #10b981;
        }
      `}</style>
    </>
  );
}
