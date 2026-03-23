import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  ShoppingCart,
  CreditCard,
  User,
  MapPin,
  Package,
  Check,
  ArrowLeft,
  ArrowRight,
  QrCode,
  Copy,
  CopyCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '~/lib/utils'
import { selectCartItems, clearCart } from '~/redux/cart/cartSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { createOrderAPI, getCartAPI, getProvincesAPI, getDistrictsAPI, getWardsAPI, getValidCouponsAPI, applyCouponAPI } from '~/apis'

// Payment methods
const PAYMENT_METHODS = [
  { id: 'COD', label: 'Tiền mặt (COD)', icon: CreditCard, desc: 'Thanh toán khi nhận hàng' },
  { id: 'MOMO', label: 'MoMo', icon: QrCode, desc: 'Quét mã QR MoMo' },
  { id: 'VNPAY', label: 'VNPay', icon: CreditCard, desc: 'Thanh toán qua VNPay' }
]

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const [cartItems, setCartItems] = useState([])
  const [loadingCart, setLoadingCart] = useState(true)

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState({})
  const [wards, setWards] = useState({})
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [coupons, setCoupons] = useState([])
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [loadingCoupons, setLoadingCoupons] = useState(true)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')

  // Constants
  const FREE_SHIP_THRESHOLD = 500000
  const DEFAULT_SHIPPING_FEE = 30000

  // Load cart from API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCartAPI()
        if (response.success && response.data) {
          const items = response.data.items || []
          // Lọc bỏ sản phẩm không hợp lệ
          const validItems = items.filter(item => item.productId && item.isActive !== 'inactive')
          console.log(validItems)
          setCartItems(validItems)
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
      } finally {
        setLoadingCart(false)
      }
    }
    fetchCart()
  }, [])

  // Load provinces from API
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await getProvincesAPI()
        if (response.success) {
          setProvinces(response.data)
        }
      } catch (error) {
        console.error('Error fetching provinces:', error)
      } finally {
        setLoadingLocations(false)
      }
    }
    fetchProvinces()
  }, [])

  // Load valid coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await getValidCouponsAPI()
        console.log(response)
        if (response.success) {
          setCoupons(response.data || [])
        }
      } catch (error) {
        console.error('Error fetching coupons:', error)
      } finally {
        setLoadingCoupons(false)
      }
    }
    fetchCoupons()
  }, [])

  // Form state
  const [formData, setFormData] = useState({
    // Receiver info
    receiverFullname: '',
    receiverPhone: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    paymentMethod: 'COD'
  })

  const [errors, setErrors] = useState({})

  // Load user data if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        receiverFullname: currentUser.fullname || '',
        receiverPhone: currentUser.phone || ''
      }))
    }
  }, [currentUser])

  // Filter districts by province
  const availableDistricts = formData.province ? districts[formData.province] || [] : []

  // Filter wards by district
  const availableWards = formData.district ? wards[formData.district] || [] : []

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
  const shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE
  const discount = couponDiscount
  const total = Math.max(0, subtotal + shippingFee - discount)

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle province change
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value
    setFormData(prev => ({
      ...prev,
      province: provinceCode,
      district: '', // Reset district
      ward: '' // Reset ward
    }))
    if (errors.province) {
      setErrors(prev => ({ ...prev, province: '' }))
    }

    // Fetch districts for selected province
    if (provinceCode && !districts[provinceCode]) {
      try {
        const response = await getDistrictsAPI(provinceCode)
        if (response.success) {
          setDistricts(prev => ({
            ...prev,
            [provinceCode]: response.data
          }))
        }
      } catch (error) {
        console.error('Error fetching districts:', error)
      }
    }
  }

  // Handle district change
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value
    setFormData(prev => ({
      ...prev,
      district: districtCode,
      ward: '' // Reset ward
    }))
    if (errors.district) {
      setErrors(prev => ({ ...prev, district: '' }))
    }

    // Fetch wards for selected district
    if (districtCode && !wards[districtCode]) {
      try {
        const response = await getWardsAPI(districtCode)
        if (response.success) {
          setWards(prev => ({
            ...prev,
            [districtCode]: response.data
          }))
        }
      } catch (error) {
        console.error('Error fetching wards:', error)
      }
    }
  }

  // Handle apply coupon
  const handleApplyCoupon = async (couponCode) => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã coupon')
      return
    }

    try {
      setCouponError('')
      const response = await applyCouponAPI({
        code: couponCode,
        totalOrderValue: subtotal
      })

      if (response.success) {
        const couponData = response.data
        // Backend đã tính sẵn discountAmount
        const discountAmount = Number(couponData.discountAmount) || 0

        setCouponDiscount(discountAmount)
        setSelectedCoupon({
          ...couponData,
          discountAmount
        })
        toast.success('Áp dụng coupon thành công!')
      } else {
        setCouponError(response.message || 'Coupon không hợp lệ')
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Coupon không hợp lệ hoặc đã hết hạn')
    }
  }

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    setSelectedCoupon(null)
    setCouponDiscount(0)
  }

  // Get province/district/ward names for order
  const getProvinceName = () => {
    return provinces.find(p => String(p.code) === String(formData.province))?.name || ''
  }

  const getDistrictName = () => {
    return availableDistricts.find(d => String(d.code) === String(formData.district))?.name || ''
  }

  const getWardName = () => {
    return availableWards.find(w => String(w.code) === String(formData.ward))?.name || ''
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    // Receiver validation
    if (!formData.receiverFullname.trim()) {
      newErrors.receiverFullname = 'Vui lòng nhập họ tên người nhận'
    }
    if (!formData.receiverPhone.trim()) {
      newErrors.receiverPhone = 'Vui lòng nhập số điện thoại'
    } else if (!/^0[0-9]{9}$/.test(formData.receiverPhone)) {
      newErrors.receiverPhone = 'Số điện thoại không hợp lệ'
    }

    // Address validation
    if (!formData.province) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố'
    }
    if (!formData.district) {
      newErrors.district = 'Vui lòng chọn quận/huyện'
    }
    if (!formData.ward) {
      newErrors.ward = 'Vui lòng chọn xã/phường'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ chi tiết'
    }

    // Additional validation - ensure values are not empty strings
    if (formData.province && !getProvinceName().trim()) {
      newErrors.province = 'Vui lòng chờ tải địa chỉ hoặc chọn lại tỉnh/thành phố'
    }
    if (formData.district && !getDistrictName().trim()) {
      newErrors.district = 'Vui lòng chờ tải địa chỉ hoặc chọn lại quận/huyện'
    }
    if (formData.ward && !getWardName().trim()) {
      newErrors.ward = 'Vui lòng chờ tải địa chỉ hoặc chọn lại xã/phường'
    }

    // Prevent submit if any address fields are empty strings
    if (!getProvinceName().trim()) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố'
    }
    if (!getDistrictName().trim()) {
      newErrors.district = 'Vui lòng chọn quận/huyện'
    }
    if (!getWardName().trim()) {
      newErrors.ward = 'Vui lòng chọn xã/phường'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit order
  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      setStep(1)
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setIsSubmitting(true)

    try {
      // Ensure we have valid data before sending
      const provinceName = getProvinceName()
      const districtName = getDistrictName()
      const wardName = getWardName()

      // Additional check: if names are empty, show error
      if (!provinceName || !provinceName.trim()) {
        toast.error('Vui lòng chọn lại địa chỉ')
        setIsSubmitting(false)
        return
      }
      if (!districtName || !districtName.trim()) {
        toast.error('Vui lòng chọn lại địa chỉ')
        setIsSubmitting(false)
        return
      }
      if (!wardName || !wardName.trim()) {
        toast.error('Vui lòng chọn lại địa chỉ')
        setIsSubmitting(false)
        return
      }

      const orderData = {
        receiverAddress: {
          fullname: formData.receiverFullname,
          phone: formData.receiverPhone,
          province: provinceName,
          district: districtName,
          ward: wardName,
          address: formData.address
        },
        paymentMethod: formData.paymentMethod,
        shippingFee,
        totalProductPrice: subtotal,
        discount: couponDiscount,
        couponCode: selectedCoupon?.code || null,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      }

      const response = await createOrderAPI(orderData)

      if (response.success) {
        setOrderResult(response.data)
        dispatch(clearCart())
        setStep(2)

        // If payment URL exists (Momo/VNPay), save order to localStorage for success page
        if (response.data.paymentUrl) {
          localStorage.setItem('pendingOrder', JSON.stringify(response.data.order))
          window.location.href = response.data.paymentUrl
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Copy order code
  const copyOrderCode = () => {
    if (orderResult?.order?._id) {
      navigator.clipboard.writeText(orderResult.order._id)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  // Empty cart - redirect to shop
  if (loadingCart) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-blue-300 animate-pulse" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Đang tải giỏ hàng...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0 && !orderResult) {
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

  // Order success step
  if (step === 2 && orderResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {orderResult.paymentUrl ? 'Đang chuyển thanh toán...' : 'Đặt hàng thành công!'}
            </h2>
            <p className="text-gray-500 mb-6">
              {orderResult.paymentUrl
                ? 'Vui lòng hoàn tất thanh toán trong 15 phút'
                : 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ sớm nhất!'
              }
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-medium text-lg">{orderResult.order?._id}</span>
                <button
                  onClick={copyOrderCode}
                  className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  {copiedCode ? <CopyCheck className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tổng tiền:</span>
                <span className="font-semibold text-blue-600">{formatPrice(orderResult.order?.finalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phương thức:</span>
                <span className="font-medium">
                  {orderResult.order?.payment?.method === 'COD' && 'Tiền mặt (COD)'}
                  {orderResult.order?.payment?.method === 'MOMO' && 'MoMo'}
                  {orderResult.order?.payment?.method === 'VNPAY' && 'VNPay'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Link
                to="/"
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                Về trang chủ
              </Link>
              <Link
                to="/shop"
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-blue-500">Trang chủ</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-blue-500">Giỏ hàng</Link>
            <span>/</span>
            <span className="text-gray-900">Thanh toán</span>
          </nav>

          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-medium",
                step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
              )}>
                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className={cn(
                "ml-2 font-medium",
                step >= 1 ? "text-gray-900" : "text-gray-500"
              )}>
                Thông tin giao hàng
              </span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200 mx-4">
              <div className={cn("h-full bg-blue-500 transition-all", step >= 2 ? "w-full" : "w-0")} />
            </div>
            <div className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-medium",
                step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
              )}>
                2
              </div>
              <span className={cn(
                "ml-2 font-medium",
                step >= 2 ? "text-gray-900" : "text-gray-500"
              )}>
                Xác nhận
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Thông tin thanh toán
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="receiverFullname"
                      value={formData.receiverFullname}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên người nhận"
                      className={cn(
                        "w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 transition-all",
                        errors.receiverFullname
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"
                      )}
                    />
                    {errors.receiverFullname && (
                      <p className="text-red-500 text-sm mt-1">{errors.receiverFullname}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="receiverPhone"
                      value={formData.receiverPhone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                      className={cn(
                        "w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 transition-all",
                        errors.receiverPhone
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"
                      )}
                    />
                    {errors.receiverPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.receiverPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Địa chỉ giao hàng
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleProvinceChange}
                      disabled={loadingLocations}
                      className={cn(
                        "w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 transition-all bg-white disabled:bg-gray-100",
                        errors.province
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"
                      )}
                    >
                      <option value="">
                        {loadingLocations ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                      </option>
                      {provinces.map(province => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleDistrictChange}
                      disabled={!formData.province}
                      className={cn(
                        "w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 transition-all bg-white disabled:bg-gray-100",
                        errors.district
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"
                      )}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {availableDistricts.map(district => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Xã/Phường <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      disabled={!formData.district}
                      className={cn(
                        "w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 transition-all bg-white disabled:bg-gray-100",
                        errors.ward
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"
                      )}
                    >
                      <option value="">Chọn xã/phường</option>
                      {availableWards.map(ward => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                    {errors.ward && (
                      <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, phường/xã..."
                    className={cn(
                      "w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 transition-all",
                      errors.address
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"
                    )}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  Phương thức thanh toán
                </h3>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(method => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all",
                        formData.paymentMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-500 focus:ring-blue-500"
                      />
                      <method.icon className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{method.label}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  Tóm tắt đơn hàng
                </h3>

                <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <img
                        src={item.image || 'https://via.placeholder.com/80'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">x{item.quantity}</span>
                          <span className="font-medium text-blue-600 text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Mã giảm giá</span>
                    <button
                      onClick={() => document.getElementById('coupon-modal')?.showModal()}
                      className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Chọn coupon
                    </button>
                  </div>

                  {selectedCoupon ? (
                    <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                      <div>
                        <span className="text-sm font-medium text-blue-600">{selectedCoupon.code}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          (-{formatPrice(selectedCoupon.discountAmount)})
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="coupon-input"
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-400"
                      />
                      <button
                        onClick={() => {
                          const code = document.getElementById('coupon-input')?.value
                          handleApplyCoupon(code)
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Áp dụng
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-red-500 text-xs mt-1">{couponError}</p>
                  )}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá</span>
                      <span className="font-medium text-green-600">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  {shippingFee > 0 && (
                    <p className="text-xs text-gray-400">
                      Miễn phí vận chuyển đơn hàng từ 500.000đ
                    </p>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Tổng cộng</span>
                      <span className="text-xl font-semibold text-blue-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full mt-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Đặt hàng
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="w-full mt-3 py-3 border border-gray-200 hover:border-blue-500 text-gray-600 hover:text-blue-500 rounded-xl font-medium text-center block transition-colors"
                >
                  Quay lại giỏ hàng
                </Link>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-medium text-gray-900 mb-3">Chính sách</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    Giao hàng tận nơi trong 2-4 giờ
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    Đổi trả hoa trong 24 giờ nếu không hài lòng
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    Hoàn tiền 100% nếu hoa không tươi
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Modal */}
      <dialog id="coupon-modal" className="modal">
        <div className="modal-box p-6 rounded-2xl max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Chọn mã giảm giá</h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost">✕</button>
            </form>
          </div>

          {loadingCoupons ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không có mã giảm giá nào</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedCoupon?._id === coupon._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                  onClick={() => {
                    handleApplyCoupon(coupon.code)
                    document.getElementById('coupon-modal')?.close()
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded">
                        {coupon.code}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {coupon.discount.type === 'percentage'
                          ? `Giảm ${coupon.discount.value}%`
                          : `Giảm ${formatPrice(coupon.discount.value)}`}
                        {coupon.discount.maxAmount && ` (tối đa ${formatPrice(coupon.discount.maxAmount)})`}
                      </p>
                      {coupon.discount.minOrder > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Đơn tối thiểu {formatPrice(coupon.discount.minOrder)}
                        </p>
                      )}
                    </div>
                    {selectedCoupon?.code === coupon.code && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}