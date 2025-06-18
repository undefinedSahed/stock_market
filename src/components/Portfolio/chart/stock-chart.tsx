"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as echarts from "echarts";
import { Card } from "@/components/ui/card";

interface StockChartProps {
    selectedStock: string;
    timeframe: string;
    comparisonStocks?: string[];
}

interface ApiResponse {
    o: number[]; // open
    h: number[]; // high
    l: number[];// low
    c: number[]; // close
    v: number[]; // volume
    t: number[]; // timestamp
    s: string; // status
}

export default function StockChart({ selectedStock, timeframe, comparisonStocks = [] }: StockChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<echarts.ECharts | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [chartData, setChartData] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState(false);

    // Primary green colors for the main stock chart
    const primaryGreen = "#1EAD00";
    const primaryGreenWithOpacity = "rgba(30, 173, 0, 0.38)";

    // Convert timeframe to API parameters, memoized for stability
    const getTimeframeParams = useCallback((timeframe: string) => {
        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        let from: number;
        let resolution: string;

        switch (timeframe) {
            case "1D":
                from = now - 24 * 60 * 60; // 1 day ago
                resolution = "5"; // 5 minute intervals
                break;
            case "5D":
                from = now - 5 * 24 * 60 * 60; // 5 days ago
                resolution = "15"; // 15 minute intervals
                break;
            case "1M":
                from = now - 30 * 24 * 60 * 60; // 30 days ago
                resolution = "60"; // 1 hour intervals
                break;
            case "3M":
                from = now - 90 * 24 * 60 * 60; // 90 days ago
                resolution = "D"; // Daily
                break;
            case "6M":
                from = now - 180 * 24 * 60 * 60; // 180 days ago
                resolution = "D"; // Daily
                break;
            case "YTD":
                const ytdStart = new Date();
                ytdStart.setMonth(0, 1); // January 1st of current year
                ytdStart.setHours(0, 0, 0, 0);
                from = Math.floor(ytdStart.getTime() / 1000);
                resolution = "D"; // Daily
                break;
            case "1Y":
                from = now - 365 * 24 * 60 * 60; // 1 year ago
                resolution = "D"; // Daily
                break;
            case "5Y":
                from = now - 5 * 365 * 24 * 60 * 60; // 5 years ago
                resolution = "W"; // Weekly
                break;
            default:
                from = now - 365 * 24 * 60 * 60; // Default to 1 year
                resolution = "D";
        }

        return { from, to: now, resolution };
    }, []);

    // Transform API data to ECharts format, memoized for stability
    const transformApiData = useCallback((apiData: ApiResponse): {
        priceData: [number, number][];
        ohlcData: [number, number, number, number, number][];
        volumeData: [number, number][];
    } => {
        const priceData: [number, number][] = [];
        const ohlcData: [number, number, number, number, number][] = [];
        const volumeData: [number, number][] = [];

        for (let i = 0; i < apiData.t.length; i++) {
            const timestamp = apiData.t[i] * 1000; // Convert to milliseconds
            const open = apiData.o[i];
            const high = apiData.h[i];
            const low = apiData.l[i];
            const close = apiData.c[i];
            const volume = apiData.v[i];

            priceData.push([timestamp, close]);
            ohlcData.push([timestamp, open, close, low, high]);
            volumeData.push([timestamp, volume]);
        }

        return { priceData, ohlcData, volumeData };
    }, []);

    // Function to normalize data for comparison, memoized for stability
    const normalizeData = useCallback((data: [number, number][]): [number, number][] => {
        if (data.length === 0) return [];

        const firstValue = data[0][1];
        return data.map((item) => [item[0], (item[1] / firstValue) * 100]);
    }, []);

    // Get color for a comparison stock, with comparisonColors defined inside for stability
    const getComparisonColor = useCallback((symbol: string): string => {
        // Color palette for comparison stocks only
        const comparisonColors = {
            AAPL: "#f43f5e", // Red
            NVDA: "#10b981", // Green
            MSFT: "#3b82f6", // Blue
            GOOGL: "#f97316", // Orange
            AMZN: "#8b5cf6", // Purple
            TSLA: "#ec4899", // Pink
            META: "#facc15", // Yellow
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (comparisonColors as any)[symbol] || "#f43f5e";
    }, []); // No dependencies needed as comparisonColors is internal to this callback

    // Fetch data from API without fallback to dummy data, memoized for stability
    const fetchStockData = useCallback(async (symbol: string, timeframe: string): Promise<ApiResponse | null> => {
        try {
            const { from, to, resolution } = getTimeframeParams(timeframe);
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/portfolio/chart?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`;

            console.log(`Fetching data for: ${symbol} from ${apiUrl}`);
            const response = await fetch(apiUrl);

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.warn(`API returned non-JSON response for ${symbol}.`);
                return null; // Indicate failure
            }

            if (!response.ok) {
                console.warn(`API request failed with status ${response.status} for ${symbol}.`);
                return null; // Indicate failure
            }

            const data: ApiResponse = await response.json();

            if (data.s !== "ok") {
                console.warn(`API returned error status: ${data.s} for ${symbol}.`);
                return null; // Indicate failure
            }

            console.log(`Successfully fetched real data for ${symbol}.`);
            return data;
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            return null; // Indicate failure
        }
    }, [getTimeframeParams]); // getTimeframeParams is a dependency

    // Load data for all stocks whenever selectedStock, timeframe, or comparisonStocks change
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newChartData: { [key: string]: any } = {};

            // Load main stock data
            const mainData = await fetchStockData(selectedStock, timeframe);
            if (mainData) {
                newChartData[selectedStock] = transformApiData(mainData);
            } else {
                // If main stock data fails, explicitly set it to undefined to trigger "Data not available"
                newChartData[selectedStock] = undefined;
            }

            // Load comparison stocks data
            for (const stock of comparisonStocks) {
                const compData = await fetchStockData(stock, timeframe);
                if (compData) {
                    newChartData[stock] = transformApiData(compData);
                }
                // If compData is null, it's simply not added to newChartData, and the chart will omit it.
            }

            setChartData(newChartData);
            setLoading(false);
        }

        loadData();
    }, [selectedStock, timeframe, comparisonStocks, fetchStockData, transformApiData]);

    // Initialize ECharts instance on first render
    useEffect(() => {
        if (chartRef.current && !chartInstanceRef.current) {
            chartInstanceRef.current = echarts.init(chartRef.current);

            // Handle resize to make the chart responsive
            const handleResize = () => {
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.resize();
                }
            };

            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.dispose();
                    chartInstanceRef.current = null;
                }
            };
        }
    }, []);

    // Update ECharts options whenever chartData, selectedStock, or other relevant props change
    useEffect(() => {
        if (!chartInstanceRef.current || loading) return;

        const mainStockData = chartData[selectedStock];

        // Display "Data not available" message if main stock data is missing
        if (!mainStockData) {
            chartInstanceRef.current.setOption({
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
                series: [] // Clear any previous series
            }, true);
            return;
        }

        const { priceData, volumeData } = mainStockData;

        // Prepare series for the chart
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
                data: comparisonStocks.length > 0 ? normalizeData(priceData) : priceData,
            },
        ];

        // Add comparison stocks if any are present and have data
        if (comparisonStocks.length > 0) {
            comparisonStocks.forEach((stockSymbol) => {
                if (chartData[stockSymbol]) {
                    const comparisonData = chartData[stockSymbol].priceData;
                    const normalizedData = normalizeData(comparisonData);
                    const stockColor = getComparisonColor(stockSymbol);

                    series.push({
                        name: stockSymbol,
                        type: "line",
                        smooth: true,
                        symbol: "none",
                        sampling: "average",
                        itemStyle: {
                            color: stockColor,
                        },
                        data: normalizedData,
                        // @ts-expect-error areaStyle is not needed for comparison
                        areaStyle: undefined,
                    });
                }
            });
        }

        // Add volume series to the chart
        series.push({
            name: "Volume",
            type: "bar",
            xAxisIndex: 0,
            yAxisIndex: 1,
            z: -1,
            itemStyle: {
                // @ts-expect-error color function
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                color: (params: any) => {
                    const priceIndex = params.dataIndex;
                    if (priceIndex > 0 && priceData[priceIndex] && priceData[priceIndex - 1]) {
                        return priceData[priceIndex][1] >= priceData[priceIndex - 1][1] ? "#10b981" : "#f43f5e";
                    }
                    return "#10b981";
                },
                opacity: 0.3,
            },
            data: volumeData,
        });

        // Configure ECharts options
        const option = {
            animation: true,
            tooltip: {
                trigger: "axis",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                position: (pt: any) => [pt[0], "10%"],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter: (params: any) => {
                    const date = new Date(params[0].value[0]);
                    let tooltipText = `<div style="font-weight: bold">${date.toLocaleDateString()}</div>`;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const priceParams = params.filter((param: any) => param.seriesName !== "Volume");
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    priceParams.forEach((param: any) => {
                        const color = param.color;
                        const seriesName = param.seriesName;
                        const value = param.value[1];

                        if (comparisonStocks.length > 0) {
                            tooltipText += `<div style="display: flex; align-items: center;">
                                <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; margin-right: 5px;"></span>
                                <span>${seriesName}: ${value.toFixed(2)}%</span>
                            </div>`;
                        } else {
                            tooltipText += `<div style="display: flex; align-items: center;">
                                <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; margin-right: 5px;"></span>
                                <span>${seriesName}: $${value.toFixed(2)}</span>
                            </div>`;
                        }
                    });
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const volumeParam = params.find((param: any) => param.seriesName === "Volume");
                    if (volumeParam) {
                        tooltipText += `<div style="display: flex; align-items: center; margin-top: 5px;">
                              <span>Volume: ${volumeParam.value[1].toLocaleString()}</span>
                          </div>`;
                    }

                    return tooltipText;
                },
            },
            title: {
                left: "center",
                text: comparisonStocks.length > 0 ? `${selectedStock} Comparison` : `${selectedStock} Stock Price`,
                textStyle: {
                    fontSize: 16,
                    fontWeight: "normal",
                },
            },
            legend: {
                data: [selectedStock, ...comparisonStocks],
                bottom: 10,
                textStyle: {
                    color: "#666",
                },
                itemStyle: {
                    opacity: 1,
                },
                inactiveColor: "#ccc",
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: "none",
                    },
                    restore: {},
                    saveAsImage: {},
                },
            },
            axisPointer: {
                link: { xAxisIndex: "all" },
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
                        formatter: (value: number) => {
                            if (comparisonStocks.length > 0) {
                                return `${value.toFixed(0)}%`;
                            }
                            return `$${value.toFixed(0)}`;
                        },
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
        };
        chartInstanceRef.current.setOption(option, true);
    }, [chartData, selectedStock, timeframe, comparisonStocks, loading, getComparisonColor, normalizeData, primaryGreen, primaryGreenWithOpacity]);

    return (
        <Card className="relative overflow-hidden max-w-[98vw]">
            {loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="text-sm text-muted-foreground">Loading chart data...</div>
                </div>
            )}
            {/* Display "Data not available" if not loading and main stock data is missing */}
            {!loading && !chartData[selectedStock] && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="text-sm text-muted-foreground text-center">
                        <p>Data not available for **{selectedStock}**.</p>
                        <p>Please try again later or select a different stock.</p>
                    </div>
                </div>
            )}
            <div ref={chartRef} className="h-[500px] w-full" />
        </Card>
    );
}