import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Lock,
  Camera,
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Loader2
} from 'lucide-react'
import { selectCurrentUser, updateUserAPI } from '~/redux/user/userSlice'
import { changePasswordAPI } from '~/apis'

const TABS = {
  PROFILE: 'profile',
  PASSWORD: 'password'
}

const TAB_LABELS = {
  [TABS.PROFILE]: 'Thông tin cá nhân',
  [TABS.PASSWORD]: 'Đổi mật khẩu'
}

export default function Settings() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const [activeTab, setActiveTab] = useState(TABS.PROFILE)
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const [profileForm, setProfileForm] = useState({
    displayName: '',
    phone: '',
    address: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        displayName: currentUser.displayName || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      })
    }
  }, [currentUser])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async () => {
    if (!profileForm.displayName.trim()) {
      toast.error('Vui lòng nhập họ tên!')
      return
    }

    if (!profileForm.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại!')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('displayName', profileForm.displayName)
      formData.append('phone', profileForm.phone)
      formData.append('address', profileForm.address || '')

      if (fileInputRef.current?.files[0]) {
        formData.append('avatar', fileInputRef.current.files[0])
      }

      await dispatch(updateUserAPI(formData)).unwrap()
      toast.success('Cập nhật thông tin thành công!')
      setAvatarPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error?.response?.data?.message || 'Cập nhật thông tin thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại!')
      return
    }

    if (!passwordForm.newPassword) {
      toast.error('Vui lòng nhập mật khẩu mới!')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!')
      return
    }

    if (!passwordForm.confirmPassword) {
      toast.error('Vui lòng xác nhận mật khẩu mới!')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }

    setLoading(true)
    try {
      await changePasswordAPI({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success('Đổi mật khẩu thành công!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(error?.response?.data?.message || 'Đổi mật khẩu thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
            <p className="text-gray-500 mt-1">Quản lý thông tin và bảo mật tài khoản</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="border-b">
            <div className="flex">
              {Object.entries(TABS).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(value)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === value
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {value === TABS.PROFILE ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    {TAB_LABELS[value]}
                  </span>
                  {activeTab === value && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === TABS.PROFILE && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                        <img
                          src={avatarPreview || currentUser?.avatar || '/placeholder-user.jpg'}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Nhấp để thay đổi ảnh đại diện</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Họ tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        value={profileForm.displayName}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder="Nhập họ tên"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={currentUser?.email || ''}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Địa chỉ
                      </label>
                      <textarea
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Nhập địa chỉ (tùy chọn)"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {activeTab === TABS.PASSWORD && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 max-w-md mx-auto"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
                    <p className="text-sm text-gray-500 mt-1">Nhập mật khẩu hiện tại và mật khẩu mới</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mật khẩu hiện tại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Đổi mật khẩu
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
