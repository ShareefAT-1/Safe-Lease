import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import axiosbase from "../config/axios-config";
import { Link } from "react-router-dom";

const SkeletonCard = () => (
  <div className="bg-slate-800 rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="h-44 bg-slate-700" />
    <div className="p-4">
      <div className="h-5 w-3/4 bg-slate-700 rounded mb-3" />
      <div className="h-3 w-full bg-slate-700 rounded mb-2" />
      <div className="h-3 w-5/6 bg-slate-700 rounded mb-4" />
      <div className="h-8 w-1/2 bg-slate-700 rounded" />
    </div>
  </div>
);

const Icons = {
  bed: (
    <svg
      className="w-6 h-6 text-blue-300 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7v10m18 0V7M3 12h18M7 12V9a2 2 0 1 1 4 0v3m6 0V9a2 2 0 1 1 4 0v3"
      />
    </svg>
  ),
  bath: (
    <svg
      className="w-6 h-6 text-pink-300 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-4z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 10V7a3 3 0 0 1 6 0v3"
      />
    </svg>
  ),
  size: (
    <svg
      className="w-6 h-6 text-purple-300 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z"
      />
    </svg>
  ),
  location: (
    <svg
      className="w-6 h-6 text-green-400 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2a8 8 0 0 1 8 8c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 8-8z"
      />
    </svg>
  )

};


const PropertyCard = ({ property }) => {
  const { _id } = property;
  const title = property.title || property.propertyName || "Untitled Property";
  const description = property.description || "";
  const price = property.price;
  const isAvailable = typeof property.available === "boolean" ? property.available : true;

  let location = "N/A";
  if (property.address && typeof property.address === "object") {
    location = [property.address.city, property.address.state].filter(Boolean).join(", ") || "N/A";
  } else if (property.location) {
    location = property.location;
  } else if (property.city || property.state) {
    location = [property.city, property.state].filter(Boolean).join(", ") || "N/A";
  }

  const status = property.listingType || property.status || "Selling";
  const size = property.area || property.size;
  const bedrooms = property.bedrooms || property.rooms;
  const bathrooms = property.bathrooms;

  let imageUrl = "https://placehold.co/800x500/0f172a/94a3b8?text=No+Image";

  if (Array.isArray(property.images) && property.images.length > 0) {
    imageUrl = property.images[0];
  }
  else if (typeof property.image === "string") {
    imageUrl = property.image.startsWith("uploads")
      ? `${axiosbase.defaults.baseURL}/${property.image.replace(/\\/g, "/")}`
      : property.image;
  }
  else if (typeof property.imageUrl === "string") {
    imageUrl = property.imageUrl;
  }


  return (
    <Link
      to={`/property/${_id}`}
      className="group block transform transition-all duration-300 will-change-transform"
      aria-label={`View details for ${title}`}
    >
      <motion.div
        whileHover={{ y: -8 }}
        className="bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-800 hover:border-sky-400/40 relative"
      >
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-600 ease-out"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = "https://placehold.co/800x500/0f172a/94a3b8?text=Image+Error"; }}
          />

          <div className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${isAvailable ? "bg-emerald-400/90 text-slate-900" : "bg-red-500/90 text-white"}`}>
            {isAvailable ? "Available" : "Not available"}
          </div>

          <div className="absolute right-4 bottom-3 text-white font-extrabold text-lg shadow-lg">
            ₹{price?.toLocaleString() || "N/A"}
          </div>

          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(400px 200px at 70% 30%, rgba(96,165,250,0.12), transparent 20%), radial-gradient(300px 140px at 20% 70%, rgba(167,139,250,0.08), transparent 18%)",
              opacity: 0.8,
            }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span className="text-xs font-semibold text-sky-300 uppercase">{status}</span>
            <div className="flex items-center text-xs text-slate-300">
              {Icons.location}
              <span>{location}</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 truncate">{title}</h3>
          <p className="text-slate-300 mb-4 line-clamp-2">{description}</p>

          <div className="flex items-center justify-between text-sm text-slate-300 border-t border-slate-800 pt-3">

            <div className="flex items-center">
              {bedrooms ? (
                <div className="flex items-center gap-2 mr-4">
                  {Icons.bed}
                  <span>{bedrooms}</span>
                </div>
              ) : null}

              {bathrooms ? (
                <div className="flex items-center gap-2 mr-4">
                  {Icons.bath}
                  <span>{bathrooms}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center text-slate-300">
              {size ? (
                <div className="flex items-center gap-2">
                  {Icons.size}
                  <span>{size} sqft</span>
                </div>
              ) : (
                <div className="text-xs">—</div>
              )}
            </div>

          </div>

        </div>
      </motion.div>
    </Link>
  );
};

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [sortBy, setSortBy] = useState("latest");

  const [cities, setCities] = useState([]);

  const sentinelRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosbase.get("/api/properties");
      setProducts(Array.isArray(data) ? data : []);
      const setCity = new Set();
      (Array.isArray(data) ? data : []).forEach((p) => {
        if (p.address?.city) setCity.add(p.address.city);
        else if (p.city) setCity.add(p.city);
        else if (p.location) {
          const parts = String(p.location).split(",");
          if (parts[0]) setCity.add(parts[0].trim());
        }
      });
      setCities(Array.from(setCity).slice(0, 30));
      setError(null);
    } catch (err) {
      setError("Failed to fetch properties. Try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((v) => Math.min(v + 6, filteredSorted.length));
          }
        });
      },
      { rootMargin: "200px", threshold: 0.2 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [sentinelRef.current]);

  const filtered = products.filter((p) => {
    const lower = query.toLowerCase().trim();
    if (lower) {
      const hay = `${p.title || p.propertyName || ""} ${p.description || ""} ${p.location || p.city || p.address?.city || ""}`.toLowerCase();
      if (!hay.includes(lower)) return false;
    }

    if (cityFilter) {
      const cityVal = (p.address?.city || p.city || p.location || "").toLowerCase();
      if (!cityVal.includes(cityFilter.toLowerCase())) return false;
    }

    if (typeFilter) {
      const t = (p.listingType || p.status || "").toLowerCase();
      if (!t.includes(typeFilter.toLowerCase())) return false;
    }

    const price = Number(p.price || 0);
    if (price < priceRange[0] || price > priceRange[1]) return false;

    return true;
  });

  const filteredSorted = filtered.sort((a, b) => {
    if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
    if (sortBy === "latest") {
      const ta = new Date(a.createdAt || a._id?.toString().slice(0, 8) || Date.now()).getTime();
      const tb = new Date(b.createdAt || b._id?.toString().slice(0, 8) || Date.now()).getTime();
      return tb - ta;
    }
    return 0;
  });

  useEffect(() => {
    setVisibleCount(9);
  }, [query, cityFilter, typeFilter, priceRange, sortBy]);

  const applyPricePreset = (preset) => {
    if (preset === "any") setPriceRange([0, 100000000]);
    if (preset === "budget") setPriceRange([0, 500000]);
    if (preset === "mid") setPriceRange([500000, 5000000]);
    if (preset === "lux") setPriceRange([5000000, 100000000]);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#071331,_#041028)] text-gray-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-10 top-24 w-60 h-60 rounded-full bg-indigo-600/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-10 bottom-36 w-72 h-72 rounded-full bg-sky-500/20 blur-3xl"
        />
      </div>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight">Discover Our Properties</h1>
            <p className="text-slate-300 mt-2 max-w-xl">Explore curated properties. Filter, sort, and scroll — we've made discovery fun ✨</p>
          </div>

          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex items-center bg-slate-800 rounded-full px-3 py-2 shadow-sm w-full md:w-[420px]">
              <input
                aria-label="Search properties"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent placeholder-slate-400 text-slate-100 flex-1 px-2 focus:outline-none"
                placeholder="Search by title, city or features..."
              />
              <button className="ml-2 px-3 py-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full text-slate-900 font-semibold">
                Search
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                aria-label="Filter by city"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                aria-label="Filter by type"
              >
                <option value="">All Types</option>
                <option value="selling">Selling</option>
                <option value="leasing">Leasing</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 text-slate-200 px-3 py-2 rounded-lg"
                aria-label="Sort by"
              >
                <option value="latest">Newest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center mb-6">
          <span className="text-slate-400 text-sm">Price:</span>
          <button onClick={() => applyPricePreset("any")} className="text-sm px-3 py-1 rounded-lg bg-slate-800">Any</button>
          <button onClick={() => applyPricePreset("budget")} className="text-sm px-3 py-1 rounded-lg bg-slate-800">Budget</button>
          <button onClick={() => applyPricePreset("mid")} className="text-sm px-3 py-1 rounded-lg bg-slate-800">Mid</button>
          <button onClick={() => applyPricePreset("lux")} className="text-sm px-3 py-1 rounded-lg bg-slate-800">Luxury</button>
        </div>

        <div className="relative">
          {loading ? (
            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-800/40 p-4 rounded">{error}</div>
          ) : filteredSorted.length === 0 ? (
            <div className="p-6 bg-slate-800 rounded">No properties match your filters.</div>
          ) : (
            <>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {filteredSorted.slice(0, visibleCount).map((p) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                    className="break-inside-avoid"
                  >
                    <PropertyCard property={p} />
                  </motion.div>
                ))}
              </div>

              <div ref={sentinelRef} className="h-8" aria-hidden />
              {visibleCount < filteredSorted.length && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setVisibleCount((v) => Math.min(v + 6, filteredSorted.length))}
                    className="px-4 py-2 rounded-full bg-sky-500 text-slate-900 font-semibold"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
