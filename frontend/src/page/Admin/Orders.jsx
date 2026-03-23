import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Eye,
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  CreditCard,
  Truck,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Scissors,
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getOrdersAdminAPI, updateOrderStatusAPI } from "~/apis";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

const STATUS_ORDER_CONFIG = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "bg-sky-100 text-sky-700 border-sky-200",
    icon: CheckCircle,
  },
  SHIPPING: {
    label: "Đang giao",
    color: "bg-violet-100 text-violet-700 border-violet-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
};

const PAYMENT_METHOD_CONFIG = {
  COD: { label: "Tiền mặt", color: "bg-gray-100 text-gray-700" },
  VNPAY: { label: "VNPay", color: "bg-blue-100 text-blue-700" },
  MOMO: { label: "MoMo", color: "bg-indigo-100 text-indigo-700" },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Đã thanh toán", color: "bg-green-100 text-green-700" },
  FAILED: { label: "Thất bại", color: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Hoàn tiền", color: "bg-orange-100 text-orange-700" },
};

const STATUS_ORDER_OPTIONS = [
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "FAILED", label: "Thất bại" },
  { value: "REFUNDED", label: "Hoàn tiền" },
];

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "0đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(amount)
    .replace("VND", "đ");
};

const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const getOrderId = (id) => {
  if (!id) return "";
  const idStr = String(id);
  return "#" + idStr.slice(-8).toUpperCase();
};

// Modal chi tiết đơn hàng
const OrderDetailModal = ({ open, onClose, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status || "");
    }
  }, [order]);

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === order.status) {
      toast.info("Vui lòng chọn trạng thái khác");
      return;
    }

    setLoading(true);
    try {
      await updateOrderStatusAPI(order._id, selectedStatus);
      toast.success("Cập nhật trạng thái thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const StatusIcon = STATUS_ORDER_CONFIG[order.status]?.icon || Clock;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        forceMount
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Chi tiết đơn hàng {getOrderId(order._id)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Thông tin đơn hàng & Thanh toán */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Thông tin đơn hàng
              </h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-gray-500">Mã đơn:</span>{" "}
                  {getOrderId(order._id)}
                </p>
                <p>
                  <span className="text-gray-500">Ngày đặt:</span>{" "}
                  {formatDate(order.createdAt)}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Trạng thái:</span>
                  <Badge className={STATUS_ORDER_CONFIG[order.status]?.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {STATUS_ORDER_CONFIG[order.status]?.label || order.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Thanh toán
              </h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-gray-500">Phương thức:</span>{" "}
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${PAYMENT_METHOD_CONFIG[order.payment?.method]?.color}`}
                  >
                    {PAYMENT_METHOD_CONFIG[order.payment?.method]?.label ||
                      order.payment?.method}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Trạng thái:</span>{" "}
                  <Badge
                    className={
                      PAYMENT_STATUS_CONFIG[order.payment?.status]?.color
                    }
                  >
                    {PAYMENT_STATUS_CONFIG[order.payment?.status]?.label ||
                      order.payment?.status}
                  </Badge>
                </p>
                {order.payment?.transactionId && (
                  <p>
                    <span className="text-gray-500">Mã GD:</span>{" "}
                    {order.payment.transactionId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Người mua & Người nhận */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Người mua
              </h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.buyerInfo?.fullname}</p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-500" />
                  {order.buyerInfo?.phone}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Người nhận
              </h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.receiverAddress?.fullname}</p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-500" />
                  {order.receiverAddress?.phone}
                </p>
                <p className="text-gray-500">
                  {order.receiverAddress?.address},{" "}
                  {order.receiverAddress?.district},{" "}
                  {order.receiverAddress?.province}
                </p>
              </div>
            </div>
          </div>

          {/* Sản phẩm */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Sản phẩm ({order.items?.length || 0})
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">STT</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-center">Size</TableHead>
                    <TableHead className="text-center">SL</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">Tổng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.size}</TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Giao hàng */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Thông tin giao hàng
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Ngày giao:</p>
                <p>
                  {order.deliveryInfo?.deliveryDate
                    ? formatDate(order.deliveryInfo.deliveryDate)
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Khung giờ:</p>
                <p>{order.deliveryInfo?.deliveryTimeSlot || "-"}</p>
              </div>
              {order.deliveryInfo?.cardMessage && (
                <div className="col-span-2">
                  <p className="text-gray-500 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Lời nhắn:
                  </p>
                  <p className="italic">"{order.deliveryInfo.cardMessage}"</p>
                </div>
              )}
              {order.deliveryInfo?.isAnonymous && (
                <div>
                  <Badge variant="outline">Gửi ẩn danh</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Tổng tiền</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng sản phẩm:</span>
                <span>{formatCurrency(order.totalProductPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí vận chuyển:</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá ({order.couponCode}):</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-medium text-lg">
                <span>TỔNG CỘNG:</span>
                <span className="text-blue-600">
                  {formatCurrency(order.finalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Cập nhật trạng thái */}
          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <h4 className="font-medium">Cập nhật trạng thái đơn hàng</h4>
              <div className="flex gap-3">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Chọn trạng thái mới" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.value === order.status}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={loading || selectedStatus === order.status}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Cập nhật
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                * Khi chuyển sang trạng thái mới sẽ không thể quay lại trạng
                thái cũ
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Trang chính
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  });

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const status = statusFilter === "all" ? "ALL" : statusFilter;
      const response = await getOrdersAdminAPI({
        page,
        limit: pagination.limit,
        status,
      });

      setOrders(response.data?.orders || []);
      setPagination({
        currentPage: response.data?.pagination?.currentPage || 1,
        totalPages: response.data?.pagination?.totalPages || 1,
        totalRecords: response.data?.pagination?.totalRecords || 0,
        limit: response.data?.pagination?.limit || 10,
      });
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter]);

  // Lọc orders theo search term (client-side)
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      getOrderId(order._id).toLowerCase().includes(search) ||
      order.buyerInfo?.fullname?.toLowerCase().includes(search) ||
      order.buyerInfo?.phone?.includes(search) ||
      order.receiverAddress?.phone?.includes(search) ||
      order.items?.some((item) => item.name?.toLowerCase().includes(search))
    );
  });

  // Filter payment method
  const displayOrders = filteredOrders.filter((order) => {
    if (paymentFilter === "all") return true;
    return order.payment?.method === paymentFilter;
  });

  // Thống kê
  const stats = {
    total: pagination.totalRecords,
    pending: orders.filter((o) => o.status === "PENDING").length,
    confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
    arranging: orders.filter((o) => o.status === "ARRANGING_FLOWERS").length,
    shipping: orders.filter((o) => o.status === "SHIPPING").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tổng đơn
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Chờ xác nhận
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-blue-600">
              Đã xác nhận
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-blue-600">
              {stats.confirmed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-blue-600">
              Đang xử lý
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-blue-600">
              {stats.arranging}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-indigo-600">
              Đang giao
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.shipping}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-green-600">
              Đã giao
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-green-600">
              {stats.delivered}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-red-600">
              Đã hủy
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-2xl font-bold text-red-600">
              {stats.cancelled}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo mã đơn, tên khách, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(STATUS_ORDER_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(PAYMENT_METHOD_CONFIG).map(([key, config]) => (
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
        ) : displayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <ShoppingCart className="w-12 h-12 mb-4 text-gray-300" />
            <p>Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="w-[140px]">Thanh toán</TableHead>
                <TableHead className="w-[130px]">Trạng thái</TableHead>
                <TableHead className="w-[120px]">Ngày đặt</TableHead>
                <TableHead className="w-[80px] text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {displayOrders.map((order) => {
                  const StatusIcon =
                    STATUS_ORDER_CONFIG[order.status]?.icon || Clock;
                  const paymentMethod =
                    PAYMENT_METHOD_CONFIG[order.payment?.method] || {};

                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <TableCell className="font-medium">
                        {getOrderId(order._id)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {order.buyerInfo?.fullname}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.buyerInfo?.phone}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.receiverAddress?.province}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <div
                              key={idx}
                              className="text-sm flex items-center gap-2"
                            >
                              <span className="max-w-[200px] truncate">
                                {item.name}
                              </span>
                              <span className="text-gray-400">
                                x{item.quantity}
                              </span>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <div className="text-sm text-gray-500">
                              +{order.items.length - 2} sản phẩm khác
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.finalPrice)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={paymentMethod.color}>
                            {paymentMethod.label}
                          </Badge>
                          <Badge
                            className={
                              PAYMENT_STATUS_CONFIG[order.payment?.status]
                                ?.color
                            }
                          >
                            {
                              PAYMENT_STATUS_CONFIG[order.payment?.status]
                                ?.label
                            }
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={STATUS_ORDER_CONFIG[order.status]?.color}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {STATUS_ORDER_CONFIG[order.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(order)}
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Trang {pagination.currentPage} / {pagination.totalPages}
            (Tổng: {pagination.totalRecords} đơn hàng)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - pagination.currentPage) <= 1
                );
              })
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <Button
                    variant={
                      page === pagination.currentPage ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedOrder && (
        <OrderDetailModal
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
};

export default OrdersPage;
