// src/pages/SingleProperty.jsx

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosbase from '../config/axios-config';
import { toast } from "react-hot-toast";
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaCheckCircle, FaTimesCircle, FaCommentDots, FaInfoCircle } from "react-icons/fa";
import { MdOutlineHouse, MdOutlineDashboardCustomize } from "react-icons/md";
import { FiPhoneCall } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../hooks/useAuth';
import ChatComponent from '../components/ChatComponent';
import Globe3D from '../components/Globe3D';

// Fix for default Leaflet icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const SingleProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [globeLocation, setGlobeLocation] = useState(null);
  const [mapStyle, setMapStyle] = useState('street');

  const currentUserId = user?.id;

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        if (!id) {
          setError("No property ID provided. Cannot load details.");
          setLoading(false);
          return;
        }
        const res = await axiosbase.get(`/api/properties/${id}`);
        setProperty(res.data);
        setLoading(false);

        const addressString = [
          res.data.address?.street,
          res.data.address?.city,
          res.data.address?.state,
          res.data.address?.zipCode,
          res.data.location
        ].filter(Boolean).join(', ');

        if (addressString && addressString !== 'N/A') {
          try {
            const geocodeRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressString)}&format=json&limit=1`);
            const geocodeData = await geocodeRes.json();
            if (geocodeData && geocodeData.length > 0) {
              const lat = parseFloat(geocodeData[0].lat);
              const lon = parseFloat(geocodeData[0].lon);
              setMapCenter([lat, lon]);
              setGlobeLocation({ latitude: lat, longitude: lon });
            } else {
              setMapCenter([0, 0]);
              setGlobeLocation({ latitude: 0, longitude: 0 });
              console.warn("Geocoding failed for address:", addressString);
            }
          } catch (geocodeError) {
            setMapCenter([0, 0]);
            setGlobeLocation({ latitude: 0, longitude: 0 });
            console.error("Error during geocoding:", geocodeError);
          }
        } else {
          setMapCenter([0, 0]);
          setGlobeLocation({ latitude: 0, longitude: 0 });
        }

      } catch (err) {
        console.error("Error fetching property:", err);
        const errorMessage = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Oops! Couldn't load property details. Please try refreshing.";
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  // Map tile layers
  const mapLayers = {
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-xl text-gray-700 font-semibold">Discovering your dream property...</p>
          <div className="w-64 h-4 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-48 h-4 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-8 text-center">
        <FaTimesCircle className="text-red-600 text-6xl mb-4" />
        <h2 className="text-3xl font-bold text-red-800 mb-2">Error!</h2>
        <p className="text-red-700 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
        >Try Again</button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <img src="https://placehold.co/150/cccccc/ffffff?text=Not+Found" alt="Property Not Found" className="mb-6 rounded-full shadow-lg" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Property Not Found</h2>
        <p className="text-gray-600 text-lg">It seems the property you are looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >Go Back</button>
      </div>
    );
  }

  const displayTitle = property.title || property.propertyName || "Untitled Property";
  const displayDescription = property.description || 'No description provided.';

  let fullLocation = 'N/A';
  if (property.address && typeof property.address === 'object') {
    fullLocation = [property.address.street, property.address.city, property.address.state, property.address.zipCode]
      .filter(Boolean)
      .join(', ');
  } else if (property.location) {
    fullLocation = property.location;
  } else if (property.city || property.state || property.zipCode) {
    fullLocation = [property.city, property.state, property.zipCode].filter(Boolean).join(', ');
  }

  const displayPropertyType = property.propertyType || property.type || 'N/A';
  const displayListingStatus = property.listingType || property.status || (typeof property.available === 'boolean' ? (property.available ? "Available" : "Not Available") : 'N/A');
  const displayArea = property.area || property.size;
  const displayBedrooms = property.bedrooms || property.rooms || 'N/A';
  const displayBathrooms = property.bathrooms || 'N/A';
  const displayPrice = property.price || 'N/A';
  const displayAvailable = typeof property.available === 'boolean' ? property.available : true;

  // Main image with new multi-image logic
  let displayImageUrl = '';
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    displayImageUrl = `${axiosbase.defaults.baseURL}/${property.images[0]}`;
  } else if (property.image && typeof property.image === 'string') {
    displayImageUrl = property.image;
  } else if (property.imageUrl && typeof property.imageUrl === 'string') {
    displayImageUrl = property.imageUrl;
  } else {
    displayImageUrl = "https://placehold.co/1200x700/cccccc/ffffff?text=No+Image+Available";
  }

  const chatRecipientId = property.owner?._id;
  const displayLandlordName = property.owner?.name || property.owner?.username || "Landlord";
  const isOwner = user && user.id === chatRecipientId;

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 md:px-8 lg:px-16 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-3xl overflow-hidden animate-fade-in-up">

        <div className="relative h-[400px] md:h-[600px] lg:h-[700px] overflow-hidden group">
          {displayImageUrl ? (
            <img
              src={displayImageUrl}
              alt={displayTitle || "Property Image"}
              className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-in-out group-hover:scale-110"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/1200x700/cccccc/ffffff?text=No+Image+Available"; }}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl">
              No Image Available
            </div>
          )}
          {(property.images && property.images.length > 1) && (
            <div className="absolute bottom-6 left-6 flex gap-2 p-2 bg-white bg-opacity-40 rounded">
              {property.images.map((img, idx) => (
                <img
                  key={idx}
                  src={`${axiosbase.defaults.baseURL}/${img}`}
                  alt={`Property Thumb ${idx + 1}`}
                  className="h-16 w-20 rounded object-cover shadow"
                  style={{ border: displayImageUrl === `${axiosbase.defaults.baseURL}/${img}` ? "2px solid #2563eb" : "none" }}
                  onClick={() => window.scrollTo({ top: 0 })}
                  onMouseOver={() => { /* swap main image on hover (optional) */ }}
                  onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/120x90/cccccc/ffffff?text=No+Image"; }}
                />
              ))}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8 md:p-12">
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 drop-shadow-2xl leading-tight">
                {displayTitle}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 md:p-12">

          <div className="lg:col-span-2 space-y-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-200">
              <div className="mb-4 sm:mb-0">
                <span className="block text-4xl md:text-5xl font-extrabold text-blue-700 mb-1 leading-none">
                  ₹{displayPrice?.toLocaleString() || 'N/A'}
                </span>
                <span className="text-lg text-gray-500 font-medium">Monthly Rent</span>
              </div>
              <div className={`flex items-center gap-2 font-bold text-lg px-6 py-3 rounded-full shadow-lg transition-colors duration-300 transform hover:scale-105 ${displayAvailable ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                {displayAvailable ? <FaCheckCircle className="text-2xl" /> : <FaTimesCircle className="text-2xl" />}
                {displayAvailable ? "Available" : "Not Available"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Detail label="Location" value={fullLocation || 'N/A'} icon={<FaMapMarkerAlt />} />
              <Detail label="Property Type" value={displayPropertyType} icon={<MdOutlineHouse />} />
              <Detail label="Listing Status" value={displayListingStatus} icon={<MdOutlineDashboardCustomize />} />
              <Detail label="Area Size" value={`${displayArea?.toLocaleString() || 'N/A'} sqft`} icon={<FaRulerCombined />} />
              <Detail label="Bedrooms" value={displayBedrooms || 'N/A'} icon={<FaBed />} />
              <Detail label="Bathrooms" value={displayBathrooms || 'N/A'} icon={<FaBath />} />
            </div>

            {property.features && property.features.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 pb-3 border-blue-200">Exclusive Features</h3>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  {property.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-sm md:text-base font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-blue-200 hover:scale-105 cursor-pointer flex items-center gap-2"
                    >
                      <FaCheckCircle className="text-blue-500 text-lg" /> {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {mapCenter && (
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Property Location</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setMapStyle('street')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all ${mapStyle === 'street' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >Street</button>
                    <button
                      onClick={() => setMapStyle('satellite')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all ${mapStyle === 'satellite' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >Satellite</button>
                  </div>
                </div>
                <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
                  <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                    <TileLayer
                      key={mapStyle}
                      url={mapLayers[mapStyle].url}
                      attribution={mapLayers[mapStyle].attribution}
                    />
                    <Marker position={mapCenter}>
                      <Popup>
                        {displayTitle} <br /> {fullLocation}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

          </div>

          <div className="lg:col-span-1 flex flex-col space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Contact Landlord</h3>

              {displayLandlordName !== "Landlord" && (
                <p className="text-center text-lg text-gray-700 mb-4">
                  Listed by: <span className="font-semibold">{displayLandlordName}</span>
                </p>
              )}

              {isAuthenticated && user?.role === 'tenant' && chatRecipientId && currentUserId && currentUserId !== chatRecipientId && (
                <Link
                  to={`/create-agreement/${property._id}/${chatRecipientId}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300 flex items-center justify-center gap-3"
                >
                  <FaCheckCircle className="text-2xl" /> Request Lease Agreement
                </Link>
              )}

              {isAuthenticated && chatRecipientId && currentUserId && currentUserId !== chatRecipientId ? (
                <button
                  type="button"
                  onClick={() => setShowChat(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 flex items-center justify-center gap-3"
                >
                  <FaCommentDots className="text-2xl" /> Chat with Landlord
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error("Please log in to chat with the landlord.");
                      navigate('/login');
                    } else if (isOwner) {
                      toast("You are the owner of this property.", { icon: 'ℹ️' });
                    } else {
                      toast.error("You are not authorized to initiate chat from here.", { icon: '🚫' });
                    }
                  }}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  <FiPhoneCall className="text-2xl" /> Contact Seller
                </button>
              )}
            </div>

            {globeLocation && (
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 flex-1 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 pb-3 border-blue-200 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" /> Global Location
                </h3>
                <Globe3D latitude={globeLocation.latitude} longitude={globeLocation.longitude} />
                <p className="text-gray-700 text-lg leading-relaxed text-center mt-4">
                  {displayDescription}
                </p>
              </div>
            )}
            {!globeLocation && (
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 flex-1 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 pb-3 border-blue-200 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-500" /> Property Overview
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line text-center">
                  {displayDescription}
                </p>
                <p className="text-gray-500 mt-4">Global map view not available for this location.</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {showChat && isAuthenticated && currentUserId && chatRecipientId && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[90vh] md:h-[75vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-lg">
              <h2 className="text-xl font-semibold">Chat with {displayLandlordName}</h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold p-1 rounded-full hover:bg-blue-700 transition"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatComponent recipientId={chatRecipientId} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const Detail = ({ label, value, icon }) => (
  <div className="flex items-start space-x-4 bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100 transition-transform duration-200 hover:scale-[1.02] hover:shadow-md">
    <div className="text-3xl text-blue-500 flex-shrink-0 mt-1">{icon}</div>
    <div className="flex flex-col">
      <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">{label}</span>
      <span className="text-lg text-gray-700 font-medium">{value}</span>
    </div>
  </div>
);

export default SingleProperty;
