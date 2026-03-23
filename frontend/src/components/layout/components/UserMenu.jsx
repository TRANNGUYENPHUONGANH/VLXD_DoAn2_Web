import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Settings, Package, Heart, ChevronDown, Shield } from 'lucide-react'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { logoutUserAPI } from '~/redux/user/userSlice'
import { clearUser } from '~/redux/user/userSlice'
import { toast } from 'sonner'
import { cn } from '~/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'

export default function UserMenu({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  // Check if user is admin
  const isAdmin = currentUser?.role?.includes('admin')
  // console.log(currentUser)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    const loadingToast = toast.success('Đang đăng xuất...')
    const result = await dispatch(logoutUserAPI(false))
    dispatch(clearUser())
    toast.dismiss(loadingToast)
    if (logoutUserAPI.fulfilled.match(result)) {
      toast.success('Đăng xuất thành công!')
    }
    navigate('/')
  }

  const menuItems = [
    { icon: Package, label: 'Đơn hàng của tôi', path: '/orders' },
    { icon: Heart, label: 'Sản phẩm yêu thích', path: '/wishlist' },
    { icon: Settings, label: 'Cài đặt', path: '/settings' },
    ...(isAdmin ? [{ icon: Shield, label: 'Đi đến trang quản trị', path: '/admin' }] : []),
  ]

  // Not logged in - show login/register buttons
  if (!currentUser) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Link
          to="/login"
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          Đăng ký
        </Link>
      </div>
    )
  }

  // Logged in - show dropdown
  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src={currentUser?.avatar} alt={currentUser?.displayName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-medium">
            {currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform hidden sm:block',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <div className="border-t pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
