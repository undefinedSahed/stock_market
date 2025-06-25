"use client"

import { useState } from "react"
import StockChart from "./stock-chart"
import StockHeader from "./stock-header"
import StockPremiumBanner from "@/components/Portfolio/chart/chart-bottom"

interface PageProps {
    params: {
        stockName: string
    }
}

export default function StockChartPage({ params }: PageProps) {
    const stockSymbol = params.stockName.toUpperCase()
    const [timeframe, setTimeframe] = useState<"1D" | "5D" | "1M" | "3M" | "6M" | "YTD" | "1Y" | "5Y">("1Y")

    const handleTimeframeChange = (newTimeframe: string) => {
        setTimeframe(newTimeframe as typeof timeframe)
    }

    return (
        <main className="w-[80vw]">
            <div className="">
                <StockHeader selectedStock={stockSymbol} timeframe={timeframe} onTimeframeChange={handleTimeframeChange} />
                <div className="mt-6">
                    <StockChart selectedStock={stockSymbol} timeframe={timeframe} />
                </div>
                <div className="lg:mt-12 mt-4">
                    <StockPremiumBanner />
                </div>
            </div>
        </main>
    )
}
