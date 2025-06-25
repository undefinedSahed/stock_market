"use client";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import { useSearchParams } from "next/navigation";
// import { YAxis } from "@/components/ui/media-chart/media-chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const PriceChart = () => {
  const [isActive, setIsActive] = useState("Day");

  const axiosInstance = useAxios();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const { data: priceData } = useQuery({
    queryKey: ["price-chart-data"],
    queryFn: async () => {
      const res = await axiosInstance(
        `/stocks/stocks-overview?symbol=${query}`
      );
      return res.data?.data;
    },
  });

  interface ChartDataItem {
    time: number;
    close: number;
    volume: number;
  }

  const getFilteredChartData = (chartData: ChartDataItem[], period: string) => {
    if (!chartData || chartData.length === 0) return [];

    const now = Date.now();
    let startTime = 0;

    switch (period) {
      case "Day":
        startTime = now - 24 * 60 * 60 * 1000; // 1 day
        break;
      case "Week":
        startTime = now - 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      case "Month":
        startTime = now - 30 * 24 * 60 * 60 * 1000; // 1 month
        break;
      case "Year":
        startTime = now - 365 * 24 * 60 * 60 * 1000; // 1 year
        break;
      case "5 Year":
        startTime = now - 5 * 365 * 24 * 60 * 60 * 1000; // 5 years
        break;
      case "Max":
        startTime = 0; // Show all data
        break;
      default:
        startTime = now - 24 * 60 * 60 * 1000; // Default to 1 day
    }

    return chartData
      .filter((item) => item.time >= startTime && !isNaN(item.close))
      .map((item) => ({
        time: new Date(item.time).toLocaleDateString(),
        price: Number(item.close) || 0, // Ensure price is a number, fallback 0 if invalid
        volume: item.volume,
      }));
  };

  return (
    <div>
      <div className="flex space-x-2 sm:text-[32px] text-xl">
        <span className="font-bold">{priceData?.priceInfo?.currentPrice}</span>
        <span className="text-green-600 font-semibold">
          +{priceData?.priceInfo?.change} ({priceData?.priceInfo?.percentChange}
          %)
        </span>
      </div>

      {/* <div className="text-sm text-gray-500 mt-1">
        <span className="mr-2">221.22</span>
        <span className="text-red-600 font-semibold">▼ 1.22 (1.2%)</span>
        <span className="ml-2">
          After Hours · 17 March 7:02 pm EDT · Market Closed
        </span>
      </div> */}

      <div className=" mt-4 overflow-x-auto">
        <div className="flex gap-2 w-max min-w-full px-2">
          <button
            className={`rounded-full px-5 w-[120px] border border-green-500 py-2 text-green-500 font-semibold ${
              isActive === "Day" ? "bg-green-500 text-white" : ""
            }`}
            onClick={() => setIsActive("Day")}
          >
            Day
          </button>

          <button
            className={`rounded-full px-5 w-[120px] border border-green-500 py-2 text-green-500 font-semibold ${
              isActive === "Week" ? "bg-green-500 text-white" : ""
            }`}
            onClick={() => setIsActive("Week")}
          >
            Week
          </button>

          <button
            className={`rounded-full px-5 w-[120px] border border-green-500 py-2 text-green-500 font-semibold ${
              isActive === "Month" ? "bg-green-500 text-white" : ""
            }`}
            onClick={() => setIsActive("Month")}
          >
            Month
          </button>

          <button
            className={`rounded-full px-5 w-[120px] border border-green-500 py-2 text-green-500 font-semibold ${
              isActive === "Year" ? "bg-green-500 text-white" : ""
            }`}
            onClick={() => setIsActive("Year")}
          >
            Year
          </button>

          <button
            className={`rounded-full px-5 w-[120px] border border-green-500 py-2 text-green-500 font-semibold ${
              isActive === "5 Year" ? "bg-green-500 text-white" : ""
            }`}
            onClick={() => setIsActive("5 Year")}
          >
            5 Year
          </button>

          <button
            className={`rounded-full px-5 w-[120px] border border-green-500 py-2 text-green-500 font-semibold ${
              isActive === "Max" ? "bg-green-500 text-white" : ""
            }`}
            onClick={() => setIsActive("Max")}
          >
            Max
          </button>
        </div>
      </div>

      <div className="mt-5">
        <Card>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-[400px]">
              {/* <AreaChart
                accessibilityLayer
                data={getFilteredChartData(priceData?.chart || [], isActive)}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    // Show abbreviated date format
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" hideLabel />}
                />
                <Area
                  dataKey="price"
                  type="linear"
                  fill="green"
                  fillOpacity={0.3}
                  stroke="#139430"
                />
              </AreaChart> */}
              <AreaChart
                accessibilityLayer
                data={getFilteredChartData(priceData?.chart || [], isActive)}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  domain={(
                    [dataMin, dataMax]: [number, number],
                    // allowDataOverflow: boolean
                  ) => {
                    if (isNaN(dataMin) || isNaN(dataMax)) {
                      // fallback domain if invalid values detected
                      return [0, 1];
                    }
                      if (!isFinite(dataMin) || !isFinite(dataMax)) {
    return [0, 100]; // or any default range you prefer
  }
                    const center = (dataMin + dataMax) / 2;
                    const range = Math.max((dataMax - dataMin) * 1.2, 1);
                    return [center - range / 2, center + range / 2];
                  }}
                />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" hideLabel />}
                />
                <Area
                  dataKey="price"
                  type="linear"
                  fill="green"
                  fillOpacity={0.3}
                  stroke="#139430"
                />
              </AreaChart>

              {/* <AreaChart
                data={getFilteredChartData(priceData?.chart || [], isActive)}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  domain={(dataMin: number, dataMax: number) => {
                    const padding = Math.max((dataMax - dataMin) * 0.1, 1); // Add padding to make it look more like stock chart
                    return [dataMin - padding, dataMax + padding];
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" hideLabel />}
                />
                <Area
                  dataKey="price"
                  type="monotone" // Smooth line
                  fill="green"
                  fillOpacity={0.3}
                  stroke="#139430"
                />
              </AreaChart> */}
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriceChart;
