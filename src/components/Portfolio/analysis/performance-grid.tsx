"use client"

import { useState, useEffect } from "react"
import PerformanceCard from "./performance-card"
import { useSession } from "next-auth/react"
import { usePortfolio } from "../portfolioContext"
import { useMutation } from "@tanstack/react-query"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


interface StockWarning {
    symbol: string
    name: string
}

interface PortfolioMetrics {
    beta: number
    peRatio: number
    dividendYield: number
    warnings: StockWarning[]
}

interface AssetAllocationResponse {
    metrics: PortfolioMetrics
    // other fields from response if needed
}

export default function PerformanceGrid() {
    const { data: session } = useSession()
    const { selectedPortfolioId } = usePortfolio()
    const [isLoading, setIsLoading] = useState(true)

    const { mutate: getAssetAllocation } = useMutation({
        mutationFn: async (): Promise<AssetAllocationResponse> => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/portfolio/allocation?portfolioId=${selectedPortfolioId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            )
            return response.json()
        },
        onSuccess: (data) => {
            processMetricsData(data.metrics)
            setIsLoading(false)
        },
        onError: () => {
            setIsLoading(false)
        }
    })

    const [performanceData, setPerformanceData] = useState({
        portfolioVolatility: {
            myRisk: 0,
            myPosition: 0,
            avgPosition: 5, // Default average position
            highestRiskStocks: [] as Array<{ id: number, name: string, ticker: string, beta: number }>
        },
        portfolioPE: {
            myRisk: 0,
            myPosition: 0,
            avgPosition: 5,
            highestRiskStocks: [] as Array<{ id: number, name: string, ticker: string, beta: number }>
        },
        portfolioDividends: {
            myRisk: 0,
            myPosition: 0,
            avgPosition: 5,
            highestRiskStocks: [] as Array<{ id: number, name: string, ticker: string, beta: number }>
        },
        stockWarnings: {
            warnings: [] as Array<{ symbol: string, name: string }>
        }
    })

    const processMetricsData = (metrics: PortfolioMetrics) => {
        // Calculate positions for the risk scale (0-9)
        const calculateBetaPosition = (beta: number) => {
            if (beta <= 0.8) return 2 // Green zone
            if (beta <= 1.0) return 4 // Light green zone
            if (beta <= 1.2) return 5 // Gray zone
            if (beta <= 1.4) return 7 // Light red zone
            return 9 // Red zone
        }

        const calculatePERatioPosition = (pe: number) => {
            if (pe <= 15) return 2 // Low PE
            if (pe <= 25) return 4 // Moderate PE
            if (pe <= 35) return 6 // High PE
            return 8 // Very high PE
        }

        const calculateDividendPosition = (yieldPercent: number) => {
            if (yieldPercent <= 1) return 8 // Low dividend
            if (yieldPercent <= 3) return 6 // Moderate dividend
            if (yieldPercent <= 5) return 4 // Good dividend
            return 2 // High dividend
        }

        const warningStocks = metrics.warnings.map((warning, index) => ({
            id: index + 1,
            name: warning.name,
            ticker: warning.symbol,
            beta: metrics.beta // Using portfolio beta for warning stocks
        }))

        setPerformanceData({
            portfolioVolatility: {
                myRisk: metrics.beta,
                myPosition: calculateBetaPosition(metrics.beta),
                avgPosition: 5, // Default average
                highestRiskStocks: warningStocks
            },
            portfolioPE: {
                myRisk: metrics.peRatio,
                myPosition: calculatePERatioPosition(metrics.peRatio),
                avgPosition: 5, // Default average
                highestRiskStocks: warningStocks
            },
            portfolioDividends: {
                myRisk: metrics.dividendYield,
                myPosition: calculateDividendPosition(metrics.dividendYield),
                avgPosition: 5, // Default average
                highestRiskStocks: warningStocks
            },
            stockWarnings: {
                warnings: metrics.warnings
            }
        })
    }

    useEffect(() => {
        if (selectedPortfolioId) {
            setIsLoading(true)
            getAssetAllocation()
        }
    }, [selectedPortfolioId, getAssetAllocation])

    if (isLoading) {
        return <div className="w-full">Loading performance data...</div>
    }

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold mb-6">Performance</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PerformanceCard
                    title="Portfolio Volatility"
                    data={performanceData.portfolioVolatility}
                />

                <PerformanceCard
                    title="Portfolio P/E"
                    data={performanceData.portfolioPE}
                />

                <PerformanceCard
                    title="Portfolio Dividends"
                    data={performanceData.portfolioDividends}
                />

                <div className="border border-red-500 rounded-lg p-4 shadow-sm">
                    {performanceData.stockWarnings.warnings.length > 0 && (
                        <div className="w-full">
                            <h2 className="text-xl font-semibold mb-4">Stock Warnings</h2>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-red-500">
                                        <TableHead className="w-[50px]">#</TableHead>
                                        <TableHead className="text-center">Symbol</TableHead>
                                        <TableHead className="text-center">Company Name</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {performanceData.stockWarnings.warnings.map((warning, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{warning.symbol}</TableCell>
                                            <TableCell>{warning.name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}