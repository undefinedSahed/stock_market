"use client";
import BannerAds from "@/components/News/BannerAds";
import MoreFromTip from "@/components/News/MoreFromTip";
import StockMarketNews from "@/components/News/StockMarketNews";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";

const NewsPage = () => {
  const axiosInstance = useAxios();

  const params = useParams();
  const path = params.path;

  const { data: allNews = [], isLoading } = useQuery({
    queryKey: ["all-news"],
    queryFn: async () => {
      const res = await axiosInstance("/admin/news/market-news");
      return res.data.data;
    },
  });

  const { data: stockNews = [] } = useQuery({
    queryKey: ["deep-research-news"],
    queryFn: async () => {
      const res = await axiosInstance(
        `/admin/news/deep-research?symbol=${path}`
      );
      return res.data.data;
    },
  });

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
      <MoreFromTip stockNews={stockNews} />
      <StockMarketNews allNews={allNews} />
    </div>
  );
};

export default NewsPage;
