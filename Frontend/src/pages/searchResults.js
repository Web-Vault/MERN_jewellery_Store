import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (location.state?.results) {
      setResults(location.state.results);
    }
    if (location.state?.error) {
      setMessage(`❌ ${location.state.error}`);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [location]);

  const handleAddToCart = async (id) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("userToken");

    if (!userId || !token) {
      setMessage("⚠️ Please log in to add items to the cart.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, productId: id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Item added to cart successfully!");
      } else {
        setMessage(`❌ ${data.message || "Error adding to cart"}`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("❌ Server error while adding to cart.");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddToWishlist = async (id) => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      setMessage("⚠️ Please log in to add items to your wishlist.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/wishlist/add/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage("❤️ Added to wishlist!");
      } else {
        setMessage(`❌ ${data.message || "Failed to add to wishlist."}`);
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      setMessage("❌ Server error while adding to wishlist.");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  if (results.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-[#fff8f5]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Results</h1>
          {message && (
            <div className="text-center text-[#6B4E4D] mb-6 transition-all duration-300">
              {message}
            </div>
          )}
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No products found.</p>
            <Link
              to="/products"
              className="inline-block mt-4 px-6 py-2 bg-[#b76e79] text-white rounded-lg hover:bg-[#9d5a64] transition-all"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-[#fff8f5]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Results</h1>
        {message && (
          <div className="text-center text-[#6B4E4D] mb-6 transition-all duration-300">
            {message}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((product) => (
            <div key={product._id} className="group bg-white/90 backdrop-blur-sm rounded-xl border border-[#E0D6CC] shadow-sm hover:shadow-md transition-all duration-300">
              <div className="relative aspect-square overflow-hidden rounded-t-xl">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6B4E4D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-serif text-[#6B4E4D] mb-2">
                  {product.name}
                </h3>
                <p className="text-[#B76E79] font-medium mb-4">
                  ₹{product.price.toLocaleString()}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#B76E79] text-white rounded-lg hover:bg-[#B76E79]/90 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(product._id)}
                    className="p-2 text-[#6B4E4D] hover:text-[#B76E79] border border-[#E0D6CC] rounded-lg hover:border-[#B76E79] transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
