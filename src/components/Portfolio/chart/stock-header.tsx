"use client"

import type React from "react"

import { useEffect } from "react"
import { ChevronDown, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { usePortfolio } from "../portfolioContext"

// Color palette for comparison stocks only - must match the ones in stock-chart.tsx
const comparisonColors = {
    AAPL: "#f43f5e", // Red
    NVDA: "#10b981", // Green
    MSFT: "#3b82f6", // Blue
    GOOGL: "#f97316", // Orange
    AMZN: "#8b5cf6", // Purple
    TSLA: "#ec4899", // Pink
    META: "#facc15", // Yellow
}

// Primary green color for all main stocks
// const primaryGreen = "#1EAD00"

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
    // onStockChange,
    timeframe,
    onTimeframeChange,
    comparisonStocks,
    onToggleComparison,
    onClearComparisons,
}: StockHeaderProps) {

    const { data: session } = useSession();
    const { selectedPortfolioId } = usePortfolio(); // Use selectedPortfolioId from context

    // Fetch portfolio data for selected ID
    const { data: portfolioData } = useQuery({
        queryKey: ["portfolio", selectedPortfolioId], // add selectedPortfolioId to the query key
        queryFn: async () => {
            // If selectedPortfolioId is undefined (initial load before a selection), prevent the fetch.
            // The `enabled` prop below also handles this, but it's good to be explicit here too.
            if (!selectedPortfolioId) {
                return null;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/get/${selectedPortfolioId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            });
            const data = await res.json();
            return data;
        },
        enabled: !!session?.user?.accessToken && !!selectedPortfolioId, // only run when both are available
    });


    const { mutate: getOverview, data: overviewData } = useMutation({
        mutationFn: async (holdings: { symbol: string; shares: number }[]) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/overview`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ holdings }),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch portfolio overview");
            }

            return res.json();
        },
    });


    useEffect(() => {
        if (portfolioData && portfolioData.stocks && portfolioData.stocks.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const holdings = portfolioData.stocks.map((stock: any) => ({
                symbol: stock.symbol,
                shares: stock.quantity,
            }));
            getOverview(holdings);
        }
        // No need to set selectedPortfolioId here, as it's now controlled by the context
    }, [portfolioData, getOverview]);


    // Update stock info when selected stock changes

    // const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     onStockChange(e.target.value.toUpperCase())
    // }

    // Get color for a comparison stockror   
    function getComparisonColor(symbol: string): string {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        return (comparisonColors as any)[symbol] || "#f43f5e" // Default to red if not found
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {comparisonStocks && onToggleComparison &&
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={comparisonStocks?.length > 0 ? "default" : "outline"} size="sm" className="gap-1">
                                    {comparisonStocks?.length > 0 ? "Comparing" : "+ Compare"} <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px]">
                                <DropdownMenuItem disabled className="text-xs font-semibold text-muted-foreground">
                                    Select stocks to compare
                                </DropdownMenuItem>
                                {overviewData?.holdings?.map(
                                    (stock: { symbol: string; shares: number }) =>
                                        stock.symbol !== selectedStock && (
                                            <DropdownMenuItem
                                                key={stock.symbol}
                                                className="flex items-center justify-between"
                                                onClick={() => onToggleComparison(stock.symbol)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: getComparisonColor(stock.symbol) }}
                                                    ></div>
                                                    <span>
                                                        {stock.symbol}
                                                    </span>
                                                </div>
                                                {comparisonStocks?.includes(stock.symbol) && <Check className="h-4 w-4 text-green-500" />}
                                            </DropdownMenuItem>
                                        ),
                                )}
                                {comparisonStocks?.length > 0 && (
                                    <DropdownMenuItem className="border-t text-xs text-muted-foreground" onClick={onClearComparisons}>
                                        Clear all comparisons
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    }
                </div>

                <Tabs value={timeframe} onValueChange={onTimeframeChange} className="h-9 pb-16 md:pb-0">
                    <TabsList className="grid grid-cols-6 md:grid-cols-8">
                        <TabsTrigger value="1D">1D</TabsTrigger>
                        <TabsTrigger value="5D">5D</TabsTrigger>
                        <TabsTrigger value="1M">1M</TabsTrigger>
                        <TabsTrigger value="3M">3M</TabsTrigger>
                        <TabsTrigger value="6M">6M</TabsTrigger>
                        <TabsTrigger value="YTD">YTD</TabsTrigger>
                        <TabsTrigger value="1Y">1Y</TabsTrigger>
                        <TabsTrigger value="5Y">5Y</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="font-bold text-xl">{selectedStock}</div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                        Volume
                    </Button>
                </div>

                {comparisonStocks && onToggleComparison &&
                    comparisonStocks?.length > 0 && (
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
                    )
                }
            </div>
        </div>
    )
}
