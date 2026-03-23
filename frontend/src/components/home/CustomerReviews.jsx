import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { getPublicReviewsAPI } from '~/apis'
import { cn } from '~/lib/utils'

const MOCK_REVIEWS = [
  {
    _id: '1',
    rating: 5,
    content: 'Vật liệu xây dựng chất lượng cao, giao hàng nhanh chóng. Rất hài lòng với dịch vụ!',
    user: { name: 'Nguyễn Văn A' },
    createdAt: '2024-03-10'
  },
  {
    _id: '2',
    rating: 5,
    content: 'Dịch vụ tuyệt vời, nhân viên nhiệt tình tư vấn. Sẽ ủng hộ dài dại!',
    user: { name: 'Trần Thị B' },
    createdAt: '2024-03-08'
  },
  {
    _id: '3',
    rating: 4,
    content: 'Hàng chính hãng, đóng gói cẩn thận. Giá cả hợp lý.',
    user: { name: 'Lê Văn C' },
    createdAt: '2024-03-05'
  },
  {
    _id: '4',
    rating: 5,
    content: 'Shop uy tín, vật liệu chất lượng. Đặt lần thứ 3 rồi, không có gì để chê!',
    user: { name: 'Phạm Thị D' },
    createdAt: '2024-03-01'
  }
]

export default function CustomerReviews({ className = '' }) {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getPublicReviewsAPI(6)
        // API trả về { success, message, data: [...] }
        const reviewsData = response.data?.data || response.data || response || []
        const allReviews = Array.isArray(reviewsData) ? reviewsData : []
        setReviews(allReviews)
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setReviews([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchReviews()
  }, [])

  useEffect(() => {
    if (reviews.length <= 1) return
    const timer = setInterval(() => {
      if (isAutoPlaying) {
        setCurrentIndex((prev) => (prev + 1) % reviews.length)
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [reviews.length, isAutoPlaying])

  const displayReviews = reviews.length > 0 ? reviews : MOCK_REVIEWS

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={cn(
          'w-5 h-5',
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
        )}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className={cn('py-16 bg-gray-50', className)}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-8" />
          <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('py-16 bg-gray-50', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-serif font-semibold text-gray-900 text-center mb-8">
          Khách hàng nói gì về chúng tôi
        </h2>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {displayReviews.map((review) => (
                <div key={review._id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-1 mb-4">
                      {renderStars(review.rating || 5)}
                    </div>
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                      "{review.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {review.user?.name?.[0] || 'K'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.user?.name || 'Khách hàng'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {review.createdAt ? formatDate(review.createdAt) : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {displayReviews.length > 1 && (
            <>
              <button
                onClick={() => {
                  setCurrentIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length)
                  setIsAutoPlaying(false)
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-blue-500 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  setCurrentIndex((prev) => (prev + 1) % displayReviews.length)
                  setIsAutoPlaying(false)
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-blue-500 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="flex justify-center gap-2 mt-6">
                {displayReviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index)
                      setIsAutoPlaying(false)
                    }}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === currentIndex ? 'bg-blue-500 w-8' : 'bg-gray-300 hover:bg-gray-400'
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
