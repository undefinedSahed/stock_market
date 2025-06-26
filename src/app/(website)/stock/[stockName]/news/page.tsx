"use client";

import RecentNews from "@/components/overview/news";
import { Button } from "@/components/ui/button";
import { Check, ChevronUp, Loader2 } from "lucide-react";
import StockNews from "./_components/StockNews";
import StockPremiumBanner from "@/components/Portfolio/chart/chart-bottom";
import OverviewFAQ from "@/components/overview/overview-faq";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const axiosInstance = useAxios();

  const { data: allNews = [], isLoading } = useQuery({
    queryKey: ["overview-news"],
    queryFn: async () => {
      const res = await axiosInstance("/admin/news/market-news");
      return res.data.data;
    },
  });

  if (isLoading)
    return (
      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
      </div>
    );

  return (
    <div className="lg:w-[75vw]">
      <div className="mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold">
            Apple (AAPL) Stock News & Sentiment
          </h3>

          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="outline"
              className="h-9 px-4 border-green-500 text-green-600 hover:bg-green-50 rounded-3xl"
            >
              <ChevronUp className="mr-1 h-4 w-4" />
              Compare
            </Button>

            <Button className="h-9 px-4 bg-green-500 hover:bg-green-600 text-white rounded-3xl">
              <Check className="mr-1 h-4 w-4" />
              Follow
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 bg-green-500/45 text-white rounded-3xl"
            >
              Portfolio
            </Button>
          </div>
        </div>

        <div className="mt-4 text-right text-sm text-gray-500">
          251,279 Followers
        </div>
      </div>

      {/* page layout */}
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <div className="lg:w-[75%]">
          <div>
            <StockNews stockNews={allNews} />
          </div>

          {/* <div>
            <NewsAndScore />
          </div> */}

          {/* <div className="mt-10">
            <MediaCoverageChart />
          </div> */}

          <div className="mt-16">
            <OverviewFAQ />
          </div>

          <div className="mt-16">
            <StockPremiumBanner />
          </div>
        </div>

        <div className="lg:w-[25%]">
          <RecentNews />
        </div>
      </div>
    </div>
  );
};

export default Page;
