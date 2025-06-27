"use client"

import React from "react"
import RecentNews from "../news"
import PerformanceCoverage from "../stock-analysis/media-coverage-chart"
import StockPremiumBanner from "@/components/Portfolio/chart/chart-bottom"
import SimilarStocksTable from "./similar-stocks-table"
import useAxios from "@/hooks/useAxios"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

// Define the interface for the similar stock data received from the API
interface SimilarStockApiData {
  ticker: string
  companyName: string
  price: string
  marketCap: string
  peRatio: string
  yearlyGain: string
  analystConsensus: string // This will be "N/A" from the API for now
  analystPriceTarget: string // This will be "-" from the API for now
  topAnalystPriceTarget: string // This will be "-" from the API for now
}

export default function SimilarStocksPage() {
  const axiosInstance = useAxios()
  const params = useParams()

  // Ensure stockName is a string, as useParams can return string | string[]
  const stockName = typeof params.stockName === "string" ? params.stockName : undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: similarStockApiResponse } = useQuery<{ similarStocks: SimilarStockApiData[]; chartData: any }>({
    queryKey: ["similar-stock-data", stockName],
    queryFn: async () => {
      const res = await axiosInstance(`/stocks/similar/${stockName}`)
      return res.data
    },
    enabled: !!stockName,
  })

  const transformedStockData = React.useMemo(() => {
    if (!similarStockApiResponse?.similarStocks) {
      return []
    }
    return similarStockApiResponse.similarStocks.map((stock) => ({
      symbol: stock.ticker,
      name: stock.companyName,
      price: stock.price,
      marketCap: stock.marketCap,
      peRatio: stock.peRatio,
      yearlyGain: stock.yearlyGain,
      analystConsensus: {
        rating: stock.analystConsensus === "N/A" ? "N/A" : stock.analystConsensus,
        fillPercentage: stock.analystConsensus === "N/A" ? 0 : 50,
      },
      analystPriceTarget: stock.analystPriceTarget !== "-",
      topAnalystPriceTarget: stock.topAnalystPriceTarget !== "-",
      smartScore: false,
    }))
  }, [similarStockApiResponse])

  return (
    <div className="flex min-h-screen flex-col lg:w-[80vw] w-[98vw]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-5">
        <div className="col-span-full lg:col-span-5">
          <div className="mt-8 lg:mt-20">
            <SimilarStocksTable
              title={`${stockName ? stockName.toUpperCase() : "Stock"} Similar Stocks`}
              subtitle="Comparison Results"
              data={transformedStockData}
            />
          </div>
          <div className="mt-8 lg:mt-20">
            <PerformanceCoverage similarStockApiResponse={similarStockApiResponse} />
          </div>
          <div className="mt-8 lg:mt-20">
            <StockPremiumBanner />
          </div>
        </div>
        <div className="col-span-full lg:col-span-2">
          <RecentNews />
        </div>
      </div>
    </div>
  )
}
