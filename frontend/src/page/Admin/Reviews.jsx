import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Search,
  Eye,
  MessageSquare,
  Trash2,
  Loader2,
  User,
  Package,
  Calendar,
  ImageIcon,
  Send,
  EyeOff,
  EyeIcon,
  BarChart3,
  Filter
} from 'lucide-react'
import {
  getReviewsAPI,
  updateReviewAPI
} from '~/apis'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { Textarea } from '~/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table'

const RATING_CONFIG = {
  5: { label: '5 sao', color: 'bg-green-500', textColor: 'text-green-600' },
  4: { label: '4 sao', color: 'bg-green-400', textColor: 'text-green-500' },
  3: { label: '3 sao', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  2: { label: '2 sao', color: 'bg-orange-500', textColor: 'text-orange-600' },
  1: { label: '1 sao', color: 'bg-red-500', textColor: 'text-red-600' }
}

const STATUS_CONFIG = {
  active: { label: 'Hiển thị', color: 'bg-green-100 text-green-700 border-green-200' },
  hidden: { label: 'Đã ẩn', color: 'bg-gray-100 text-gray-700 border-gray-200' }
}

const RATING_OPTIONS = [
  { value: 'all', label: 'Tất cả sao' },
  { value: '5', label: '5 sao' },
  { value: '4', label: '4 sao' },
  { value: '3', label: '3 sao' },
  { value: '2', label: '2 sao' },
  { value: '1', label: '1 sao' }
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hiển thị' },
  { value: 'hidden', label: 'Đã ẩn' }
]

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const renderStars = (rating) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
        />
      ))}
    </div>
  )
}

// Modal Chi tiết đánh giá
const ReviewDetailModal = ({ open, onClose, review, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [currentStatus, setCurrentStatus] = useState(review?.status || 'active')

  useEffect(() => {
    if (review) {
      setCurrentStatus(review.status || 'active')
      setReplyContent(review.adminReply?.content || '')
    }
  }, [review])

  const handleToggleStatus = async () => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active'
    setLoading(true)
    try {
      await updateReviewAPI(review._id, { status: newStatus })
      toast.success(newStatus === 'active' ? 'Hiển thị đánh giá' : 'Ẩn đánh giá thành công!')
      setCurrentStatus(newStatus)
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.info('Vui lòng nhập nội dung phản hồi')
      return
    }

    if (review.adminReply?.content) {
      toast.info('Đã có phản hồi, không thể chỉnh sửa')
      return
    }

    setLoading(true)
    try {
      await updateReviewAPI(review._id, {
        adminReply: {
          content: replyContent,
          repliedAt: new Date().toISOString()
        }
      })
      toast.success('Gửi phản hồi thành công!')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return

    setLoading(true)
    try {
      await updateReviewAPI(review._id, { status: 'hidden' })
      toast.success('Xóa đánh giá thành công!')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  if (!review) return null

  const hasReply = !!review.adminReply?.content

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" forceMount>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Chi tiết đánh giá
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User & Product Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Người đánh giá
              </h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{review.user?.name || 'Người dùng'}</p>
                <p className="text-gray-500">Ngày: {formatDate(review.createdAt)}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Sản phẩm
              </h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{review.product?.name || 'Sản phẩm'}</p>
                <Badge className={STATUS_CONFIG[review.status]?.color}>
                  {STATUS_CONFIG[review.status]?.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Rating & Content */}
          <div className="p-4 bg-yellow-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Đánh giá:</span>
                {renderStars(review.rating)}
                <span className="font-medium text-yellow-600">({review.rating}/5)</span>
              </div>
            </div>
            <div>
              <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
            </div>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  Hình ảnh đính kèm ({review.images.length})
                </p>
                <div className="flex gap-2 flex-wrap">
                  {review.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-20 rounded-lg overflow-hidden border bg-white cursor-pointer hover:opacity-80"
                    >
                      <img
                        src={img}
                        alt={`Review ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onClick={() => window.open(img, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Reply */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Phản hồi của shop
            </h4>

            {hasReply ? (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {review.adminReply.content}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Đã phản hồi: {formatDate(review.adminReply.repliedAt)}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Nhập phản hồi của bạn..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  * Chỉ được phản hồi một lần, không thể chỉnh sửa sau khi gửi
                </p>
                <Button onClick={handleReply} disabled={loading} size="sm">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Send className="w-4 h-4 mr-2" />
                  Gửi phản hồi
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant={currentStatus === 'active' ? 'outline' : 'default'}
                size="sm"
                onClick={handleToggleStatus}
                disabled={loading}
              >
                {currentStatus === 'active' ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ẩn đánh giá
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Hiển thị
                  </>
                )}
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa đánh giá
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Stats Chart Component
const RatingStatsChart = ({ reviews }) => {
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) {
      ratingCounts[r.rating]++
    }
  })

  const total = reviews.length || 1
  const maxCount = Math.max(...Object.values(ratingCounts), 1)

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Phân bố đánh giá
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating]
            const percentage = (count / total) * 100

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8 flex items-center gap-0.5">
                  {rating} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${RATING_CONFIG[rating]?.color} transition-all duration-500`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm w-12 text-right">{count}</span>
                <span className="text-xs text-gray-400 w-10 text-right">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Trang chính
const ReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReview, setSelectedReview] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await getReviewsAPI()
      setReviews(response.data || [])
    } catch (error) {
      toast.error('Không thể tải danh sách đánh giá')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchUser = review.user?.name?.toLowerCase().includes(search)
      const matchProduct = review.product?.name?.toLowerCase().includes(search)
      const matchContent = review.content?.toLowerCase().includes(search)
      if (!matchUser && !matchProduct && !matchContent) return false
    }

    // Rating filter
    if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) {
      return false
    }

    // Status filter
    if (statusFilter !== 'all' && review.status !== statusFilter) {
      return false
    }

    return true
  })

  // Stats
  const stats = {
    total: reviews.length,
    fiveStar: reviews.filter((r) => r.rating === 5).length,
    fourStar: reviews.filter((r) => r.rating === 4).length,
    threeStar: reviews.filter((r) => r.rating === 3).length,
    twoStar: reviews.filter((r) => r.rating === 2).length,
    oneStar: reviews.filter((r) => r.rating === 1).length,
    hidden: reviews.filter((r) => r.status === 'hidden').length,
    active: reviews.filter((r) => r.status === 'active').length
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const handleViewDetail = (review) => {
    setSelectedReview(review)
    setShowDetailModal(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8 text-yellow-500" />
          <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        </div>
      </div>

      {/* Stats Cards + Chart */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500">Tổng</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-green-600">5 sao</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-green-600">{stats.fiveStar}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-green-500">4 sao</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-green-500">{stats.fourStar}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-yellow-500">3 sao</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-yellow-500">{stats.threeStar}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-orange-500">2 sao</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-orange-500">{stats.twoStar}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-red-500">1 sao</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-red-500">{stats.oneStar}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-600">Đã ẩn</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-gray-600">{stats.hidden}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-blue-600">Điểm TB</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-blue-600 flex items-center gap-1">
              {averageRating}
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Chart */}
      <RatingStatsChart reviews={reviews} />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên user, sản phẩm, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Số sao" />
            </SelectTrigger>
            <SelectContent>
              {RATING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Star className="w-12 h-12 mb-4 text-gray-300" />
            <p>Không tìm thấy đánh giá nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">STT</TableHead>
                <TableHead className="w-[180px]">Người đánh giá</TableHead>
                <TableHead className="w-[200px]">Sản phẩm</TableHead>
                <TableHead className="w-[100px]">Rating</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead className="w-[100px]">Hình ảnh</TableHead>
                <TableHead className="w-[100px]">Phản hồi</TableHead>
                <TableHead className="w-[100px]">Trạng thái</TableHead>
                <TableHead className="w-[100px]">Ngày</TableHead>
                <TableHead className="w-[80px] text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredReviews.map((review, index) => (
                  <motion.tr
                    key={review._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{review.user?.name || 'Người dùng'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          {review.product?.thumbnail && (
                            <img
                              src={review.product.thumbnail}
                              alt={review.product?.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="text-sm line-clamp-2">
                          {review.product?.name || 'Sản phẩm'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm line-clamp-2 max-w-[250px]">
                        {review.content}
                      </p>
                    </TableCell>
                    <TableCell>
                      {review.images && review.images.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {review.images.slice(0, 3).map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => window.open(img, '_blank')}
                              className="w-10 h-10 rounded-md overflow-hidden border bg-gray-100 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                            >
                              <img
                                src={img}
                                alt={`Đánh giá ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E'
                                }}
                              />
                            </button>
                          ))}
                          {review.images.length > 3 && (
                            <span className="text-xs text-gray-500 self-center">+{review.images.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {review.adminReply?.content ? (
                        <Badge className="bg-blue-100 text-blue-700">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Đã trả lời
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Chưa trả lời</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_CONFIG[review.status]?.color}>
                        {STATUS_CONFIG[review.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(review)}
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal */}
      {selectedReview && (
        <ReviewDetailModal
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedReview(null)
          }}
          review={selectedReview}
          onSuccess={fetchReviews}
        />
      )}
    </div>
  )
}

export default ReviewsPage
