"use client"

import { useState } from "react"
import PerformanceCard from "./performance-card"

// This would come from your API in a real application
const dummyData = {
    portfolioVolatility: {
        myRisk: 0.96,
        myPosition: 1, // Position on the risk scale (0-9)
        avgPosition: 6, // Position on the risk scale (0-9)
        highestRiskStocks: [{ id: 1, name: "Apple", ticker: "AAPL", beta: 0.96 }],
    },
    portfolioPE: {
        myRisk: 0.96,
        myPosition: 5,
        avgPosition: 7,
        highestRiskStocks: [{ id: 1, name: "Apple", ticker: "AAPL", beta: 0.96 }],
    },
    portfolioDividends: {
        myRisk: 0.96,
        myPosition: 3,
        avgPosition: 6,
        highestRiskStocks: [{ id: 1, name: "Apple", ticker: "AAPL", beta: 0.96 }],
    },
    stockWarnings: {
        myRisk: 0.96,
        myPosition: 5,
        avgPosition: 7,
        highestRiskStocks: [{ id: 1, name: "Apple", ticker: "AAPL", beta: 0.96 }],
    },
}

export default function PerformanceGrid() {
    const [data, setData] = useState(dummyData)

    console.log(setData);

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold mb-6">Performance</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PerformanceCard title="Portfolio Volatility" data={data.portfolioVolatility} />

                <PerformanceCard title="Portfolio P/E" data={data.portfolioPE} />

                <PerformanceCard title="Portfolio Dividends" data={data.portfolioDividends} />

                <PerformanceCard title="Stock Warnings" data={data.stockWarnings} />
            </div>
        </div>
    )
}
