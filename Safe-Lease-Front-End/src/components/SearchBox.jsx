import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa"; // Import a search icon

const SearchBox = () => {
  const [properties, setProperties] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() === "") {
        setProperties([]);
        setNoResults(false);
        setLoading(false);
        setIsDropdownOpen(false);
        return;
      }

      setLoading(true);
      setNoResults(false);
      setIsDropdownOpen(true);

      fetch(`http://localhost:4000/properties/search?q=${query}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.properties) {
            setProperties(data.properties);
            if (data.properties.length === 0) {
              setNoResults(true);
            }
          } else {
            setProperties([]);
            setNoResults(true);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Property search failed:", err);
          setLoading(false);
          setNoResults(true);
        });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleEnter = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Optional: Navigate to a dedicated search results page if needed
      // navigate(`/search-results?q=${query}`);

      setQuery("");
      setProperties([]);
      setIsDropdownOpen(false);
    }
  };

  const handleResultClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
    setQuery("");
    setProperties([]);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative bg-transparent p-2 rounded-full flex justify-center items-center">
      {/* Root container is transparent to blend with Navbar's white background */}
      <form onSubmit={handleEnter} className="relative w-full max-w-md">
        <input
          className="text-gray-800 bg-gray-100 w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          // Text color set to dark gray for readability on light background
          // Input background is light gray for subtle contrast
          // Focus ring changed to a prominent blue for interaction
          // Placeholder is darker for visibility
          type="text"
          placeholder="Search for properties..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() !== "" || properties.length > 0)
              setIsDropdownOpen(true);
          }}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        {/* Search icon color adjusted */}
      </form>

      {isDropdownOpen &&
        (query.trim() !== "" || loading || noResults || properties.length > 0) && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white rounded-xl shadow-lg max-h-[300px] overflow-y-auto overflow-x-hidden border border-gray-200">
            {/* Dropdown background is now white, border is light gray */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin border-4 border-t-4 border-blue-500 border-solid rounded-full w-10 h-10"></div>
                {/* Spinner color adjusted to match prominent blue */}
              </div>
            )}

            {noResults && !loading && (
              <div className="flex justify-center items-center py-8 text-gray-600">
                {/* No results text color for readability */}
                <p>No properties found.</p>
              </div>
            )}

            {query && !loading && properties.length > 0 && (
              <div className="flex flex-col py-2">
                {properties.map((property) => (
                  <div
                    onClick={() => handleResultClick(property._id)}
                    key={property._id}
                    className="bg-gray-50 m-2 p-3 rounded-lg w-[calc(100%-16px)] cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  >
                    {/* Result item background is very light gray, hover is slightly darker */}
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 line-clamp-1">
                        {/* Result title color is dark gray, hover is blue */}
                        {property.title || property.propertyName || "Untitled Property"}
                      </h2>
                      {property.address && (
                        <p className="text-sm text-gray-500 line-clamp-1">{property.address}</p>
                        // Address text color adjusted
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default SearchBox;