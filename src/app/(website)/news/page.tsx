"use client"
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

  const { data: allNews = [] } = useQuery({
    queryKey: ["all-news"],
    queryFn: async () => {
      const res = await axiosInstance("/admin/news/market-news");
      return res.data.data;
    },
  });

  const firstNews = allNews[10];

  return (
    <div className="lg:my-20 my-5">
      <BannerAds />
      <StockNewsMain firstNews={firstNews}/>
      <StockMarketNews />
      <ExpertSpotlight />
      <TipRanksLabs />
      <EarningsReportsInsights />
      <MoreFromTip />
    </div>
  );
};

export default NewsPage;
