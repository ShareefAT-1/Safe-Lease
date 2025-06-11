import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SearchBox = () => {
  const [properties, setProperties] = useState([]); 
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() === "") {
        setProperties([]);
        setNoResults(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNoResults(false);

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
        });
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleEnter = (e) => {
    e.preventDefault();
    if (query.trim()) {

      setQuery("");
      setProperties([]); 
    }
  };

  return (
    <div className="bg-fuchsia-950 relative">
      <form action="" onSubmit={handleEnter}>
        <input
          className="text-amber-50 bg-blue-900 px-4 py-2 rounded focus:outline-none focus:ring focus:ring-gray-600"
          type="text"
          placeholder="Search properties..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {loading && (
        <div className="absolute z-10 w-full h-64 flex justify-center items-center bg-black opacity-70">
          <div className="animate-spin border-4 border-t-4 border-white border-solid rounded-full w-12 h-12"></div>
        </div>
      )}

      {noResults && !loading && (
        <div className="absolute z-10 w-full h-64 flex justify-center items-center bg-black opacity-70 text-white">
          <p>No properties found</p>
        </div>
      )}

      <div className="absolute z-10 bg-black left-0 right-0 max-h-[300px] overflow-y-auto overflow-x-hidden justify-center shadow-lg">
        {query && !loading && properties.length > 0 && (
          <div className="flex flex-col items-center py-2">
            {properties.map((property) => (
              <div
                onClick={() => {

                  navigate(`/property/${property._id}`); 
                  setQuery(""); 
                  setProperties([]); 
                }}
                key={property._id}
                className="bg-gray-800 text-white m-1 p-3 rounded-lg w-full max-w-[calc(100%-16px)] cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-lg font-semibold hover:text-cyan-400 line-clamp-1">
                    {property.title || property.propertyName || "Untitled Property"} 
                  </h2>
                  {property.address && property.title && (
                    <p className="text-sm text-gray-400 line-clamp-1">{property.address}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;