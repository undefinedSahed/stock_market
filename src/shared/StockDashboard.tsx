"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import StockTrackingTable from "@/components/HomePage/AllStock";
import TopStocksTable from "@/components/HomePage/ByRating";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import { useLanguage } from "@/providers/LanguageProvider";

export default function StockDashboard() {
  const axiosInstance = useAxios();
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [showAllTop, setShowAllTop] = useState(false);
  const { dictionary } = useLanguage();

  const {
    data: stocks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trending-top-stocks"],
    queryFn: async () => {
      const res = await axiosInstance("/stocks/stock-summary");
      return res.data;
    },
  });

  const topStocks = stocks?.topStocks || [];
  const trendingStocks = stocks?.trendingStocks || [];

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">
            Error loading stock data. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Trending Stocks Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
              <h2 className="text-xl font-bold">{dictionary.trendingStocks}</h2>
              <StockTrackingTable
                trendingStocks={
                  showAllTrending ? trendingStocks : trendingStocks.slice(0, 5)
                }
              />

              {/* Footer */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowAllTrending(!showAllTrending)}
                  className="flex items-center text-sm font-medium text-green-600 hover:text-green-700"
                >
                  {showAllTrending ? "Show Less" : "All Trending Stocks"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Top Stocks Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
              <h2 className="text-xl font-bold">{dictionary.topStocks}</h2>
              <TopStocksTable
                topStocks={showAllTop ? topStocks : topStocks.slice(0, 5)}
              />

              {/* Footer */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowAllTop(!showAllTop)}
                  className="flex items-center text-sm font-medium text-green-600 hover:text-green-700"
                >
                  {showAllTop ? "Show Less" : dictionary.allTopStocks}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
