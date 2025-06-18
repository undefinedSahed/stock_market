import Image from "next/image"

interface TrendingStock {
  symbol: string
  currentPrice: number
  priceChange: number | null
  percentChange: number | null
  buy: number
  hold: number
  sell: number
  targetMean: number | null
  upsidePercent: string | null
}

interface StockTrackingTableProps {
  trendingStocks: TrendingStock[]
}

export default function StockTrackingTable({ trendingStocks }: StockTrackingTableProps) {
  if (!trendingStocks || trendingStocks.length === 0) {
    return <div className="mt-4 p-8 text-center text-gray-500">No trending stocks data available</div>
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px] lg:max-w-4xl mx-auto">
        {/* Header */}
        <div className="mt-4 grid grid-cols-4 gap-2 rounded-t-md bg-green-50 p-2 text-sm font-medium">
          <div>Company</div>
          <div>Smart Score</div>
          <div>Price & Change</div>
          <div>
            Rating in Last 30 <br /> Days
          </div>
        </div>

        {/* Table Rows */}
        <div className="bg-white rounded-b-md">
          {trendingStocks.map((stock, index) => {
            const totalRatings = stock.buy + stock.hold + stock.sell
            const smartScore = totalRatings > 0 ? Math.round((stock.buy / totalRatings) * 100) : 0
            const isNegative = stock.percentChange !== null && stock.percentChange < 0

            return (
              <div
                key={`${stock.symbol}-${index}`}
                className={`grid grid-cols-4 p-3 items-center ${
                  index !== trendingStocks.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                {/* Company */}
                <div>
                  <div className="text-[#2e7d32] font-medium">{stock.symbol}</div>
                  <div className="text-gray-500 text-sm">Stock Symbol</div>
                </div>

                {/* Smart Score */}
                <div className="font-medium">
                  <p className="ml-16">{stock.currentPrice || "N/A"}</p>
                  <div className="flex items-center gap-1">
                    {isNegative && <Image src="/images/downarrow.png" alt="downarrow" width={15} height={15} />}
                    <span className={isNegative ? "text-red-500" : "text-green-500"}>
                      {stock.priceChange !== null && stock.percentChange !== null
                        ? `${stock.priceChange.toFixed(2)} (${stock.percentChange.toFixed(2)}%)`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Price & Change */}
                <div className="flex items-center ml-8">
                  <div
                    className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#28A745]"
                    style={{
                      filter: "blur(3px)",
                      boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <Image src="/images/lock.png" alt="lock-image" width={20} height={20} className="absolute" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-full border-4 border-yellow-400 flex items-center justify-center">
                      <span className="text-lg font-bold">{smartScore}</span>
                    </div>

                    <div className="">
                      <div className="flex flex-col items-end text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500"></div>
                          <span>{stock.buy} Buy</span>
                        </div>
                        <div className="flex items-center gap-[3px]">
                          <div className="w-3 h-3 bg-yellow-400"></div>
                          <span>{stock.hold} Hold</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500"></div>
                          <span>{stock.sell} Sell</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
