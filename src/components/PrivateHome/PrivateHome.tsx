"use client";

import type React from "react";

import LatestArticles from "@/shared/Articles";
import StockDashboard from "@/shared/StockDashboard";
import Image from "next/image";
import StockTickerCarousel from "../Watchlist/StockTickerCarousel";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, TrendingUp, TrendingDown } from "lucide-react";
import useAxios from "@/hooks/useAxios";
import { useDebounce } from "@/hooks/useDebounce";

interface StockResult {
  symbol: string;
  description: string;
  flag: string;
  price: number;
  change: number;
  percentChange: number;
  logo?: string;
  exchange?: string;
}

interface SearchResponse {
  success: boolean;
  results: StockResult[];
}

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

const PrivateHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const axiosInstance = useAxios();

  // TanStack Query for search
  const debouncedQuery = useDebounce(searchQuery, 500); // wait 1 second

  const { data: searchData, isLoading } = useQuery<SearchResponse>({
    queryKey: ["stocks-search", debouncedQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/stocks/search?q=${debouncedQuery}`
      );
      return response.data;
    },
    enabled: debouncedQuery.length > 0, // only fetch if query isn't empty
    staleTime: 30000,
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };

  const handleStockSelect = (stock: StockResult) => {
    setSearchQuery(stock.symbol);
    setShowResults(false);
  };

  const { data: stockNews = [] } = useQuery<NewsItem[]>({
    queryKey: ["private-news"],
    queryFn: async () => {
      const res = await axiosInstance("/admin/news/market-news");
      return res.data.data;
    },
  });

  // Helper function to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="mt-28 container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-5">
        <StockTickerCarousel />
      </div>

      {/* ADDED: Quick-access shortcut buttons/links */}
      <div className="mb-6 flex justify-center space-x-4">
        <Link
          href="/my-portfolio"
          className="inline-block rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
        >
          Portfolio
        </Link>
        <Link
          href="/watchlist"
          className="inline-block rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Watchlist
        </Link>
        <Link
          href="/news"
          className="inline-block rounded-md bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
        >
          News
        </Link>
      </div>

      {/* Updated Search Section */}
      <div className="relative mb-8 md:mb-10" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length > 0 && setShowResults(true)}
            className="border border-green-500 rounded-md p-2 w-full outline-0 h-[48px] sm:h-[56px] md:h-[64px] focus:border-2 pr-12"
            placeholder="Search any Stock....."
          />
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-2">Searching...</p>
              </div>
            ) : searchData?.results && searchData.results.length > 0 ? (
              <>
                <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                  <Star className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Search Results
                  </span>
                </div>
                {searchData.results.map((stock, index) => (
                  <Link
                    key={`${stock.symbol}-${index}`}
                    href={`/search-result?q=${stock?.symbol}`}
                  >
                    <div
                      onClick={() => handleStockSelect(stock)}
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {stock?.logo && (
                            <Image
                              src={stock.logo || "/placeholder.svg"}
                              alt="Company Logo"
                              width={38}
                              height={47}
                            />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {stock.symbol}
                            </span>
                            <Image
                              src={stock.flag || "/placeholder.svg"}
                              alt="Country flag"
                              width={4}
                              height={4}
                              className="w-4 h-4"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <span className="text-sm text-gray-600">
                              {stock.exchange}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {stock.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ${stock.price.toFixed(2)}
                        </div>
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            stock.change >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {stock.change >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>
                            {stock.change >= 0 ? "+" : ""}
                            {stock.change.toFixed(2)} (
                            {stock.percentChange.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            ) : searchQuery.length > 1 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No stocks found for {searchQuery}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6 lg:gap-10">
        {/* Layout 1 - Left Column */}
        <div className="col-span-1 lg:col-span-2">
          {stockNews[0] && (
            <Link
              href={stockNews[0].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="cursor-pointer hover:opacity-90 transition-opacity">
                <Image
                  src={
                    stockNews[0].image ||
                    "/placeholder.svg?height=270&width=500"
                  }
                  alt={stockNews[0].headline}
                  width={500}
                  height={270}
                  className="w-full object-cover"
                  style={{ aspectRatio: "500 / 270" }}
                />
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <span className="text-xs text-gray-500 uppercase font-medium">
                    {stockNews[0].source}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(stockNews[0].datetime)}
                  </span>
                </div>
                <h1 className="font-medium mt-3 text-lg md:text-xl leading-tight">
                  {truncateText(stockNews[0].headline, 80)}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                  {truncateText(stockNews[0].summary, 120)}
                </p>
              </div>
            </Link>
          )}

          {stockNews[1] && (
            <Link
              href={stockNews[1].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="mt-6 md:mt-8 cursor-pointer hover:opacity-90 transition-opacity">
                <Image
                  src={
                    stockNews[1].image ||
                    "/placeholder.svg?height=270&width=500"
                  }
                  alt={stockNews[1].headline}
                  width={500}
                  height={270}
                  className="w-full object-cover"
                  style={{ aspectRatio: "500 / 270" }}
                />
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <span className="text-xs text-gray-500 uppercase font-medium">
                    {stockNews[1].source}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(stockNews[1].datetime)}
                  </span>
                </div>
                <h1 className="font-medium mt-3 text-lg md:text-xl leading-tight">
                  {truncateText(stockNews[1].headline, 80)}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                  {truncateText(stockNews[1].summary, 120)}
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Layout 2 - Center Column (Featured News) */}
        <div className="col-span-1 lg:col-span-3">
          {stockNews[73] && (
            <Link
              href={stockNews[2].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="cursor-pointer hover:opacity-90 transition-opacity">
                <Image
                  src={
                    stockNews[2].image ||
                    "/placeholder.svg?height=450&width=800"
                  }
                  alt={stockNews[2].headline}
                  width={800}
                  height={450}
                  className="w-full object-cover"
                  style={{ aspectRatio: "800 / 450" }}
                />
                <div className="flex items-center justify-center gap-2 mt-4 mb-2">
                  <span className="text-sm text-gray-500 uppercase font-medium">
                    {stockNews[2].source}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(stockNews[2].datetime)}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-xs text-blue-600 uppercase font-medium px-2 py-1 bg-blue-50 rounded">
                    {stockNews[2].category}
                  </span>
                </div>
                <h1 className="font-bold my-4 md:my-5 text-2xl md:text-[40px] w-full lg:w-[90%] mx-auto text-center leading-tight">
                  {stockNews[2].headline}
                </h1>
                <p className="w-full lg:w-[80%] mx-auto text-center text-sm md:text-base text-gray-600">
                  {stockNews[2].summary}
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Layout 3 - Right Column */}
        <div className="col-span-1 lg:col-span-2">
          {stockNews[3] && (
            <Link
              href={stockNews[3].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="cursor-pointer hover:opacity-90 transition-opacity">
                <Image
                  src={
                    stockNews[3].image ||
                    "/placeholder.svg?height=270&width=500"
                  }
                  alt={stockNews[3].headline}
                  width={500}
                  height={270}
                  className="w-full object-cover"
                  style={{ aspectRatio: "500 / 270" }}
                />
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <span className="text-xs text-gray-500 uppercase font-medium">
                    {stockNews[3].source}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(stockNews[3].datetime)}
                  </span>
                </div>
                <h1 className="font-medium mt-3 text-lg md:text-xl leading-tight">
                  {truncateText(stockNews[3].headline, 80)}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                  {truncateText(stockNews[3].summary, 120)}
                </p>
              </div>
            </Link>
          )}

          {stockNews[4] && (
            <Link
              href={stockNews[4].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="mt-6 md:mt-8 cursor-pointer hover:opacity-90 transition-opacity">
                <Image
                  src={
                    stockNews[4].image ||
                    "/placeholder.svg?height=270&width=500"
                  }
                  alt={stockNews[4].headline}
                  width={500}
                  height={270}
                  className="w-full object-cover"
                  style={{ aspectRatio: "500 / 270" }}
                />
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <span className="text-xs text-gray-500 uppercase font-medium">
                    {stockNews[4].source}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(stockNews[4].datetime)}
                  </span>
                </div>
                <h1 className="font-medium mt-3 text-lg md:text-xl leading-tight">
                  {truncateText(stockNews[4].headline, 80)}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                  {truncateText(stockNews[4].summary, 120)}
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Horizontal News Cards Row */}
      <div className="flex flex-col md:flex-row justify-between items-center my-8 md:my-16 gap-4 md:gap-2">
        {stockNews.slice(5, 9).map((news) => (
          <Link
            key={news.id}
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex gap-2 items-center cursor-pointer hover:opacity-90 transition-opacity">
              <div>
                <Image
                  src={news.image || "/placeholder.svg?height=56&width=88"}
                  alt={news.headline}
                  width={88}
                  height={56}
                  className="rounded-2xl object-cover"
                />
              </div>
              <div className="max-w-[200px]">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] text-gray-500 uppercase font-medium">
                    {news.source}
                  </span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-[10px] text-gray-500">
                    {formatDate(news.datetime)}
                  </span>
                </div>
                <h1 className="font-bold text-[14px] leading-tight">
                  {truncateText(news.headline, 60)}
                </h1>
                <p className="text-[12px] md:text-[14px] text-gray-600 mt-1">
                  {truncateText(news.summary, 50)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-12 md:mb-16">
        <h1 className="text-3xl md:text-5xl mb-6 md:mb-10 font-semibold leading-tight">
          Want up to 11% Dividend Yield?
        </h1>

        <div className="h-[500px] border border-gray-300 p-4 rounded-lg shadow-xl">
          <iframe
            className="w-full h-full rounded-lg shadow-sm"
            src="https://www.youtube.com/embed/8EDwgRmnJr8?si=PPdCwHz16TMOQ5ME"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      </div>

      <div className="mb-12 md:mb-16">
        <LatestArticles />
      </div>

      <div>
        <StockDashboard />
      </div>
    </div>
  );
};

export default PrivateHome;
