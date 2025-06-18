"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import Image from "next/image"
import useAxios from "@/hooks/useAxios"
import { useQuery } from "@tanstack/react-query"

type Stock = {
  symbol: string
  stockRating: string
  analystTarget: string
  ratingTrend: {
    buy: number
    hold: number
    sell: number
  }
  monthChange: string
  marketCap: string
  month: string
  sector: string
}

export default function StockOfMonth() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  //api calling
  const axiosInstance = useAxios()

  const { data: stockofMonth } = useQuery({
    queryKey: ["stock-of-month"],
    queryFn: async () => {
      const res = await axiosInstance("/stocks/stock-of-month")
      return res.data
    },
  })

  // Handle loading state
  if (!stockofMonth) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 md:p-6 container mx-auto border mt-10">
        <h2 className="text-xl sm:text-2xl font-medium mb-4">Stocks Of Months</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading stocks...</div>
        </div>
      </div>
    )
  }

  const stocks = stockofMonth?.stockOfTheMonth || []

  // Calculate pagination
  const totalItems = stocks.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = stocks.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 md:p-6 container mx-auto border mt-10">
      <h2 className="text-xl sm:text-2xl font-medium mb-4">Stocks Of Months</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-green-50">
              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Company</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Stock Rating</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                Analyst Price Target
              </th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                <div className="flex items-center">
                  <p>Ratings in Last</p>
                  <p className="ml-1">72 Days ▼</p>
                </div>
              </th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Month %</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Market Cap</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Month</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Sector</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((stock: Stock, index: number) => (
                <tr key={stock.symbol || index} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Image src={"/images/lock-s.png"} alt="lock" width={10} height={10} />
                      </div>
                      <span className="ml-2 text-xs sm:text-sm font-medium hidden sm:block">{stock.symbol}</span>
                    </div>
                  </td>

                  <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <div className="flex flex-col items-center">
                      <p className="text-xs sm:text-sm font-medium">{stock.stockRating || "N/A"}</p>
                      <div className="relative w-16 sm:w-24 mt-1">
                        <div className="w-full h-2 bg-green-500 rounded-full"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 bg-white border border-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm">
                    <div className="text-center">
                      <p className="text-green-500 font-medium">{stock.analystTarget}</p>
                    </div>
                  </td>

                  <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-yellow-400 flex items-center justify-center">
                        <span className="text-base sm:text-lg font-bold">
                          {stock.ratingTrend.buy + stock.ratingTrend.hold + stock.ratingTrend.sell > 0
                            ? Math.round(
                                (stock.ratingTrend.buy /
                                  (stock.ratingTrend.buy + stock.ratingTrend.hold + stock.ratingTrend.sell)) *
                                  10,
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
                      stock.monthChange && stock.monthChange.includes("-") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {stock.monthChange || "0.00%"}
                  </td>

                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                    {stock.marketCap || "N/A"}
                  </td>

                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm">{stock.month || "N/A"}</td>

                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm">{stock.sector || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  {stocks.length === 0 ? "No stocks available" : "Loading stocks..."}
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
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const shouldShow =
                page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)

              if (!shouldShow) {
                if (page === 2 || page === totalPages - 1) {
                  return (
                    <span
                      key={`ellipsis-${page}`}
                      className="flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center text-gray-600"
                    >
                      ...
                    </span>
                  )
                }
                return null
              }

              return (
                <button
                  key={page}
                  className={`flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center rounded-md text-xs sm:text-sm ${
                    currentPage === page ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600"
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )
            })}

            <button
              className={`flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
