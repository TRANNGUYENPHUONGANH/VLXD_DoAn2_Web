import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { User, Mail, Phone, MapPin, Camera, Save, ArrowLeft, Lock } from 'lucide-react'
import { selectCurrentUser, updateUser } from '~/redux/user/userSlice'
import { updateUserProfileAPI } from '~/apis'

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)

  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: ''
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    setFormData({
      displayName: currentUser.displayName || '',
      phone: currentUser.phone || '',
      address: currentUser.address || ''
    })
    if (currentUser.avatar) {
      setAvatarPreview(currentUser.avatar)
    }
  }, [currentUser, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      data.append('displayName', formData.displayName)
      data.append('phone', formData.phone)
      data.append('address', formData.address || '')
      if (avatarFile) {
        data.append('avatar', avatarFile)
      }

      const response = await updateUserProfileAPI(data)

      if (response.success) {
        dispatch(updateUser(response.data))
        toast.success('Cập nhật thông tin thành công!')
        navigate('/profile')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error(error.response?.data?.message || 'Cập nhật thông tin thất bại!')
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return null
  }

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

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
              <h1 className="text-2xl font-bold text-white">Thông tin tài khoản</h1>
              <p className="text-blue-100 mt-1">Quản lý thông tin cá nhân của bạn</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold">
                          {currentUser?.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors shadow-md">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Nhấp vào icon camera để thay đổi ảnh đại diện
                  </p>

                  {/* Quick Links */}
                  <div className="mt-6 w-full space-y-2">
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Lock className="w-5 h-5" />
                      <span className="font-medium">Đổi mật khẩu</span>
                    </Link>
                  </div>
                </div>

                {/* Form Section */}
                <div className="flex-1 space-y-6">
                  {/* Email (readonly) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Địa chỉ
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Nhập địa chỉ của bạn"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
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
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
