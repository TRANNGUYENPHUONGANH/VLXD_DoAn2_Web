import { Truck, Package, BadgePercent, ShieldCheck, HeadphonesIcon } from 'lucide-react'
import { cn } from '~/lib/utils'

const features = [
  {
    icon: Truck,
    title: 'Giao hàng nhanh',
    description: 'Giao hàng tận chân công trình'
  },
  {
    icon: Package,
    title: 'Hàng chính hãng',
    description: 'Cam kết hàng chất lượng cao'
  },
  {
    icon: BadgePercent,
    title: 'Giá hợp lý',
    description: 'Nhiều ưu đãi chiết khấu'
  },
  {
    icon: ShieldCheck,
    title: 'Bảo hành uy tín',
    description: 'Hỗ trợ đổi trả hàng'
  },
  {
    icon: HeadphonesIcon,
    title: 'Hỗ trợ 24/7',
    description: 'Tư vấn kỹ thuật miễn phí'
  }
]

export default function FeaturesBar({ className = '' }) {
  return (
    <div className={cn('bg-gray-50 py-6 border-b', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {feature.title}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
