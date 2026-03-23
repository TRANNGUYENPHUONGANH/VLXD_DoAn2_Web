import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { selectCartItems, removeFromCart, updateQuantity } from '~/redux/cart/cartSlice'
import { cn } from '~/lib/utils'

export default function CartDropdown({ isOpen, onClose, className = '' }) {
  const cartItems = useSelector(selectCartItems)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleQuantityChange = (item, delta) => {
    const newQuantity = item.quantity + delta
    if (newQuantity < 1) {
      dispatch(removeFromCart({ productId: item.productId }))
    } else {
      dispatch(updateQuantity({ productId: item.productId, quantity: newQuantity }))
    }
  }

  const handleRemove = (item) => {
    dispatch(removeFromCart({ productId: item.productId }))
  }

  const handleCheckout = () => {
    onClose()
    navigate('/cart')
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-50',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-blue-500" />
          Giỏ hàng ({itemCount})
        </h3>
      </div>

      {/* Cart Items */}
      <div className="max-h-80 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Giỏ hàng trống</p>
            <Link
              to="/products"
              onClick={onClose}
              className="text-blue-500 text-sm hover:underline mt-2 inline-block"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.productId}
              className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50"
            >
              <div className="flex gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-blue-600 font-medium">
                      {formatPrice(item.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Tổng cộng:</span>
            <span className="text-lg font-semibold text-blue-600">
              {formatPrice(subtotal)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            Xem giỏ hàng
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
