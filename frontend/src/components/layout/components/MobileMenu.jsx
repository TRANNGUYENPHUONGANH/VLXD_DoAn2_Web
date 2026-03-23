import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, Store, Folder, FileText, MessageCircle, ShoppingCart, User, LogOut, Shield } from 'lucide-react'
import { selectCartItems } from '~/redux/cart/cartSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useDispatch } from 'react-redux'
import { logoutUserAPI } from '~/redux/user/userSlice'
import { clearUser } from '~/redux/user/userSlice'
import { toast } from 'sonner'
import Logo from './Logo'

const navItems = [
  { label: 'Trang chủ', path: '/', icon: Home },
  { label: 'Cửa hàng', path: '/shop', icon: Store },
  { label: 'Danh mục', path: '/categories', icon: Folder },
  { label: 'Tin tức', path: '/blog', icon: FileText },
  { label: 'Liên hệ', path: '/contact', icon: MessageCircle },
]

export default function MobileMenu({ isOpen, onClose, className = '' }) {
  const location = useLocation()
  const dispatch = useDispatch()
  const cartItems = useSelector(selectCartItems)
  const currentUser = useSelector(selectCurrentUser)

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Check if user is admin
  const isAdmin = currentUser?.email === 'admin@pabuild.com' || currentUser?.email?.includes('admin')

  const handleLogout = async () => {
    onClose()
    const loadingToast = toast.success('Đang đăng xuất...')
    const result = await dispatch(logoutUserAPI(false))
    dispatch(clearUser())
    toast.dismiss(loadingToast)
    if (logoutUserAPI.fulfilled.match(result)) {
      toast.success('Đăng xuất thành công!')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed top-0 left-0 bottom-0 w-[300px] bg-white z-50 lg:hidden ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Logo />
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Divider */}
            <div className="border-t mx-4" />

            {/* User Section */}
            <div className="p-4 space-y-2">
              {currentUser ? (
                <>
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5" />
                      Giỏ hàng
                    </span>
                    {cartCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/orders"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    <User className="w-5 h-5" />
                    Tài khoản
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      <Shield className="w-5 h-5" />
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="block w-full px-4 py-3 text-center text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="block w-full px-4 py-3 text-center text-sm font-medium bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
