import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Star,
  X,
  ChevronDown,
  ShoppingCart,
  Heart,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { getProductsAPI, getCategoriesAPI } from '~/apis'
import { addToCart, addToCartAsync } from '~/redux/cart/cartSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { authUtils } from '~/utils/authUtils'
import { cn } from '~/lib/utils'

// Mock data fallback
const MOCK_CATEGORIES = [
  { _id: '1', name: 'Cát xây dựng', slug: 'cat' },
  { _id: '2', name: 'Đá dăm', slug: 'da' },
  { _id: '3', name: 'Xi măng', slug: 'xi-mang' },
  { _id: '4', name: 'Gạch các loại', slug: 'gach' },
  { _id: '5', name: 'Sắt thép', slug: 'sat-thep' }
]

const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 500.000đ', min: 0, max: 500000 },
  { label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
  { label: '1.000.000đ - 5.000.000đ', min: 1000000, max: 5000000 },
  { label: '5.000.000đ - 10.000.000đ', min: 5000000, max: 10000000 },
  { label: 'Trên 10.000.000đ', min: 10000000, max: Infinity }
]

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Giá: Thấp đến cao', value: 'price_asc' },
  { label: 'Giá: Cao đến thấp', value: 'price_desc' },
  { label: 'Đánh giá cao', value: 'rating' }
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  // State
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedPriceRange, setSelectedPriceRange] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [sortBy, setSortBy] = useState('newest')

  // View states
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [hoveredProduct, setHoveredProduct] = useState(null)

  // Quick View
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 12
  })

  // Fetch products
  const fetchProducts = async (page = 1) => {
    setIsLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProductsAPI({ page, limit: pagination.limit }),
        getCategoriesAPI()
      ])

      const productsData = productsRes.data?.products ||
        productsRes.data?.data ||
        productsRes.data || []
      const categoriesData = categoriesRes.data?.data ||
        categoriesRes.data || []

      setProducts(Array.isArray(productsData) ? productsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : MOCK_CATEGORIES)

      // Set pagination if available
      if (productsRes.data?.pagination) {
        setPagination(productsRes.data.pagination)
      } else if (productsRes.pagination) {
        setPagination(productsRes.pagination)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setProducts([])
      setCategories(MOCK_CATEGORIES)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchProducts(1)
  }, [])

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Filter and sort products (local fallback if API doesn't support)
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Category filter
    if (selectedCategory && product.categoryId !== selectedCategory) {
      const productCategoryId = String(product.categoryId)
      if (productCategoryId !== selectedCategory) {
        return false
      }
    }

    // Price filter
    const price = product.referencePrice || product.price || 0
    const priceRange = PRICE_RANGES[selectedPriceRange]
    if (price < priceRange.min || price > priceRange.max) {
      return false
    }

    // Rating filter
    if (selectedRating > 0 && (product.ratingAverage || 0) < selectedRating) {
      return false
    }

    return true
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return (a.referencePrice || a.price || 0) - (b.referencePrice || b.price || 0)
      case 'price_desc':
        return (b.referencePrice || b.price || 0) - (a.referencePrice || a.price || 0)
      case 'rating':
        return (b.ratingAverage || 0) - (a.ratingAverage || 0)
      case 'newest':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
  })

  // Display products
  const displayedProducts = sortedProducts

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price)
  }

  // Render stars
  const renderStars = (rating) => {
    // Nếu không có đánh giá
    if (!rating || rating === 0) {
      return (
        <span className="text-gray-400 text-sm italic">Chưa có đánh giá</span>
      )
    }

    // Hiển thị sao nửa + sao đầy + sao rỗng
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          const fillLevel = rating - i
          return (
            <div key={i} className="relative w-4 h-4">
              {/* Sao rỗng (nền) */}
              <Star className="absolute inset-0 w-4 h-4 fill-gray-200 text-gray-200" />
              {/* Sao đầy hoặc nửa sao */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: fillLevel >= 1 ? '100%' : fillLevel >= 0.5 ? '50%' : '0%'
                }}
              >
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          )
        })}
        <span className="text-sm text-gray-500 ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  // Handle add to cart
  const handleAddToCart = (e, product, isQuickView = false) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if user is logged in
    if (!currentUser) {
      authUtils.saveReturnUrl()
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', {
        action: {
          label: 'Đăng nhập',
          onClick: () => navigate('/login')
        },
        duration: 3000
      })
      return
    }

    const price = product.referencePrice || product.price
    const stockQuantity = product.stockQuantity || 100

    dispatch(addToCartAsync({
      productId: product._id,
      name: product.name,
      price: price,
      image: product.images?.[0],
      quantity: 1,
      stockQuantity: stockQuantity
    }))

    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
      description: isQuickView && selectedVariant ? `Kích thước: ${selectedVariant.size}` : '',
      duration: 2000
    })
  }

  // Quick View handlers
  const openQuickView = (product) => {
    setQuickViewProduct(product)
    setSelectedImageIndex(0)
    setSelectedVariant(product.variants?.[0] || null)
    document.body.style.overflow = 'hidden'
  }

  const closeQuickView = () => {
    setQuickViewProduct(null)
    document.body.style.overflow = 'unset'
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedPriceRange(0)
    setSelectedRating(0)
    setSortBy('newest')
    setSearchParams({})
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    fetchProducts(1)
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedPriceRange > 0 || selectedRating > 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-10 w-64 bg-gray-200 rounded mb-8" />
            <div className="flex gap-8">
              <div className="w-64 hidden lg:block">
                <div className="h-40 bg-gray-200 rounded mb-4" />
                <div className="h-60 bg-gray-200 rounded" />
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i}>
                      <div className="aspect-square bg-gray-200 rounded-2xl mb-3" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-500">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-900">Cửa hàng</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-gray-900">Cửa hàng</h1>
            <p className="text-gray-500 mt-1">
              {sortedProducts.length} sản phẩm
              {hasActiveFilters && ' (đã lọc)'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={cn(
            'w-64 flex-shrink-0',
            showFilters ? 'block' : 'hidden lg:block'
          )}>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg mb-4"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Bộ lọc
            </button>

            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Danh mục</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('')
                      const params = new URLSearchParams(searchParams)
                      params.delete('category')
                      setSearchParams(params)
                    }}
                    className={cn(
                      'block w-full text-left px-3 py-2 rounded-lg transition-colors',
                      !selectedCategory ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    Tất cả
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        setSelectedCategory(category._id)
                        setSearchParams({ category: category._id })
                        setPagination(prev => ({ ...prev, currentPage: 1 }))
                        fetchProducts(1)
                      }}
                      className={cn(
                        'block w-full text-left px-3 py-2 rounded-lg transition-colors',
                        selectedCategory === category._id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Khoảng giá</h3>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedPriceRange(index)
                        setPagination(prev => ({ ...prev, currentPage: 1 }))
                        fetchProducts(1)
                      }}
                      className={cn(
                        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        selectedPriceRange === index
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Đánh giá</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        const newRating = selectedRating === rating ? 0 : rating
                        setSelectedRating(newRating)
                        setPagination(prev => ({ ...prev, currentPage: 1 }))
                        fetchProducts(1)
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg w-full transition-colors',
                        selectedRating === rating
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-4 h-4',
                              i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">trở lên</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    setPagination(prev => ({ ...prev, currentPage: 1 }))
                    fetchProducts(1)
                  }}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products Grid/List */}
            {displayedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className={cn(
                'grid gap-6',
                viewMode === 'grid'
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1'
              )}>
                {displayedProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className={cn(
                      'group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300',
                      viewMode === 'list' && 'flex'
                    )}
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Image */}
                    <div className={cn(
                      'relative overflow-hidden bg-gray-100',
                      viewMode === 'grid' ? 'aspect-square' : 'w-48 h-48 flex-shrink-0'
                    )}>
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/400'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Hover Actions */}
                      <div className={cn(
                        'absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 flex items-center justify-center gap-2',
                        hoveredProduct === product._id && 'opacity-100'
                      )}>
                        <button
                          onClick={(e) => {
                            handleAddToCart(e, product, false)
                          }}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-blue-500 hover:text-white transition-colors shadow-lg"
                          title="Thêm vào giỏ"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            openQuickView(product)
                          }}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-blue-500 hover:text-white transition-colors shadow-lg"
                          title="Xem nhanh"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-blue-500 hover:text-white transition-colors shadow-lg"
                          title="Yêu thích"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Badges */}
                      {product.status === 'inactive' && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                          Hết hàng
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className={cn('p-4', viewMode === 'list' && 'flex-1')}>
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(product.ratingAverage)}
                        {product.ratingAverage > 0 && (
                          <span className="text-xs text-gray-500">
                            ({product.ratingQuantity || 0} đánh giá)
                          </span>
                        )}
                      </div>
                      <p className="text-blue-600 font-semibold">
                        {formatPrice(product.referencePrice || product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page numbers with ellipsis */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                  const showPage = page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.currentPage) <= 1

                  const showEllipsisBefore = page === pagination.currentPage - 2 && page > 2
                  const showEllipsisAfter = page === pagination.currentPage + 2 && page < pagination.totalPages - 1

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <span key={`ellipsis-${page}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
                        ...
                      </span>
                    )
                  }

                  if (!showPage) return null

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${pagination.currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                        }`}
                    >
                      {page}
                    </button>
                  )
                })}

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Results info */}
            {pagination.totalRecords > 0 && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Hiển thị {(pagination.currentPage - 1) * pagination.limit + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} của {pagination.totalRecords} sản phẩm
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeQuickView}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={closeQuickView}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid md:grid-cols-2 gap-8 p-6">
              {/* Images */}
              <div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={quickViewProduct.images?.[selectedImageIndex] || quickViewProduct.image || 'https://via.placeholder.com/400'}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {quickViewProduct.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {quickViewProduct.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                          selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                        )}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
                  {quickViewProduct.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  {renderStars(quickViewProduct.ratingAverage)}
                  {quickViewProduct.ratingAverage > 0 && (
                    <span className="text-sm text-gray-500">
                      ({quickViewProduct.ratingQuantity || 0} đánh giá)
                    </span>
                  )}
                </div>

                {/* Price */}
                <p className="text-3xl text-blue-600 font-bold mb-4">
                  {formatPrice(selectedVariant?.price || quickViewProduct.referencePrice || quickViewProduct.price)}
                </p>

                {/* Variants */}
                {quickViewProduct.variants?.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kích thước
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.variants.map((variant, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedVariant(variant)}
                          className={cn(
                            'px-4 py-2 border rounded-lg transition-colors flex items-center gap-2',
                            selectedVariant?.size === variant.size
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-blue-300'
                          )}
                        >
                          <span>{variant.size}</span>
                          <span className="text-xs opacity-70">{formatPrice(variant.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-600 mb-6 line-clamp-4">
                  {quickViewProduct.description || 'Chưa có mô tả'}
                </p>

                {/* Actions */}
                <div className="flex gap-4 mt-auto">
                  <button
                    onClick={(e) => handleAddToCart(e, quickViewProduct, true)}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ
                  </button>
                  <button className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                {/* Link to detail */}
                <Link
                  to={`/product/${quickViewProduct._id}`}
                  onClick={closeQuickView}
                  className="block text-center mt-4 text-blue-500 hover:text-blue-600 text-sm"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
