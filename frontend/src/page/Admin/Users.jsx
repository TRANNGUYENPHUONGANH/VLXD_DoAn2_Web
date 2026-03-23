import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import {
  Users,
  Search,
  Eye,
  Lock,
  Unlock,
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { getUsersAPI, getUserByIdAPI, updateUserStatusAPI } from '~/apis'
import { toast } from 'sonner'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getRoleBadge = (role) => {
  const styles = {
    admin: 'bg-blue-100 text-blue-700 border-blue-200',
    customer: 'bg-blue-100 text-blue-700 border-blue-200'
  }
  const labels = {
    admin: 'Quản trị viên',
    customer: 'Khách hàng'
  }
  return (
    <Badge className={styles[role] || styles.customer}>
      {labels[role] || role}
    </Badge>
  )
}

const ToggleSwitch = ({ isActive, onChange, disabled, userId, userName, currentUserId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const isCurrentUser = currentUserId === userId

  const handleToggle = async () => {
    if (isLoading) return

    // Nếu là chính mình, hiện cảnh báo
    if (isCurrentUser) {
      setShowWarning(true)
      return
    }

    setShowConfirm(true)
  }

  const confirmToggle = async () => {
    setIsLoading(true)
    try {
      const newStatus = !isActive
      const response = await updateUserStatusAPI(userId, { isActive: newStatus })
      if (response.success) {
        onChange(newStatus)
        toast.success(newStatus ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={disabled || isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isActive ? 'bg-green-500' : 'bg-red-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
        {isLoading && (
          <Loader2 className="absolute w-3 h-3 animate-spin text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </button>

      {/* Warning Modal - Cannot lock yourself */}
      <AnimatePresence>
        {showWarning && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowWarning(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-xl w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-yellow-100">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Không thể thao tác
                  </h3>
                  <p className="text-sm text-gray-500">
                    Bạn không thể khóa chính tài khoản của mình
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Tài khoản <strong>{userName}</strong> là tài khoản admin đang đăng nhập hiện tại. Bạn không thể khóa chính mình.
              </p>
              <div className="flex justify-end">
                <Button onClick={() => setShowWarning(false)}>
                  Đồng ý
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-xl w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${isActive ? 'bg-red-100' : 'bg-green-100'}`}>
                  {isActive ? (
                    <Lock className="w-6 h-6 text-red-600" />
                  ) : (
                    <Unlock className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isActive
                      ? 'Người dùng sẽ không thể đăng nhập'
                      : 'Người dùng sẽ có thể đăng nhập lại'}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn <strong>{isActive ? 'khóa' : 'mở khóa'}</strong> tài khoản của{' '}
                <strong>{userName}</strong>?
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={confirmToggle}
                  className={isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                >
                  {isActive ? 'Khóa' : 'Mở khóa'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

const UserDetailModal = ({ userId, open, onClose }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId && open) {
      const fetchUser = async () => {
        setLoading(true)
        try {
          const response = await getUserByIdAPI(userId)
          if (response.success) {
            setUser(response.data)
          }
        } catch (error) {
          toast.error('Không thể tải thông tin người dùng')
        } finally {
          setLoading(false)
        }
      }
      fetchUser()
    }
  }, [userId, open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin người dùng
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : user ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {user.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-semibold">{user.displayName || 'Chưa cập nhật'}</h3>
                <p className="text-gray-500">{user.email}</p>
              </div>
              {getRoleBadge(user.role)}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Ngày đăng ký: {formatDate(user.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {user.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                  {user.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
                </span>
              </div>
              {user.address && (
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user.address}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Không có dữ liệu</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const { currentUser } = useSelector((state) => state.user)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [activeUsers, setActiveUsers] = useState(0)
  const [lockedUsers, setLockedUsers] = useState(0)
  const [adminCount, setAdminCount] = useState(0)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [selectedUserId, setSelectedUserId] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const observerRef = useRef()
  const limit = 10

  const fetchUsers = useCallback(async (pageNum = 1, reset = false) => {
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const response = await getUsersAPI({
        page: pageNum,
        limit,
        role: roleFilter,
        isActive: statusFilter
      })

      if (response.success) {
        if (reset) {
          setUsers(response.data.users)
        } else {
          setUsers((prev) => [...prev, ...response.data.users])
        }
        setHasMore(response.data.users.length === limit)
        setPage(pageNum)
      }
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [roleFilter, statusFilter])

  const fetchStats = useCallback(async () => {
    try {
      const [allResponse, activeResponse, lockedResponse, adminResponse] = await Promise.all([
        getUsersAPI({ limit: 1 }),
        getUsersAPI({ limit: 1, isActive: 'true' }),
        getUsersAPI({ limit: 1, isActive: 'false' }),
        getUsersAPI({ limit: 1, role: 'admin' })
      ])

      if (allResponse.success) setTotalUsers(allResponse.data.pagination.totalRecords)
      if (activeResponse.success) setActiveUsers(activeResponse.data.pagination.totalRecords)
      if (lockedResponse.success) setLockedUsers(lockedResponse.data.pagination.totalRecords)
      if (adminResponse.success) setAdminCount(adminResponse.data.pagination.totalRecords)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchUsers(1, true)
    fetchStats()
  }, [roleFilter, statusFilter])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchUsers(page + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, page, fetchUsers])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(e.target.value)
  }

  const filteredUsers = users.filter((user) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    )
  })

  const openUserDetail = (userId) => {
    setSelectedUserId(userId)
    setDetailModalOpen(true)
  }

  const stats = [
    {
      title: 'Tổng người dùng',
      value: totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Hoạt động',
      value: activeUsers,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Bị khóa',
      value: lockedUsers,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Quản trị viên',
      value: adminCount,
      icon: Shield,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        <p className="text-gray-500 mt-1">Quản lý và theo dõi người dùng hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} opacity-10`}>
                    <stat.icon className={`w-8 h-8 ${stat.textColor} opacity-50`} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên hoặc email..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-10 bg-gray-50 border-gray-200 focus:ring-blue-500"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
                <SelectItem value="customer">Khách hàng</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Bị khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[50px] text-center">STT</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày đăng ký</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Không có người dùng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => (
                  <TableRow key={user._id} className="hover:bg-gray-50">
                    <TableCell className="text-center font-medium text-gray-500">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {user.displayName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-800">
                            {user.displayName || 'Chưa cập nhật'}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <ToggleSwitch
                        isActive={user.isActive}
                        userId={user._id}
                        userName={user.displayName || user.email}
                        currentUserId={currentUser?._id}
                        onChange={(newStatus) => {
                          setUsers((prev) =>
                            prev.map((u) =>
                              u._id === user._id ? { ...u, isActive: newStatus } : u
                            )
                          )
                          fetchStats()
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-gray-600">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openUserDetail(user._id)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Infinite scroll trigger */}
        {hasMore && !loading && (
          <div ref={observerRef} className="py-4 text-center">
            {loadingMore && (
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" />
            )}
          </div>
        )}
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedUserId(null)
        }}
      />
    </div>
  )
}
