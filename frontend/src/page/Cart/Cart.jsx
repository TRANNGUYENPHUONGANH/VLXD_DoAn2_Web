import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Tag,
  Check,
  AlertCircle,
  Truck,
  RefreshCw,
  Shield,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { selectCartItems, removeFromCart, updateQuantity, clearCart } from '~/redux/cart/cartSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { getValidCouponsAPI, applyCouponAPI } from '~/apis'
import { cn } from '~/lib/utils'

export default function Cart() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const cartItems = useSelector(selectCartItems)
  const currentUser = useSelector(selectCurrentUser)

  const [coupons, setCoupons] = useState([])
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [loadingCoupons, setLoadingCoupons] = useState(true)
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)

  // Fetch valid coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await getValidCouponsAPI()
        if (response.success) {
          setCoupons(response.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch coupons:', error)
      } finally {
        setLoadingCoupons(false)
      }
    }
    fetchCoupons()
  }, [])

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price)
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const selectedSubtotal = cartItems
    .filter(item => selectedItems.has(item.productId))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const shipping = selectedSubtotal >= 500000 ? 0 : 30000
  const total = Math.max(0, selectedSubtotal - discount + shipping)

  // Handle quantity change
  const handleQuantityChange = (item, delta) => {
    const newQuantity = item.quantity + delta
    if (newQuantity < 1) {
      handleRemove(item)
    } else if (newQuantity <= item.stockQuantity) {
      dispatch(updateQuantity({ productId: item.productId, quantity: newQuantity }))
    } else {
      toast.warning(`Chỉ còn ${item.stockQuantity} sản phẩm trong kho`)
    }
  }

  // Handle remove item
  const handleRemove = (item) => {
    dispatch(removeFromCart({ productId: item.productId }))
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(item.productId)
      return newSet
    })
  }

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return

    setIsApplyingCoupon(true)
    try {
      const response = await applyCouponAPI({
        code: couponInput.trim(),
        totalOrderValue: selectedSubtotal
      })

      if (response.success) {
        setAppliedCoupon({
          code: response.data.code,
          discountAmount: response.data.discountAmount
        })
        toast.success(response.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
  }

  // Handle select item
  const handleSelectItem = (itemKey) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey)
      } else {
        newSet.add(itemKey)
      }
      return newSet
    })
  }

  // Handle select all
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems(new Set())
      setIsAllSelected(false)
    } else {
      const allKeys = cartItems.map(item => item.productId)
      setSelectedItems(new Set(allKeys))
      setIsAllSelected(true)
    }
  }

  // Update isAllSelected when selectedItems changes
  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.size === cartItems.length) {
      setIsAllSelected(true)
    } else {
      setIsAllSelected(false)
    }
  }, [selectedItems, cartItems.length])

  // Handle checkout
  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      toast.warning('Vui lòng chọn sản phẩm để thanh toán')
      return
    }
    navigate('/checkout')
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-blue-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-500">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-900">Giỏ hàng</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Giỏ hàng của bạn
          </h1>
          <span className="text-gray-500">{cartItems.length} sản phẩm</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">Chọn tất cả ({cartItems.length})</span>
              </label>
              <button
                onClick={() => {
                  dispatch(clearCart())
                  setSelectedItems(new Set())
                }}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            {/* Cart Items */}
            {cartItems.map((item) => {
              const itemKey = item.productId
              const isSelected = selectedItems.has(itemKey)
              const isOutOfStock = item.stockQuantity === 0

              return (
                <div
                  key={itemKey}
                  className={cn(
                    "bg-white rounded-xl p-4 md:p-6 shadow-sm transition-all",
                    isSelected && "ring-2 ring-blue-500",
                    isOutOfStock && "opacity-60"
                  )}
                >
                  <div className="flex gap-4 md:gap-6">
                    {/* Checkbox */}
                    <div className="hidden sm:block">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(itemKey)}
                        disabled={isOutOfStock}
                        className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>

                    {/* Image */}
                    <Link to={`/product/${item.productId}`} className="shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/product/${item.productId}`}
                            className="font-medium text-gray-900 hover:text-blue-500 transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => handleRemove(item)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Stock Warning */}
                      {item.quantity > item.stockQuantity && (
                        <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>Chỉ còn {item.stockQuantity} sản phẩm trong kho</span>
                        </div>
                      )}

                      {isOutOfStock && (
                        <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>Sản phẩm đã hết hàng</span>
                        </div>
                      )}

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-semibold text-blue-600">
                            {formatPrice(item.price)}
                          </span>
                          {item.price < item.stockQuantity && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(item.price * 1.2)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item, -1)}
                            disabled={isOutOfStock}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1
                              if (val > 0 && val <= item.stockQuantity) {
                                dispatch(updateQuantity({ productId: item.productId, quantity: val }))
                              }
                            }}
                            disabled={isOutOfStock}
                            className="w-14 h-9 text-center border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <button
                            onClick={() => handleQuantityChange(item, 1)}
                            disabled={isOutOfStock || item.quantity >= item.stockQuantity}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Right Column - Summary & Coupons */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính ({selectedItems.size} sản phẩm)</span>
                  <span className="font-medium">{formatPrice(selectedSubtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({appliedCoupon.code})</span>
                    <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                  </span>
                </div>

                {shipping > 0 && (
                  <p className="text-xs text-gray-400">
                    Miễn phí vận chuyển đơn hàng từ 500.000đ
                  </p>
                )}

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng</span>
                    <span className="text-blue-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedItems.size === 0}
                className="w-full mt-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thanh toán ngay
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/shop"
                className="w-full mt-3 py-3 border border-gray-200 hover:border-blue-500 text-gray-600 hover:text-blue-500 rounded-xl font-medium text-center block transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-500" />
                Mã giảm giá
              </h2>

              {/* Applied Coupon */}
              {appliedCoupon && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-700">{appliedCoupon.code}</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Giảm {formatPrice(appliedCoupon.discountAmount)}
                  </p>
                </div>
              )}

              {/* Coupon Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                  disabled={!!appliedCoupon}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponInput.trim() || !!appliedCoupon}
                  className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplyingCoupon ? '...' : 'Áp dụng'}
                </button>
              </div>

              {/* Available Coupons */}
              {!loadingCoupons && coupons.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-3">Mã giảm giá có sẵn:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon._id}
                        onClick={() => {
                          if (!appliedCoupon) {
                            setCouponInput(coupon.code)
                          }
                        }}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          appliedCoupon
                            ? "border-gray-100 bg-gray-50 opacity-50"
                            : "border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-blue-700">{coupon.code}</span>
                            <p className="text-xs text-gray-500 mt-1">
                              {coupon.discount.type === 'FIXED'
                                ? `Giảm ${formatPrice(coupon.discount.value)}`
                                : `Giảm ${coupon.discount.value}%`
                              }
                              {coupon.discount.maxAmount && coupon.discount.type === 'PERCENTAGE'
                                ? ` (tối đa ${formatPrice(coupon.discount.maxAmount)})`
                                : ''
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">Đơn tối thiểu</span>
                            <p className="text-sm font-medium">{formatPrice(coupon.discount.minOrder)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Policies */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chính sách</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Giao hàng tận nơi</p>
                    <p className="text-xs text-gray-500">Trong 2-4 giờ tại TP.HCM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Đổi trả hoa</p>
                    <p className="text-xs text-gray-500">Trong 24 giờ nếu không hài lòng</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Hoàn tiền 100%</p>
                    <p className="text-xs text-gray-500">Nếu hoa không tươi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
