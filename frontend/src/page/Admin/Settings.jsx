import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  User,
  Lock,
  LogOut,
  Camera,
  Loader2,
  Save,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react'
import {
  updateUserProfileAPI,
  changePasswordAPI
} from '~/apis'
import { selectCurrentUser, updateUserAPI, logoutUserAPI } from '~/redux/user/userSlice'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '~/components/ui/Tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/components/ui/alert-dialog'

const ProfileTab = ({ user, onSuccess }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToUpdate = {
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address || ''
      }
      if (avatarFile) {
        dataToUpdate.avatar = avatarFile
      }

      const response = await updateUserProfileAPI(dataToUpdate)
      const updatedUser = response.data?.data || response.data || response
      dispatch(updateUserAPI(updatedUser))
      setAvatarFile(null)
      toast.success('Cập nhật hồ sơ thành công!')
      onSuccess?.()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
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
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <User className="w-16 h-16 text-blue-400" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">Nhấn vào icon để đổi ảnh đại diện</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Tên hiển thị</Label>
          <Input
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Nhập tên hiển thị"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user?.email || ''}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-400">Email không thể thay đổi</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Địa chỉ</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ"
            rows={3}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          Lưu thay đổi
        </Button>
      </div>
    </form>
  )
}

const ChangePasswordTab = () => {
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
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
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
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
      await changePasswordAPI({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
      toast.success('Đổi mật khẩu thành công!')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="space-y-4">
        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              className={errors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('current')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-500">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
              className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Lock className="w-4 h-4 mr-2" />
          Đổi mật khẩu
        </Button>
      </div>
    </form>
  )
}

const LogoutTab = ({ onLogout }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Đăng xuất khỏi hệ thống</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Bạn có chắc chắn muốn đăng xuất không? Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng hệ thống.
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          variant="destructive"
          size="lg"
          onClick={onLogout}
          className="px-8"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Đăng xuất ngay
        </Button>
      </div>
    </div>
  )
}

// Main Settings Page
const SettingsPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await dispatch(logoutUserAPI()).unwrap()
      toast.success('Đăng xuất thành công!')
      navigate('/login')
    } catch (error) {
      toast.error('Đăng xuất thất bại')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <User className="w-8 h-8 text-blue-500" />
          Cài đặt tài khoản
        </h1>
        <p className="text-gray-500 mt-1">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      {/* User Info Card */}
      {user && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-500" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.displayName}</h3>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <p className="text-gray-400 text-xs mt-1">
                  Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Hồ sơ
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Đổi mật khẩu
          </TabsTrigger>
          <TabsTrigger value="logout" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin hồ sơ</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileTab user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent>
              <ChangePasswordTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logout">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Đăng xuất</CardTitle>
            </CardHeader>
            <CardContent>
              <LogoutTab onLogout={() => setLogoutOpen(true)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Xác nhận đăng xuất
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SettingsPage
