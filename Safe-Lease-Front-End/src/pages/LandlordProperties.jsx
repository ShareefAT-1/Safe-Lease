import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosbase from "../config/axios-config";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/getImageUrl";

const LandlordProperties = () => {
    const { landlordId } = useParams();
    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLandlordProperties = async () => {
            try {
                const res = await axiosbase.get(
                    `/api/properties/landlord/${landlordId}`
                );
                setProperties(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load landlord properties");
            } finally {
                setLoading(false);
            }
        };

        fetchLandlordProperties();
    }, [landlordId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0d1224] text-white">
                Loading listings...
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-[#0d1224] pt-20 pb-24 px-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">
                    Landlord Listings
                </h1>

                {properties.length === 0 ? (
                    <p className="text-slate-400">No properties listed.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <div
                                key={property._id}
                                className="bg-[#0c1322] border border-white/6 rounded-2xl overflow-hidden hover:border-cyan-400/40 transition"
                            >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                                    <img
                                        src={
                                            property.images?.length > 0
                                                ? getImageUrl(property.images[0])
                                                : property.imageUrl ||
                                                "https://placehold.co/600x400/111827/FFFFFF?text=No+Image"
                                        }
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://placehold.co/600x400/111827/FFFFFF?text=No+Image";
                                        }}
                                        alt={property.title || property.propertyName}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Title overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                                        <h3 className="text-lg font-semibold text-white drop-shadow">
                                            {property.title || property.propertyName || "Untitled Property"}
                                        </h3>
                                    </div>
                                </div>



                                {/* Info */}
                                <div className="p-4">

                                    <p className="text-sm text-slate-400">
                                        {property.city && property.state
                                            ? `${property.city}, ${property.state}`
                                            : property.location || "Location not specified"}
                                    </p>


                                    <div className="mt-2 text-cyan-300 font-semibold">
                                        ₹{property.price}
                                    </div>

                                    <button
                                        onClick={() => navigate(`/property/${property._id}`)}
                                        className="mt-4 w-full px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
                                    >
                                        View Property
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default LandlordProperties;
