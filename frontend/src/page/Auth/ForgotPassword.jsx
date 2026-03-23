import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Mail } from 'lucide-react'
import AuthLayout from '~/components/layout/AuthLayout'

import { publicAxiosInstance } from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

const forgotPasswordAPI = async (email) => {
  const response = await publicAxiosInstance.post(`${API_ROOT}/v1/users/forgot-password`, { email })
  return response.data
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email) {
      setError('Vui lòng nhập email!')
      return
    }

    setIsLoading(true)

    try {
      await forgotPasswordAPI(email)
      setSuccess('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.')
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi email. Vui lòng thử lại.')
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
        Quên mật khẩu?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-gray-500 mb-6 text-center"
      >
        Nhập email để lấy lại mật khẩu
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
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all bg-gray-50/50"
              placeholder="example@email.com"
            />
          </div>
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
              Đang gửi...
            </>
          ) : (
            'Gửi liên kết đặt lại mật khẩu'
          )}
        </button>
      </form>

      {/* Back to login */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6 text-center"
      >
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors inline-flex items-center gap-2">
          ← Quay lại đăng nhập
        </Link>
      </motion.p>
    </AuthLayout>
  )
}
