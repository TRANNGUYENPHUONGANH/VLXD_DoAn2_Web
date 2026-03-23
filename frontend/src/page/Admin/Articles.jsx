import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Eye,
  Image as ImageIcon,
  Upload,
  X,
  Calendar,
  ExternalLink
} from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {
  getArticlesAPI,
  createArticleAPI,
  updateArticleAPI,
  deleteArticleAPI
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

const STATUS_LABELS = {
  draft: 'Bản nháp',
  published: 'Đã đăng',
  hidden: 'Ẩn'
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  hidden: 'bg-orange-100 text-orange-700'
}

// Hàm tạo slug từ tên
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Quill modules config
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ]
}

// Modal thêm/sửa bài viết
const ArticleFormModal = ({ open, onClose, article, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    thumbnail_url: '',
    summary: '',
    content: '',
    status: 'draft'
  })

  useEffect(() => {
    if (article) {
      setFormData({
        name: article.name || '',
        slug: article.slug || '',
        thumbnail_url: article.thumbnail_url || '',
        summary: article.summary || '',
        content: article.content || '',
        status: article.status || 'draft'
      })
      setThumbnailPreview(article.thumbnail_url || '')
      setThumbnailFile(null)
    } else {
      setFormData({
        name: '',
        slug: '',
        thumbnail_url: '',
        summary: '',
        content: '',
        status: 'draft'
      })
      setThumbnailPreview('')
      setThumbnailFile(null)
    }
  }, [article, open])

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnailPreview('')
    setThumbnailFile(null)
    setFormData({ ...formData, thumbnail_url: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết')
      return
    }
    if (!formData.summary.trim()) {
      toast.error('Vui lòng nhập tóm tắt bài viết')
      return
    }
    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết')
      return
    }

    setLoading(true)
    try {
      // Sử dụng FormData để upload ảnh
      const submitData = new FormData()
      submitData.append('name', formData.name.trim())
      submitData.append('slug', formData.slug || generateSlug(formData.name))
      submitData.append('summary', formData.summary.trim())
      submitData.append('content', formData.content)
      submitData.append('status', formData.status)
      
      if (thumbnailFile) {
        submitData.append('image', thumbnailFile)
      } else if (formData.thumbnail_url && formData.thumbnail_url.startsWith('data:')) {
        // Nếu là base64 từ trước, giữ nguyên
        submitData.append('thumbnail_url', formData.thumbnail_url)
      }

      if (article) {
        await updateArticleAPI(article._id, submitData)
        toast.success('Cập nhật bài viết thành công!')
      } else {
        await createArticleAPI(submitData)
        toast.success('Tạo bài viết thành công!')
      }
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" forceMount>
        <DialogHeader>
          <DialogTitle>
            {article ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tiêu đề *</Label>
              <Input
                id="name"
                placeholder="Nhập tiêu đề bài viết"
                value={formData.name}
                onChange={handleNameChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="slug-url"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="published">Đã đăng</SelectItem>
                <SelectItem value="hidden">Ẩn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ảnh thumbnail</Label>
            <div className="flex items-center gap-4">
              {thumbnailPreview ? (
                <div className="relative w-40 h-24 rounded-lg overflow-hidden border">
                  <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-6 h-6 mx-auto text-gray-400" />
                    <span className="text-xs text-gray-500">Chọn ảnh</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Tóm tắt *</Label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tóm tắt bài viết (tối đa 300 ký tự)"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value.slice(0, 300) })}
              maxLength={300}
            />
            <p className="text-xs text-gray-500 text-right">{formData.summary.length}/300</p>
          </div>

          <div className="space-y-2">
            <Label>Nội dung *</Label>
            <div className="bg-white">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                modules={quillModules}
                className="h-64 mb-12"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {article ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Modal xác nhận xóa
const DeleteConfirmModal = ({ open, onClose, article, onConfirm }) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteArticleAPI(article._id)
      toast.success('Xóa bài viết thành công!')
      onConfirm()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" forceMount>
        <DialogHeader>
          <DialogTitle>Xóa bài viết</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">
          Bạn có chắc muốn xóa bài viết <strong>"{article?.name}"</strong>?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getArticlesAPI()
      if (res.status === 'success') {
        setArticles(res.data)
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const filteredArticles = articles.filter(article => {
    const matchSearch = article.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || article.status === filterStatus

    return matchSearch && matchStatus
  })

  const handleAddNew = () => {
    setSelectedArticle(null)
    setFormModalOpen(true)
  }

  const handleEdit = (article) => {
    setSelectedArticle(article)
    setFormModalOpen(true)
  }

  const handleDelete = (article) => {
    setSelectedArticle(article)
    setDeleteModalOpen(true)
  }

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý bài viết</h1>
          <p className="text-gray-500">Quản lý các bài viết của cửa hàng</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm bài viết
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
            <SelectItem value="published">Đã đăng</SelectItem>
            <SelectItem value="hidden">Ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tóm tắt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>Không tìm thấy bài viết nào</p>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article, index) => (
                  <tr key={article._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
                        {article.thumbnail_url ? (
                          <img src={article.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-full h-full p-2 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-800 truncate">{article.name}</p>
                        <p className="text-xs text-gray-500">/{article.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {stripHtml(article.summary)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[article.status]}`}>
                        {STATUS_LABELS[article.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(article.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(article)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ArticleFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        article={selectedArticle}
        onSuccess={fetchData}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        article={selectedArticle}
        onConfirm={fetchData}
      />
    </div>
  )
}
