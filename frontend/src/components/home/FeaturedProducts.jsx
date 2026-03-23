import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ShoppingCart, Heart, Eye, Star, ArrowRight } from 'lucide-react'
import { getProductsAPI } from '~/apis'
import { addToCart, addToCartAsync } from '~/redux/cart/cartSlice'
import { cn } from '~/lib/utils'

export default function FeaturedProducts({ className = '' }) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProductsAPI()
        // API trả về { success, message, data: { products, total, page, limit } }
        const productsData = response.data?.products || response.data?.data || response.data || []
        const allProducts = Array.isArray(productsData) ? productsData : []
        setProducts(allProducts.slice(0, 8))
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()

    dispatch(addToCartAsync({
      productId: product._id,
      name: product.name,
      price: product.referencePrice || product.price,
      image: product.thumbnail || product.images?.[0],
      quantity: 1,
      stockQuantity: product.stockQuantity || 100
    }))
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price)
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={cn(
          'w-3.5 h-3.5',
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        )}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className={cn('py-12', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse mb-3" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900">
            Sản phẩm nổi bật
          </h2>
          <Link
            to="/shop"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.slice(0, 8).map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="group"
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Card */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                  {/* Product Image */}
                  <img
                    src={product.thumbnail || product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Hover Actions */}
                  <div className={cn(
                    'absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 flex items-center justify-center gap-2',
                    hoveredProduct === product._id && 'opacity-100'
                  )}>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-blue-500 hover:text-white transition-colors shadow-lg"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-blue-500 hover:text-white transition-colors shadow-lg">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(product.rating || 4.5)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({product.ratingQuantity || 0})
                    </span>
                  </div>
                  <p className="text-blue-600 font-semibold">
                    {formatPrice(product.price || product.referencePrice)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              Chưa có sản phẩm nào
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
