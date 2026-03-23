import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Loader2, Package } from "lucide-react";
import { cn } from "~/lib/utils";
import { getProductsAPI } from "~/apis";

// Highlight matching text
function HighlightText({ text, query }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200/60 text-inherit rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// Thumbnail with placeholder
function ProductThumbnail({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <Package className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </div>
  );
}

export default function SearchBar({ className = "", mobileIconMode = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search with real API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await getProductsAPI({ search: query, limit: 10 });
        const productsData = data?.data?.products || data?.data?.data || data?.products || data?.data || [];
        setResults(Array.isArray(productsData) ? productsData : []);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
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
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsFocused(false);
        if (mobileIconMode) {
          inputRef.current?.blur();
        }
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileIconMode]);

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
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSelectProduct = (product) => {
    setQuery("");
    setIsOpen(false);
    setIsFocused(false);
    navigate(`/products/${product._id}`);
  };

  const handleMobileIconClick = () => {
    setIsFocused(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Mobile icon mode - chỉ hiện icon, click để expand
  if (mobileIconMode) {
    return (
      <>
        {/* Icon button */}
        <button
          onClick={handleMobileIconClick}
          className={cn(
            "p-2.5 rounded-full transition-all duration-300",
            "hover:bg-gray-100 text-gray-600",
            isFocused && "opacity-0 pointer-events-none absolute"
          )}
          aria-label="Tìm kiếm"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Mobile Search Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-50 bg-white transition-all duration-300",
            isFocused
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible translate-y-4"
          )}
        >
          {/* Search Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <button
              onClick={() => {
                setIsFocused(false);
                setQuery("");
                setIsOpen(false);
                inputRef.current?.blur();
              }}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 relative">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
                  isLoading ? "text-blue-500" : "text-gray-400"
                )}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm vật liệu xây dựng..."
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              {isLoading && (
                <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-blue-600 font-medium text-sm"
            >
              Tìm
            </button>
          </div>

          {/* Results */}
          <div className="overflow-y-auto h-[calc(100vh-60px)]">
            {isOpen && results.length > 0 && (
              <div className="divide-y">
                {results.map((product, index) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    onClick={() => handleSelectProduct(product)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors",
                      index === selectedIndex && "bg-gray-100"
                    )}
                  >
                    <ProductThumbnail
                      src={product.images?.[0]}
                      alt={product.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        <HighlightText text={product.name} query={query} />
                      </p>
                      <p className="text-sm text-blue-600 font-medium">
                        {formatPrice(product.referencePrice || product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {isOpen && query && results.length === 0 && !isLoading && (
              <div className="p-8 text-center">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
              </div>
            )}

            {!query && (
              <div className="p-4 text-center text-sm text-gray-500">
                <p>Bắt đầu nhập để tìm kiếm sản phẩm</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Desktop mode - expand animation
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div
        className={cn(
          "relative transition-all duration-300 ease-out",
          isFocused && inputRef.current === document.activeElement
            ? "w-80 lg:w-96"
            : "w-64 lg:w-72"
        )}
      >
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
            isLoading ? "text-blue-500" : "text-gray-400",
            isFocused && "text-blue-500"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            query && results.length > 0 && setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Tìm vật liệu xây dựng..."
          className={cn(
            "w-full pl-10 pr-10 py-2 bg-gray-100 border-0 rounded-full text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white",
            "transition-all duration-300 ease-out"
          )}
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
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Autocomplete Dropdown - Fade in animation */}
      <div
        className={cn(
          "absolute top-full left-0 right-0 mt-2",
          "bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/80",
          "overflow-hidden z-50",
          "transition-all duration-200 ease-out origin-top",
          isOpen && results.length > 0
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
          {results.map((product, index) => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              onClick={() => handleSelectProduct(product)}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-150",
                "border-l-2 border-transparent",
                index === selectedIndex && "bg-blue-50/50 border-l-blue-500"
              )}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <ProductThumbnail src={product.images?.[0]} alt={product.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  <HighlightText text={product.name} query={query} />
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {formatPrice(product.referencePrice || product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="px-4 py-2.5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100/50">
          <button
            onClick={handleSearch}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <Search className="w-3 h-3" />
            Xem tất cả kết quả cho "{query}"
          </button>
        </div>
      </div>

      {/* No results */}
      <div
        className={cn(
          "absolute top-full left-0 right-0 mt-2",
          "bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/80 p-4 z-50",
          "transition-all duration-200 ease-out origin-top",
          isOpen && query && results.length === 0 && !isLoading
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        <p className="text-sm text-gray-500 text-center">
          Không tìm thấy sản phẩm nào
        </p>
      </div>
    </div>
  );
}
