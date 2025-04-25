import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.results) {
      setResults(location.state.results);
    }
  }, [location]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#b76e79] mb-8">Search Results</h1>
      {results.length === 0 ? (
        <div className="text-center text-gray-600">
          No magical items found matching your search...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              className="transform transition duration-300 hover:scale-105"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
