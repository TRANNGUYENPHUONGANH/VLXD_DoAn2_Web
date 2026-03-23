import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginUserAPI } from '~/redux/user/userSlice'
import AuthLayout from '~/components/layout/AuthLayout'

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await dispatch(loginUserAPI(formData)).unwrap()
      if (result.success) {
        // Check if user is admin from the result
        const userRole = result.data?.role
        console.log(userRole)
        if (userRole === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      setError(err || 'Đăng nhập thất bại. Vui lòng thử lại.')
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
        Chào mừng trở lại!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-gray-500 mb-6 text-center"
      >
        Đăng nhập để tiếp tục mua sắm
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all bg-gray-50/50 pr-12"
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
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Quên mật khẩu?
          </Link>
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
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      {/* Register link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6 text-center text-gray-600"
      >
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
          Đăng ký ngay
        </Link>
      </motion.p>
    </AuthLayout>
  )
}
