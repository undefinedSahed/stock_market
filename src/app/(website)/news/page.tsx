"use client";
import BannerAds from "@/components/News/BannerAds";
import EarningsReportsInsights from "@/components/News/EarningsReportsInsights";
import ExpertSpotlight from "@/components/News/ExpertSpotlight";
import MoreFromTip from "@/components/News/MoreFromTip";
import StockMarketNews from "@/components/News/StockMarketNews";
import StockNewsMain from "@/components/News/StoctNewsMain";
import TipRanksLabs from "@/components/News/TipRanksLabs";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const NewsPage = () => {
  const axiosInstance = useAxios();

  const { data: allNews = [], isLoading } = useQuery({
    queryKey: ["all-news"],
    queryFn: async () => {
      const res = await axiosInstance("/admin/news/market-news");
      return res.data.data;
    },
  });

  const { data: stockNews = [] } = useQuery({
    queryKey: ["stock-news"],
    queryFn: async () => {
      const res = await axiosInstance("/admin/news/all-news");
      return res.data.data;
    },
  });

  console.log(stockNews)

  const firstNews = allNews[10];
  const rightSide = stockNews[1];
  const leftSide1 = stockNews[2];
  const leftSide2 = stockNews[3];

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 min-h-screen flex flex-col items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!allNews || allNews.length === 0) {
    return (
      <div className="text-2xl text-red-500 min-h-screen flex flex-col items-center justify-center">
        No news available
      </div>
    );
  }

  return (
    <div className="lg:my-20 my-5">
      <BannerAds />
      <StockNewsMain firstNews={firstNews} />
      <StockMarketNews allNews={allNews} />
      <ExpertSpotlight />
      <TipRanksLabs
        rightSide={rightSide}
        leftSide1={leftSide1}
        leftSide2={leftSide2}
      />
      <MoreFromTip stockNews={stockNews} />
      <EarningsReportsInsights />
    </div>
  );
};

export default NewsPage;
