import BannerAds from "@/components/News/BannerAds";
import AlertsCards from "@/components/Watchlist/AlertsCards";
import StockTickerCarousel from "@/components/Watchlist/StockTickerCarousel";
import Articles from "@/shared/Articles";
import React from "react";
import WatchlistTable from "./_components/WathclistTable";

const WatchlistPage = () => {
  return (
    <div className="px-1 lg:px-0">
      <StockTickerCarousel />
      <WatchlistTable />
      <AlertsCards />
      <BannerAds />
      <Articles />
    </div>
  );
};

export default WatchlistPage;
