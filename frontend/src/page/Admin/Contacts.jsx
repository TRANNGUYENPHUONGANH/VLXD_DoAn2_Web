import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Search,
  Eye,
  Trash2,
  Loader2,
  Mail,
  Phone,
  User,
  Calendar,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter
} from 'lucide-react'
import {
  getContactsAPI,
  updateContactAPI,
  deleteContactAPI
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

const STATUS_CONFIG = {
  NEW: {
    label: 'Mới',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: MessageCircle
  },
  PENDING: {
    label: 'Đang chờ',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock
  },
  RESOLVED: {
    label: 'Đã xử lý',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle
  },
  SPAM: {
    label: 'Spam',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertCircle
  }
}

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

const truncateText = (text, maxLength = 80) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Modal xem chi tiết liên hệ
const ContactDetailModal = ({ open, onClose, contact, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: 'NEW',
    adminNotes: ''
  })

  useEffect(() => {
    if (contact) {
      setFormData({
        status: contact.status || 'NEW',
        adminNotes: contact.adminNotes || ''
      })
    }
  }, [contact])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateContactAPI(contact._id, formData)
      toast.success('Cập nhật liên hệ thành công!')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  if (!contact) return null

  const StatusIcon = STATUS_CONFIG[contact.status]?.icon || MessageCircle

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" forceMount>
        <DialogHeader>
          <DialogTitle>Chi tiết liên hệ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Thông tin người liên hệ */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{contact.fullname}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{formatDate(contact.createdAt)}</span>
              </div>
            </div>

            {/* Nội dung tin nhắn */}
            <div className="space-y-2">
              <Label>Nội dung tin nhắn</Label>
              <div className="p-3 bg-gray-50 rounded-lg border max-h-40 overflow-y-auto">
                <p className="whitespace-pre-wrap">{contact.message}</p>
              </div>
            </div>

            {/* Trạng thái */}
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
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ghi chú admin */}
            <div className="space-y-2">
              <Label>Ghi chú của admin</Label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập ghi chú..."
                value={formData.adminNotes}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Modal xác nhận xóa
const DeleteConfirmModal = ({ open, onClose, contact, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteContactAPI(contact._id)
      toast.success('Xóa liên hệ thành công!')
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
      <DialogContent className="max-w-md" forceMount>
        <DialogHeader>
          <DialogTitle>Xóa liên hệ</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Bạn có chắc chắn muốn xóa liên hệ từ <strong>{contact?.fullname}</strong>?</p>
          <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Trang chính
const ContactsPage = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedContact, setSelectedContact] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await getContactsAPI()
      setContacts(response.data || [])
    } catch (error) {
      toast.error('Không thể tải danh sách liên hệ')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  // Lọc liên hệ theo search và status
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      searchTerm === '' ||
      contact.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Thống kê
  const stats = {
    total: contacts.length,
    new: contacts.filter((c) => c.status === 'NEW').length,
    pending: contacts.filter((c) => c.status === 'PENDING').length,
    resolved: contacts.filter((c) => c.status === 'RESOLVED').length,
    spam: contacts.filter((c) => c.status === 'SPAM').length
  }

  const handleViewDetail = (contact) => {
    setSelectedContact(contact)
    setShowDetailModal(true)
  }

  const handleDeleteClick = (contact) => {
    setSelectedContact(contact)
    setShowDeleteModal(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Quản lý liên hệ</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500">Tổng số</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-blue-600">Mới</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-yellow-600">Đang chờ</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-green-600">Đã xử lý</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-red-600">Spam</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-red-600">{stats.spam}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
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
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mb-4 text-gray-300" />
            <p>Không tìm thấy liên hệ nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Thông tin liên hệ</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead className="w-[150px]">Ngày gửi</TableHead>
                <TableHead className="w-[120px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredContacts.map((contact, index) => {
                  const StatusIcon = STATUS_CONFIG[contact.status]?.icon || MessageCircle
                  return (
                    <motion.tr
                      key={contact._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{contact.fullname}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs" title={contact.message}>
                          {truncateText(contact.message, 100)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_CONFIG[contact.status]?.color || 'bg-gray-100'}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {STATUS_CONFIG[contact.status]?.label || contact.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(contact.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(contact)}
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(contact)}
                            title="Xóa"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modals */}
      {selectedContact && (
        <>
          <ContactDetailModal
            open={showDetailModal}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedContact(null)
            }}
            contact={selectedContact}
            onSuccess={fetchContacts}
          />
          <DeleteConfirmModal
            open={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false)
              setSelectedContact(null)
            }}
            contact={selectedContact}
            onSuccess={fetchContacts}
          />
        </>
      )}
    </div>
  )
}

export default ContactsPage
