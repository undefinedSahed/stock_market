"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { usePortfolio } from "../portfolioContext";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface PerformanceData {
  date: string;
  murakkabAverage: number;
  murakkabAverageSecondary?: number;
  sp500: number;
  myPortfolio: number;
}

export default function PerformanceDashboard() {
  const [showMurakkab, setShowMurakkab] = useState(true);
  const [showSP500, setShowSP500] = useState(true);
  const [showPortfolio, setShowPortfolio] = useState(true);

  const { selectedPortfolioId } = usePortfolio();

  const { data: performaceData, isLoading: isPerformaceDataLoading } = useQuery({
    queryKey: ['portfolioPerformance'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-performance/${selectedPortfolioId}`);
      return response.json();
    },
    enabled: !!selectedPortfolioId,
  });

  const chartData = performaceData?.returnsComparison;

  const performanceData: PerformanceData[] = useMemo(() => {
    if (!chartData) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return chartData.map((item: any) => ({
      date: item.month,
      murakkabAverage: item.mudarabahAverage,
      murakkabAverageSecondary: item.mudarabahAverage,
      sp500: item.sp500,
      myPortfolio: item.portfolio,
    }));
  }, [chartData]);

  const maxValue = 26.01;
  const minValue = -26.01;

  const getBarHeight = (value: number) => {
    const percentage = (Math.abs(value) / maxValue) * 100;
    return Math.min(Math.max(percentage, 5), 100);
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-[0px_0px_16px_0px_#00000029]">
      <h1 className="text-3xl font-bold mb-4 pb-2 border-b">Performance</h1>

      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="murakkab"
            checked={showMurakkab}
            onCheckedChange={() => setShowMurakkab(!showMurakkab)}
            className="h-5 w-5 rounded-full bg-green-500 border-green-500 text-white"
          />
          <Label htmlFor="murakkab" className="text-base font-medium">
            Olive Stock&apos;s Average
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="sp500"
            checked={showSP500}
            onCheckedChange={() => setShowSP500(!showSP500)}
            className="h-5 w-5 rounded-full bg-yellow-400 border-yellow-400 text-white"
          />
          <Label htmlFor="sp500" className="text-base font-medium">
            S&P 500
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="portfolio"
            checked={showPortfolio}
            onCheckedChange={() => setShowPortfolio(!showPortfolio)}
            className="h-5 w-5 rounded-full bg-red-500 border-red-500 text-white"
          />
          <Label htmlFor="portfolio" className="text-base font-medium">
            My Portfolio
          </Label>
        </div>
      </div>

      {
        isPerformaceDataLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin w-16 h-16 text-green-500" />
          </div>
        )
          :
          (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="mb-8 col-span-5 overflow-x-scroll lg:overflow-auto">
                <div className="flex justify-start mb-2">
                  <span className="text-gray-700 font-medium">
                    {maxValue.toFixed(2)}%
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2 mb-1 min-w-[600px]">
                  {performanceData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-full bg-gray-100 flex flex-col h-48">
                        {/* Top half for positive values */}
                        <div className="flex-1 flex items-end justify-center gap-4 relative">
                          <div
                            className="w-7 bg-green-500 rounded-t-sm"
                            style={{
                              height:
                                showMurakkab && data.murakkabAverage > 0
                                  ? `${getBarHeight(data.murakkabAverage)}%`
                                  : "0%",
                              opacity: showMurakkab ? 1 : 0,
                            }}
                          />
                          <div
                            className="w-7 bg-yellow-400 rounded-t-sm"
                            style={{
                              height:
                                showSP500 && data.sp500 > 0
                                  ? `${getBarHeight(data.sp500)}%`
                                  : "0%",
                              opacity: showSP500 ? 1 : 0,
                            }}
                          />
                          <div
                            className="w-7 bg-red-500 rounded-t-sm"
                            style={{
                              height:
                                showPortfolio && data.myPortfolio > 0
                                  ? `${getBarHeight(data.myPortfolio)}%`
                                  : "0%",
                              opacity: showPortfolio ? 1 : 0,
                            }}
                          />
                        </div>

                        <div className="h-[1px] bg-gray-300 w-full" />

                        {/* Bottom half for negative values */}
                        <div className="flex-1 flex items-start justify-center gap-4 relative">
                          <div
                            className="w-7 bg-green-500 rounded-b-sm"
                            style={{
                              height:
                                showMurakkab && data.murakkabAverage < 0
                                  ? `${getBarHeight(data.murakkabAverage)}%`
                                  : "0%",
                              opacity: showMurakkab ? 1 : 0,
                            }}
                          />
                          <div
                            className="w-7 bg-yellow-400 rounded-b-sm"
                            style={{
                              height:
                                showSP500 && data.sp500 < 0
                                  ? `${getBarHeight(data.sp500)}%`
                                  : "0%",
                              opacity: showSP500 ? 1 : 0,
                            }}
                          />
                          <div
                            className="w-7 bg-red-500 rounded-b-sm"
                            style={{
                              height:
                                showPortfolio && data.myPortfolio < 0
                                  ? `${getBarHeight(data.myPortfolio)}%`
                                  : "0%",
                              opacity: showPortfolio ? 1 : 0,
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-sm font-medium mt-1">{data.date}</div>

                      <div className="flex flex-col gap-1 mt-2">
                        {showMurakkab && (
                          <div
                            className={`flex items-center gap-1 ${data.murakkabAverageSecondary &&
                              data.murakkabAverageSecondary > 0
                              ? "text-green-500"
                              : "text-red-500"
                              }`}
                          >
                            {data.murakkabAverageSecondary &&
                              data.murakkabAverageSecondary > 0
                              ? "▲"
                              : "▼"}{" "}
                            {data.murakkabAverageSecondary
                              ? Math.abs(data.murakkabAverageSecondary).toFixed(2)
                              : "0.00"}
                            %
                          </div>
                        )}

                        {showSP500 && (
                          <div
                            className={`flex items-center gap-1 ${data.sp500 > 0 ? "text-green-500" : "text-red-500"
                              }`}
                          >
                            {data.sp500 > 0 ? "▲" : "▼"}{" "}
                            {Math.abs(data.sp500).toFixed(2)}%
                          </div>
                        )}

                        {showPortfolio && (
                          <div
                            className={`flex items-center gap-1 ${data.myPortfolio > 0
                              ? "text-green-500"
                              : "text-red-500"
                              }`}
                          >
                            {data.myPortfolio > 0 ? "▲" : "▼"}{" "}
                            {Math.abs(data.myPortfolio).toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-start">
                  <span className="text-gray-700 font-medium">
                    {minValue.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )
      }
    </div>
  );
}
