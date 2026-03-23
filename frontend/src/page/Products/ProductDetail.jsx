import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  Shield,
  RefreshCw,
  MessageCircle,
  Minus,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { getProductByIdAPI, getProductsAPI, getProductReviewsAPI, createReviewAPI, getMyOrdersAPI } from '~/apis'
import { addToCart, addToCartAsync } from '~/redux/cart/cartSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { authUtils } from '~/utils/authUtils'
import { cn } from '~/lib/utils'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  // State
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHoverRating, setReviewHoverRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewImages, setReviewImages] = useState([])
  const [reviewImagePreviews, setReviewImagePreviews] = useState([])
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [purchasedProducts, setPurchasedProducts] = useState([])
  const [selectedProductToReview, setSelectedProductToReview] = useState(null)

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        const [productRes, productsRes] = await Promise.all([
          getProductByIdAPI(id),
          getProductsAPI()
        ])

        const rawProductData = productRes.data?.product || productRes.data
        const productData = {
          ...rawProductData,
          reviewCount: rawProductData.totalReviews ?? rawProductData.reviewCount ?? 0
        }
        console.log('productData', productData)
        setProduct(productData)

        // Get related products (same category)
        const allProducts = productsRes.data?.products || productsRes.data?.data || []
        const related = allProducts
          .filter(p => p.categoryId === productData?.categoryId && p._id !== id)
          .slice(0, 4)
        setRelatedProducts(related)
      } catch (error) {
        console.error('Error fetching product:', error)
        // Mock data fallback
        setProduct({
          _id: id,
          name: 'Xi măng Hà Tiên PC40',
          image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
          images: [
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
            'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
            'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800',
            'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800'
          ],
          price: 850000,
          referencePrice: 950000,
          description: 'Xi măng Hà Tiên PC40 là loại xi măng poóc lăng hỗn hợp chất lượng cao, phù hợp cho mọi công trình xây dựng dân dụng và công nghiệp. Sản phẩm đạt tiêu chuẩn TCVN 6260:2020.',
          categoryId: '4',
          category: { name: 'Xi măng', slug: 'xi-mang' },
          variants: [
            { _id: 'v1', size: '1 bao (50kg)', price: 85000, stockQuantity: 1000 },
            { _id: 'v2', size: '5 bao', price: 400000, stockQuantity: 500 },
            { _id: 'v3', size: '1 tấn', price: 750000, stockQuantity: 100 }
          ],
          rating: 4.8,
          reviewCount: 24,
          brand: 'Hà Tiên',
          type: 'Xi măng PC40',
          isFavorite: false
        })

        // Mock related products
        setRelatedProducts([
          {
            _id: 'rel1',
            name: 'Sắt thép Việt Nhật',
            image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
            price: 750000,
            rating: 4.5,
            reviewCount: 12
          },
          {
            _id: 'rel2',
            name: 'Gạch đỏ nung',
            image: 'https://images.unsplash.com/photo-1470509037663-253ce784d5aa?w=400',
            price: 650000,
            rating: 4.7,
            reviewCount: 18
          },
          {
            _id: 'rel3',
            name: 'Cát san lấp',
            image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400',
            price: 550000,
            rating: 4.6,
            reviewCount: 8
          },
          {
            _id: 'rel4',
            name: 'Đá dăm 1x2',
            image: 'https://images.unsplash.com/photo-1566928419897-969c2747e0b3?w=400',
            price: 1500000,
            rating: 4.9,
            reviewCount: 15
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
    window.scrollTo(0, 0)
  }, [id])

  // Fetch reviews when product is loaded
  const fetchReviews = async (productId, page = 1) => {
    setIsLoadingReviews(true)
    try {
      console.log('Fetching reviews for product:', productId)
      const response = await getProductReviewsAPI(productId, page, 10)
      console.log('Reviews response:', response)
      // Backend returns status: 'success' not success: true
      if (response.status === 'success' || response.success) {
        setReviews(response.data || [])
        if (response.pagination) {
          setReviewsPagination(response.pagination)
        }
      } else {
        console.warn('Failed to fetch reviews:', response.message)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Fetch reviews when tab is reviews
  useEffect(() => {
    if (activeTab === 'reviews' && product?._id) {
      fetchReviews(product._id, 1)
    }
  }, [activeTab, product?._id])

  // Handle image zoom
  const handleMouseMove = (e) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          const fillLevel = rating - i
          return (
            <div key={i} className="relative w-5 h-5">
              <Star className="absolute inset-0 w-5 h-5 fill-gray-200 text-gray-200" />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: fillLevel >= 1 ? '100%' : fillLevel >= 0.5 ? '50%' : '0%'
                }}
              >
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Fetch purchased products for review
  const fetchPurchasedProducts = async () => {
    if (!currentUser) return
    try {
      const response = await getMyOrdersAPI({ status: 'delivered' })
      const orders = response.data || response || []
      const products = []
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (item.productId === product._id || item.productId === product._id?.toString()) {
            products.push({
              ...item,
              orderId: order._id
            })
          }
        })
      })
      setPurchasedProducts(products)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  // Handle opening review modal
  const handleOpenReviewModal = async () => {
    if (!currentUser) {
      authUtils.saveReturnUrl()
      toast.info('Vui lòng đăng nhập để đánh giá sản phẩm!', {
        action: {
          label: 'Đăng nhập',
          onClick: () => navigate('/login')
        },
        duration: 3000
      })
      return
    }

    await fetchPurchasedProducts()
    setSelectedProductToReview({
      _id: product._id,
      name: product.name,
      image: product.images?.[0] || product.image
    })
    setShowReviewModal(true)
  }

  // Handle review image selection
  const handleReviewImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + reviewImagePreviews.length > 5) {
      toast.warning('Tối đa 5 hình ảnh')
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(`${file.name} vượt quá 5MB`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.warning(`${file.name} không phải hình ảnh`)
        return false
      }
      return true
    })

    const newImages = [...reviewImages, ...validFiles]
    setReviewImages(newImages)

    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setReviewImagePreviews(prev => [...prev, e.target.result])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  // Remove review image
  const removeReviewImage = (index) => {
    const newImages = reviewImages.filter((_, i) => i !== index)
    const newPreviews = reviewImagePreviews.filter((_, i) => i !== index)
    setReviewImages(newImages)
    setReviewImagePreviews(newPreviews)
  }

  // Submit review
  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }
    if (reviewContent.length < 10) {
      toast.error('Nội dung đánh giá phải có ít nhất 10 ký tự')
      return
    }

    // Check if user purchased this product
    if (purchasedProducts.length === 0) {
      toast.error('Bạn cần mua sản phẩm này để đánh giá')
      return
    }

    setIsSubmittingReview(true)
    try {
      const formData = new FormData()
      formData.append('productId', product._id)
      formData.append('orderId', purchasedProducts[0].orderId)
      formData.append('rating', reviewRating)
      formData.append('content', reviewContent)

      reviewImages.forEach(image => {
        formData.append('images', image)
      })

      const response = await createReviewAPI(formData)
      if (response.success || response.message) {
        toast.success('Đánh giá sản phẩm thành công!')
        setShowReviewModal(false)
        setReviewRating(0)
        setReviewContent('')
        setReviewImages([])
        setReviewImagePreviews([])
        fetchReviews(product._id, 1)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error?.response?.data?.message || 'Đánh giá thất bại, vui lòng thử lại')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Close review modal
  const handleCloseReviewModal = () => {
    setShowReviewModal(false)
    setReviewRating(0)
    setReviewContent('')
    setReviewImages([])
    setReviewImagePreviews([])
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return

    // Check if user is logged in
    if (!currentUser) {
      // Save current URL to return after login
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
      quantity: quantity,
      stockQuantity: stockQuantity
    }))

    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
      description: `Số lượng: ${quantity}`,
      duration: 2000
    })
  }

  // Quantity handlers
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    const maxStock = product?.stockQuantity || 100
    if (quantity < maxStock) setQuantity(quantity + 1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Image skeleton */}
              <div className="lg:w-1/2">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
              {/* Info skeleton */}
              <div className="lg:w-1/2">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-20 bg-gray-200 rounded mb-4" />
                <div className="h-12 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
          <Link to="/shop" className="text-blue-500 hover:text-blue-600">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    )
  }

  const currentPrice = product.referencePrice || product.price
  const images = product.images?.length > 0 ? product.images : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-500">Trang chủ</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-blue-500">Cửa hàng</Link>
            <span>/</span>
            {product.category?.name && (
              <>
                <Link to={`/shop?category=${product.categoryId}`} className="hover:text-blue-500">
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-12">
          <div className="flex flex-col lg:flex-row">
            {/* Image Gallery */}
            <div className="lg:w-1/2 p-6">
              {/* Main Image */}
              <div
                className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in mb-4"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{
                    transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                  }}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={`thumb-${index}`}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                        selectedImageIndex === index ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                      )}
                    >
                      <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2 p-6 lg:pl-0">
              {/* Title & Rating */}
              <div className="mb-4">
                <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating || 0)}
                  </div>
                  <span className="text-gray-500">|</span>
                  <button
                    onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-500 hover:text-blue-500"
                  >
                    {product.reviewCount || 0} đánh giá
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-blue-500">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.referencePrice && product.referencePrice > currentPrice && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.referencePrice)}
                    </span>
                  )}
                </div>
                {product.referencePrice && product.referencePrice > currentPrice && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                    Giảm {Math.round((1 - currentPrice / product.referencePrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-gray-600 mb-6">
                {product.description?.substring(0, 200)}...
              </p>

              {/* Đơn vị tính */}
              <div className="mb-6">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Đơn vị:</span>
                  <span className="font-medium text-gray-900">{product.unit || 'KG'}</span>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Số lượng
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= (product?.stockQuantity || 100)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Còn hàng: {product?.stockQuantity || 'Nhiều'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={product?.stockQuantity === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </button>
                <button
                  className="w-14 h-14 flex items-center justify-center border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  className="w-14 h-14 flex items-center justify-center border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Giao hàng nhanh</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Bảo hành tươi</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Đổi trả 24h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-12">
          {/* Tab Headers */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={cn(
                  'px-6 py-4 font-medium transition-colors relative',
                  activeTab === 'description' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Mô tả
                {activeTab === 'description' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={cn(
                  'px-6 py-4 font-medium transition-colors relative',
                  activeTab === 'details' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Thông tin chi tiết
                {activeTab === 'details' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={cn(
                  'px-6 py-4 font-medium transition-colors relative',
                  activeTab === 'specs' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Thông số kỹ thuật
                {activeTab === 'specs' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={cn(
                  'px-6 py-4 font-medium transition-colors relative',
                  activeTab === 'reviews' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Đánh giá ({product.totalReviews ?? product.reviewCount ?? 0})
                {activeTab === 'reviews' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Về sản phẩm</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {product.description || 'Vật liệu xây dựng chất lượng cao, đáp ứng tiêu chuẩn Việt Nam. Sản phẩm được kiểm tra chất lượng nghiêm ngặt trước khi đến tay khách hàng.'}
                </p>
              </div>
            )}

            {activeTab === 'details' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Thông tin chi tiết</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Danh mục</span>
                    <span className="font-medium">{product.category?.title || 'Vật liệu xây dựng'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Xuất xứ</span>
                    <span className="font-medium">{product.origin || 'Việt Nam'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Chứng nhận</span>
                    <span className="font-medium">{product.certification || 'Tiêu chuẩn QCVN'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Đơn vị tính</span>
                    <span className="font-medium">{product.unit || 'KG'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Thông số kỹ thuật</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm">
                    {product.specifications || 'Chưa có thông số kỹ thuật'}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div id="reviews">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Đánh giá sản phẩm</h3>
                  <button
                    onClick={handleOpenReviewModal}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Viết đánh giá
                  </button>
                </div>

                {/* Rating Summary */}
                <div className="flex items-center gap-8 p-6 bg-gray-50 rounded-xl mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-500">{product.ratingAverage?.toFixed(1) || product.rating?.toFixed(1) || '0'}</div>
                    <div className="flex justify-center my-2">{renderStars(product.ratingAverage || product.rating || 0)}</div>
                    <div className="text-sm text-gray-500">{reviewsPagination.total || product.totalReviews || product.reviewCount || 0} đánh giá</div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(r => r.rating === star).length
                      const percentage = reviewsPagination.total > 0 ? Math.round((count / reviewsPagination.total) * 100) : 0
                      return (
                        <div key={star} className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500 w-3">{star}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-8">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                {isLoadingReviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
                    <p className="text-gray-500 mt-2">Đang tải đánh giá...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review, index) => (
                      <div key={review._id || index} className="p-4 border-b last:border-0">
                        <div className="flex items-start gap-4">
                          {review.user?.avatar ? (
                            <img
                              src={review.user.avatar}
                              alt={review.user?.name || 'User'}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-500 font-medium text-sm">
                                {review.user?.displayName?.[0] || review.user?.name?.[0] || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.user?.displayName || review.user?.name || 'Người dùng'}</span>
                              <span className="text-gray-400">|</span>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'w-4 h-4',
                                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-gray-600">{review.content}</p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {review.images.map((img, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={img}
                                    alt={`Review image ${imgIndex + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                ))}
                              </div>
                            )}
                            {review.adminReply && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700">Phản hồi từ shop:</p>
                                <p className="text-sm text-gray-600">{review.adminReply.content}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                    <p className="text-sm mt-1">Hãy là người đầu tiên đánh giá!</p>
                  </div>
                )}

                {/* Load More Reviews */}
                {reviewsPagination.totalPages > 1 && reviewsPagination.page < reviewsPagination.totalPages && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => fetchReviews(product._id, reviewsPagination.page + 1)}
                      disabled={isLoadingReviews}
                      className="px-6 py-2 border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50"
                    >
                      {isLoadingReviews ? 'Đang tải...' : 'Xem thêm đánh giá'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-6">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-500 font-semibold">
                        {formatPrice(product.referencePrice || product.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-500">
                          {product.rating?.toFixed(1) || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseReviewModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Đánh giá sản phẩm</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedProductToReview?.name}</p>
              </div>
              <button
                onClick={handleCloseReviewModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div className="flex items-start gap-4">
                <img
                  src={selectedProductToReview?.image}
                  alt={selectedProductToReview?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedProductToReview?.name}</p>
                  <p className="text-sm text-gray-500 mt-1">Sản phẩm đã mua</p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá của bạn
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHoverRating(star)}
                      onMouseLeave={() => setReviewHoverRating(0)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={cn(
                          'w-8 h-8 transition-colors',
                          star <= (reviewHoverRating || reviewRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {reviewRating > 0 ? `${reviewRating}/5 sao` : 'Chọn số sao'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung đánh giá
                </label>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  className="w-full min-h-[120px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {reviewContent.length}/1000 ký tự
                </p>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh (tùy chọn)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {reviewImagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeReviewImage(index)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {reviewImagePreviews.length < 5 && (
                    <button
                      onClick={() => document.getElementById('review-image-input').click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                    </button>
                  )}
                </div>
                <input
                  id="review-image-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleReviewImageSelect}
                />
                <p className="text-xs text-gray-500 mt-1">Tối đa 5 hình ảnh, mỗi hình tối đa 5MB</p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingReview && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
