import React from 'react'
import Portfolio from '@/components/murakkabs_portfolio/Portfolio'
import BannerAds from '@/components/murakkabs_portfolio/BannerAds'
import StockTickerCarousel from '@/components/Watchlist/StockTickerCarousel'
import Articles from '@/shared/Articles'

export default function page() {
  return (
    <>
      <StockTickerCarousel />
      <Portfolio />
      <BannerAds />
      <Articles />
    </>
  )
}
