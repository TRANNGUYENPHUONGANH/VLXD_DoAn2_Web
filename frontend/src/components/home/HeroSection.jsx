import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '~/lib/utils'
import banner1 from '~/assets/banner/b1.jpg'
import banner2 from '~/assets/banner/b2.jpg'
import banner3 from '~/assets/banner/b3.jpg'

// Banner cứng - 3 banner mặc định
const DEFAULT_BANNERS = [
  {
    _id: '1',
    title: 'Vật liệu xây dựng chất lượng cao',
    slug: 'Cung cấp vật liệu xây dựng uy tín, giá tốt nhất thị trường',
    image: banner1,
    link: '/products'
  },
  {
    _id: '2',
    title: 'Sắt thép xây dựng',
    slug: 'Đảm bảo chất lượng, nguồn gốc rõ ràng',
    image: banner2,
    link: '/products'
  },
  {
    _id: '3',
    title: 'Cát, đá, xi măng',
    slug: 'Vật liệu cơ bản cho mọi công trình',
    image: banner3,
    link: '/products'
  }
]

export default function HeroSection({ className = '' }) {
  const [banners] = useState(DEFAULT_BANNERS)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto slide
  useEffect(() => {
    if (banners.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length])

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className={cn('relative h-[400px] lg:h-[500px] overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${currentBanner.image})`
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-4xl lg:text-5xl font-serif text-white mb-4 leading-tight">
                  {currentBanner.title || 'Vật liệu xây dựng chất lượng cao'}
                </h2>
                <p className="text-lg text-gray-200 mb-8">
                  {currentBanner.slug || 'Cung cấp vật liệu xây dựng uy tín, giá tốt nhất thị trường'}
                </p>
                <div className="flex gap-4">
                  <Link
                    to={currentBanner.link || '/products'}
                    className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                  >
                    Mua ngay
                  </Link>
                  <Link
                    to="/products"
                    className="inline-block px-8 py-3 bg-white/20 text-white rounded-full font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    Xem cửa hàng
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-blue-600 w-8'
                  : 'bg-white/50 hover:bg-white/80'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
