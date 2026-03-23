import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Package,
  Search,
  X,
  MapPin,
  Truck,
  CreditCard,
  Clock,
  ChevronRight,
  ShoppingBag,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Star,
  Send,
  Upload,
} from "lucide-react";
import { selectCurrentUser } from "~/redux/user/userSlice";
import {
  getMyOrdersAPI,
  cancelOrderAPI,
  createReviewAPI,
  getReviewsByOrderIdAPI,
} from "~/apis";

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
    label: "Đang giao hàng",
    color: "bg-violet-100 text-violet-700 border-violet-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao hàng",
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
  COD: {
    label: "Thanh toán khi nhận hàng",
    color: "bg-gray-100 text-gray-700",
  },
  VNPAY: { label: "VNPAY", color: "bg-blue-100 text-blue-700" },
  MOMO: { label: "MoMo", color: "bg-pink-100 text-pink-700" },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: "Chờ thanh toán", color: "bg-amber-100 text-amber-700" },
  PAID: { label: "Đã thanh toán", color: "bg-emerald-100 text-emerald-700" },
  FAILED: { label: "Thanh toán thất bại", color: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-700" },
};

const ORDER_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
];

// Review Modal Component
const ReviewModal = ({ open, onClose, order, onSubmitReview }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && order?.items?.length > 0) {
      setSelectedProduct(order.items[0]);
      setRating(5);
      setComment("");
      setImages([]);
      setImagePreviews([]);
    }
  }, [open, order]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 5) {
      toast.warning("Tối đa 5 hình ảnh");
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(`${file.name} vượt quá 5MB`);
        return false;
      }
      if (!file.type.startsWith("image/")) {
        toast.warning(`${file.name} không phải hình ảnh`);
        return false;
      }
      return true;
    });

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderId", order._id);
      formData.append("productId", selectedProduct.productId);
      formData.append("rating", rating);
      formData.append("content", comment);

      images.forEach((image) => {
        formData.append("images", image);
      });

      await onSubmitReview(formData);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold">Đánh giá sản phẩm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn sản phẩm
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {order?.items?.map((item) => (
                <div
                  key={item.productId}
                  onClick={() => setSelectedProduct(item)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedProduct?.productId === item.productId
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=100"
                    }
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá của bạn
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {rating === 5
                ? "Tuyệt vời"
                : rating === 4
                  ? "Rất tốt"
                  : rating === 3
                    ? "Tốt"
                    : rating === 2
                      ? "Trung bình"
                      : "Kém"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét của bạn
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh (tùy chọn)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imagePreviews.length < 5 && (
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("review-image-input").click()
                  }
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                </button>
              )}
            </div>
            <input
              id="review-image-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tối đa 5 hình ảnh, mỗi hình tối đa 5MB
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedProduct}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gửi đánh giá
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderDetailModal = ({
  open,
  onClose,
  order,
  onCancel,
  onReview,
  reviewedProducts = {},
}) => {
  if (!order) return null;

  const StatusIcon = STATUS_ORDER_CONFIG[order.status]?.icon || Clock;
  const isDelivered = order.status === "DELIVERED";

  // Check if all products in the order have been reviewed
  const reviewedCount = (reviewedProducts[order._id] || []).length;
  const totalProducts = order.items?.length || 0;
  const allReviewed = reviewedCount >= totalProducts;

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "flex" : "hidden"} items-center justify-center p-4`}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold">
            Chi tiết đơn hàng #{order._id?.slice(-8).toUpperCase()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status Timeline */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${STATUS_ORDER_CONFIG[order.status]?.color}`}
                >
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">
                    {STATUS_ORDER_CONFIG[order.status]?.label || order.status}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              {order.status === "PENDING" && (
                <button
                  onClick={() => onCancel(order._id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                >
                  Hủy đơn
                </button>
              )}
              {isDelivered && (
                <button
                  onClick={onReview}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    allReviewed
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}
                >
                  <Star className="w-4 h-4" />
                  {allReviewed ? "Đã đánh giá" : "Đánh giá"}
                  {totalProducts - reviewedCount > 0 && !allReviewed && (
                    <span className="text-xs">
                      ({totalProducts - reviewedCount})
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Thông tin thanh toán
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${PAYMENT_METHOD_CONFIG[order.payment?.method]?.color}`}
                >
                  {PAYMENT_METHOD_CONFIG[order.payment?.method]?.label ||
                    order.payment?.method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${PAYMENT_STATUS_CONFIG[order.payment?.status]?.color}`}
                >
                  {PAYMENT_STATUS_CONFIG[order.payment?.status]?.label ||
                    order.payment?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Địa chỉ giao hàng
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium">
                {order.receiverAddress?.fullname} -{" "}
                {order.receiverAddress?.phone}
              </p>
              <p className="text-gray-600 text-sm">
                {order.receiverAddress?.address}, {order.receiverAddress?.ward},{" "}
                {order.receiverAddress?.district},{" "}
                {order.receiverAddress?.province}
              </p>
            </div>
          </div>

          {/* Delivery Time */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-600" />
              Thời gian giao hàng
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <p className="font-medium">
                {order.deliveryInfo?.deliveryDate &&
                  new Date(order.deliveryInfo.deliveryDate).toLocaleDateString(
                    "vi-VN",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
              </p>
              <p className="text-gray-600 text-sm">
                {order.deliveryInfo?.deliveryTimeSlot}
              </p>
              {order.deliveryInfo?.cardMessage && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm text-gray-500">Lời chúc:</p>
                  <p className="italic text-pink-600">
                    {order.deliveryInfo.cardMessage}
                  </p>
                </div>
              )}
              {order.deliveryInfo?.note && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm text-gray-500">Ghi chú:</p>
                  <p className="text-gray-600">{order.deliveryInfo.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Sản phẩm đã đặt ({order.items?.length})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=100"
                    }
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-gray-500 text-sm">
                      Size: {item.size} | Số lượng: {item.quantity}
                    </p>
                    <p className="font-semibold text-blue-600 mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-3">Tổng tiền</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(order.totalProductPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>
                  {order.shippingFee === 0
                    ? "Miễn phí"
                    : formatPrice(order.shippingFee)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              {order.couponCode && (
                <div className="flex justify-between text-gray-600">
                  <span>Mã giảm giá</span>
                  <span className="text-pink-600">{order.couponCode}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Tổng cộng</span>
                <span className="text-blue-600">
                  {formatPrice(order.finalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState({}); // Track reviewed products per order

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [currentUser, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrdersAPI();
      const ordersData = response.data || [];
      setOrders(ordersData);

      // Fetch reviews for delivered orders
      const deliveredOrders = ordersData.filter(
        (o) => o.status === "DELIVERED",
      );
      const reviewsMap = {};

      for (const order of deliveredOrders) {
        try {
          const reviewResponse = await getReviewsByOrderIdAPI(order._id);
          const reviews = reviewResponse.data || [];
          // Store productId as string for comparison
          reviewsMap[order._id] = reviews.map((r) =>
            String(r.productId?._id || r.productId),
          );
        } catch (err) {
          console.error("Error fetching reviews for order:", order._id, err);
          reviewsMap[order._id] = [];
        }
      }

      setReviewedProducts(reviewsMap);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      await cancelOrderAPI(orderId);
      toast.success("Hủy đơn hàng thành công");
      fetchOrders();
      setShowDetailModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      // reviewData là FormData, gửi trực tiếp
      await createReviewAPI(reviewData);
      toast.success("Đánh giá của bạn đã được gửi!");

      // Fetch updated reviews for this order
      try {
        const reviewResponse = await getReviewsByOrderIdAPI(reviewData.orderId);
        const reviews = reviewResponse.data || [];
        setReviewedProducts((prev) => ({
          ...prev,
          [reviewData.orderId]: reviews.map((r) =>
            String(r.productId?._id || r.productId),
          ),
        }));
      } catch (err) {
        console.error("Error fetching updated reviews:", err);
      }
    } catch (error) {
      throw error;
    }
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "ALL" || order.status === activeTab;
    const matchesSearch =
      !searchTerm ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.slice(-8).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getOrderId = (id) => {
    return id ? `#${id.slice(-8).toUpperCase()}` : "";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lịch sử đơn hàng
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các đơn hàng của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {ORDER_TABS.map((tab) => {
            const count =
              tab.key === "ALL"
                ? orders.length
                : orders.filter((o) => o.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.key ? "bg-white/20" : "bg-gray-200"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Không tìm thấy đơn hàng phù hợp"
                : "Bạn chưa có đơn hàng nào"}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Mua sắm ngay
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon =
                STATUS_ORDER_CONFIG[order.status]?.icon || Clock;
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-lg">
                        {getOrderId(order._id)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_ORDER_CONFIG[order.status]?.color}`}
                    >
                      <StatusIcon className="w-4 h-4 inline mr-1" />
                      {STATUS_ORDER_CONFIG[order.status]?.label || order.status}
                    </span>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {order.items?.length} sản phẩm
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            Giao đến: {order.receiverAddress?.district},{" "}
                            {order.receiverAddress?.province}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <CreditCard className="w-4 h-4" />
                          <span>
                            {PAYMENT_METHOD_CONFIG[order.payment?.method]
                              ?.label || order.payment?.method}
                          </span>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="text-right">
                        <p className="text-gray-600 text-sm mb-1">Tổng tiền</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatPrice(order.finalPrice)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4 pt-4 border-t">
                      <button
                        onClick={() => openOrderDetail(order)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Hủy đơn
                        </button>
                      )}
                      {order.status === "DELIVERED" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowReviewModal(true);
                            }}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                              (reviewedProducts[order._id] || []).length >=
                              (order.items?.length || 0)
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            }`}
                          >
                            <Star className="w-4 h-4" />
                            {(reviewedProducts[order._id] || []).length >=
                            (order.items?.length || 0)
                              ? "Đã đánh giá"
                              : `Đánh giá (${(order.items?.length || 0) - (reviewedProducts[order._id] || []).length})`}
                          </button>
                          <button
                            onClick={() => navigate(`/products`)}
                            className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Mua lại
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        order={selectedOrder}
        onCancel={handleCancelOrder}
        onReview={() => {
          setShowDetailModal(false);
          setShowReviewModal(true);
        }}
        reviewedProducts={reviewedProducts}
      />

      {/* Review Modal */}
      <ReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        order={selectedOrder}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
}
