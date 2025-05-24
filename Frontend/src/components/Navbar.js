import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShoppingCart,
  Package,
  LogOut,
  Menu,
  X,
  SearchIcon,
} from "lucide-react";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("userToken");
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const offset = 100; // Adjust this value to change when the transformation triggers
      setIsScrolled(window.scrollY > offset);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const [searchText, setSearchText] = useState("");

  const handleSearch = async () => {
    if (!searchText.trim()) {
      return; // Don't search if the search text is empty
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/search/${encodeURIComponent(
          searchText.trim()
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to search products");
      }

      // Ensure we have a valid array of results
      const results = Array.isArray(data) ? data : data.products || [];

      navigate("/search-results", { state: { results } });
      setIsSearchOpen(false);
      setSearchText("");
    } catch (error) {
      console.error("Error searching products:", error);
      navigate("/search-results", {
        state: { results: [], error: error.message },
      });
      setIsSearchOpen(false);
      setSearchText("");
    }
  };

  return (
    <>
      <nav
        className={`fixed left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 transition-all duration-500 [transition-property:all] ease-out ${
          isScrolled
            ? "top-6 w-[90%] md:w-[80%] shadow-xl bg-white/70 backdrop-blur-lg border border-[#e0d6cc] scale-100"
            : "top-0 w-full bg-[#fff8f5] border-b-2 border-[#f5e6e0]"
        } ${
          isMobileMenuOpen
            ? "rounded-t-2xl rounded-b-none"
            : isScrolled
            ? "rounded-2xl"
            : "rounded-none"
        }`}
        style={{
          opacity: isScrolled ? 1 : 0.95,
        }}
      >
        {/* Animated Logo Container */}
        <div className="flex items-center space-x-3 relative group">
          <button
            className="md:hidden text-gray-800 hover:text-[#b76e79] transition-transform hover:scale-110"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-7 h-7 animate-spin-in" />
            ) : (
              <Menu className="w-7 h-7 animate-pulse-once" />
            )}
          </button>
          <Link
            to="/"
            className="relative hover:rotate-[2deg] transition-transform duration-300"
          >
            <img
              src="product_images/logo.png"
              alt="JewelStore"
              className={`h-12 md:h-14 transition-all duration-500 ${
                !isScrolled
                  ? "drop-shadow-[0_10px_15px_rgba(183,110,121,0.3)]"
                  : "shadow-none"
              }`}
            />
            {!isScrolled && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#fff8f500_0%,#fff8f5_100%)] mix-blend-soft-light animate-shine" />
            )}
          </Link>
        </div>

        {/* Rest of your navbar content remains the same */}
        <div className="hidden md:flex space-x-8 text-gray-900 font-medium text-lg">
          <Link
            to="/"
            className="relative group transition-all hover:!opacity-100"
          >
            <span className="block transform transition-all duration-500 group-hover:translate-y-[-2px]">
              Home
            </span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b76e79] origin-left transform scale-x-0 group-hover:scale-x-100 transition-all duration-300" />
            <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-10 bg-[#b76e79] blur-md transition-opacity duration-300" />
          </Link>
          <Link
            to="/products"
            className="relative group transition-all hover:!opacity-100"
          >
            <span className="block transform transition-all duration-500 group-hover:translate-y-[-2px]">
              Products
            </span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b76e79] origin-left transform scale-x-0 group-hover:scale-x-100 transition-all duration-300" />
            <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-10 bg-[#b76e79] blur-md transition-opacity duration-300" />
          </Link>
          <Link
            to="/collections"
            className="relative group transition-all hover:!opacity-100"
          >
            <span className="block transform transition-all duration-500 group-hover:translate-y-[-2px]">
              Collections
            </span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b76e79] origin-left transform scale-x-0 group-hover:scale-x-100 transition-all duration-300" />
            <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-10 bg-[#b76e79] blur-md transition-opacity duration-300" />
          </Link>
          <Link
            to="/contact"
            className="relative group transition-all hover:!opacity-100"
          >
            <span className="block transform transition-all duration-500 group-hover:translate-y-[-2px]">
              Contact
            </span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b76e79] origin-left transform scale-x-0 group-hover:scale-x-100 transition-all duration-300" />
            <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-10 bg-[#b76e79] blur-md transition-opacity duration-300" />
          </Link>
        </div>
        {/* User Actions */}
        <div className="flex items-center space-x-5">
          {isAuthenticated ? (
            <>
              <button onClick={() => setIsSearchOpen((prev) => !prev)}>
                <SearchIcon className="w-7 h-7 text-gray-800 hover:text-[#b76e79] transition" />
              </button>
              <Link to="/cart">
                <ShoppingCart className="w-7 h-7 text-gray-800 hover:text-[#b76e79] transition" />
              </Link>
              <Link to="/order-history">
                <Package className="w-7 h-7 text-gray-800 hover:text-[#b76e79] transition" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative focus:outline-none"
                >
                  <User className="w-7 h-7 text-gray-800 hover:text-[#b76e79] transition" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-white shadow-lg rounded-lg py-2 border border-[#e0d6cc]">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Wishlist
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 inline-block mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="relative overflow-hidden px-6 py-2 bg-[#b76e79] text-white rounded-lg shadow-md hover:bg-[#9d5a64] transition-all hover:shadow-lg hover:scale-105"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-20 transition-opacity duration-300" />
              <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] opacity-20 mix-blend-soft-light" />
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <div
          className={`absolute top-full left-0 w-full bg-white/70 backdrop-blur-lg shadow-xl px-6 py-3 border border-[#e0d6cc] overflow-hidden transition-all duration-500 ${
            isMobileMenuOpen
              ? "max-h-[300px] py-4 opacity-100 rounded-b-2xl"
              : "max-h-0 opacity-0"
          }`}
        >
          <Link
            to="/"
            className="block py-3 text-lg text-gray-900 hover:ml-5 transition-all pl-0 hover:pl-4 border-l-4 border-transparent hover:border-[#b76e79]"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="block py-3 text-lg text-gray-900 hover:ml-5 transition-all pl-0 hover:pl-4 border-l-4 border-transparent hover:border-[#b76e79]"
          >
            Products
          </Link>
          <Link
            to="/collections"
            className="block py-3 text-lg text-gray-900 hover:ml-5 transition-all pl-0 hover:pl-4 border-l-4 border-transparent hover:border-[#b76e79]"
          >
            collections
          </Link>
          <Link
            to="/contact"
            className="block py-3 text-lg text-gray-900 hover:ml-5 transition-all pl-0 hover:pl-4 border-l-4 border-transparent hover:border-[#b76e79]"
          >
            Contact
          </Link>
        </div>
      </nav>
      {isSearchOpen && (
        <div className="fixed top-24 right-3 w-full z-40 flex justify-end px-4 md:px-0">
          <div className="w-full max-w-2xl bg-white border border-[#e0d6cc] shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
            <div className="flex items-center px-4 py-3 space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#b76e79]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Try 'gold ring under 5000'..."
                className="flex-1 text-gray-800 placeholder-gray-500 bg-transparent outline-none text-sm"
              />
              <button
                onClick={handleSearch}
                className="bg-[#b76e79] hover:bg-[#9d5a64] text-white px-4 py-2 text-sm rounded-lg transition-all duration-200"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
