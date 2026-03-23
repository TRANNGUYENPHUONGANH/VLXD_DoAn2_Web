import { Link } from 'react-router-dom'
import { Package, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send } from 'lucide-react'

const footerLinks = {
  shop: [
    { label: 'Cát xây dựng', path: '/products?category=cat' },
    { label: 'Đá dăm', path: '/products?category=da' },
    { label: 'Xi măng', path: '/products?category=xi-mang' },
    { label: 'Gạch các loại', path: '/products?category=gach' },
  ],
  support: [
    { label: 'Câu hỏi thường gặp', path: '/faq' },
    { label: 'Chính sách vận chuyển', path: '/shipping' },
    { label: 'Chính sách đổi trả', path: '/return' },
    { label: 'Liên hệ', path: '/contact' },
  ],
  about: [
    { label: 'Về chúng tôi', path: '/about' },
    { label: 'Tuyển dụng', path: '/careers' },
    { label: 'Tin tức', path: '/blog' },
    { label: 'Liên kết', path: '/partners' },
  ],
}

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Youtube, label: 'Youtube', href: 'https://youtube.com' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="font-serif text-2xl font-semibold text-white">PA BUILD MATERIAL</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              PA BUILD MATERIAL - Chuyên cung cấp vật liệu xây dựng chất lượng cao, giá tốt nhất thị trường.
              Đồng hành cùng công trình của bạn từ khâu thiết kế đến hoàn thiện.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>0123 456 789</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>contact@pabuild.vn</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                <span>123 Đường Nguyễn Trãi, Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Cửa hàng</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About + Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Về chúng tôi</h3>
            <ul className="space-y-3 mb-6">
              {footerLinks.about.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-medium mb-3">Đăng ký nhận tin</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 PA BUILD MATERIAL. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Payment Icons (placeholder) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Thanh toán:</span>
              <div className="flex gap-2">
                {['Visa', 'Master', 'MoMo'].map((payment) => (
                  <div
                    key={payment}
                    className="w-10 h-6 bg-gray-800 rounded text-xs flex items-center justify-center text-gray-500"
                  >
                    {payment}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
