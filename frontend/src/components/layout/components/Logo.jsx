import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'

export default function Logo({ variant = 'full', className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <Package className="w-8 h-8 text-blue-600" />
      {variant === 'full' && (
        <span className="font-serif text-xl font-semibold text-gray-800">PA BUILD MATERIAL</span>
      )}
    </Link>
  )
}
