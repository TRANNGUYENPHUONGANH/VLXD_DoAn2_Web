import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '~/lib/utils'

export default function PromotionBanner({ className = '' }) {
  return (
    <div className={cn('py-8', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/shop?promotion=true"
          className="relative block rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200')] bg-cover bg-center opacity-20" />

          {/* Content */}
          <div className="relative px-8 py-12 md:py-16 flex items-center justify-between">
            <div className="max-w-xl">
              <span className="inline-block px-4 py-1 bg-white/20 text-white text-sm font-medium rounded-full mb-4">
                Khuyến mãi đặc biệt
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-3">
                Giảm giá 15%
              </h2>
              <p className="text-white/80 text-lg mb-6">
                Cho tất cả vật liệu xây dựng<br />
                Áp dụng từ ngày 01/3 - 31/3
              </p>
              <span className="inline-flex items-center gap-2 text-white font-medium">
                Mua ngay <ArrowRight className="w-5 h-5" />
              </span>
            </div>

            {/* Decorative */}
            <div className="hidden md:block w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-5xl font-serif text-white">15%</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
