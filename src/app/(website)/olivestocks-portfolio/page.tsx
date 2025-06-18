import React from 'react'
import Portfolio from '@/components/murakkabs_portfolio/Portfolio'
import UnderRader from '@/components/murakkabs_portfolio/UnderRader'
import BannerAds from '@/components/murakkabs_portfolio/BannerAds'
import StockTickerCarousel from '@/components/Watchlist/StockTickerCarousel'
import Articles from '@/shared/Articles'

export default function page() {
  return (
    <>
      <StockTickerCarousel />
      <Portfolio />
      <UnderRader />
      <BannerAds />
      <Articles />
    </>
  )
}
