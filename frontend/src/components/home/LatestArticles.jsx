import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { getArticlesAPI } from '~/apis'
import { cn } from '~/lib/utils'

const MOCK_ARTICLES = [
  {
    _id: '1',
    name: 'Cách chọn vật liệu xây dựng chất lượng',
    summary: 'Hướng dẫn lựa chọn vật liệu xây dựng tốt nhất cho công trình của bạn...',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    slug: 'cach-chon-vat-lieu-xay-dung-chat-luong',
    author: { name: 'Kỹ sư Minh' },
    createdAt: '2024-03-10'
  },
  {
    _id: '2',
    name: 'So sánh các loại xi măng phổ biến',
    summary: 'Phân tích ưu nhược điểm của các loại xi măng trên thị trường hiện nay...',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
    slug: 'so-sanh-cac-loai-xi-mang-pho-bien',
    author: { name: 'Kỹ sư Hùng' },
    createdAt: '2024-03-08'
  },
  {
    _id: '3',
    name: 'Xu hướng vật liệu xây dựng 2024',
    summary: 'Những vật liệu xây dựng được ưa chuộng nhất trong năm 2024...',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
    slug: 'xu-huong-vat-lieu-xay-dung-2024',
    author: { name: 'Kỹ sư Lan' },
    createdAt: '2024-03-05'
  }
]

export default function LatestArticles({ className = '' }) {
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getArticlesAPI()
        // API trả về { success, message, data: [...] }
        const articlesData = response.data?.data || response.data || response || []
        const allArticles = Array.isArray(articlesData) ? articlesData : []
        setArticles(allArticles.slice(0, 3))
      } catch (error) {
        console.error('Error fetching articles:', error)
        setArticles([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const displayArticles = articles.length > 0 ? articles : MOCK_ARTICLES

  if (isLoading) {
    return (
      <div className={cn('py-12', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="aspect-video bg-gray-200 rounded-2xl animate-pulse mb-4" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
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
            Tin tức & Blog
          </h2>
          <Link
            to="/blog"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayArticles.map((article) => (
            <Link
              key={article._id}
              to={`/blog/${article._id}`}
              className="group"
            >
              {/* Article Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                {/* Image */}
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.thumbnail_url || article.thumbnail}
                    alt={article.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {article.summary || article.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.createdAt ? formatDate(article.createdAt) : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {article.author?.name || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
