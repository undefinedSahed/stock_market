"use client"

import { useState } from "react" // Import useEffect
import StockChart from "@/components/Portfolio/chart/stock-chart"
import StockHeader from "@/components/Portfolio/chart/stock-header"
import StockList from "@/components/Portfolio/chart/stock-list"
import StockPremiumBanner from "@/components/Portfolio/chart/chart-bottom"

export default function ChartPage() {
    const [selectedStock, setSelectedStock] = useState<string | undefined>(undefined) // Initialize as undefined
    const [timeframe, setTimeframe] = useState("1Y")
    const [comparisonStocks, setComparisonStocks] = useState<string[]>([])

    // Function to handle adding/removing comparison stocks
    const toggleComparisonStock = (symbol: string) => {
        if (symbol === selectedStock) return // Can't compare with itself

        setComparisonStocks((prev) => {
            // If already in comparison, remove it
            if (prev.includes(symbol)) {
                return prev.filter((s) => s !== symbol)
            }
            // Otherwise add it (limit to 3 comparison stocks)
            else if (prev.length < 3) {
                return [...prev, symbol]
            }
            return prev
        })
    }

    // Function to clear all comparison stocks
    const clearComparisons = () => {
        setComparisonStocks([])
    }


    return (
        <main className="flex min-h-screen flex-col lg:p-4 md:p-6 lg:w-[80vw] w-[98vw]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
                <div className="col-span-5">
                    {/* Ensure selectedStock is not undefined before passing */}
                    {selectedStock && (
                        <StockHeader
                            selectedStock={selectedStock}
                            onStockChange={setSelectedStock}
                            timeframe={timeframe}
                            onTimeframeChange={setTimeframe}
                            comparisonStocks={comparisonStocks}
                            onToggleComparison={toggleComparisonStock}
                            onClearComparisons={clearComparisons}
                        />
                    )}
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
                        <div className="lg:col-span-3">
                            {/* Ensure selectedStock is not undefined before rendering StockChart */}
                            {selectedStock && (
                                <StockChart selectedStock={selectedStock} timeframe={timeframe} comparisonStocks={comparisonStocks} />
                            )}
                        </div>
                        <div className="lg:col-span-1">
                            <StockList
                                selectedStock={selectedStock}
                                onSelectStock={setSelectedStock}
                            />
                        </div>
                    </div>
                    <div className="mt-20">
                        <StockPremiumBanner />
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="md:w-[200px] h-full">
                        <div className="bg-green-50 h-full rounded-xl flex items-center justify-center">
                            <div className="font-bold text-3xl -rotate-90 tracking-wider hidden md:flex">Banner Ads</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}