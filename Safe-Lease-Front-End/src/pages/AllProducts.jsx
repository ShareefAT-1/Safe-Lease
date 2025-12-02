// src/pages/AllProducts.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import axiosbase from "../config/axios-config";
import { Link } from "react-router-dom";

/* ---------- Small UI pieces ---------- */
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

/* inline SVG icons to avoid external dependency / font issues */
const Icons = {
  bed: (
    <svg className="w-5 h-5 mr-2 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4" />
    </svg>
  ),
  bath: (
    <svg className="w-5 h-5 mr-2 text-pink-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5 5 0 006 0M6 7l3 9M6 7l6-2" />
    </svg>
  ),
  size: (
    <svg className="w-5 h-5 mr-2 text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4" />
    </svg>
  ),
  location: (
    <svg className="w-4 h-4 mr-1 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

/* ---------- PROPERTY CARD (upgraded visuals + spotlight effect) ---------- */
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
  if (property.image && typeof property.image === "string") {
    if (property.image.startsWith("uploads/")) {
      imageUrl = `${axiosbase.defaults.baseURL}/${property.image}`;
    } else if (property.image.startsWith("uploads\\")) {
      imageUrl = `${axiosbase.defaults.baseURL}/${property.image.replace(/\\/g, "/")}`;
    } else {
      imageUrl = property.image;
    }
  } else if (property.imageUrl && typeof property.imageUrl === "string") {
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
        {/* image with spotlight overlay */}
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-600 ease-out"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = "https://placehold.co/800x500/0f172a/94a3b8?text=Image+Error"; }}
          />

          {/* floating status badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${isAvailable ? "bg-emerald-400/90 text-slate-900" : "bg-red-500/90 text-white"}`}>
            {isAvailable ? "Available" : "Not available"}
          </div>

          {/* price badge */}
          <div className="absolute right-4 bottom-3 text-white font-extrabold text-lg shadow-lg">
            ₹{price?.toLocaleString() || "N/A"}
          </div>

          {/* spotlight radial effect on hover */}
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
                <div className="flex items-center mr-4">
                  {Icons.bed}
                  <span>{bedrooms}</span>
                </div>
              ) : null}

              {bathrooms ? (
                <div className="flex items-center mr-4">
                  {Icons.bath}
                  <span>{bathrooms}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center text-slate-300">
              {size ? (
                <div className="flex items-center">
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

/* ---------- MAIN PAGE (with controls + infinite scroll) ---------- */
export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9); // initial chunk
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filter / search state
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // e.g. "Selling" | "Leasing"
  const [priceRange, setPriceRange] = useState([0, 100000000]); // min, max
  const [sortBy, setSortBy] = useState("latest"); // latest | price-asc | price-desc

  // unique filter values
  const [cities, setCities] = useState([]);

  // sentinel for infinite scroll
  const sentinelRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosbase.get("/api/properties");
      setProducts(Array.isArray(data) ? data : []);
      // unique city list for filter
      const setCity = new Set();
      (Array.isArray(data) ? data : []).forEach((p) => {
        if (p.address?.city) setCity.add(p.address.city);
        else if (p.city) setCity.add(p.city);
        else if (p.location) {
          // try to grab city from "City, Country" text
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

  // infinite scroll observer: load more when sentinel visible
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current]);

  // derived + filtering
  const filtered = products.filter((p) => {
    // search
    const lower = query.toLowerCase().trim();
    if (lower) {
      const hay = `${p.title || p.propertyName || ""} ${p.description || ""} ${p.location || p.city || p.address?.city || ""}`.toLowerCase();
      if (!hay.includes(lower)) return false;
    }

    // city
    if (cityFilter) {
      const cityVal = (p.address?.city || p.city || p.location || "").toLowerCase();
      if (!cityVal.includes(cityFilter.toLowerCase())) return false;
    }

    // type
    if (typeFilter) {
      const t = (p.listingType || p.status || "").toLowerCase();
      if (!t.includes(typeFilter.toLowerCase())) return false;
    }

    // price
    const price = Number(p.price || 0);
    if (price < priceRange[0] || price > priceRange[1]) return false;

    return true;
  });

  // sorting
  const filteredSorted = filtered.sort((a, b) => {
    if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
    // latest: fallback to createdAt if present, else keep order
    if (sortBy === "latest") {
      const ta = new Date(a.createdAt || a._id?.toString().slice(0, 8) || Date.now()).getTime();
      const tb = new Date(b.createdAt || b._id?.toString().slice(0, 8) || Date.now()).getTime();
      return tb - ta;
    }
    return 0;
  });

  // reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(9);
  }, [query, cityFilter, typeFilter, priceRange, sortBy]);

  /* UI: price range quick presets */
  const applyPricePreset = (preset) => {
    if (preset === "any") setPriceRange([0, 100000000]);
    if (preset === "budget") setPriceRange([0, 500000]);
    if (preset === "mid") setPriceRange([500000, 5000000]);
    if (preset === "lux") setPriceRange([5000000, 100000000]);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#071331,_#041028)] text-gray-100">
      {/* Floating orbs (soft) */}
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
        {/* Title + controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight">Discover Our Properties</h1>
            <p className="text-slate-300 mt-2 max-w-xl">Explore curated properties. Filter, sort, and scroll — we've made discovery fun ✨</p>
          </div>

          {/* Search + Filters */}
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

        {/* quick price presets */}
        <div className="flex gap-2 items-center mb-6">
          <span className="text-slate-400 text-sm">Price:</span>
          <button onClick={() => applyPricePreset("any")} className="text-sm px-3 py-1 rounded-lg bg-slate-800">Any</button>
          <button onClick={() => applyPricePreset("budget")} className="text-sm px-3 py-1 rounded-lg bg-slate-800">Budget</button>
          <button onClick={() => applyPricePreset("mid")} className="text-sm px-3 py-1 rounded-lg bg-slate-800">Mid</button>
          <button onClick={() => applyPricePreset("lux")} className="text-sm px-3 py-1 rounded-lg bg-slate-800">Luxury</button>
        </div>

        {/* Grid - masonry-like using CSS columns */}
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
              {/* Responsive 'masonry' using CSS columns on small widths and grid on larger */}
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

              {/* sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-8" aria-hidden />
              {/* small pager / indicator */}
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
