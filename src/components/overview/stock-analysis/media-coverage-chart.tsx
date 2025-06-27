"use client"

import { useRef, useEffect, useState, useCallback, useMemo } from "react" // Import useMemo
import * as echarts from "echarts"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

// Define stock types
interface Stock {
    id: string
    name: string
    color: string
    visible: boolean
    price: number
}

// Define data point structure
interface DataPoint {
    date: string
    [key: string]: number | string
}

// Define time period
type TimePeriod = "3m" | "6m" | "1y" | "YTD" | "3y" | "5y"

// Props interface for the component
interface PerformanceCoverageProps {
    similarStockApiResponse?: {
        similarStocks: Array<{
            ticker: string
            companyName: string
            price: string
            marketCap: string
            peRatio: string
            yearlyGain: string
            analystConsensus: string
            analystPriceTarget: string
            topAnalystPriceTarget: string
        }>
        chartData: {
            labels: string[]
            rawPriceChart: Array<{
                label: string
                data: number[]
            }>
            percentReturnChart: Array<{
                label: string
                data: string[]
            }>
        }
    }
}

export default function PerformanceCoverage({ similarStockApiResponse }: PerformanceCoverageProps) {
    const chartRef = useRef<HTMLDivElement>(null)
    const chartInstance = useRef<echarts.ECharts | null>(null)
    const { theme } = useTheme()
    const [isClient, setIsClient] = useState(false)

    // Color palette for different stocks - Memoized
    const stockColors = useMemo(() => ["#2695FF", "#28A745", "#0E3A18", "#FFD700", "#ff5733", "#594B00"], [])

    // Available stocks - dynamically created from API data
    const [stocks, setStocks] = useState<Stock[]>([])

    // State for selected time period
    const [period, setPeriod] = useState<TimePeriod>("1y")

    // State for data
    const [data, setData] = useState<DataPoint[]>([])

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [stockTableData, setStockTableData] = useState<any[]>([])

    // Initialize stocks from API data
    useEffect(() => {
        if (similarStockApiResponse?.similarStocks) {
            const apiStocks = similarStockApiResponse.similarStocks.map((stock, index) => ({
                id: stock.ticker,
                name: stock.companyName,
                color: stockColors[index % stockColors.length],
                visible: true,
                price: Number.parseFloat(stock.price),
            }))
            setStocks(apiStocks)
        }
    }, [similarStockApiResponse, stockColors]) // stockColors is now stable due to useMemo

    // Process API data based on selected time period
    const processApiData = useCallback(
        (period: TimePeriod): DataPoint[] => {
            if (!similarStockApiResponse?.chartData) return []

            const { labels, percentReturnChart } = similarStockApiResponse.chartData
            const data: DataPoint[] = []

            // Calculate how many data points to show based on period
            let dataPoints: number
            const totalPoints = labels.length

            switch (period) {
                case "3m":
                    dataPoints = Math.min(65, totalPoints) // ~3 months of trading days
                    break
                case "6m":
                    dataPoints = Math.min(130, totalPoints) // ~6 months of trading days
                    break
                case "1y":
                    dataPoints = Math.min(252, totalPoints) // ~1 year of trading days
                    break
                case "YTD":
                    // Calculate from start of current year
                    const currentYear = new Date().getFullYear()
                    const startOfYearIndex = labels.findIndex((label) => label.startsWith(currentYear.toString()))
                    dataPoints = startOfYearIndex >= 0 ? totalPoints - startOfYearIndex : totalPoints
                    break
                case "3y":
                    dataPoints = Math.min(756, totalPoints) // ~3 years of trading days
                    break
                case "5y":
                    dataPoints = totalPoints // All available data
                    break
                default:
                    dataPoints = Math.min(252, totalPoints)
            }

            // Get the last N data points
            const startIndex = Math.max(0, totalPoints - dataPoints)
            const selectedLabels = labels.slice(startIndex)

            // Process each data point
            selectedLabels.forEach((label, index) => {
                const actualIndex = startIndex + index
                const dataPoint: DataPoint = {
                    date: new Date(label).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "2-digit",
                    }),
                }

                // Add data for each stock
                percentReturnChart.forEach((stockData) => {
                    if (actualIndex < stockData.data.length) {
                        dataPoint[stockData.label] = Number.parseFloat(stockData.data[actualIndex])
                    }
                })

                data.push(dataPoint)
            })

            return data
        },
        [similarStockApiResponse],
    )

    // Calculate latest values and changes for the table
    const getStockTableData = useCallback(
        (data: DataPoint[]) => {
            if (data.length < 2 || stocks.length === 0) return []

            const latest = data[data.length - 1]
            const previous = data[data.length - 2]

            return stocks.map((stock) => {
                const currentValue = (latest[stock.id] as number) || 0
                const previousValue = (previous[stock.id] as number) || 0
                const change = Number.parseFloat((currentValue - previousValue).toFixed(2))
                const percentChange =
                    previousValue !== 0 ? Number.parseFloat(((change / Math.abs(previousValue)) * 100).toFixed(2)) : 0

                return {
                    ...stock,
                    change,
                    percentChange,
                }
            })
        },
        [stocks],
    )

    // Update chart with current data and stock visibility
    const updateChart = useCallback(() => {
        if (!chartInstance.current || data.length === 0) return

        const option = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "cross",
                    label: {
                        backgroundColor: "#6a7985",
                    },
                },
                /* eslint-disable @typescript-eslint/no-explicit-any */
                formatter: (params: any) => {
                    const date = params[0].axisValue
                    let html = `<div style="margin-bottom: 5px;">${date}</div>`
                    params.forEach((param: any) => {
                        const stock = stocks.find((s) => s.id === param.seriesName)
                        if (!stock) return

                        const color = stock.color
                        const value = param.value.toFixed(2)

                        html += `<div style="display: flex; justify-content: space-between; align-items: center; margin: 3px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; margin-right: 5px;"></span>
              <span style="margin-right: 15px;">${stock.name}</span>
              <span>${value}%</span>
            </div>`
                    })
                    return html
                },
            },
            legend: {
                data: stocks.filter((s) => s.visible).map((s) => s.id),
                right: 10,
                top: 0,
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                top: "40px",
                containLabel: true,
            },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: data.map((item) => item.date),
                axisLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#555" : "#ddd",
                    },
                },
                axisLabel: {
                    color: theme === "dark" ? "#ccc" : "#666",
                    fontSize: window.innerWidth < 768 ? 10 : 12,
                    rotate: window.innerWidth < 768 ? 30 : 0,
                },
            },
            yAxis: {
                type: "value",
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    color: theme === "dark" ? "#ccc" : "#666",
                    formatter: "{value}%",
                    fontSize: window.innerWidth < 768 ? 10 : 12,
                },
                splitLine: {
                    lineStyle: {
                        color: theme === "dark" ? "#333" : "#eee",
                    },
                },
            },
            series: stocks
                .filter((stock) => stock.visible)
                .map((stock) => ({
                    name: stock.id,
                    type: "line",
                    data: data.map((item) => item[stock.id]),
                    smooth: 0.2,
                    showSymbol: false,
                    lineStyle: {
                        width: 2,
                        color: stock.color,
                    },
                    itemStyle: {
                        color: stock.color,
                    },
                    connectNulls: true,
                    sampling: "average",
                })),
        }

        chartInstance.current.setOption(option, true)
    }, [data, stocks, theme])

    // Initialize data on client-side only
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Update data when period changes or API data is available
    useEffect(() => {
        if (isClient && similarStockApiResponse) {
            const processedData = processApiData(period)
            setData(processedData)
            setStockTableData(getStockTableData(processedData))
        }
    }, [period, isClient, processApiData, getStockTableData, similarStockApiResponse])

    // Toggle stock visibility
    const toggleStockVisibility = useCallback((stockId: string) => {
        setStocks((prevStocks) => {
            const newStocks = prevStocks.map((stock) =>
                stock.id === stockId ? { ...stock, visible: !stock.visible } : stock,
            )
            return newStocks
        })
    }, [])

    // Effect to update chart when stocks visibility changes
    useEffect(() => {
        if (isClient && chartInstance.current) {
            updateChart()
        }
    }, [stocks, isClient, updateChart])

    // Initialize chart
    useEffect(() => {
        if (!isClient || data.length === 0) return

        if (chartRef.current) {
            if (!chartInstance.current) {
                chartInstance.current = echarts.init(chartRef.current)
            }
            updateChart()
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose()
                chartInstance.current = null
            }
        }
    }, [data, isClient, updateChart])

    // Handle resize
    useEffect(() => {
        if (!isClient) return

        const handleResize = () => {
            if (chartInstance.current) {
                chartInstance.current.resize()
                updateChart()
            }
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [isClient, updateChart])

    // Show loading state if no data
    if (!similarStockApiResponse || stocks.length === 0) {
        return (
            <Card className="w-full shadow-[0px_0px_10px_1px_#0000001A]">
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-green-500"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full shadow-[0px_0px_10px_1px_#0000001A]">
            <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-xl sm:text-2xl">Performance Comparison</CardTitle>
                <Tabs value={period} onValueChange={(value) => setPeriod(value as TimePeriod)} className="mt-2 sm:mt-0">
                    <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-6 bg-transparent">
                        <TabsTrigger value="3m">3m</TabsTrigger>
                        <TabsTrigger value="6m">6m</TabsTrigger>
                        <TabsTrigger value="1y">1y</TabsTrigger>
                        <TabsTrigger value="YTD">YTD</TabsTrigger>
                        <TabsTrigger value="3y">3y</TabsTrigger>
                        <TabsTrigger value="5y">5y</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                <div ref={chartRef} className="w-full h-[300px] sm:h-[400px] md:h-[500px]" />
                {isClient ? (
                    <div className="mt-6 overflow-x-auto">
                        <Table className="border-none">
                            <TableHeader>
                                <TableRow className=" border-t">
                                    <TableHead>Ticker</TableHead>
                                    <TableHead className="hidden sm:table-cell text-center">Company Name</TableHead>
                                    <TableHead className="text-center">Price</TableHead>
                                    <TableHead className="text-center">Change</TableHead>
                                    <TableHead className="text-center">%Change</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockTableData.map((stock) => (
                                    <TableRow key={stock.id} className="">
                                        <TableCell className="border-r-0 flex items-center gap-1">
                                            <Checkbox
                                                checked={stock.visible}
                                                onCheckedChange={() => toggleStockVisibility(stock.id)}
                                                style={{
                                                    backgroundColor: stock.visible ? stock.color : "transparent",
                                                    borderColor: stock.color,
                                                }}
                                            />
                                            <Badge
                                                variant="outline"
                                                style={{
                                                    color: stock.color,
                                                    borderColor: stock.color,
                                                }}
                                            >
                                                {stock.id}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell border-r-0 text-center">{stock.name}</TableCell>
                                        <TableCell className="border-r-0 text-center">${stock.price.toFixed(2)}</TableCell>
                                        <TableCell
                                            className={`border-r-0 text-center ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}
                                        >
                                            {stock.change >= 0 ? "+" : ""}
                                            {stock.change.toFixed(2)}%
                                        </TableCell>
                                        <TableCell
                                            className={`text-center border-r-0 ${stock.percentChange >= 0 ? "text-green-600" : "text-red-600"}`}
                                        >
                                            {stock.percentChange >= 0 ? "+" : ""}
                                            {stock.percentChange.toFixed(2)}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="mt-6 flex items-center justify-center p-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}