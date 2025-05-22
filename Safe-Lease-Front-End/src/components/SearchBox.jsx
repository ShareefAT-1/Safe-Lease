import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SearchBox = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() === "") {
        setBooks([]);
        return;
      }

      setLoading(true);
      setNoResults(false);

      fetch(`https://www.dbooks.org/api/search/${query}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.books) {
            setBooks(data.books);
            if (data.books.length === 0) {
              setNoResults(true);
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleEnter = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/searchResults/${query}`);
    }
  };

  return (
    <div className="bg-fuchsia-950 relative">
      <form action="" onSubmit={handleEnter}>
        <input
          className="text-amber-50 bg-blue-900 px-4 py-2 rounded focus:outline-none focus:ring focus:ring-gray-600"
          type="text"
          placeholder="Search books..."
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
          <p>No results found</p>
        </div>
      )}

      <div className="flex flex-wrap absolute z-10 bg-black h-[300px] overflow-auto justify-center">
        {query && !loading && books.length > 0 && books.map((book) => (
          <div
            onClick={() => {
              navigate(`/bookdetails/${book.id}`);
              setQuery("");
            }}
            key={book.id}
            className="bg-gray-800 text-white m-3 p-4 rounded-lg w-[300px] cursor-pointer"
          >
            <div className="flex flex-col items-center">
              <div className="text-center">
                <h2 className="text-lg font-semibold hover:text-cyan-400 line-clamp-1">
                  {book.title}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBox;
