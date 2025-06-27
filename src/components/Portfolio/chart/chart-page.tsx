
"use client";

import { useState, useEffect } from "react";
import StockChart from "./stock-chart";
import StockHeader from "./stock-header";
import StockList from "./stock-list";
import StockPremiumBanner from "./chart-bottom";
import { usePortfolio } from "../portfolioContext";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Define interfaces
interface PortfolioStock {
    symbol: string;
    quantity: number;
}

interface PortfolioData {
    name: string;
    stocks: PortfolioStock[];
}



export default function ChartPage() {
    const { data: session } = useSession();
    const { selectedPortfolioId } = usePortfolio();

    const [selectedStock, setSelectedStock] = useState<string | undefined>(undefined);
    const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "1Y">("1Y");
    const [comparisonStocks, setComparisonStocks] = useState<string[]>([]);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    const {
        data: portfolioData,
        isLoading: isPortfolioLoading,
        isSuccess: isPortfolioSuccess,
    } = useQuery<PortfolioData | null>({
        queryKey: ["portfolio", selectedPortfolioId],
        queryFn: async () => {
            if (!selectedPortfolioId || !session?.user?.accessToken) return null;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/get/${selectedPortfolioId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch portfolio");

            const data = await res.json();
            return data as PortfolioData;
        },
        enabled: !!session?.user?.accessToken && !!selectedPortfolioId,
        staleTime: 5 * 60 * 1000
    });

    // Set the initial selected stock
    useEffect(() => {
        if (
            isPortfolioSuccess &&
            portfolioData &&
            portfolioData.stocks.length > 0 &&
            !selectedStock
        ) {
            setSelectedStock(portfolioData.stocks[0].symbol);
            setInitialLoadComplete(true);
        } else if (
            isPortfolioSuccess &&
            (!portfolioData || portfolioData.stocks.length === 0)
        ) {
            setInitialLoadComplete(true);
        }
    }, [isPortfolioSuccess, portfolioData, selectedStock]);

    const toggleComparisonStock = (symbol: string) => {
        if (symbol === selectedStock) return;

        setComparisonStocks((prev) => {
            if (prev.includes(symbol)) {
                return prev.filter((s) => s !== symbol);
            } else if (prev.length < 3) {
                return [...prev, symbol];
            }
            return prev;
        });
    };

    const clearComparisons = () => {
        setComparisonStocks([]);
    };

    // Loading State
    if (isPortfolioLoading && !initialLoadComplete) {
        return (
            <main className="flex lg:w-[80vw] min-h-[75vh] items-center justify-center">
                <Loader2 className="animate-spin w-16 h-16 text-green-500"/>
            </main>
        );
    }

    // Empty Portfolio UI
    if (isPortfolioSuccess && (!portfolioData || portfolioData.stocks.length === 0)) {
        return (
            <main className="flex min-h-screen flex-col lg:p-4 md:p-6 lg:w-[80vw] w-[98vw]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
                    <div className="col-span-5 flex flex-col items-center justify-center h-[500px] text-gray-600">
                        <p className="text-lg font-semibold">Your portfolio is empty.</p>
                        <p className="text-md mt-2">Add some stocks to get started!</p>
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
        );
    }

    // Main Chart Page
    return (
        <main className="flex min-h-screen flex-col lg:p-4 md:p-6 lg:w-[80vw] w-[98vw]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
                <div className="col-span-5">
                    {selectedStock && (
                        <StockHeader
                            selectedStock={selectedStock}
                            onStockChange={setSelectedStock}
                            timeframe={timeframe}
                            onTimeframeChange={setTimeframe as (timeframe: string) => void}
                            comparisonStocks={comparisonStocks}
                            onToggleComparison={toggleComparisonStock}
                            onClearComparisons={clearComparisons}
                        />
                    )}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-3">
                            {selectedStock && (
                                <StockChart
                                    selectedStock={selectedStock}
                                    timeframe={timeframe}
                                    comparisonStocks={comparisonStocks}
                                />
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
    );
}
