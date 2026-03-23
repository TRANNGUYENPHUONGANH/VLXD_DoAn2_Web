import { NavLink } from 'react-router-dom'
import { cn } from '~/lib/utils'

const navItems = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Sản phẩm', path: '/products' },
  { label: 'Danh mục', path: '/categories' },
  { label: 'Tin tức', path: '/blog' },
  { label: 'Về chúng tôi', path: '/about' },
  { label: 'Liên hệ', path: '/contact' },
]

export default function Navbar({ className = '', onItemClick }) {
  return (
    <nav className={cn('hidden lg:flex items-center gap-1', className)}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              'px-2 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
              isActive
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
