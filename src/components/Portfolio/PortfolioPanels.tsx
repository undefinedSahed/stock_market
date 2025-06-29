"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Edit2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import { usePortfolio } from "./portfolioContext";
import { AddPortfolioDialog } from "./add-portfolio-dialog";
import AddToPortfolioDialog from "./add-holding-dialog";
import { Input } from "../ui/input";
import { toast } from "sonner";

import * as echarts from "echarts/core";
import {
  LineChart
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import {
  CanvasRenderer
} from "echarts/renderers";

// Register required components
echarts.use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

export default function Home() {
  const { data: session } = useSession();
  const { selectedPortfolioId } = usePortfolio();
  const [cashValue, setCashValue] = useState<string>("");
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const [showPortfolio] = useState(true);
  const [showSP500] = useState(true);


  // Fetch portfolio data for selected ID
  const { data: portfolioData, isLoading: isPortfolioDataLoading } = useQuery({
    queryKey: ["portfolio", selectedPortfolioId],
    queryFn: async () => {
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
    enabled: !!session?.user?.accessToken && !!selectedPortfolioId,
  });


  const { mutate: getGainLose, data: gainLoseData, isPending: isGainLoseLoading } = useMutation({
    mutationFn: async (symbols: string[]) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/topmovers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbols }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch portfolio overview");
      }

      return res.json();
    },
  });


  const { data: performaceData, isLoading: isPerformaceDataLoading } = useQuery({
    queryKey: ['portfolioPerformance'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-performance/${selectedPortfolioId}`);
      return response.json();
    },
    enabled: !!selectedPortfolioId,
  });


  const performanceChartData = performaceData?.performanceChart

  console.log(performanceChartData)

  const { mutate: getOverview, data: overviewData, isPending: isOverviewLoading } = useMutation({
    mutationFn: async (portfolioId: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/overview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: portfolioId }),
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
      const symbols = portfolioData.stocks.map((stock: any) => stock.symbol);
      getGainLose(symbols);
    }
  }, [portfolioData, getGainLose, getOverview]);


  useEffect(() => {
    if (selectedPortfolioId) {
      getOverview(selectedPortfolioId);
    }
  }, [selectedPortfolioId, getOverview]);

  useEffect(() => {
    if (!chartRef.current || !performanceChartData) return;

    const { labels, datasets } = performanceChartData;

    const filteredSeries = datasets
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((ds: any) => {
        if (ds.label === "My Portfolio" && showPortfolio) return true;
        if (ds.label === "S&P 500" && showSP500) return true;
        return false;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((ds: any) => {
        const isPortfolio = ds.label === "My Portfolio";
        return {
          name: ds.label,
          type: "line",
          smooth: true,
          data: ds.data,
          lineStyle: {
            width: 1,
            color: isPortfolio ? "#28A745" : "#DC3545", // green / red
          },
          areaStyle: {
            opacity: 0.15,
            color: isPortfolio ? "#28A745" : "#DC3545", // lighter fill
          },
          symbol: "circle",
          symbolSize: 6,
        };
      })


    const options: echarts.EChartsCoreOption = {

      tooltip: {
        trigger: "axis",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) =>
          params
            .map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (item: any) =>
                `${item.seriesName}: <b>${item.data.toFixed(2)}%</b>`
            )
            .join("<br/>"),
      },
      legend: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: filteredSeries.map((s: any) => s.name),
        top: 0,
        color: "green",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: labels,
        boundaryGap: false,
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: "{value}%",
        },
      },
      series: filteredSeries,
    };

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    chartInstance.current.setOption(options);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [performanceChartData, showPortfolio, showSP500]);


  const dailyReturn = overviewData?.dailyReturn ?? 0;
  const dailyReturnPercent = overviewData?.dailyReturnPercent ?? 0;
  const isReturnPositive = dailyReturn >= 0;
  const isReturnPercentPositive = dailyReturnPercent >= 0;

  const isMonthlyReturnPercentPositive = overviewData?.monthlyReturnPrecent >= 0;


  const queryClient = useQueryClient();

  const { mutate: updateCash, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protfolio/${selectedPortfolioId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({ cash: Number(cashValue) }),
      });

      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Cash updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["portfolio", selectedPortfolioId] });
      getOverview(selectedPortfolioId as string);
    },
    onError: () => {
      toast.error("Error updating cash");
    },
  });

  useEffect(() => {
    if (overviewData?.cash !== undefined) {
      setCashValue(String(overviewData.cash));
    }
  }, [overviewData?.cash]);

  console.log(overviewData)

  return (
    <div className="flex flex-col ">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 p-3 mt-8 mb-6">
        <AddPortfolioDialog />
        <AddToPortfolioDialog />
      </div>

      {/* Portfolio Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-3">
        {/* Left Section */}
        <div className="border rounded-xl overflow-hidden h-[400px] bg-white shadow-[0px_0px_8px_0px_#00000029] max-w-[100vw]">
          {
            isPortfolioDataLoading || isOverviewLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin w-16 h-16 text-green-500" />
              </div>
            ) : (
              <div className="p-4">
                <h2 className="font-semibold text-lg text-gray-800">
                  Portfolio Overview
                </h2>
                <div className="flex mt-2 shadow-[0px_0px_10px_1px_#0000001A]">
                  <div className="px-4 py-2 font-medium relative after:absolute after:top-0 after:left-0 after:content-[''] after:h-[5px] after:w-full after:bg-[#28A745]">
                    Overview
                  </div>
                </div>

                <div className="py-3 text-center">
                  <h1 className="text-[40px] text-[#595959] font-bold">
                    {`$${Number(overviewData?.totalValueWithCash)?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                  </h1>
                </div>

                <div className="text-sm text-gray-600 mt-4 text-center">
                  Total Holdings
                </div>

                <div className="flex text-center items-center justify-center mt-2 py-2 gap-2">
                  <div>Portfolio Cash: $</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-32"
                      value={cashValue}
                      onChange={(e) => setCashValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateCash();
                      }}
                      disabled={isPending}
                      placeholder="Enter cash"
                    />
                    <button
                      onClick={() => updateCash()}
                      disabled={isPending}
                      className="hover:text-black text-gray-400 transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>


                <div className="mt-4">
                  <div className="flex divide-x divide-gray-200">
                    {/* Total Return */}
                    <div className="flex-1 px-4">
                      <div className={`flex items-center ${isReturnPositive ? "text-green-500" : "text-red-500"}`}>
                        {isReturnPositive ? <FaCaretUp className="w-6 h-6 mr-1" /> : <FaCaretDown className="w-6 h-6 mr-1" />}
                        <span className="text-lg font-semibold">$ {dailyReturn}</span>
                      </div>
                      <div className={`flex items-center ${isReturnPercentPositive ? "text-green-500" : "text-red-500"}`}>
                        {isReturnPercentPositive ? <FaCaretUp className="w-6 h-6 mr-1" /> : <FaCaretDown className="w-6 h-6 mr-1" />}
                        <span className="text-lg font-semibold">{dailyReturnPercent}%</span>
                      </div>
                      <div className="flex items-center text-xs mt-4 text-muted-foreground">
                        Daily Return
                      </div>
                    </div>

                    {/* Daily Return */}
                    <div className="flex-1 px-4 mt-9">
                      <div className={`flex items-center ${isMonthlyReturnPercentPositive ? "text-green-500" : "text-red-500"}`}>
                        {isMonthlyReturnPercentPositive ? <FaCaretUp className="w-6 h-6 mr-1" /> : <FaCaretDown className="w-6 h-6 mr-1" />}
                        <span className="text-lg font-semibold">{overviewData?.monthlyReturnPercent}%</span>
                      </div>
                      <div className="text-xs text-center">
                        30 Day Return
                      </div>
                    </div>

                    {/* 30 Day Return */}
                    <div className="flex-1 px-4 mt-9">
                      <div className="h-8 flex items-center justify-center">
                        ---
                      </div>
                      <div className="text-xs text-center">
                        30 Day Return
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        </div>

        {/* Middle Section */}
        <div className="border rounded-xl overflow-hidden h-[400px] bg-white shadow-[0px_0px_8px_0px_#00000029] max-w-[100vw]">
          {
            isPortfolioDataLoading || isGainLoseLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin w-16 h-16 text-green-500" />
              </div>
            )
              :
              (
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-lg text-gray-800">
                    Portfolio Overview
                  </h2>
                  <div className="flex justify-between mt-2 shadow-[0px_0px_10px_1px_#0000001A]">
                    <div className="px-4 py-2 font-medium relative after:absolute after:top-0 after:left-0 after:content-[''] after:h-[5px] after:w-full after:bg-[#28A745]">
                      Top Gainers
                    </div>
                    <div className="px-4 py-2 text-gray-500">Top Losers</div>
                  </div>

                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-5 items-center py-2">
                      <div className="">
                        {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          gainLoseData?.topGainers?.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-2 border-b space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">{item.symbol}</span>
                              </div>
                              <div className="">
                                <div className={`flex items-center ${item.dp > 0 ? "text-green-500" : "text-red-500"}`}>
                                  {item.dp > 0 ? <FaCaretUp className="w-4 h-4 mr-1" /> : <FaCaretDown className="w-4 h-4 mr-1" />}
                                  <span className="text-base font-semibold">{item.dp.toFixed(2)}%</span>
                                </div>
                                <div className={`flex items-center ${item.d > 0 ? "text-green-500" : "text-red-500"}`}>
                                  {item.d > 0 ? <FaCaretUp className="w-4 h-4 mr-1" /> : <FaCaretDown className="w-4 h-4 mr-1" />}
                                  <span className="text-base font-semibold">$ {item.d.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                      <div className="">
                        <div className="py-4 text-center text-gray-500 text-sm">
                          {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            gainLoseData?.topLosers?.map((item: any, index: number) => (
                              <div key={index} className="flex items-center justify-between gap-2 border-b space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-semibold">{item.symbol}</span>
                                </div>
                                <div className="">
                                  <div className={`flex items-center ${item.dp > 0 ? "text-green-500" : "text-red-500"}`}>
                                    {item.dp > 0 ? <FaCaretUp className="w-4 h-4 mr-1" /> : <FaCaretDown className="w-4 h-4 mr-1" />}
                                    <span className="text-base font-semibold">{item.dp.toFixed(2)}%</span>
                                  </div>
                                  <div className={`flex items-center ${item.d > 0 ? "text-green-500" : "text-red-500"}`}>
                                    {item.d > 0 ? <FaCaretUp className="w-4 h-4 mr-1" /> : <FaCaretDown className="w-4 h-4 mr-1" />}
                                    <span className="text-base font-semibold">$ {item.d.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
          }
        </div>

        {/* Right Section - Portfolio Performance with ECharts */}
        <div className="border rounded-xl overflow-hidden h-[400px] bg-white shadow-[0px_0px_8px_0px_#00000029] max-w-[100vw]">
          {
            isPortfolioDataLoading || isPerformaceDataLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin w-16 h-16 text-green-500" />
              </div>
            )
              :
              (
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg text-gray-800">
                      Portfolio Performance
                    </h2>
                    <div className="text-xs text-green-500 flex items-center cursor-pointer hover:underline">
                      See All <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                  <div className="flex mt-2 shadow-[0px_0px_10px_1px_#0000001A]">
                    <div className="px-4 py-2 font-medium relative after:absolute after:top-0 after:left-0 after:content-[''] after:h-[5px] after:w-full after:bg-[#28A745]">
                      Overview
                    </div>
                  </div>

                  {/* Chart Container */}
                  <div ref={chartRef} className="h-[250px] w-full mt-2" />
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
}