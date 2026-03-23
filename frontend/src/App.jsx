import './index.css'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useSelector } from 'react-redux'

// Layouts
import MainLayout from '~/components/layout/MainLayout'
import AdminLayout from '~/components/layout/AdminLayout'

// Auth Pages
import Login from '~/page/Auth/Login'
import Register from '~/page/Auth/Register'
import Verify from '~/page/Auth/Verify'
import ForgotPassword from '~/page/Auth/ForgotPassword'
import ResetPassword from '~/page/Auth/ResetPassword'
import Profile from '~/page/Auth/Profile'
import Settings from '~/page/Auth/UserSettings'
import Home from '~/page/Home/Home'
import Cart from '~/page/Cart/Cart'
import Checkout from '~/page/Checkout/Checkout'
import OrderSuccess from '~/page/Checkout/OrderSuccess'
import OrderHistory from '~/page/Orders/OrderHistory'
import Products from '~/page/Products/Products'
import ProductDetail from '~/page/Products/ProductDetail'
import Blog from '~/page/Blog/Blog'
import BlogDetail from '~/page/Blog/BlogDetail'
import About from '~/page/About/About'
import Contact from '~/page/Contact/Contact'
import Categories from './page/Categories/Categories'

// Admin Pages
import Dashboard from '~/page/Admin/Dashboard'
import UsersPage from '~/page/Admin/Users'
import CategoriesPage from '~/page/Admin/Categories'
import ProductsPage from '~/page/Admin/Products'
import WarehousePage from '~/page/Admin/Warehouse'
import CouponsPage from '~/page/Admin/Coupons'
import ArticlesPage from '~/page/Admin/Articles'
import ContactsPage from '~/page/Admin/Contacts'
import OrdersPage from '~/page/Admin/Orders'
import ReviewsPage from '~/page/Admin/Reviews'
import SettingsPage from '~/page/Admin/Settings'

// Admin Route Guard
function PrivateRoute() {
  const currentUser = useSelector((state) => state.user.currentUser)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <>
      <Toaster position="bottom-left" richColors />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="warehouse" element={<WarehousePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="articles" element={<ArticlesPage />} />
            <Route path="contacts" element={<ContactsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
