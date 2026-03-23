import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getCategoriesAPI } from '~/apis'
import { cn } from '~/lib/utils'

export default function CategoriesGrid({ className = '' }) {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesAPI()
        // API trả về { success, message, data: [...] } hoặc [... ]
        const categoriesData = response.data?.data || response.data || response || []
        const allCategories = Array.isArray(categoriesData) ? categoriesData : []
        setCategories(allCategories.slice(0, 5))
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price)
  }

  // Default categories if API fails or no data
  const defaultCategories = [
    { _id: '1', name: 'Cát xây dựng', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400', slug: 'cat', description: 'Cát các loại' },
    { _id: '2', name: 'Đá dăm', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', slug: 'da', description: 'Đá xây dựng' },
    { _id: '3', name: 'Xi măng', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400', slug: 'xi-mang', description: 'Xi măng chất lượng' },
    { _id: '4', name: 'Gạch các loại', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', slug: 'gach', description: 'Gạch nung, gạch block' },
    { _id: '5', name: 'Sắt thép', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400', slug: 'sat-thep', description: 'Thép xây dựng' },
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  if (isLoading) {
    return (
      <div className={cn('py-12', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900">
            Danh mục sản phẩm
          </h2>
          <Link
            to="/categories"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {displayCategories.map((category, index) => (
            <Link
              key={category._id || index}
              to={`/shop?category=${category.slug || category._id}`}
              className="group relative aspect-square rounded-2xl overflow-hidden"
            >
              {/* Background Image */}
              <img
                src={category.image || category.images?.[0]}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {category.name}
                </h3>
                <p className="text-white/70 text-sm">
                  {category.description || 'Xem ngay'}
                </p>
              </div>
              {/* Hover Effect */}
              <div className="absolute inset-0 ring-2 ring-inset ring-white/30 group-hover:ring-white/60 transition-all rounded-2xl" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
