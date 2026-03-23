import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Flower2 } from "lucide-react";
import { getCategoriesAPI } from "~/apis";
import { motion } from "framer-motion";

const DEFAULT_CATEGORIES = [
  {
    _id: "1",
    name: "Hoa cưới",
    image: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=600",
    slug: "hoa-cuoi",
    description: "Những bó hoa cưới sang trọng",
  },
  {
    _id: "2",
    name: "Hoa sinh nhật",
    image: "https://images.unsplash.com/photo-1518882605630-8eb582dd4e5d?w=600",
    slug: "hoa-sinh-nhat",
    description: "Tặng người thương nhân dịp đặc biệt",
  },
  {
    _id: "3",
    name: "Hoa khai trương",
    image: "https://images.unsplash.com/photo-1566937169390-7be4c63b8a0e?w=600",
    slug: "hoa-khai-truong",
    description: "Chúc mừng khai trương thành công",
  },
  {
    _id: "4",
    name: "Hoa tang lễ",
    image: "https://images.unsplash.com/photo-1596720626382-3dc1a962a5c2?w=600",
    slug: "hoa-tang-le",
    description: "Gửi lời chia buồn đến gia đình",
  },
  {
    _id: "5",
    name: "Combo quà tặng",
    image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600",
    slug: "combo-qua-tang",
    description: "Quà tặng ý nghĩa",
  },
  {
    _id: "6",
    name: "Hoa tình yêu",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600",
    slug: "hoa-tinh-yeu",
    description: "Biểu đạt tình yêu của bạn",
  },
  {
    _id: "7",
    name: "Hoa hồng",
    image: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600",
    slug: "hoa-hong",
    description: "Hoa hồng đỏ, hồng, trắng...",
  },
  {
    _id: "8",
    name: "Hoa lan",
    image: "https://images.unsplash.com/photo-1560729008-7b71c1f4e3e9?w=600",
    slug: "hoa-lan",
    description: "Hoa lan sang trọng và quý phái",
  },
];

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesAPI();
        const categoriesData =
          response.data?.data || response.data || response || [];
        const allCategories = Array.isArray(categoriesData)
          ? categoriesData
          : [];
        setCategories(
          allCategories.length > 0 ? allCategories : DEFAULT_CATEGORIES,
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="h-10 w-64 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border-4 border-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Flower2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Danh mục sản phẩm
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-xl">
            Khám phá các loại vật liệu xây dựng chất lượng cao, được chọn lọc kỹ
            lưỡng cho mọi công trình của bạn
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {categories.map((category, index) => (
            <motion.div key={category._id || index} variants={itemVariants}>
              <Link
                to={`/shop?category=${category.slug || category._id}`}
                className="group block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-[4/3] relative">
                  <img
                    src={
                      category.image ||
                      category.images?.[0] ||
                      "https://images.unsplash.com/photo-1518882605630-8eb582dd4e5d?w=600"
                    }
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-blue-200 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2">
                      {category.description || "Xem chi tiết"}
                    </p>
                    <div className="flex items-center gap-1 text-white/80 text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Xem ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Border Effect */}
                  <div className="absolute inset-0 ring-2 ring-inset ring-white/0 group-hover:ring-white/30 transition-all rounded-2xl" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flower2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có danh mục nào
            </h3>
            <p className="text-gray-500 mb-6">Danh mục sẽ sớm được cập nhật</p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white py-12 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Bạn cần tư vấn thêm?
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng tư vấn giải pháp
              vật liệu xây dựng tối ưu cho công trình của bạn
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium inline-flex items-center gap-2"
            >
              Liên hệ ngay
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
