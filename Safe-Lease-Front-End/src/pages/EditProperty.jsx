import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosbase from "../config/axios-config";
import PropertyForm from "../components/PropertyForm";
import toast from "react-hot-toast";

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axiosbase.get(`/api/properties/${id}`);
        setProperty(res.data);
      } catch {
        toast.error("Failed to load property");
        navigate("/my-properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleUpdate = async (formData) => {
    try {
      const token = localStorage.getItem("token");

      await axiosbase.put(`/api/properties/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Property updated");
      navigate("/my-properties");
    } catch {
      toast.error("Failed to update property");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0d1224]">
        Loading property...
      </div>
    );
  }

  return (
    <PropertyForm
      initialData={property}
      onSubmit={handleUpdate}
      submitText="Update Property"
    />
  );
};

export default EditProperty;
