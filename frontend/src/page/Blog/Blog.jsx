import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, User, FileText } from "lucide-react";
import { getArticlesAPI } from "~/apis";
import { motion } from "framer-motion";

const MOCK_ARTICLES = [
  {
    _id: "1",
    name: "Cách chăm sóc hoa tươi lâu nhất",
    summary:
      "Những mẹo nhỏ giúp hoa tươi đẹp trong nhiều ngày. Tìm hiểu cách bảo quản hoa đúng cách...",
    thumbnail_url:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600",
    slug: "cach-cham-soc-hoa-tuoi-lau",
    author: { name: "Ngọc Minh" },
    createdAt: "2024-03-10",
  },
  {
    _id: "2",
    name: "Ý nghĩa các loài hoa trong ngày cưới",
    summary:
      "Tìm hiểu ý nghĩa của các loài hoa trong ngày trọng đại của bạn...",
    thumbnail_url:
      "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=600",
    slug: "y-nghia-cac-loai-hoa-trong-ngay-cuoi",
    author: { name: "Minh Anh" },
    createdAt: "2024-03-08",
  },
  {
    _id: "3",
    name: "Top 10 loại hoa được yêu thích nhất",
    summary: "Khám phá những loại hoa được săn đón nhiều nhất trong năm qua...",
    thumbnail_url:
      "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=600",
    slug: "top-10-loai-hoa-duoc-yeu-thich-nhat",
    author: { name: "Huyền Trang" },
    createdAt: "2024-03-05",
  },
  {
    _id: "4",
    name: "Hoa hồng - Biểu tượng của tình yêu",
    summary: "Khám phá ý nghĩa và lịch sử của loài hoa hồng trong văn hóa...",
    thumbnail_url:
      "https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600",
    slug: "hoa-hong-bieu-tuong-cua-tinh-yeu",
    author: { name: "Lan Anh" },
    createdAt: "2024-03-01",
  },
  {
    _id: "5",
    name: "Cách chọn hoa khai trương ý nghĩa",
    summary: "Hướng dẫn chọn hoa khai trương mang lại may mắn và thành công...",
    thumbnail_url:
      "https://images.unsplash.com/photo-1566937169390-7be4c63b8a0e?w=600",
    slug: "cach-chon-hoa-khai-truong-y-nghia",
    author: { name: "Tuấn Anh" },
    createdAt: "2024-02-25",
  },
  {
    _id: "6",
    name: "Xu hướng hoa tươi 2024",
    summary:
      "Những xu hướng hoa tươi đang được ưa chuộng nhất trong năm 2024...",
    thumbnail_url:
      "https://images.unsplash.com/photo-1518882605630-8eb582dd4e5d?w=600",
    slug: "xu-huong-hoa-tuoi-2024",
    author: { name: "Thanh Hà" },
    createdAt: "2024-02-20",
  },
];

export default function Blog() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getArticlesAPI();
        const articlesData = response?.data || response || [];
        setArticles(Array.isArray(articlesData) ? articlesData : MOCK_ARTICLES);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setArticles(MOCK_ARTICLES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const featuredArticle = articles.length > 0 ? articles[0] : MOCK_ARTICLES[0];
  const otherArticles =
    articles.length > 0 ? articles.slice(1) : MOCK_ARTICLES.slice(1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full" />
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
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Tin tức & Blog
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-xl">
            Cập nhật tin tức mới nhất, kinh nghiệm và kiến thức về vật liệu xây
            dựng
          </p>
        </div>
      </div>

      {/* Featured Article */}
      {featuredArticle && !isLoading && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            to={`/blog/${featuredArticle._id}`}
            className="group block"
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-[4/3] md:aspect-auto relative overflow-hidden">
                  <img
                    src={
                      featuredArticle.thumbnail_url ||
                      featuredArticle.thumbnail ||
                      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800"
                    }
                    alt={featuredArticle.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full w-fit mb-4">
                    Bài viết nổi bật
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {featuredArticle.name}
                  </h2>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {featuredArticle.summary || featuredArticle.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featuredArticle.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {featuredArticle.author?.name || "Admin"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Bài viết mới nhất
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="aspect-video bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {otherArticles.map((article) => (
              <motion.div key={article._id} variants={itemVariants}>
                <Link
                  to={`/blog/${article._id}`}
                  className="group block h-full"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={
                          article.thumbnail_url ||
                          article.thumbnail ||
                          "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600"
                        }
                        alt={article.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                        {article.summary || article.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(article.createdAt)}
                        </span>
                        <span className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                          Đọc tiếp
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && articles.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có bài viết nào
            </h3>
            <p className="text-gray-500 mb-6">
              Các bài viết sẽ sớm được cập nhật
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white py-12 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Bạn đang tìm vật liệu xây dựng?
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Khám phá bộ sưu tập vật liệu xây dựng chất lượng cao của chúng tôi
              và chọn cho mình một sản phẩm ưng ý
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium inline-flex items-center gap-2"
            >
              Xem sản phẩm
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
