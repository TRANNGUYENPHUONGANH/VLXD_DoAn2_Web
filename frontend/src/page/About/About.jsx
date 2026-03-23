import { MapPin, Phone, Mail, Clock, Hammer, Truck, Award, Users, Package, Shield, HeadphonesIcon, Calculator, Building2 } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col justify-center items-center text-center">
          <div className="mb-6">
            <Building2 className="w-16 h-16 text-white mx-auto" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Về VLXD - Vật Liệu Xây Dựng
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl">
            Đồng hành xây dựng ngôi nhà mơ ước của bạn
          </p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Chúng tôi cam kết<br />
              <span className="text-blue-500">chất lượng hàng đầu</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              <strong>VLXD - Vật Liệu Xây Dựng</strong> là địa chỉ uy tín chuyên cung cấp các vật liệu xây dựng chất lượng cao,
              được kiểm tra và chứng nhận từ các nhà sản xuất uy tín. Chúng tôi cam kết mang đến sản phẩm đạt tiêu chuẩn
              với giá cả cạnh tranh nhất trên thị trường.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Với sứ mệnh đồng hành cùng quý khách hàng trong mọi công trình, chúng tôi không ngừng cải tiến
              dịch vụ và mở rộng danh mục sản phẩm để đáp ứng mọi nhu cầu xây dựng, từ nhà ở dân sinh đến
              các công trình quy mô lớn.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <span className="font-medium text-gray-700">Cam kết chất lượng, bảo hành uy tín</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=500&fit=crop"
              alt="Vật liệu xây dựng"
              className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=500&fit=crop"
              alt="Công trình xây dựng"
              className="w-full h-64 object-cover rounded-2xl shadow-lg mt-8"
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">5+</div>
              <div className="text-white/80">Năm kinh nghiệm</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">200+</div>
              <div className="text-white/80">Sản phẩm VLXD</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">5000+</div>
              <div className="text-white/80">Khách hàng</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">8000+</div>
              <div className="text-white/80">Đơn hàng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
          Tại sao chọn <span className="text-blue-500">VLXD</span>?
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Chúng tôi cam kết mang đến cho bạn vật liệu xây dựng chất lượng với dịch vụ tận tâm
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Sản phẩm chính hãng</h3>
            <p className="text-gray-600">
              Tất cả vật liệu đều có nguồn gốc rõ ràng, chứng nhận chất lượng từ các nhà sản xuất uy tín.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Giao hàng tận công trình</h3>
            <p className="text-gray-600">
              Vận chuyển nhanh chóng, đảm bảo an toàn đến tận công trình xây dựng của quý khách.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeadphonesIcon className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tư vấn chuyên nghiệp</h3>
            <p className="text-gray-600">
              Đội ngũ tư vấn nhiệt tình, hỗ trợ lựa chọn vật liệu phù hợp với nhu cầu và ngân sách của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Sản phẩm <span className="text-blue-500">của chúng tôi</span>
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Đa dạng vật liệu xây dựng để đáp ứng mọi nhu cầu công trình
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Hammer className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Xi măng</h3>
              <p className="text-gray-600 text-sm">
                Xi măng các loại: PCB30, PCB40, PC50 từ các thương hiệu uy tín
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Sắt thép</h3>
              <p className="text-gray-600 text-sm">
                Thép xây dựng, thép hộp, thép tròn các loại từ các nhà máy lớn
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Gạch & Đá</h3>
              <p className="text-gray-600 text-sm">
                Gạch đỏ, gạch block, đá 1x2, đá 4x6, cát các loại
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Vật liệu hoàn thiện</h3>
              <p className="text-gray-600 text-sm">
                Ngói, sơn, gạch ốp lát, thiết bị vệ sinh các loại
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          Liên hệ <span className="text-blue-500">với chúng tôi</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Địa chỉ</h3>
            <p className="text-gray-600 text-sm">
              123 Đường Nguyễn Trãi,<br />Quận 1, TP. HCM
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Điện thoại</h3>
            <p className="text-gray-600 text-sm">
              0901 234 567<br />
              028 1234 5678
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Email</h3>
            <p className="text-gray-600 text-sm">
              contact@vlxd.com<br />
              info@vlxd.com
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Giờ mở cửa</h3>
            <p className="text-gray-600 text-sm">
              Thứ 2 - Chủ nhật<br />
              7:00 - 21:00
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng xây dựng ngôi nhà mơ ước?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Hãy liên hệ ngay với chúng tôi để được tư vấn và báo giá các vật liệu xây dựng tốt nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/products"
              className="px-8 py-3 bg-white text-blue-500 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Xem sản phẩm
            </a>
            <a
              href="/contact"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Liên hệ ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
