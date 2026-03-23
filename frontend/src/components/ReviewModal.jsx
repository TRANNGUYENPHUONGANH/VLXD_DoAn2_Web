import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createReviewAPI } from '~/apis'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'

const MAX_IMAGES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function ReviewModal({ isOpen, onClose, orderId, product, onReviewSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const handleClose = () => {
    setRating(0)
    setHoverRating(0)
    setContent('')
    setImages([])
    setImagePreviews([])
    onClose()
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + imagePreviews.length > MAX_IMAGES) {
      toast.warning(`Tối đa ${MAX_IMAGES} hình ảnh`)
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.warning(`${file.name} vượt quá 5MB`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.warning(`${file.name} không phải hình ảnh`)
        return false
      }
      return true
    })

    const newImages = [...images, ...validFiles]
    setImages(newImages)

    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }
    if (content.length < 10) {
      toast.error('Nội dung đánh giá phải có ít nhất 10 ký tự')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('productId', product._id || product.productId)
      formData.append('orderId', orderId)
      formData.append('rating', rating)
      formData.append('content', content)

      images.forEach(image => {
        formData.append('images', image)
      })

      const response = await createReviewAPI(formData)
      if (response.success) {
        toast.success('Đánh giá sản phẩm thành công!')
        onReviewSubmitted?.(product._id || product.productId)
        handleClose()
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error?.response?.data?.message || 'Đánh giá thất bại, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Đánh giá sản phẩm</h2>
                <p className="text-sm text-gray-500 mt-0.5">{product?.name}</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <img
                  src={product?.image}
                  alt={product?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product?.name}</p>
                  {product?.size && (
                    <p className="text-sm text-gray-500 mt-1">Size: {product?.size}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Số lượng: {product?.quantity}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá của bạn
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={cn(
                          'w-8 h-8 transition-colors',
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {rating > 0 ? `${rating}/5 sao` : 'Chọn số sao'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung đánh giá
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {content.length}/1000 ký tự
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh (tùy chọn)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-500">Thêm</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tối đa {MAX_IMAGES} hình ảnh, mỗi hình không quá 5MB
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0 || content.length < 10}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi đánh giá'
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
