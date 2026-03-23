import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send, CheckCircle, Facebook, Instagram, Building2 } from 'lucide-react'
import { createContactAPI } from '~/apis'

export default function Contact() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Vui lòng nhập họ tên'
    } else if (formData.fullname.trim().length < 3) {
      newErrors.fullname = 'Họ tên phải có ít nhất 3 ký tự'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^(0|\+84)[3-9][0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Vui lòng nhập nội dung tin nhắn'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Tin nhắn phải có ít nhất 10 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await createContactAPI(formData)
      setSubmitStatus('success')
      setFormData({ fullname: '', email: '', phone: '', message: '' })
    } catch (error) {
      console.error('Error submitting contact:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Liên hệ với chúng tôi
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-xl">
            Chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn 24/7
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Thông tin liên hệ
              </h2>
              <p className="text-gray-600 mb-8">
                Hãy liên hệ với chúng tôi nếu bạn có câu hỏi về vật liệu xây dựng, báo giá hoặc tư vấn kỹ thuật. Đội ngũ của chúng tôi sẽ phản hồi trong thời gian sớm nhất.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                  <p className="text-gray-600">
                    123 Đường Nguyễn Trãi, Quận 1<br />
                    Thành phố Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Điện thoại</h3>
                  <p className="text-gray-600">
                    +84 123 456 789<br />
                    +84 987 654 321
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-sm flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">
                    contact@pabuild.vn<br />
                    support@pabuild.vn
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-sm flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Giờ mở cửa</h3>
                  <p className="text-gray-600">
                    Thứ 2 - Thứ 6: 8:00 - 20:00<br />
                    Thứ 7 - Chủ nhật: 9:00 - 21:00
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <div className="pt-4">
              <h3 className="font-semibold text-gray-900 mb-4">Kết nối với chúng tôi</h3>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <Facebook className="w-6 h-6 text-blue-600" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center hover:bg-pink-200 transition-colors"
                >
                  <Instagram className="w-6 h-6 text-pink-600" />
                </a>
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors"
                >
                  <span className="text-blue-500 font-bold text-lg">Z</span>
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.319350036788!2d106.62926597485784!3d10.786834792830878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ed2392b7d87%3A0xba1b8e7e1f4e4b4f!2zQ-G6o24gUGhvb20!5e0!3m2!1svi!2s!4v1699999999999!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ"
              />
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Gửi tin nhắn cho chúng tôi
              </h2>

              {/* Status Messages */}
              <AnimatePresence mode="wait">
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800">Gửi tin nhắn thành công!</p>
                      <p className="text-sm text-green-600">Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                    </div>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                  >
                    <p className="font-medium text-red-800">Có lỗi xảy ra!</p>
                    <p className="text-sm text-red-600">Vui lòng thử lại sau hoặc liên hệ trực tiếp qua điện thoại.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="Nhập họ tên của bạn"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.fullname ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                  />
                  {errors.fullname && (
                    <p className="mt-1 text-sm text-red-500">{errors.fullname}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912345678"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung tin nhắn <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung bạn muốn liên hệ..."
                    className={`w-full px-4 py-3 rounded-xl border resize-none ${
                      errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Gửi tin nhắn
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white border-t py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Câu hỏi thường gặp
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Thời gian giao vật liệu đến công trình?
              </h3>
              <p className="text-gray-600 text-sm">
                Chúng tôi giao hàng trong vòng 2-4 giờ nội thành. Các tỉnh thành khác từ 1-3 ngày tùy khoảng cách. Đặc biệt, giao hàng tận công trình theo yêu cầu.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Có giao vật liệu vào ngày lễ, Tết không?
              </h3>
              <p className="text-gray-600 text-sm">
                Có, chúng tôi hỗ trợ giao hàng vào các ngày lễ, Tết với phí phụ thu. Vui lòng liên hệ trước để được tư vấn và sắp xếp.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Làm thế nào để đặt vật liệu xây dựng?
              </h3>
              <p className="text-gray-600 text-sm">
                Bạn có thể đặt trực tiếp trên website, gọi điện thoại hoặc đến trực tiếp cửa hàng. Đội ngũ tư vấn sẽ hỗ trợ bạn chọn vật liệu phù hợp với công trình.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Chính sách bảo hành vật liệu như thế nào?
              </h3>
              <p className="text-gray-600 text-sm">
                Tất cả vật liệu đều có chứng nhận chất lượng. Nếu sản phẩm có vấn đề về chất lượng, vui lòng phản hồi trong vòng 24 giờ để được hỗ trợ đổi trả.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
