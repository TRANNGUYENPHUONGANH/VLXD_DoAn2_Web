import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  Share2,
  Facebook,
  Twitter,
} from "lucide-react";
import { getArticleByIdAPI, getArticlesAPI } from "~/apis";
import { motion } from "framer-motion";

const MOCK_ARTICLE = {
  _id: "1",
  name: "Cách bảo quản vật liệu xây dựng hiệu quả",
  slug: "cach-bao-quan-vat-lieu-xay-dung-hieu-qua",
  thumbnail_url:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200ttps://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200",
  summary:
    "Hướng dẫn bảo quản vật liệu xây dựng đúng cách giúp tăng độ bền, tiết kiệm chi phí và đảm bảo chất lượng công trình.",
  content: `
    <h2>Giới thiệu</h2>
    <p>Vật liệu xây dựng đóng vai trò quan trọng trong mọi công trình. Tuy nhiên, nếu không được bảo quản đúng cách, vật liệu có thể bị hư hỏng, giảm chất lượng và gây thiệt hại chi phí. Bài viết này sẽ chia sẻ những cách bảo quản vật liệu xây dựng hiệu quả nhất.</p>

    <h2>1. Lựa chọn vật liệu chất lượng</h2>
    <p>Khi nhập vật liệu, cần kiểm tra kỹ nguồn gốc, chất lượng và tình trạng sản phẩm. Tránh sử dụng vật liệu bị ẩm mốc, nứt vỡ hoặc không đạt tiêu chuẩn.</p>

    <h2>2. Bảo quản xi măng đúng cách</h2>
    <p>Xi măng cần được lưu trữ ở nơi khô ráo, thoáng mát và tránh tiếp xúc trực tiếp với nền đất. Nên xếp xi măng trên pallet và cách tường ít nhất 20cm để tránh ẩm.</p>

    <h2>3. Lưu trữ sắt thép</h2>
    <p>Sắt thép nên được đặt ở nơi cao ráo, tránh nước mưa để hạn chế gỉ sét. Có thể phủ bạt hoặc sơn chống gỉ để tăng độ bền.</p>

    <h2>4. Bảo quản gạch và cát đá</h2>
    <p>Gạch cần được xếp gọn gàng, tránh va đập mạnh. Cát và đá nên được che chắn để không bị rửa trôi hoặc lẫn tạp chất.</p>

    <h2>Kết luận</h2>
    <p>Việc bảo quản vật liệu xây dựng đúng cách giúp đảm bảo chất lượng công trình và tiết kiệm chi phí. Hãy áp dụng những phương pháp trên để quản lý vật liệu hiệu quả hơn.</p>
  `,
  author: { name: "Ngọc Trân" },
  createdAt: "2024-03-10",
  relatedArticles: [
    {
      _id: "2",
      name: "Cách chọn xi măng chất lượng",
      thumbnail_url:
        "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600",
      slug: "cach-chon-xi-mang-chat-luong",
    },
    {
      _id: "3",
      name: "Phân biệt các loại thép xây dựng",
      thumbnail_url:
        "https://images.unsplash.com/photo-1590650046871-92c887180603?w=600",
      slug: "phan-biet-thep-xay-dung",
    },
    {
      _id: "4",
      name: "Kinh nghiệm quản lý kho vật liệu",
      thumbnail_url:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
      slug: "quan-ly-kho-vat-lieu",
    },
  ],
};

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getArticleByIdAPI(id);
        const articleData = response?.data || response;
        if (articleData) {
          setArticle(articleData);
        } else {
          setArticle(MOCK_ARTICLE);
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setArticle(MOCK_ARTICLE);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRelatedArticles = async () => {
      try {
        const response = await getArticlesAPI();
        const articlesData = response?.data || response || [];
        const allArticles = Array.isArray(articlesData) ? articlesData : [];
        setRelatedArticles(allArticles.slice(0, 3));
      } catch (err) {
        console.error("Error fetching related articles:", err);
        setRelatedArticles(MOCK_ARTICLE.relatedArticles || []);
      }
    };

    fetchArticle();
    fetchRelatedArticles();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article?.name || "";

    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        "_blank",
      );
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        "_blank",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="h-10 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-2/3 bg-gray-200 rounded animate-pulse mb-8" />
            <div className="flex gap-4">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="aspect-video bg-gray-200 rounded-2xl animate-pulse mb-8" />
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại tin tức
          </button>

          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
              Tin tức
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {article?.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(article?.createdAt)}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {article?.author?.name || "Admin"}
            </span>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-10">
        <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-xl">
          <img
            src={
              article?.thumbnail_url ||
              article?.thumbnail ||
              "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200"
            }
            alt={article?.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm">
          {/* Share Buttons */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b">
            <span className="text-gray-500 text-sm">Chia sẻ bài viết:</span>
            <div className="flex gap-3">
              <button
                onClick={() => handleShare("facebook")}
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="w-10 h-10 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center hover:bg-sky-200 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Article Content */}
          <div
            className="pblue pblue-lg max-w-none
              pblue-headings:font-bold pblue-headings:text-gray-900 pblue-headings:mt-8 pblue-headings:mb-4
              pblue-p:text-gray-600 pblue-p:leading-relaxed pblue-p:mb-6
              pblue-a:text-blue-500 pblue-a:no-underline hover:pblue-a:underline
              pblue-img:rounded-xl pblue-img:shadow-lg
              first:pblue-p:mt-0 first:pblue-p:mb-6"
            dangerouslySetInnerHTML={{
              __html: article?.content || article?.summary,
            }}
          />

          {/* Tags */}
          {article?.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="bg-white border-t py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Bài viết liên quan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related._id}
                  to={`/blog/${related._id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={
                          related.thumbnail_url ||
                          related.thumbnail ||
                          "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600"
                        }
                        alt={related.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {related.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {related.summary || related.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Bạn cần tư vấn thêm?
          </h3>
          <p className="text-gray-600 mb-6">
            Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
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
  );
}
