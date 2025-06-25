"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as echarts from "echarts"
import { Card } from "@/components/ui/card"

interface StockChartProps {
    selectedStock: string
    timeframe: string
}

interface ApiResponse {
    o: number[] // open
    h: number[] // high
    l: number[] // low
    c: number[] // close
    v: number[] // volume
    t: number[] // timestamp
    s: string // status
}

export default function StockChart({ selectedStock, timeframe }: StockChartProps) {
    const chartRef = useRef<HTMLDivElement>(null)
    const chartInstanceRef = useRef<echarts.ECharts | null>(null)
    const [chartData, setChartData] = useState<{
        priceData: [number, number][]
        ohlcData: [number, number, number, number, number][]
        volumeData: [number, number][]
    } | null>(null)
    const [loading, setLoading] = useState(false)

    // Primary green colors for the main stock chart
    const primaryGreen = "#1EAD00"
    const primaryGreenWithOpacity = "rgba(30, 173, 0, 0.38)"

    // Convert timeframe to API parameters
    const getTimeframeParams = useCallback((timeframe: string) => {
        const now = Math.floor(Date.now() / 1000)
        let from: number
        let resolution: string

        switch (timeframe) {
            case "1D":
                from = now - 24 * 60 * 60
                resolution = "5"
                break
            case "5D":
                from = now - 5 * 24 * 60 * 60
                resolution = "15"
                break
            case "1M":
                from = now - 30 * 24 * 60 * 60
                resolution = "60"
                break
            case "3M":
                from = now - 90 * 24 * 60 * 60
                resolution = "D"
                break
            case "6M":
                from = now - 180 * 24 * 60 * 60
                resolution = "D"
                break
            case "YTD":
                const ytdStart = new Date()
                ytdStart.setMonth(0, 1)
                ytdStart.setHours(0, 0, 0, 0)
                from = Math.floor(ytdStart.getTime() / 1000)
                resolution = "D"
                break
            case "1Y":
                from = now - 365 * 24 * 60 * 60
                resolution = "D"
                break
            case "5Y":
                from = now - 5 * 365 * 24 * 60 * 60
                resolution = "W"
                break
            default:
                from = now - 365 * 24 * 60 * 60
                resolution = "D"
        }

        return { from, to: now, resolution }
    }, [])

    // Transform API data to ECharts format
    const transformApiData = useCallback((apiData: ApiResponse) => {
        const priceData: [number, number][] = []
        const ohlcData: [number, number, number, number, number][] = []
        const volumeData: [number, number][] = []

        for (let i = 0; i < apiData.t.length; i++) {
            const timestamp = apiData.t[i] * 1000
            const open = apiData.o[i]
            const high = apiData.h[i]
            const low = apiData.l[i]
            const close = apiData.c[i]
            const volume = apiData.v[i]

            priceData.push([timestamp, close])
            ohlcData.push([timestamp, open, close, low, high])
            volumeData.push([timestamp, volume])
        }

        return { priceData, ohlcData, volumeData }
    }, [])

    // Fetch data from API
    const fetchStockData = useCallback(
        async (symbol: string, timeframe: string): Promise<ApiResponse | null> => {
            try {
                const { from, to, resolution } = getTimeframeParams(timeframe)
                const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/portfolio/chart?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`

                const response = await fetch(apiUrl)

                const contentType = response.headers.get("content-type")
                if (!contentType || !contentType.includes("application/json")) {
                    console.warn(`API returned non-JSON response for ${symbol}.`)
                    return null
                }

                if (!response.ok) {
                    console.warn(`API request failed with status ${response.status} for ${symbol}.`)
                    return null
                }

                const data: ApiResponse = await response.json()

                if (data.s !== "ok") {
                    console.warn(`API returned error status: ${data.s} for ${symbol}.`)
                    return null
                }
                return data
            } catch (error) {
                console.error(`Error fetching data for ${symbol}:`, error)
                return null
            }
        },
        [getTimeframeParams],
    )

    // Load data when selectedStock or timeframe changes
    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const data = await fetchStockData(selectedStock, timeframe)
            if (data) {
                setChartData(transformApiData(data))
            } else {
                setChartData(null)
            }
            setLoading(false)
        }

        loadData()
    }, [selectedStock, timeframe, fetchStockData, transformApiData])

    // Initialize ECharts instance
    useEffect(() => {
        if (chartRef.current && !chartInstanceRef.current) {
            chartInstanceRef.current = echarts.init(chartRef.current)

            const handleResize = () => {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.resize()
                }
            }

            window.addEventListener("resize", handleResize)

            return () => {
                window.removeEventListener("resize", handleResize)
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.dispose()
                    chartInstanceRef.current = null
                }
            }
        }
    }, [])

    // Update ECharts options
    useEffect(() => {
        if (!chartInstanceRef.current || loading) return

        if (!chartData) {
            chartInstanceRef.current.setOption(
                {
                    title: {
                        text: "Data not available",
                        left: "center",
                        top: "center",
                        textStyle: {
                            color: "#999",
                            fontSize: 20,
                        },
                    },
                    xAxis: { show: false },
                    yAxis: { show: false },
                    grid: { show: false },
                    series: [],
                },
                true,
            )
            return
        }

        const { priceData, volumeData } = chartData

        const series = [
            {
                name: selectedStock,
                type: "line",
                smooth: true,
                symbol: "none",
                sampling: "average",
                itemStyle: {
                    color: primaryGreen,
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: primaryGreenWithOpacity,
                        },
                        {
                            offset: 0.9893,
                            color: "#FFFFFF",
                        },
                    ]),
                },
                data: priceData,
            },
            {
                name: "Volume",
                type: "bar",
                xAxisIndex: 0,
                yAxisIndex: 1,
                z: -1,
                itemStyle: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color: (params: any) => {
                        const priceIndex = params.dataIndex
                        if (priceIndex > 0 && priceData[priceIndex] && priceData[priceIndex - 1]) {
                            return priceData[priceIndex][1] >= priceData[priceIndex - 1][1] ? "#10b981" : "#f43f5e"
                        }
                        return "#10b981"
                    },
                    opacity: 0.3,
                },
                data: volumeData,
            },
        ]

        const option = {
            animation: true,
            tooltip: {
                trigger: "axis",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                position: (pt: any) => [pt[0], "10%"],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter: (params: any) => {
                    const date = new Date(params[0].value[0])
                    let tooltipText = `<div style="font-weight: bold">${date.toLocaleDateString()}</div>`
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const priceParam = params.find((param: any) => param.seriesName === selectedStock)
                    if (priceParam) {
                        tooltipText += `<div style="display: flex; align-items: center;">
                            <span style="display: inline-block; width: 10px; height: 10px; background: ${priceParam.color}; margin-right: 5px;"></span>
                            <span>${selectedStock}: $${priceParam.value[1].toFixed(2)}</span>
                        </div>`
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const volumeParam = params.find((param: any) => param.seriesName === "Volume")
                    if (volumeParam) {
                        tooltipText += `<div style="display: flex; align-items: center; margin-top: 5px;">
                            <span>Volume: ${volumeParam.value[1].toLocaleString()}</span>
                        </div>`
                    }

                    return tooltipText
                },
            },
            title: {
                top: "8%",
                left: "center",
                text: `${selectedStock} Stock Price`,
                textStyle: {
                    fontSize: 16,
                    fontWeight: "bold",
                },
            },
            toolbox: {
                top: "4%",
                right: "5%",
                feature: {
                    dataZoom: [
                        {
                            type: "inside",
                            xAxisIndex: 0,
                        },
                        {
                            type: "slider",
                            xAxisIndex: 0,
                        },
                    ],
                    restore: {},
                    saveAsImage: {},
                },
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "60px",
                top: "15%",
                containLabel: true,
            },
            xAxis: {
                type: "time",
                boundaryGap: false,
                axisLine: { onZero: false },
                splitLine: { show: true },
            },
            yAxis: [
                {
                    type: "value",
                    position: "right",
                    boundaryGap: [0, "100%"],
                    axisLabel: {
                        formatter: (value: number) => `$${value.toFixed(0)}`,
                    },
                    splitLine: { show: true },
                },
                {
                    type: "value",
                    position: "right",
                    scale: true,
                    name: "Volume",
                    nameLocation: "end",
                    nameGap: 15,
                    nameTextStyle: {
                        color: "#999",
                        fontSize: 10,
                    },
                    boundaryGap: [0, "100%"],
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                },
            ],
            dataZoom: [
                {
                    type: "inside",
                    start: 0,
                    end: 100,
                    xAxisIndex: [0],
                    zoomLock: false,
                },
                {
                    type: "slider",
                    start: 0,
                    end: 100,
                    height: 20,
                    bottom: 30,
                    borderColor: "transparent",
                    backgroundColor: "#f5f5f5",
                    fillerColor: "rgba(200, 200, 200, 0.3)",
                    handleStyle: {
                        color: "#ddd",
                        borderColor: "#ccc",
                    },
                    moveHandleStyle: {
                        color: "#aaa",
                    },
                    emphasis: {
                        handleStyle: {
                            color: "#999",
                        },
                    },
                },
            ],
            series: series,
        }

        chartInstanceRef.current.setOption(option, true)
    }, [chartData, selectedStock, timeframe, loading, primaryGreen, primaryGreenWithOpacity])

    return (
        <Card className="relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="text-sm text-muted-foreground">Loading chart data...</div>
                </div>
            )}
            {!loading && !chartData && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="text-sm text-muted-foreground text-center">
                        <p>
                            Data not available for <strong>{selectedStock}</strong>.
                        </p>
                        <p>Please try again later or check the stock symbol.</p>
                    </div>
                </div>
            )}
            <div ref={chartRef} className="h-[600px] w-full" />
        </Card>
    )
}
