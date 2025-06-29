"use client"

import type React from "react"

import { useEffect, useState } from "react"

import { ChevronDown, X, Check, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Badge } from "@/components/ui/badge"

import { Input } from "@/components/ui/input"

import { useSession } from "next-auth/react"

import { useMutation, useQuery } from "@tanstack/react-query"

import { usePortfolio } from "../portfolioContext"

import Image from "next/image"

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

const comparisonColors = {
    AAPL: "#f43f5e", // Red
    NVDA: "#10b981", // Green
    MSFT: "#3b82f6", // Blue
    GOOGL: "#f97316", // Orange
    AMZN: "#8b5cf6", // Purple
    TSLA: "#ec4899", // Pink
    META: "#facc15", // Yellow
}

interface StockResult {
    symbol: string
    description: string
    flag: string
    price: number
    change: number
    percentChange: number
    exchange: string
    logo?: string
}

interface SearchResponse {
    success: boolean
    results: StockResult[]
}

interface StockHeaderProps {
    selectedStock?: string
    onStockChange?: (symbol: string) => void
    timeframe: string
    onTimeframeChange: (timeframe: string) => void
    comparisonStocks?: string[]
    onToggleComparison?: (symbol: string) => void
    onClearComparisons?: () => void
}

export default function StockHeader({
    selectedStock,
    timeframe,
    onTimeframeChange,
    comparisonStocks,
    onToggleComparison,
    onClearComparisons,
}: StockHeaderProps) {
    const { data: session } = useSession()
    const { selectedPortfolioId } = usePortfolio()
    const [searchQuery, setSearchQuery] = useState("")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // Debounce search query
    const debouncedQuery = useDebounce(searchQuery, 500)

    // Fetch portfolio data for selected ID
    const { data: portfolioData } = useQuery({
        queryKey: ["portfolio", selectedPortfolioId],
        queryFn: async () => {
            if (!selectedPortfolioId) {
                return null
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/get/${selectedPortfolioId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            })
            const data = await res.json()
            return data
        },
        enabled: !!session?.user?.accessToken && !!selectedPortfolioId,
    })

    // Search stocks query
    const { data: searchData, isLoading: isSearchLoading } = useQuery<SearchResponse>({
        queryKey: ["stocks-search-comparison", debouncedQuery],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/search?q=${debouncedQuery}`)
            return response.json()
        },
        enabled: debouncedQuery.length > 0,
        staleTime: 30000,
    })

    const { mutate: getOverview, data: overviewData } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/overview`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: selectedPortfolioId }),
            })
            if (!res.ok) {
                throw new Error("Failed to fetch portfolio overview")
            }
            return res.json()
        },
    })

    useEffect(() => {
        if (portfolioData && portfolioData.stocks && portfolioData.stocks.length > 0 && selectedPortfolioId) {
            getOverview()
        }
    }, [portfolioData, getOverview, selectedPortfolioId])

    function getComparisonColor(symbol: string): string {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        return (comparisonColors as any)[symbol] || "#f43f5e"
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleStockSelect = (symbol: string) => {
        if (onToggleComparison) {
            onToggleComparison(symbol)
        }
        setSearchQuery("")
    }

    const clearSearch = () => {
        setSearchQuery("")
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {comparisonStocks && onToggleComparison && (
                        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button variant={comparisonStocks?.length > 0 ? "default" : "outline"} size="sm" className={`gap-1 ${comparisonStocks?.length > 0 ? "bg-green-500 text-white" : ""}`}>
                                    {comparisonStocks?.length > 0 ? "Comparing" : "+ Compare"} <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[300px] max-h-[400px] overflow-y-auto">
                                {/* Search Input */}
                                <div className="p-2 border-b border-gray-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search any stock..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            className="pl-10 pr-8"
                                        />
                                        {searchQuery && (
                                            <button onClick={clearSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Portfolio Stocks Section */}
                                {overviewData?.holdings && overviewData.holdings.length > 0 && (
                                    <>
                                        <DropdownMenuItem disabled className="text-xs font-semibold text-muted-foreground">
                                            Portfolio Stocks
                                        </DropdownMenuItem>
                                        {overviewData.holdings.map(
                                            (stock: { symbol: string; shares: number; logo?: string }) =>
                                                stock.symbol !== selectedStock && (
                                                    <DropdownMenuItem
                                                        key={`portfolio-${stock.symbol}`}
                                                        className="flex items-center justify-between"
                                                        onClick={() => handleStockSelect(stock.symbol)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-3 w-3 rounded-full"
                                                                style={{ backgroundColor: getComparisonColor(stock.symbol) }}
                                                            ></div>
                                                            {stock.logo && (
                                                                <Image
                                                                    src={stock.logo || "/placeholder.svg"}
                                                                    alt={stock.symbol}
                                                                    width={16}
                                                                    height={16}
                                                                    className="rounded"
                                                                />
                                                            )}
                                                            <span>{stock.symbol}</span>
                                                        </div>
                                                        {comparisonStocks?.includes(stock.symbol) && <Check className="h-4 w-4 text-green-500" />}
                                                    </DropdownMenuItem>
                                                ),
                                        )}
                                    </>
                                )}

                                {/* Search Results Section */}
                                {searchQuery && (
                                    <>
                                        {overviewData?.holdings && overviewData.holdings.length > 0 && (
                                            <div className="border-t border-gray-100 my-1"></div>
                                        )}
                                        <DropdownMenuItem disabled className="text-xs font-semibold text-muted-foreground">
                                            Search Results
                                        </DropdownMenuItem>
                                        {isSearchLoading ? (
                                            <DropdownMenuItem disabled className="flex items-center justify-center py-4">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                                                <span className="ml-2 text-sm">Searching...</span>
                                            </DropdownMenuItem>
                                        ) : searchData?.results && searchData.results.length > 0 ? (
                                            searchData.results
                                                .filter((stock) => stock.symbol !== selectedStock)
                                                .slice(0, 10) // Limit to 10 results
                                                .map((stock) => (
                                                    <DropdownMenuItem
                                                        key={`search-${stock.symbol}`}
                                                        className="flex items-center justify-between"
                                                        onClick={() => handleStockSelect(stock.symbol)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-3 w-3 rounded-full"
                                                                style={{ backgroundColor: getComparisonColor(stock.symbol) }}
                                                            ></div>
                                                            {stock.logo && (
                                                                <Image
                                                                    src={stock.logo || "/placeholder.svg"}
                                                                    alt={stock.symbol}
                                                                    width={16}
                                                                    height={16}
                                                                    className="rounded"
                                                                />
                                                            )}
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-medium">{stock.symbol}</span>
                                                                    {stock.flag && (
                                                                        <Image
                                                                            src={stock.flag || "/placeholder.svg"}
                                                                            alt="Country flag"
                                                                            width={12}
                                                                            height={12}
                                                                            className="w-3 h-3"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                                                    {stock.description}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            {comparisonStocks?.includes(stock.symbol) && <Check className="h-4 w-4 text-green-500" />}
                                                            <span className="text-xs text-gray-600">${stock.price.toFixed(2)}</span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))
                                        ) : searchQuery.length > 1 ? (
                                            <DropdownMenuItem disabled className="text-center text-gray-500 py-4">
                                                No stocks found for {searchQuery}
                                            </DropdownMenuItem>
                                        ) : null}
                                    </>
                                )}

                                {/* Clear All Option */}
                                {comparisonStocks?.length > 0 && (
                                    <>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <DropdownMenuItem
                                            className="text-xs text-muted-foreground justify-center"
                                            onClick={onClearComparisons}
                                        >
                                            Clear all comparisons
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <Tabs value={timeframe} onValueChange={onTimeframeChange} className="h-9 pb-16 md:pb-0">
                    <TabsList className="grid grid-cols-8 md:grid-cols-8">
                        <TabsTrigger value="1D" className="px-2">
                            1D
                        </TabsTrigger>
                        <TabsTrigger value="5D" className="px-2">
                            5D
                        </TabsTrigger>
                        <TabsTrigger value="1M" className="px-2">
                            1M
                        </TabsTrigger>
                        <TabsTrigger value="3M" className="px-2">
                            3M
                        </TabsTrigger>
                        <TabsTrigger value="6M" className="px-2">
                            6M
                        </TabsTrigger>
                        <TabsTrigger value="YTD" className="px-2">
                            YTD
                        </TabsTrigger>
                        <TabsTrigger value="1Y" className="px-2">
                            1Y
                        </TabsTrigger>
                        <TabsTrigger value="5Y" className="px-2">
                            5Y
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex flex-wrap items-center gap-10">
                <div className="flex items-center gap-2">
                    <div className="font-bold text-xl">{selectedStock}</div>
                </div>
                {comparisonStocks && onToggleComparison && comparisonStocks?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm text-muted-foreground">Comparing with:</div>
                        {comparisonStocks?.map((stock) => (
                            <Badge key={stock} variant="outline" className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: getComparisonColor(stock) }}></div>
                                {stock}
                                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => onToggleComparison(stock)} />
                            </Badge>
                        ))}
                        {comparisonStocks?.length > 0 && (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onClearComparisons}>
                                Clear All
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
