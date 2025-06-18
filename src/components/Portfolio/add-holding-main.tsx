"use client"

import type React from "react"
import { Search, Star, TrendingUp, TrendingDown, Plus } from "lucide-react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import useAxios from "@/hooks/useAxios"
import { usePortfolio } from "./portfolioContext" // Adjust path as necessary
import { useSession } from "next-auth/react"
import { toast } from "sonner"

// Custom hooks
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

// --- Type Definitions ---
interface StockResult {
    symbol: string
    description: string
    flag: string | null
    price: number
    change: number
    percentChange: number
    logo: string
    exchange: string
}

interface SearchResponse {
    success: boolean
    results: StockResult[]
}

interface AddHoldingData {
    portfolioId: string;
    symbol: string;
    quantity: number;
}

interface AddStockSearchProps {
    onStockAdded: () => void; // Callback to close dialog or give feedback
}

export default function AddStockSearch({ onStockAdded }: AddStockSearchProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const axiosInstance = useAxios()
    const queryClient = useQueryClient()

    const { selectedPortfolioId } = usePortfolio()
    const { data: session } = useSession()

    const debouncedQuery = useDebounce(searchQuery, 500)

    const { data: searchData, isLoading } = useQuery<SearchResponse>({
        queryKey: ["stocks-search", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) {
                return { success: true, results: [] }
            }
            const response = await axiosInstance.get(`/stocks/search?q=${debouncedQuery}`)
            return response.data
        },
        enabled: debouncedQuery.length > 0,
        staleTime: 30000,
    })

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        setShowResults(value.length > 0)
    }

    const { mutate: addHolding, isPending: isAddingHolding } = useMutation({
        mutationFn: async (data: AddHoldingData) => {
            if (!data.portfolioId) {
                throw new Error("Portfolio ID is missing.")
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protfolio/add-stock`, { // Ensure this is the correct endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
                body: JSON.stringify({
                    portfolioId: data.portfolioId,
                    symbol: data.symbol,
                    quantity: data.quantity,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to add stock to portfolio.")
            }
            return response.json()
        },
        onSuccess: (data) => {
            toast.success(data.message || `Added stock to portfolio!`)
            queryClient.invalidateQueries({ queryKey: ["portfolio", selectedPortfolioId] })
            queryClient.invalidateQueries({ queryKey: ["portfolio-overview"] })
            setSearchQuery("")
            setShowResults(false)
            onStockAdded(); // Call callback to signal stock was added (e.g., to close dialog)
        },
        onError: (error) => {
            toast.error(error.message || "Error adding stock to portfolio.")
        },
    })

    const handleStockSelect = (stock: StockResult) => {
        if (!selectedPortfolioId) {
            toast.error("No portfolio selected. Please select a portfolio first.")
            return
        }
        addHolding({
            portfolioId: selectedPortfolioId,
            symbol: stock.symbol,
            quantity: 1, // Default to 1, could be made configurable later
        })
    }

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowResults(true)} // Show results on focus, even if query is empty initially
                    placeholder="Search any Stock to add to your Portfolio...."
                    className="w-full rounded-full border border-green-300 bg-white py-3 pl-6 pr-12 text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <Search className="h-5 w-5 text-gray-500" />
                </div>
            </div>

            {showResults && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                            <p className="mt-2">Searching...</p>
                        </div>
                    ) : searchData?.results && searchData.results.length > 0 ? (
                        <>
                            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                                <Star className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-gray-700">Search Results</span>
                            </div>
                            {searchData.results.map((stock, index) => (
                                <div
                                    key={stock.symbol + index}
                                    className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center text-white text-sm font-bold">
                                            {stock.logo ? (
                                                <Image
                                                    src={stock.logo}
                                                    alt={stock.symbol}
                                                    width={350}
                                                    height={200}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                                                    {stock.symbol.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{stock.symbol}</span>
                                                {stock.flag && (
                                                    <Image
                                                        src={stock.flag}
                                                        alt="Country flag"
                                                        width={16}
                                                        height={16}
                                                        className="w-4 h-4"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none"
                                                        }}
                                                    />
                                                )}
                                                <span className="text-sm text-gray-600">{stock.exchange}</span>
                                            </div>
                                            <p className="text-sm text-gray-500">{stock.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-5">
                                        <div>
                                            <div className="font-semibold text-gray-900">${stock.price.toFixed(2)}</div>
                                            <div
                                                className={`flex items-center gap-1 text-sm ${stock.change >= 0 ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {stock.change >= 0 ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3" />
                                                )}
                                                <span>
                                                    {stock.change >= 0 ? "+" : ""}
                                                    {stock.change.toFixed(2)} ({stock.percentChange.toFixed(2)}%)
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <Plus
                                                onClick={() => handleStockSelect(stock)}
                                                className={`h-8 w-8 p-1 rounded-full ${isAddingHolding ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 text-white cursor-pointer'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : searchQuery.length > 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <p>No stocks found for &quot;{searchQuery}&quot;</p>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            <p>Start typing to search for stocks.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}