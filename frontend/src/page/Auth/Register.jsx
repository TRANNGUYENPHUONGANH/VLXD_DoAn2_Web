import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { registerUserAPI } from '~/apis'
import AuthLayout from '~/components/layout/AuthLayout'

export default function Register() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const passwordRequirements = [
    { label: 'Tối thiểu 8 ký tự', valid: formData.password.length >= 8 },
    { label: 'Có chữ cái', valid: /[a-zA-Z]/.test(formData.password) },
    { label: 'Có số', valid: /\d/.test(formData.password) }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Xác nhận mật khẩu không khớp!')
      return
    }

    if (!agreeTerms) {
      setError('Bạn cần đồng ý với điều khoản!')
      return
    }

    const isPasswordValid = passwordRequirements.every(req => req.valid)
    if (!isPasswordValid) {
      setError('Mật khẩu không đáp ứng yêu cầu!')
      return
    }

    setIsLoading(true)

    try {
      await registerUserAPI({
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
      setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="font-serif text-2xl font-semibold text-gray-800 mb-2 text-center"
      >
        Tạo tài khoản
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-gray-500 mb-6 text-center"
      >
        Đăng ký để bắt đầu mua sắm vật liệu xây dựng
      </motion.p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
        >
          {success}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all bg-gray-50/50"
              placeholder="example@email.com"
            />
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
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all bg-gray-50/50"
              placeholder="0123456789"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all bg-gray-50/50 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Password requirements */}
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {req.valid ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-gray-300" />
                  )}
                  <span className={req.valid ? 'text-green-600' : 'text-gray-400'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all bg-gray-50/50 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">Mật khẩu không khớp</p>
            )}
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <a href="#" className="text-blue-600 hover:underline">Điều khoản</a>
              {' '}và{' '}
              <a href="#" className="text-blue-600 hover:underline">Chính sách bảo mật</a>
            </span>
          </label>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang đăng ký...
              </>
            ) : (
              'Đăng ký ngay'
            )}
          </button>
        </form>

        {/* Login link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-center text-gray-600"
        >
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Đăng nhập
          </Link>
        </motion.p>
    </AuthLayout>
  )
}
