import React from 'react'
import Portfolio from '@/components/olivestocks_portfolio/Portfolio'
import BannerAds from '@/components/olivestocks_portfolio/BannerAds'
import StockTickerCarousel from '@/components/Watchlist/StockTickerCarousel'
import Articles from '@/shared/Articles'

export default function page() {
  return (
    <>
      <StockTickerCarousel />
      <div className="container mx-auto">
        <Portfolio title="Olive Stocks Portfolio" />
      </div>
      <BannerAds />
      <Articles />
    </>
  )
}
