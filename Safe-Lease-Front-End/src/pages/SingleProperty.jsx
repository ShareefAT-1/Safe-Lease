import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosbase from "../config/axios-config";
import { toast } from "react-hot-toast";

import {
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCheckCircle,
  FaTimesCircle,
  FaCommentDots,
} from "react-icons/fa";
import { MdOutlineHouse, MdOutlineDashboardCustomize } from "react-icons/md";
import { FiPhoneCall } from "react-icons/fi";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { useAuth } from "../hooks/useAuth";
import ChatComponent from "../components/ChatComponent";
import Globe3D from "../components/Globe3D";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const SingleProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const mapLayers = {
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    },
  };

  const [mapCenter, setMapCenter] = useState(null);
  const [globeLocation, setGlobeLocation] = useState(null);
  const [mapStyle, setMapStyle] = useState("street");

  const currentUserId = user?.id;

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const res = await axiosbase.get(`/api/properties/${id}`);
        setProperty(res.data);
        setLoading(false);

        const addr = [
          res.data?.address?.street,
          res.data?.address?.city,
          res.data?.address?.state,
          res.data?.address?.zipCode,
          res.data?.location,
        ]
          .filter(Boolean)
          .join(", ");

        if (addr) {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              addr
            )}&format=json&limit=1`
          );
          const geo = await geoRes.json();

          if (geo.length > 0) {
            const lat = parseFloat(geo[0].lat);
            const lon = parseFloat(geo[0].lon);
            setMapCenter([lat, lon]);
            setGlobeLocation({ latitude: lat, longitude: lon });
          }
        }
      } catch (err) {
        console.error("fetch property error", err);
        setError("Could not load property details.");
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    document.body.style.overflow = showChat ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showChat]);

  const isOwner = Boolean(
    user?.id && property?.owner?._id && property.owner._id === user.id
  );


  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1224]">
        <div className="animate-spin h-16 w-16 border-t-4 border-b-4 border-cyan-400 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-10">
        <FaTimesCircle className="text-red-600 text-6xl mb-4" />
        <h2 className="text-3xl font-bold text-red-700">{error}</h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-red-600 px-6 py-3 rounded-lg text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!property) return <div>No Property Found</div>;

  const displayTitle = property.title || property.propertyName || "Untitled Property";
  const displayDescription = property.description || "No description provided.";

  const fullLocation = property.address
    ? [
      property.address.street,
      property.address.city,
      property.address.state,
      property.address.zipCode,
    ]
      .filter(Boolean)
      .join(", ")
    : property.location || "N/A";

  const displayImageUrl =
    property.images?.length > 0
      ? `${axiosbase.defaults.baseURL.replace(/\/$/, "")}/${String(
        property.images[0]
      ).replace(/^\/+/, "")}`
      : property.imageUrl ||
      property.image ||
      "https://placehold.co/1200x700/000000/FFFFFF?text=No+Image";

  const chatRecipientId = property.owner?._id;
  const displayLandlordName = property.owner?.name || property.owner?.username || "Landlord";

  return (
    <section className="min-h-screen bg-[#0d1224] pt-10 pb-20 px-6 md:px-12 text-white">
      <div className="max-w-7xl mx-auto bg-[#11172b] rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.4)] border border-[#1f2a47] overflow-hidden">

        <div className="relative h-[420px] md:h-[620px] overflow-hidden group">
          <img
            src={displayImageUrl}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-10">
            <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">{displayTitle}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 p-10">

          <div className="lg:col-span-2 space-y-10">

            <div className="flex justify-between border-b border-[#1f2a47] pb-6">
              <div>
                <h2 className="text-5xl font-extrabold text-cyan-400">
                  ₹{(property.price || 0).toLocaleString()}
                </h2>
                <p className="text-slate-400">Monthly Rent</p>
              </div>

              <div
                className={`px-6 py-3 rounded-full flex items-center gap-3 font-bold shadow-lg ${property.available ? "bg-green-600/80" : "bg-red-600/80"
                  }`}
              >
                {property.available ? <FaCheckCircle /> : <FaTimesCircle />}
                {property.available ? "Available" : "Unavailable"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Detail label="Location" value={fullLocation} icon={<FaMapMarkerAlt />} />
              <Detail label="Property Type" value={property.propertyType || property.type || "N/A"} icon={<MdOutlineHouse />} />
              <Detail label="Listing Status" value={property.listingType || property.status || "N/A"} icon={<MdOutlineDashboardCustomize />} />
              <Detail label="Area Size" value={`${property.area || property.size || "N/A"} sqft`} icon={<FaRulerCombined />} />
              <Detail label="Bedrooms" value={property.bedrooms || property.rooms || "N/A"} icon={<FaBed />} />
              <Detail label="Bathrooms" value={property.bathrooms || property.baths || "N/A"} icon={<FaBath />} />
            </div>

            {mapCenter && (
              <div className="bg-[#121a33] p-6 rounded-2xl border border-[#243158]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-cyan-300">Property Location</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setMapStyle("street")} className={`px-4 py-2 rounded-lg ${mapStyle === "street" ? "bg-cyan-600" : "bg-[#1b243b]"}`}>Street</button>
                    <button onClick={() => setMapStyle("satellite")} className={`px-4 py-2 rounded-lg ${mapStyle === "satellite" ? "bg-cyan-600" : "bg-[#1b243b]"}`}>Satellite</button>
                  </div>
                </div>

                <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} className="h-96 w-full rounded-lg overflow-hidden">
                  <TileLayer url={mapLayers[mapStyle].url} />
                  <Marker position={mapCenter}>
                    <Popup>{fullLocation}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>

          <div className="space-y-6">

            <div className="bg-[#121a33] p-8 rounded-2xl border border-[#243158] text-center">

              <h3 className="text-2xl font-bold text-cyan-300">Contact Landlord</h3>
              <p className="text-slate-300 mt-2">
                Listed by: <span className="font-semibold">{displayLandlordName}</span>
              </p>

              {isOwner && (
                <div className="mt-6 bg-purple-900/30 border border-purple-600/40 text-purple-300 px-6 py-4 rounded-xl shadow-lg">
                  <div className="text-xl font-bold mb-1">🎖️ You Are The Landlord</div>
                  <p className="text-sm opacity-80">This is your listing.</p>
                </div>
              )}

              {!isOwner && (
                <>
                  {isAuthenticated && user?.role === "tenant" && (
                    <button
                      onClick={() => setShowChat(true)}
                      className="w-full bg-purple-700/80 hover:bg-purple-700 text-white py-3 rounded-xl mt-4 shadow-lg"
                    >
                      <FaCommentDots className="inline mr-2" /> Chat with Landlord
                    </button>
                  )}

                  {isAuthenticated && user?.role === "tenant" && (
                    <button
                      onClick={() => navigate(`/profile/${chatRecipientId}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl mt-4 shadow-lg"
                    >
                      👤 View Landlord Profile
                    </button>
                  )}

                  {!isAuthenticated && (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl mt-4 shadow-lg"
                    >
                      <FiPhoneCall className="inline mr-2" /> Contact Seller
                    </button>
                  )}
                </>
              )}


            </div>

            {/* Globe */}
            <div className="bg-[#121a33] p-6 rounded-2xl border border-[#243158] text-center">
              <h3 className="text-2xl font-bold text-cyan-300 mb-3 flex items-center justify-center">
                <FaMapMarkerAlt className="mr-2 text-cyan-400" /> Global Location
              </h3>

              {globeLocation ? (
                <Globe3D latitude={globeLocation.latitude} longitude={globeLocation.longitude} />
              ) : (
                <p className="text-slate-400">Location unavailable</p>
              )}

              <p className="text-slate-300 mt-4">{displayDescription}</p>
            </div>

          </div>
        </div>
      </div>

      {showChat && isAuthenticated && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#11172b] rounded-xl w-full max-w-lg h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-cyan-700/40">

            <div className="p-4 bg-cyan-700 text-white flex justify-between items-center">
              <h2 className="text-xl font-semibold">Chat with {displayLandlordName}</h2>

              <button
                onClick={() => setShowChat(false)}
                className="text-3xl font-bold hover:text-gray-300"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ChatComponent recipientId={chatRecipientId} />
            </div>

          </div>
        </div>
      )}
    </section>
  );
};

const Detail = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 bg-[#121a33] p-5 rounded-xl border border-[#243158]">
    <div className="text-3xl text-cyan-400">{icon}</div>
    <div>
      <span className="block text-slate-400 text-sm uppercase tracking-wide">{label}</span>
      <span className="text-xl text-white font-semibold">{value}</span>
    </div>
  </div>
);

export default SingleProperty;
