"use client";

import useAxios from "@/hooks/useAxios";
import { useSocketContext } from "@/providers/SocketProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Star, TrendingDown, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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

// --- Type Definitions ---
interface StockResult {
  symbol: string;
  description: string;
  flag: string | null; // flag can be null from API
  price: number;
  change: number;
  percentChange: number;
  logo: string;
  exchange: string;
}

interface SearchResponse {
  success: boolean;
  results: StockResult[];
}

const AddQualityStocks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const { notifications } = useSocketContext();
  const { data: session } = useSession();

  // TanStack Query for search
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: searchData, isLoading } = useQuery<SearchResponse>({
    queryKey: ["quality-stock-search", debouncedQuery],
    queryFn: async () => {
      // Ensure debouncedQuery is not empty before making the API call
      if (!debouncedQuery) {
        return { success: true, results: [] }; // Return empty results immediately
      }
      const response = await axiosInstance.get(
        `/stocks/search?q=${debouncedQuery}`
      );
      return response.data;
    },
    enabled: debouncedQuery.length > 0, // Only enable if there's a debounced query
    staleTime: 30000,
  });

  console.log(searchData);

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
    // Show results only if there's input
    setShowResults(value.length > 0);
  };

  const { mutate: addHolding, isPending: isAddingHolding } = useMutation({
    mutationFn: async (data: StockResult) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/stocks/quality-stocks`,
        {
          // Corrected endpoint typo: protfolio -> portfolio
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify({
            symbol: data.symbol,
            type: "quality",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to add stock to quality stocks."
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || `Added to quality stock!`);
      queryClient.invalidateQueries({
        queryKey: ["quality-stock-search"],
      });
      queryClient.invalidateQueries({ queryKey: ["quality-stock-search"] });
      setSearchQuery("");
      setShowResults(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error adding stock to quality stock.");
    },
  });

  const handleStockSelect = (stock: StockResult) => {
    addHolding(stock);
  };

  return (
    <section>
      {" "}
      {/* Added z-50 to ensure it's on top */}
      <div className="mt-[150px]">
        {/* Enhanced Search Bar with Dropdown */}
        <div className="relative mx-auto max-w-2xl" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length > 0 && setShowResults(true)}
              placeholder="Search any Stock to add to quality stocks..."
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
                    <div
                      key={stock.symbol + index} // Use symbol + index for unique key
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center text-white text-sm font-bold">
                          <Image
                            src={stock.logo}
                            alt={stock.symbol}
                            width={350}
                            height={200}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {stock.symbol}
                            </span>
                            {/* Ensure flag is not null before rendering Image */}
                            {stock.flag && (
                              <Image
                                src={stock.flag}
                                alt="Country flag"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <span className="text-sm text-gray-600">
                              {stock.exchange}
                            </span>{" "}
                            {/* This might be dynamic based on API */}
                          </div>
                          <p className="text-sm text-gray-500">
                            {stock.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-5">
                        <div className="">
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
                        <div className="">
                          <Plus
                            onClick={() => handleStockSelect(stock)}
                            className={`h-8 w-8 p-1 rounded-full ${
                              isAddingHolding
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 text-white cursor-pointer"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : searchQuery.length > 0 ? ( // Changed from > 1 to > 0 to show "No stocks found" even for single character
                <div className="p-4 text-center text-gray-500">
                  <p>No stocks found for &quot;{searchQuery}&quot;</p>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>Start typing to search for stocks.</p>
                </div>
              )}
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
                  <div
                    className={`text-xs font-medium text-green-500 ${
                      parseFloat(stock.change) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
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
};

export default AddQualityStocks;
