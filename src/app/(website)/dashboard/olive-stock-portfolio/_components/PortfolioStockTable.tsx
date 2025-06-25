"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import Image from "next/image";
import useAxios from "@/hooks/useAxios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Stock = {
  symbol: string;
  stockRating: string;
  analystTarget: string;
  ratingTrend: {
    buy: number;
    hold: number;
    sell: number;
  };
  oneMonthReturn: string;
  marketCap: string;
  lastRatingDate: string;
  sector: string;
  createdAt: string;
  logo: string;
  olives?: {
    valuation?: string;
    competitiveAdvantage?: string;
    financialHealth?: string;
  };
};

export default function PortfolioStockTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<Stock | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 5;

  //api calling
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const { data: qualityStock = [], isLoading } = useQuery({
    queryKey: ["olive-stock-list"],
    queryFn: async () => {
      const res = await axiosInstance("/stocks/olive-stock-protfolio");
      return res.data;
    },
  });

  const handleDeleteClick = (stock: Stock) => {
    setStockToDelete(stock);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!stockToDelete) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete("/admin/stocks/quality-stocks", {
        data: {
          type: "protfolio",
          symbol: stockToDelete.symbol,
        },
      });

      // Invalidate and refetch the query to update the table
      queryClient.invalidateQueries({ queryKey: ["olive-stock-list"] });

      // Close modal and reset state
      setDeleteModalOpen(false);
      setStockToDelete(null);
    } catch (error) {
      console.error("Error deleting stock:", error);
      // Optional: Show error message to user
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setStockToDelete(null);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1>Loading...</h1>
      </div>
    );
  }

  const stocks = qualityStock?.OliveStocks || [];


  // Calculate pagination
  const totalItems = stocks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = stocks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="rounded-lg overflow-hidden border border-[#b0b0b0]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#b0b0b0]">
                <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                  Company
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-medium text-gray-700">
                  Sector
                </th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-medium text-gray-700">
                  Stock Rating
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                  Analyst Price Target
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <p>Ratings in Last</p>
                    <p className="ml-1">72 Days ▼</p>
                  </div>
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                  Month %
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                  Market Cap
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((stock: Stock, index: number) => (
                  <tr key={stock.symbol || index}>
                    <td className="px-2 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center">
                        <div>
                          <Image
                            src={stock.logo || "/placeholder.svg"}
                            alt="lock"
                            width={10}
                            height={10}
                            className="h-8 w-8"
                          />
                        </div>
                        <span className="ml-2 text-xs sm:text-sm font-medium hidden sm:block">
                          {stock.symbol}
                        </span>
                      </div>
                    </td>

                    <td>
                      {new Date(stock.lastRatingDate).toLocaleDateString()}
                    </td>

                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-center">
                      {stock.sector || "N/A"}
                    </td>

                    <td className="flex justify-center items-center">
                      <svg
                        width="250"
                        height="100"
                        viewBox="0 0 369 191"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto mt-4"
                      >
                        <path
                          d="M322.624 39.3246H324.382V40.9746H322.624V39.3246ZM323.796 29.9746C326.932 30.0956 328.297 33.0656 326.434 35.2931C325.947 35.8431 325.162 36.2061 324.775 36.6681C324.382 37.1246 324.382 37.6746 324.382 38.2246H322.624C322.624 37.3061 322.624 36.5306 323.016 35.9806C323.403 35.4306 324.189 35.1061 324.675 34.7431C326.094 33.5111 325.742 31.7676 323.796 31.6246C323.33 31.6246 322.882 31.7984 322.553 32.1079C322.223 32.4173 322.038 32.837 322.038 33.2746H320.279C320.279 32.3994 320.65 31.56 321.309 30.9412C321.969 30.3223 322.863 29.9746 323.796 29.9746Z"
                          fill="white"
                        />
                        <path
                          d="M225.361 33.3092L225.484 28.8699L227.931 28.87L227.93 33.2973C244.486 37.2315 246.519 66.8143 237.377 80.1525C229.77 91.2512 221.267 88.4465 217.967 85.6568C207.491 77.3919 207.835 60.9144 209.317 53.7087C211.795 37.6732 221.045 33.4276 225.361 33.3092Z"
                          fill={`${stock?.olives?.valuation}`}
                        />
                        <path
                          d="M232.203 38.033L230.362 37.9533C236.306 42.4438 237.066 51.0313 237.196 55.5522C238.263 63.8277 236.653 76.9332 230.008 83.6572C229.187 84.6992 227.581 85.3951 226.98 85.668C237.785 86.163 240.331 62.7676 238.823 52.5304C238.049 43.6958 234.087 39.1844 232.203 38.033Z"
                          fill="white"
                        />
                        <path
                          d="M154.376 24.1034C154.35 23.9941 154.323 23.8877 154.298 23.7798L125.42 11.185L153.646 22.2997L153.698 21.329L153.617 21.302C143.54 -11.2344 100.541 3.4891 100.541 3.4891C100.541 3.4891 123.907 45.3747 154.376 24.1034Z"
                          fill="#406325"
                        />
                        <path
                          d="M188.163 36.2371L186.92 31.944L186.876 31.8099L189.446 31.4629L190.603 35.4322C207.551 34.0906 218.547 61.8171 213.94 77.4244C210.107 90.4112 201.162 90.3486 197.169 88.6939C184.675 84.0072 179.955 68.1077 179.156 60.7438C176.601 44.6088 184.096 37.6831 188.163 36.2371Z"
                          fill={`${stock?.olives?.competitiveAdvantage}`}
                        />
                        <path
                          d="M196.304 38.9141L194.527 39.4026C201.562 41.854 204.919 49.7945 206.429 54.0579C209.982 61.6075 212.469 74.5753 208.206 83.0131C207.744 84.2566 206.429 85.4113 205.941 85.8554C216.377 83.0131 211.625 59.9644 207.051 50.6827C203.605 42.5113 198.45 39.4322 196.304 38.9141Z"
                          fill="white"
                        />
                        <path
                          d="M169.566 37.823L170.951 34.0273H173.722L172.033 38.3465C175.046 38.6999 177.935 41.9549 179.003 43.5382C173.358 55.9634 178.569 70.8056 181.167 75.9537C171.947 99.1201 157.1 91.3107 153.983 84.8538C148.832 76.0409 149.64 63.767 151.04 58.1972C155.23 41.7233 165.137 37.7503 169.566 37.823Z"
                          fill={`${stock?.olives?.financialHealth}`}
                        />
                        <path
                          d="M293.557 25.8881L294.197 40.1143C253.538 19.0028 172.949 32.2187 137.737 41.4655C135.8 41.8069 102.382 51.9455 85.9151 56.972L127.913 45.9468L128.269 46.4447C124.966 58.5085 116.405 66.9304 112.538 69.6333C92.2647 81.4695 63.6111 74.5651 51.8184 69.6333C83.139 25.7598 112.419 33.5701 123.144 42.9595C213.063 15.19 274.219 20.0079 293.557 25.8881Z"
                          fill="#406325"
                        />
                      </svg>
                    </td>

                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm">
                      <div className="text-center">
                        <p className="text-green-500 font-medium">
                          {stock.analystTarget}
                        </p>
                      </div>
                    </td>

                    <td className="px-2 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-yellow-400 flex items-center justify-center">
                          <span className="text-base sm:text-lg font-bold">
                            {stock.ratingTrend.buy +
                              stock.ratingTrend.hold +
                              stock.ratingTrend.sell >
                            0
                              ? Math.round(
                                  (stock.ratingTrend.buy /
                                    (stock.ratingTrend.buy +
                                      stock.ratingTrend.hold +
                                      stock.ratingTrend.sell)) *
                                    10
                                )
                              : 0}
                          </span>
                        </div>

                        <div className="flex flex-col text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-sm"></div>
                            <span>{stock.ratingTrend.buy} Buy</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-yellow-400 rounded-sm"></div>
                            <span>{stock.ratingTrend.hold} Hold</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-sm"></div>
                            <span>{stock.ratingTrend.sell} Sell</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      className={`px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium ${
                        stock.oneMonthReturn &&
                        stock.oneMonthReturn.includes("-")
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {stock.oneMonthReturn || "0.00%"}
                    </td>

                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                      {stock.marketCap || "N/A"}
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() => handleDeleteClick(stock)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete stock"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {stocks.length === 0
                      ? "No stocks available"
                      : "Loading stocks..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-2 sm:p-4 mt-2">
            <div className="text-xs sm:text-sm text-gray-500">
              Showing {startIndex + 1}-{endIndex} of {totalItems} stocks
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                className={`flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() =>
                  currentPage > 1 && handlePageChange(currentPage - 1)
                }
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  const shouldShow =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  if (!shouldShow) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span
                          key={`ellipsis-${page}`}
                          className="flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center text-gray-600"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      className={`flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center rounded-md text-xs sm:text-sm ${
                        currentPage === page
                          ? "bg-green-600 text-white"
                          : "border border-gray-200 text-gray-600"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                }
              )}

              <button
                className={`flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  currentPage < totalPages && handlePageChange(currentPage + 1)
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Stock</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{stockToDelete?.symbol}</span>{" "}
              from the quality stocks portfolio? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
