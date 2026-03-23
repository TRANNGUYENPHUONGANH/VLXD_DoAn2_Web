import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

// Mock data - sau này thay bằng API call
const MOCK_PRODUCTS = [
  {
    _id: "1",
    name: "Xi măng Hà Tiên",
    price: 95000,
    thumbnail:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=100",
  },
  {
    _id: "2",
    name: "Thép xây dựng Hòa Phát",
    price: 15000000,
    thumbnail:
      "https://images.unsplash.com/photo-1590650046871-92c887180603?w=100",
  },
  {
    _id: "3",
    name: "Gạch đỏ xây tường",
    price: 1200,
    thumbnail:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=100",
  },
  {
    _id: "4",
    name: "Cát xây dựng",
    price: 300000,
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100",
  },
  {
    _id: "5",
    name: "Đá 1x2",
    price: 350000,
    thumbnail:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=100",
  },
];

export default function SearchBar({ className = "" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      // Mock search - sau này thay bằng API
      const filtered = MOCK_PRODUCTS.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()),
      );
      setResults(filtered);
      setIsOpen(true);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectProduct(results[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSelectProduct = (product) => {
    setQuery("");
    setIsOpen(false);
    navigate(`/product/${product._id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          placeholder="Tìm vật liệu xây dựng..."
          className="w-64 lg:w-72 pl-10 pr-10 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="max-h-80 overflow-y-auto">
            {results.map((product, index) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                onClick={() => handleSelectProduct(product)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors",
                  index === selectedIndex && "bg-gray-50",
                )}
              >
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t">
            <button
              onClick={handleSearch}
              className="text-xs text-gray-500 hover:text-blue-600"
            >
              Xem tất cả kết quả cho "{query}"
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {isOpen && query && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
          <p className="text-sm text-gray-500 text-center">
            Không tìm thấy sản phẩm nào
          </p>
        </div>
      )}
    </div>
  );
}
