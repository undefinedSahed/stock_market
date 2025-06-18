import Image from "next/image"
import { Star } from "lucide-react"

interface TopStock {
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

interface TopStocksTableProps {
  topStocks: TopStock[]
}

export default function TopStocksTable({ topStocks }: TopStocksTableProps) {
  if (!topStocks || topStocks.length === 0) {
    return <div className="mt-4 p-8 text-center text-gray-500">No top stocks data available</div>
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] w-full max-w-4xl mx-auto">
        <div className="mt-4 grid grid-cols-4 gap-2 rounded-t-md bg-green-50 p-2 text-sm font-medium">
          <div>Stock Info</div>
          <div className="ml-10">Company</div>
          <div className="ml-7">
            Rating &<br /> Price Target
          </div>
          <div>
            Upside <br /> Potential
          </div>
        </div>

        <div className="bg-white rounded-b-md">
          {topStocks.map((stock, index) => {
            const totalRatings = stock.buy + stock.hold + stock.sell
            const rating = totalRatings > 0 ? Math.min(5, Math.round((stock.buy / totalRatings) * 5)) : 0

            return (
              <div
                key={`${stock.symbol}-${index}`}
                className={`grid grid-cols-4 p-3 items-center ${
                  index !== topStocks.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                {/* Stock Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-green-100 mr-3 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">{stock.symbol}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[14px]">{stock.symbol}</div>
                    <div className="text-gray-500 text-xs">Stock Symbol</div>
                    <div className="flex mt-1">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Company */}
                <div className="ml-10">
                  <div className="text-green-500 font-medium">${stock.currentPrice || "N/A"}</div>
                  <div className="text-gray-500 text-sm">
                    {stock.priceChange !== null && stock.percentChange !== null
                      ? `${stock.priceChange >= 0 ? "+" : ""}${stock.priceChange.toFixed(2)} (${stock.percentChange.toFixed(2)}%)`
                      : "No change data"}
                  </div>
                </div>

                {/* Rating & Price Target */}
                <div className="flex items-center ml-8">
                  <div
                    className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#28A745] z-0"
                    style={{
                      filter: "blur(3px)",
                      boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <Image src="/images/lock.png" alt="lock-image" width={20} height={20} className="absolute z-1000" />
                  </div>
                </div>

                {/* Upside Potential */}
                <div className="text-green-500 font-medium mt-3 ml-3">
                  {stock.upsidePercent ? `${stock.upsidePercent}%` : "N/A"}
                  <div className="text-green-500 text-sm">{stock.upsidePercent ? "Upside" : "No data"}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
