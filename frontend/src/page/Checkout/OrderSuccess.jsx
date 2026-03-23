import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { CheckCircle, Package, ArrowRight, Home, FileText, MapPin, Truck, CreditCard, AlertCircle } from 'lucide-react'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { getOrderByIdAPI } from '~/apis'

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const orderFromState = location.state?.order

  const [orderFromStorage, setOrderFromStorage] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchOrderFromPayment = async () => {
      const queryParams = new URLSearchParams(location.search)
      const vnpResponseCode = queryParams.get('vnp_ResponseCode')
      const momoResultCode = queryParams.get('resultCode')
      const paymentStatus = queryParams.get('payment')

      // Handle redirect from payment gateway with query param
      if (paymentStatus === 'success' || paymentStatus === 'failed' || paymentStatus === 'error') {
        const savedOrder = localStorage.getItem('pendingOrder')
        if (savedOrder) {
          try {
            const parsedOrder = JSON.parse(savedOrder)
            setLoading(true)
            // Fetch latest order from API to get updated payment status
            const response = await getOrderByIdAPI(parsedOrder._id)
            if (response.data) {
              setOrderFromStorage(response.data)
              localStorage.removeItem('pendingOrder')

              if (paymentStatus === 'success') {
                toast.success('Thanh toán thành công!')
              } else if (paymentStatus === 'failed') {
                toast.error('Thanh toán thất bại. Vui lòng thử lại!')
              } else {
                toast.error('Đã xảy ra lỗi khi thanh toán!')
              }
            }
          } catch (error) {
            console.error('Error fetching order:', error)
            const parsedOrder = JSON.parse(savedOrder)
            setOrderFromStorage(parsedOrder)
            localStorage.removeItem('pendingOrder')
          } finally {
            setLoading(false)
          }
        }
      } else if (vnpResponseCode !== null || momoResultCode !== null) {
        const savedOrder = localStorage.getItem('pendingOrder')
        if (savedOrder) {
          try {
            const parsedOrder = JSON.parse(savedOrder)
            setLoading(true)
            const response = await getOrderByIdAPI(parsedOrder._id)
            if (response.data) {
              setOrderFromStorage(response.data)
              localStorage.removeItem('pendingOrder')

              if (vnpResponseCode === '00' || momoResultCode === '0') {
                toast.success('Thanh toán thành công!')
              } else if (vnpResponseCode === '24' || momoResultCode === '1006') {
                toast.error('Bạn đã hủy thanh toán')
              } else {
                toast.error('Thanh toán thất bại. Vui lòng thử lại!')
              }
            }
          } catch (error) {
            console.error('Error fetching order:', error)
            const parsedOrder = JSON.parse(savedOrder)
            setOrderFromStorage(parsedOrder)
            localStorage.removeItem('pendingOrder')
          } finally {
            setLoading(false)
          }
        }
      } else if (!orderFromState) {
        const savedOrder = localStorage.getItem('pendingOrder')
        if (savedOrder) {
          try {
            const parsedOrder = JSON.parse(savedOrder)
            setOrderFromStorage(parsedOrder)
            localStorage.removeItem('pendingOrder')
          } catch (e) {
            console.error('Error parsing saved order:', e)
          }
        }
      }
    }

    fetchOrderFromPayment()
  }, [location.search, orderFromState])

  const displayOrder = orderFromState || orderFromStorage

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Package className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Đang xử lý thanh toán...</h2>
          <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  if (!displayOrder) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-500 mb-6">Vui lòng kiểm tra lịch sử đơn hàng của bạn</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'COD': return 'Thanh toán khi nhận hàng (COD)'
      case 'VNPAY': return 'VNPAY'
      case 'MOMO': return 'MoMo'
      default: return method
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận'
      case 'CONFIRMED': return 'Đã xác nhận'
      case 'ARRANGING_FLOWERS': return 'Đang soạn hoa'
      case 'SHIPPING': return 'Đang giao hàng'
      case 'DELIVERED': return 'Đã giao hàng'
      case 'CANCELLED': return 'Đã hủy'
      default: return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700'
      case 'ARRANGING_FLOWERS': return 'bg-purple-100 text-purple-700'
      case 'SHIPPING': return 'bg-orange-100 text-orange-700'
      case 'DELIVERED': return 'bg-green-100 text-green-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-500">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {/* Order ID & Status */}
          <div className="bg-gray-50 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mã đơn hàng</p>
              <p className="font-semibold text-lg">#{displayOrder._id?.slice(-8).toUpperCase()}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(displayOrder.status)}`}>
              {getStatusLabel(displayOrder.status)}
            </span>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-6">
            {/* Payment Info */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                <p className="font-medium">{getPaymentMethodLabel(displayOrder.payment?.method)}</p>
                {displayOrder.payment?.status === 'PAID' && (
                  <p className="text-sm text-green-600 mt-1">Thanh toán thành công</p>
                )}
                {displayOrder.payment?.status === 'PENDING' && displayOrder.payment?.method === 'COD' && (
                  <p className="text-sm text-orange-600 mt-1">Chờ thanh toán</p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                <p className="font-medium">{displayOrder.receiverAddress?.fullname} - {displayOrder.receiverAddress?.phone}</p>
                <p className="text-gray-600 text-sm">
                  {displayOrder.receiverAddress?.address}, {displayOrder.receiverAddress?.ward}, {displayOrder.receiverAddress?.district}, {displayOrder.receiverAddress?.province}
                </p>
              </div>
            </div>

            {/* Delivery Time */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Thời gian giao hàng</p>
                <p className="font-medium">
                  {displayOrder.deliveryInfo?.deliveryDate && new Date(displayOrder.deliveryInfo.deliveryDate).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600 text-sm">{displayOrder.deliveryInfo?.deliveryTimeSlot}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-3">Sản phẩm đã đặt</p>
              <div className="space-y-3">
                {displayOrder.items?.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=100'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-gray-500 text-sm">Size: {item.size} | SL: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(displayOrder.totalProductPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{displayOrder.shippingFee === 0 ? 'Miễn phí' : formatPrice(displayOrder.shippingFee)}</span>
              </div>
              {displayOrder.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(displayOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{formatPrice(displayOrder.finalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note for COD */}
        {displayOrder.payment?.method === 'COD' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Lưu ý:</strong> Đơn hàng của bạn sẽ được xác nhận và giao hàng sau khi admin kiểm tra. Bạn vui lòng chờ nhé!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Xem đơn hàng
          </button>
        </div>

        {/* Contact Support */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Nếu có thắc mắc, vui lòng liên hệ <a href="/contact" className="text-blue-600 hover:underline">hotline</a> để được hỗ trợ.
        </p>
      </div>
    </div>
  )
}
