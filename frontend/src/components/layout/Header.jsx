import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ShoppingCart, Menu, Heart } from 'lucide-react'
import { selectCartItems } from '~/redux/cart/cartSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { cn } from '~/lib/utils'
import { authUtils } from '~/utils/authUtils'

import Logo from './components/Logo'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import UserMenu from './components/UserMenu'
import MobileMenu from './components/MobileMenu'

export default function Header({ className = '' }) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const cartItems = useSelector(selectCartItems)
  const currentUser = useSelector(selectCurrentUser)
  const cartCount = cartItems.length

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCartClick = () => {
    if (!currentUser) {
      authUtils.saveReturnUrl()
      navigate('/login')
      return
    }
    navigate('/cart')
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Logo */}
            <Logo />

            {/* Desktop Navigation */}
            <Navbar className="hidden lg:flex" />

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Bar - Desktop */}
              <div className="hidden md:block">
                <SearchBar />
              </div>

              {/* Wishlist - Desktop */}
              <button className="hidden lg:flex p-2.5 rounded-full hover:bg-gray-100 text-gray-600">
                <Heart className="w-5 h-5" />
              </button>

              {/* Cart */}
              <div className="relative">
                <button
                  onClick={handleCartClick}
                  className="relative p-2.5 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {currentUser && cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <UserMenu className="hidden lg:flex" />

              {/* Mobile: Wishlist + Cart + User (alternative) */}
              <div className="flex lg:hidden items-center gap-1">
                <button className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600">
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCartClick}
                  className="relative p-2.5 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {currentUser && cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  )
}
