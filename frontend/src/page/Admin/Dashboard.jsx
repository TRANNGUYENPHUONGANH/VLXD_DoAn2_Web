import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  ShoppingBag,
  Package,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { getDashboardAPI } from '~/apis'

const COLORS = ['#F59E0B', '#0EA5E9', '#A855F7', '#10B981', '#DC2626']

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusLabel = (status) => {
  const key = (status || '').toLowerCase()
  const labels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    arranging_flowers: 'Đang cắm hoa',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
  }
  return labels[key] || status
}

const getStatusColor = (status) => {
  const key = (status || '').toLowerCase()
  const colors = {
    pending: '#F59E0B',        // Cam - Chờ xác nhận
    confirmed: '#0EA5E9',     // Xanh da trời - Đã xác nhận
    arranging_flowers: '#A855F7', // Tím - Đang cắm hoa
    shipping: '#8B5CF6',      // Violet - Đang giao
    delivered: '#10B981',    // Xanh lá - Đã giao
    cancelled: '#DC2626'     // Đỏ - Đã hủy
  }
  return colors[key] || '#6B7280'
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('6')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const targetDate = new Date()
        targetDate.setMonth(targetDate.getMonth() - parseInt(timeRange))

        const response = await getDashboardAPI()
        if (response.success) {
          setDashboardData(response.data)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
        Lỗi: {error}
      </div>
    )
  }

  // Prepare data for pie chart
  const orderStatusData = dashboardData?.orderStatusStats?.map((status) => ({
    name: getStatusLabel(status._id),
    value: status.count,
    color: getStatusColor(status._id)
  })) || []

  const totalOrderCount = orderStatusData.reduce((sum, item) => sum + item.value, 0)

  // Format revenue data for bar chart
  const revenueData = dashboardData?.revenueOverTime?.map((item) => ({
    name: item.date,
    revenue: item.totalRevenue,
    formattedDate: item.date?.slice(5) // MM-YY
  })) || []

  const stats = [
    {
      title: 'Tổng đơn hàng',
      value: dashboardData?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(dashboardData?.totalRevenue || 0),
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Sản phẩm',
      value: dashboardData?.totalProducts || 0,
      icon: Package,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Người dùng',
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-gray-500 mt-1">Chào mừng đến với trang quản trị</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
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
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Chart (Pie) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái đơn hàng</h2>
          {orderStatusData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} đơn`, 'Số lượng']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {orderStatusData.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm text-gray-600">{status.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{status.value}</span>
                      <span className="text-xs text-gray-400">
                        ({totalOrderCount > 0 ? Math.round((status.value / totalOrderCount) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">Chưa có đơn hàng nào</p>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Chart (Bar) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Doanh thu theo thời gian</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="6">6 tháng gần nhất</option>
              <option value="3">3 tháng gần nhất</option>
              <option value="12">12 tháng gần nhất</option>
            </select>
          </div>
          {revenueData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="formattedDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#60A5FA" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">Chưa có dữ liệu doanh thu</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h2>
          <Link
            to="/admin/orders"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Mã đơn</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Khách hàng</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Tổng tiền</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentOrders?.map((order) => (
                <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <span className="text-sm font-medium text-gray-800">#{order._id?.slice(-6)}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{order.buyerInfo?.fullname || 'Khách'}</p>
                      <p className="text-xs text-gray-400">{order.receiverAddress?.phone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {formatCurrency(order.finalPrice)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'processing' ? 'bg-sky-100 text-sky-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
              {!dashboardData?.recentOrders?.length && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
