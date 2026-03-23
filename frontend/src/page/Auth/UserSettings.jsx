import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Lock, Eye, EyeOff, Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { changePasswordAPI } from '~/apis'

export default function Settings() {
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      const response = await changePasswordAPI({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })

      if (response.success) {
        toast.success('Đổi mật khẩu thành công!')
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error('Change password error:', error)
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const passwordRequirements = [
    { met: formData.newPassword.length >= 6, text: 'Ít nhất 6 ký tự' },
    { met: formData.newPassword !== formData.currentPassword, text: 'Khác mật khẩu hiện tại' },
    { met: formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '', text: 'Mật khẩu khớp' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
              <h1 className="text-2xl font-bold text-white">Cài đặt tài khoản</h1>
              <p className="text-blue-100 mt-1">Quản lý mật khẩu và bảo mật</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.newPassword}
                  </p>
                )}

                {/* Password Requirements */}
                {formData.newPassword && (
                  <div className="mt-3 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <p
                        key={index}
                        className={`text-sm flex items-center gap-2 ${
                          req.met ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {req.met ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {req.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Đổi mật khẩu
                    </>
                  )}
                </button>

                <Link
                  to="/profile"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </Link>
              </div>
            </form>
          </div>

          {/* Quick Links */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Liên kết nhanh</h2>
            <div className="space-y-2">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Thông tin tài khoản</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
