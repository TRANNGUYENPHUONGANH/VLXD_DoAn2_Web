import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderPlus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Image as ImageIcon,
  Upload
} from 'lucide-react'
import {
  getCategoriesAPI,
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI
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
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '~/components/ui/card'

// Modal thêm/sửa category
const CategoryFormModal = ({ open, onClose, category, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: null
      })
      setPreviewImage(category.image || null)
    } else {
      setFormData({ name: '', description: '', image: null })
      setPreviewImage(null)
    }
  }, [category, open])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, image: file })
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    setLoading(true)
    try {
      if (category) {
        await updateCategoryAPI(category._id, formData)
        toast.success('Cập nhật danh mục thành công!')
      } else {
        await createCategoryAPI(formData)
        toast.success('Tạo danh mục thành công!')
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên danh mục *</Label>
            <Input
              id="name"
              placeholder="Nhập tên danh mục"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả danh mục"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              {previewImage ? (
                <div className="relative inline-block">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null)
                      setFormData({ ...formData, image: null })
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click để tải ảnh lên</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {category ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Modal xác nhận xóa
const DeleteConfirmModal = ({ open, onClose, category, onConfirm }) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteCategoryAPI(category._id)
      toast.success('Xóa danh mục thành công!')
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Xác nhận xóa danh mục
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-600">
          Bạn có chắc chắn muốn xóa danh mục{' '}
          <strong>"{category?.name}"</strong> không?
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getCategoriesAPI()
      if (response.status === 'success') {
        setCategories(response.data)
      }
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddNew = () => {
    setSelectedCategory(null)
    setFormModalOpen(true)
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setFormModalOpen(true)
  }

  const handleDelete = (category) => {
    setSelectedCategory(category)
    setDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
          <p className="text-gray-500">Quản lý các danh mục sản phẩm</p>
        </div>
        <Button onClick={handleAddNew}>
          <FolderPlus className="w-4 h-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <FolderPlus className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {search ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
          </p>
          {!search && (
            <Button onClick={handleAddNew} className="mt-4">
              Thêm danh mục đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative bg-gray-100">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <h3 className="font-semibold text-lg truncate">{category.name}</h3>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {category.description || 'Không có mô tả'}
                    </p>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <CategoryFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        category={selectedCategory}
        onSuccess={fetchCategories}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        category={selectedCategory}
        onConfirm={fetchCategories}
      />
    </div>
  )
}
