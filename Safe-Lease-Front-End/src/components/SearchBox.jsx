import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SearchBox = () => {
  const [properties, setProperties] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!query.trim()) {
        setProperties([]);
        setNoResults(false);
        return;
      }

      setLoading(true);
      setOpen(true);

      fetch(
        `http://localhost:4000/api/properties/search?q=${encodeURIComponent(
          query
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          setProperties(data.properties || []);
          setNoResults(!data.properties || data.properties.length === 0);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setNoResults(true);
        });
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative w-[340px]">
      {/* 🌈 RGB OUTLINE */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            exit={{ opacity: 0 }}
            transition={{
              backgroundPosition: {
                duration: 16,
                repeat: Infinity,
                ease: "linear",
              },
              opacity: { duration: 0.2 },
            }}
            className="absolute -inset-[1.2px] rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgb(66,135,245), rgb(120,66,245), rgb(66,245,162), rgb(245,66,162), rgb(66,135,245))",
              backgroundSize: "300% 300%",
              filter: "blur(1.5px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* 🔍 SEARCH INPUT */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white shadow-sm">
        <FaSearch className="text-blue-500 text-sm" />
        <input
          type="text"
          placeholder="Search properties..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="
            w-full bg-transparent outline-none
            text-gray-800 placeholder:text-gray-400
            text-sm
          "
        />
      </div>

      {/* 📦 DROPDOWN */}
      <AnimatePresence>
       {open && query && (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.2 }}
    className="absolute z-50 mt-3 w-full"
  >
    {/* 🌈 RGB BORDER */}
    <motion.div
      className="absolute -inset-[1px] rounded-xl pointer-events-none"
      style={{
        background:
          "linear-gradient(90deg, rgb(66,135,245), rgb(120,66,245), rgb(66,245,162), rgb(245,66,162), rgb(66,135,245))",
        backgroundSize: "300% 300%",
        filter: "blur(1px)",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "linear",
      }}
    />

    {/* 🧊 ACTUAL DROPDOWN (ONLY scrollable element) */}
    <div
      className="
        relative
        rounded-xl
        bg-[#0b1220]/95
        backdrop-blur-xl
        border border-white/10
        shadow-2xl
        max-h-[320px]
        overflow-y-auto

        [&::-webkit-scrollbar]:hidden
        [-ms-overflow-style:none]
        [scrollbar-width:none]
      "
    >
      {loading && (
        <div className="py-6 text-center text-white/60 text-sm">
          Searching…
        </div>
      )}

      {noResults && !loading && (
        <div className="py-6 text-center text-white/50 text-sm">
          No properties found
        </div>
      )}

      {!loading &&
        properties.map((p) => (
          <div
            key={p._id}
            onClick={() => navigate(`/property/${p._id}`)}
            className="
              px-4 py-3 cursor-pointer
              hover:bg-white/5 transition
              border-b border-white/5 last:border-none
            "
          >
            <p className="text-sm font-medium text-white">
              {p.propertyName}
            </p>
            <p className="text-xs text-white/50">{p.location}</p>
          </div>
        ))}
    </div>
  </motion.div>
)}


      </AnimatePresence>
    </div>
  );
};

export default SearchBox;
