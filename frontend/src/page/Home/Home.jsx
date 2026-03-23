import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import HeroSection from '~/components/home/HeroSection'
import FeaturesBar from '~/components/home/FeaturesBar'
import CategoriesGrid from '~/components/home/CategoriesGrid'
import FeaturedProducts from '~/components/home/FeaturedProducts'
import PromotionBanner from '~/components/home/PromotionBanner'
import NewArrivals from '~/components/home/NewArrivals'
import CustomerReviews from '~/components/home/CustomerReviews'
import LatestArticles from '~/components/home/LatestArticles'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const toastMsg = searchParams.get('toast')
    if (!toastMsg) return
    toast.success(decodeURIComponent(toastMsg))
    const next = new URLSearchParams(searchParams)
    next.delete('toast')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  return (
    <div>
      {/* Hero Section - Banner Carousel */}
      <HeroSection />

      {/* Features Bar */}
      <FeaturesBar />

      {/* Categories Grid */}
      <CategoriesGrid />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Promotion Banner */}
      <PromotionBanner />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* Latest Articles */}
      <LatestArticles />
    </div>
  )
}
