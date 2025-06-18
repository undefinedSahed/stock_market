"use client";

import type React from "react";

import { Search, Star, TrendingUp, TrendingDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import { useSocketContext } from "@/providers/SocketProvider";

// Custom hooks (you'll need to implement these based on your project structure)
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface StockResult {
  symbol: string;
  description: string;
  flag: string;
  price: number;
  change: number;
  percentChange: number;
  exchange: string;
  logo?: string;
}

interface SearchResponse {
  success: boolean;
  results: StockResult[];
}

export default function StockSearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const axiosInstance = useAxios();
  const { notifications } = useSocketContext();

  console.log(notifications);

  // TanStack Query for search
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: searchData, isLoading } = useQuery<SearchResponse>({
    queryKey: ["stocks-search", debouncedQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/stocks/search?q=${debouncedQuery}`
      );
      return response.data;
    },
    enabled: debouncedQuery.length > 0,
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
    // Add your navigation logic here
    console.log("Selected stock:", stock);
  };

  console.log(searchData);

  return (
    <section className="w-full bg-[#f0f7f0] py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-black md:text-4xl lg:text-5xl">
            Make Informed, Data-Driven Investments
          </h2>
          <p className="mt-4 text-lg text-gray-800">
            We empower everyone with access to institutional-grade research
            tools and data.
          </p>
        </div>

        {/* Enhanced Search Bar with Dropdown */}
        <div className="relative mx-auto mt-10 max-w-2xl" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length > 0 && setShowResults(true)}
              placeholder="Search any Stock...."
              className="w-full rounded-full border border-green-300 bg-white py-3 pl-6 pr-12 text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
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
                                src={stock.logo}
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
                                width={16}
                                height={16}
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

        {/* Stock Grid */}
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {notifications?.map((stock, index) => (
              <div
                key={`stock-top-${index}`}
                className="flex items-center justify-between rounded-full bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full">
                    {stock?.logo && (
                      <Image
                        src={stock.logo}
                        alt="Company Logo"
                        width={38}
                        height={47}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-blue-500">
                      {stock.symbol}
                    </div>
                    <div className="text-sm font-medium">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {parseFloat(stock.currentPrice)?.toFixed(2)}
                  </div>
                  <div className="text-xs font-medium text-green-500">
                    {parseFloat(stock.change)?.toFixed(2)} (
                    {parseFloat(stock.percent)?.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
