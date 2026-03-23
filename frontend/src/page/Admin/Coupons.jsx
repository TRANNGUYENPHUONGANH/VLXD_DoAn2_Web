import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Tag,
  Calendar,
  Percent,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import {
  getCouponsAPI,
  createCouponAPI,
  updateCouponAPI,
  deleteCouponAPI
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

// Modal thêm/sửa mã giảm giá
const CouponFormModal = ({ open, onClose, coupon, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discount: {
      type: 'FIXED',
      value: '',
      maxAmount: '',
      minOrder: 0
    },
    quantity: '',
    startDate: '',
    endDate: '',
    isActive: true
  })

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        name: coupon.name || '',
        discount: {
          type: coupon.discount?.type || 'FIXED',
          value: coupon.discount?.value || '',
          maxAmount: coupon.discount?.maxAmount || '',
          minOrder: coupon.discount?.minOrder || 0
        },
        quantity: coupon.quantity || '',
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
        isActive: coupon.isActive ?? true
      })
    } else {
      setFormData({
        code: '',
        name: '',
        discount: {
          type: 'FIXED',
          value: '',
          maxAmount: '',
          minOrder: 0
        },
        quantity: '',
        startDate: '',
        endDate: '',
        isActive: true
      })
    }
  }, [coupon, open])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên mã giảm giá')
      return
    }
    if (!formData.discount.value) {
      toast.error('Vui lòng nhập giá trị giảm giá')
      return
    }
    if (!formData.quantity) {
      toast.error('Vui lòng nhập số lượng mã')
      return
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Vui lòng chọn ngày bắt đầu và kết thúc')
      return
    }

    setLoading(true)
    try {
      const submitData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        discount: {
          type: formData.discount.type,
          value: Number(formData.discount.value),
          maxAmount: formData.discount.maxAmount ? Number(formData.discount.maxAmount) : null,
          minOrder: Number(formData.discount.minOrder) || 0
        },
        quantity: Number(formData.quantity),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        isActive: formData.isActive
      }

      if (coupon) {
        await updateCouponAPI(coupon._id, submitData)
        toast.success('Cập nhật mã giảm giá thành công!')
      } else {
        await createCouponAPI(submitData)
        toast.success('Tạo mã giảm giá thành công!')
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {coupon ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã giảm giá *</Label>
              <Input
                id="code"
                placeholder="VD: SUMMER2025"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên mã *</Label>
              <Input
                id="name"
                placeholder="VD: Giảm giá mùa hè"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Loại giảm</Label>
              <Select
                value={formData.discount.type}
                onValueChange={(value) => setFormData({
                  ...formData,
                  discount: { ...formData.discount, type: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Cố định (VNĐ)</SelectItem>
                  <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Giá trị giảm *</Label>
              <Input
                type="number"
                placeholder={formData.discount.type === 'PERCENT' ? 'VD: 15' : 'VD: 50000'}
                value={formData.discount.value}
                onChange={(e) => setFormData({
                  ...formData,
                  discount: { ...formData.discount, value: e.target.value }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Số lượng *</Label>
              <Input
                type="number"
                placeholder="VD: 100"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Giảm tối đa (VNĐ)</Label>
              <Input
                type="number"
                placeholder="Chỉ áp dụng cho %"
                value={formData.discount.maxAmount}
                disabled={formData.discount.type === 'FIXED'}
                onChange={(e) => setFormData({
                  ...formData,
                  discount: { ...formData.discount, maxAmount: e.target.value }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Đơn tối thiểu (VNĐ)</Label>
              <Input
                type="number"
                placeholder="VD: 200000"
                value={formData.discount.minOrder}
                onChange={(e) => setFormData({
                  ...formData,
                  discount: { ...formData.discount, minOrder: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày bắt đầu *</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Ngày kết thúc *</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className="flex items-center gap-2"
            >
              {formData.isActive ? (
                <ToggleRight className="w-8 h-8 text-green-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
              <span className="text-sm text-gray-600">
                {formData.isActive ? 'Đang kích hoạt' : 'Đã vô hiệu hóa'}
              </span>
            </button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {coupon ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Modal xác nhận xóa
const DeleteConfirmModal = ({ open, onClose, coupon, onConfirm }) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteCouponAPI(coupon._id)
      toast.success('Xóa mã giảm giá thành công!')
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
          <DialogTitle>Xóa mã giảm giá</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">
          Bạn có chắc muốn xóa mã giảm giá <strong>"{coupon?.code}"</strong>?
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

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCouponsAPI()
      if (res.success) {
        setCoupons(res.data)
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

  const getCouponStatus = (coupon) => {
    const now = new Date()
    const endDate = new Date(coupon.endDate)
    const used = coupon.usedCount || 0
    const total = coupon.quantity || 0

    if (!coupon.isActive) return { label: 'Vô hiệu', color: 'bg-gray-100 text-gray-700' }
    if (endDate < now) return { label: 'Hết hạn', color: 'bg-red-100 text-red-700' }
    if (used >= total) return { label: 'Hết mã', color: 'bg-orange-100 text-orange-700' }
    return { label: 'Hoạt động', color: 'bg-green-100 text-green-700' }
  }

  const formatDiscount = (discount) => {
    if (!discount) return '-'
    if (discount.type === 'PERCENT') {
      return `${discount.value}%${discount.maxAmount ? ` (max ${formatPrice(discount.maxAmount)})` : ''}`
    }
    return formatPrice(discount.value)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('vi-VN')
  }

  const filteredCoupons = coupons.filter(coupon => {
    const matchSearch = 
      coupon.code.toLowerCase().includes(search.toLowerCase()) ||
      coupon.name.toLowerCase().includes(search.toLowerCase())

    const status = getCouponStatus(coupon)
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && status.label === 'Hoạt động') ||
      (filterStatus === 'expired' && status.label === 'Hết hạn') ||
      (filterStatus === 'out' && status.label === 'Hết mã') ||
      (filterStatus === 'inactive' && status.label === 'Vô hiệu')

    return matchSearch && matchStatus
  })

  const handleAddNew = () => {
    setSelectedCoupon(null)
    setFormModalOpen(true)
  }

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon)
    setFormModalOpen(true)
  }

  const handleDelete = (coupon) => {
    setSelectedCoupon(coupon)
    setDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý mã giảm giá</h1>
          <p className="text-gray-500">Quản lý các mã giảm giá của cửa hàng</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm mã giảm giá
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm mã..."
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
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="expired">Hết hạn</SelectItem>
            <SelectItem value="out">Hết mã</SelectItem>
            <SelectItem value="inactive">Vô hiệu</SelectItem>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảm giá</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn tối thiểu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sử dụng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn sử dụng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <Tag className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>Không tìm thấy mã giảm giá nào</p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon, index) => {
                  const status = getCouponStatus(coupon)
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{coupon.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          {coupon.discount?.type === 'PERCENT' ? (
                            <Percent className="w-4 h-4 text-blue-500" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-green-500" />
                          )}
                          <span className="font-medium">{formatDiscount(coupon.discount)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {coupon.discount?.minOrder ? formatPrice(coupon.discount.minOrder) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={coupon.usedCount >= coupon.quantity ? 'text-orange-600' : ''}>
                          {coupon.usedCount || 0} / {coupon.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CouponFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        coupon={selectedCoupon}
        onSuccess={fetchData}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        coupon={selectedCoupon}
        onConfirm={fetchData}
      />
    </div>
  )
}
