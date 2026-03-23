import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '~/lib/utils';
import { logoutUserAPI, selectCurrentUser } from '~/redux/user/userSlice';
import { clearUser } from '~/redux/user/userSlice';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  ShoppingCart,
  Users,
  Star,
  Image,
  FileText,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  Settings,
  Package,
  Warehouse
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
  { icon: ShoppingBag, label: 'Sản phẩm', path: '/admin/products' },
  { icon: Warehouse, label: 'Kho hàng', path: '/admin/warehouse' },
  { icon: Tags, label: 'Danh mục', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Đơn hàng', path: '/admin/orders' },
  { icon: Users, label: 'Người dùng', path: '/admin/users' },
  { icon: Tags, label: 'Mã giảm giá', path: '/admin/coupons' },
  { icon: Star, label: 'Đánh giá', path: '/admin/reviews' },
  { icon: FileText, label: 'Bài viết', path: '/admin/articles' },
  { icon: MessageCircle, label: 'Liên hệ', path: '/admin/contacts' },
  { icon: Settings, label: 'Cài đặt', path: '/admin/settings' },
];

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const handleLogout = async () => {
    setUserMenuOpen(false)
    const loadingToast = toast.success('Đang đăng xuất...')
    const result = await dispatch(logoutUserAPI(false))
    dispatch(clearUser())
    toast.dismiss(loadingToast)
    if (logoutUserAPI.fulfilled.match(result)) {
      toast.success('Đăng xuất thành công!')
    }
    navigate('/login')
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Tổng quan';
    const item = menuItems.find(item => path.startsWith(item.path));
    return item?.label || 'Admin';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        <Link to="/admin" className="flex items-center gap-2">
          <Package className="w-8 h-8 text-blue-600" />
          <span className="font-serif text-xl font-semibold text-gray-800">PA BUILD MATERIAL</span>
        </Link>

        <div className="w-10" />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <Link to="/admin" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Package className="w-8 h-8 text-blue-600" />
                  <span className="font-serif text-xl font-semibold text-gray-800">PA BUILD MATERIAL</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed top-0 left-0 bottom-0 bg-white border-r border-gray-200 z-30 transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/admin" className="flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            {!sidebarCollapsed && (
              <span className="font-serif text-xl font-semibold text-gray-800">PA BUILD MATERIAL</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t">
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-gray-50',
            sidebarCollapsed && 'justify-center p-3'
          )}>
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.displayName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-medium">
                {currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.displayName || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Page Title */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
                {getPageTitle()}
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-64 pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-medium">
                      {currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b">
                          <p className="text-sm font-medium text-gray-900">
                            {currentUser?.displayName || 'Admin'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {currentUser?.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/"
                            target="_blank"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Package className="w-4 h-4" />
                            Xem website
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
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
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
