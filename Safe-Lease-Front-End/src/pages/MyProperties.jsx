import React, { useEffect, useState } from "react";
import axiosbase from "../config/axios-config";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/getImageUrl";

const MyProperties = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     if (properties.length > 0) {
    //         console.log("PROPERTY IMAGES DEBUG:", properties.map(p => p.images));
    //     }
    // }, [properties]);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const fetchMyProperties = async () => {
            try {
                const res = await axiosbase.get(
                    `/api/properties/owner/${user.id}`
                );
                setProperties(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load your properties");
            } finally {
                setLoading(false);
            }
        };

        fetchMyProperties();
    }, [isAuthenticated, user]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-[#0d1224]">
                Please login to view your properties.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-[#0d1224]">
                Loading your properties...
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-[#0d1224] pt-20 pb-24 px-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">
                    My Properties
                </h1>

                {properties.length === 0 ? (
                    <div className="text-slate-400">
                        You haven’t listed any properties yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <div
                                key={property._id}
                                className="bg-[#0c1322] border border-white/6 rounded-2xl overflow-hidden hover:border-cyan-400/40 transition"
                            >
                                {/* Image */}
                                <div className="h-48 bg-black overflow-hidden rounded-t-2xl">
                                    <img
                                        src={
                                            property.images?.length > 0
                                                ? getImageUrl(property.images[0])
                                                : property.imageUrl
                                                    ? property.imageUrl
                                                    : "https://placehold.co/600x400/111827/FFFFFF?text=No+Image"
                                        }
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://placehold.co/600x400/111827/FFFFFF?text=No+Image";
                                        }}
                                        alt={property.title || property.propertyName}
                                        className="w-full h-full object-cover"
                                    />


                                </div>


                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        {property.title || property.propertyName}
                                    </h3>

                                    <p className="text-sm text-slate-400">
                                        {property.city && property.state
                                            ? `${property.city}, ${property.state}`
                                            : property.location}
                                    </p>

                                    <div className="mt-2 text-cyan-300 font-semibold">
                                        ₹{property.price}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => navigate(`/property/${property._id}`)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm"
                                        >
                                            View
                                        </button>

                                        <button
                                            onClick={() =>
                                                navigate(`/property/edit/${property._id}`)
                                            }
                                            className="flex-1 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default MyProperties;
