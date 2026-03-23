import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'
import AuthLayout from '~/components/layout/AuthLayout'

import { publicAxiosInstance } from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

const resetPasswordAPI = async (data) => {
  const response = await publicAxiosInstance.post(`${API_ROOT}/v1/users/reset-password`, data)
  return response.data
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email')
  const resetToken = searchParams.get('token')

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const passwordRequirements = [
    { label: 'Tối thiểu 8 ký tự', valid: formData.newPassword.length >= 8 },
    { label: 'Có chữ cái', valid: /[a-zA-Z]/.test(formData.newPassword) },
    { label: 'Có số', valid: /\d/.test(formData.newPassword) }
  ]

  useEffect(() => {
    if (!email || !resetToken) {
      setStatus('error')
      setMessage('Liên kết đặt lại mật khẩu không hợp lệ.')
    }
  }, [email, resetToken])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !resetToken) {
      setStatus('error')
      setMessage('Liên kết đặt lại mật khẩu không hợp lệ.')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Xác nhận mật khẩu không khớp!')
      return
    }

    const isPasswordValid = passwordRequirements.every(req => req.valid)
    if (!isPasswordValid) {
      setMessage('Mật khẩu không đáp ứng yêu cầu!')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      await resetPasswordAPI({
        email,
        resetToken,
        newPassword: formData.newPassword
      })
      setStatus('success')
      setMessage('Đặt lại mật khẩu thành công!')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'error' && !email) {
    return (
      <AuthLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-4"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-gray-800 mb-2">
            Liên kết không hợp lệ
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {message}
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            Yêu cầu liên kết mới
          </Link>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-4"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-gray-800 mb-2">
            Đặt lại mật khẩu thành công!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {message} Đang chuyển hướng đến trang đăng nhập...
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            Đăng nhập ngay
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-serif text-2xl font-semibold text-gray-800 mb-2 text-center"
          >
            Đặt lại mật khẩu
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-500 mb-6 text-center"
          >
            Nhập mật khẩu mới cho tài khoản của bạn
          </motion.p>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-lg text-sm ${
                status === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-600'
                  : 'bg-green-50 border border-green-200 text-green-600'
              }`}
            >
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
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
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
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
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Mật khẩu không khớp</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
