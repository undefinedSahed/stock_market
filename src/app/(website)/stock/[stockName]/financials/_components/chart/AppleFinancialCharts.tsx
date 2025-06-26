"use client";

import { ChartContainer } from "@/components/ui/chart";
import {
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import useAxios from "@/hooks/useAxios";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function AppleFinancialCharts() {
  const [isMobile, setIsMobile] = useState(false);

  const axiosInstance = useAxios();
  const params = useParams();
  const stockName = params.stockName as string;

  // --- API Data Fetching ---
  const { data: cashFlow } = useQuery({
    queryKey: ["cashflow-overview", stockName],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/stocks/stock/cash-flow?symbol=${stockName.toUpperCase()}`
      );
      return res.data;
    },
    enabled: !!stockName,
  });

  const { data: epsData } = useQuery({
    queryKey: ["eps-overview", stockName],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/stocks/stock/eps?symbol=${stockName.toUpperCase()}`
      );
      return res.data;
    },
    enabled: !!stockName,
  });

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Cash Flow Chart */}
        <div className="border rounded-lg p-3 md:p-4 shadow-sm bg-white">
          <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-4">
            Apple Cash Flow
          </h2>
          <div className="h-[250px] md:h-[300px]">
            <CashFlowChart
              isMobile={isMobile}
              data={cashFlow?.cashFlows || []}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 md:mt-4 gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-gray-600">Operating</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600">Investing</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">Financing</span>
              </div>
            </div>
            <a
              href="#"
              className="text-xs text-blue-500 flex items-center hover:underline"
            >
              Cash Flow <ArrowRight className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>

        {/* EPS Chart */}
        <div className="border rounded-lg p-3 md:p-4 shadow-sm bg-white">
          <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-4">
            Apple Forecast EPS vs Actual EPS
          </h2>
          <div className="h-[250px] md:h-[300px]">
            <EPSChart isMobile={isMobile} data={epsData || []} />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 md:mt-4 gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-gray-600">Estimate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600">Beat</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">Miss</span>
              </div>
            </div>
            <a
              href="#"
              className="text-xs text-blue-500 flex items-center hover:underline"
            >
              Earnings <ArrowRight className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Cash Flow Chart Component
function CashFlowChart({
  isMobile,
  data,
}: {
  isMobile: boolean;
  data: {
    year: number;
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
  }[];
}) {
  const cashFlowData = data.slice(0, 5).map((item) => ({
    year: item.year.toString(),
    operating: item.operatingCashFlow / 1000,
    investing: item.investingCashFlow / 1000,
    financing: item.financingCashFlow / 1000,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer
        config={{
          operating: { label: "Operating", color: "#10b981" },
          investing: { label: "Investing", color: "#3b82f6" },
          financing: { label: "Financing", color: "#ef4444" },
        }}
      >
        <LineChart
          data={cashFlowData}
          margin={{
            top: 10,
            right: isMobile ? 5 : 10,
            left: isMobile ? 0 : 10,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            stroke="#e5e7eb"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={isMobile ? 1 : 0}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={isMobile ? 5 : 10}
            stroke="#e5e7eb"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickFormatter={(v) => `${v}B`}
            domain={[-150, 150]}
            ticks={[-150, -100, -50, 0, 50, 100, 150]}
            width={isMobile ? 35 : 45}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="operating"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: isMobile ? 3 : 4, strokeWidth: 2, fill: "white" }}
            activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="investing"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: isMobile ? 3 : 4, strokeWidth: 2, fill: "white" }}
            activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="financing"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: isMobile ? 3 : 4, strokeWidth: 2, fill: "white" }}
            activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}

// ✅ EPS Chart Component
function EPSChart({
  isMobile,
  data,
}: {
  isMobile: boolean;
  data: {
    actual: number;
    estimate: number;
    period: string;
    quarter: number;
    surprise: number;
    surprisePercent: number;
    year: number;
  }[];
}) {
  const adjustedEpsData = data
    .slice(0, 10)
    .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime())
    .map((item, index) => {
      const label = `Q${item.quarter}'${item.year.toString().slice(2)}`;
      let category: "beat" | "miss" | "estimate" = "estimate";
      if (item.actual > item.estimate) category = "beat";
      else if (item.actual < item.estimate) category = "miss";

      return {
        quarter: label,
        x: index,
        y: item.actual,
        z: isMobile ? 95 : 115,
        category,
      };
    });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer
        config={{
          estimate: { label: "Estimate", color: "#10b981" },
          beat: { label: "Beat", color: "#3b82f6" },
          miss: { label: "Miss", color: "#ef4444" },
        }}
      >
        <ScatterChart
          margin={{
            top: 20,
            right: isMobile ? 5 : 20,
            bottom: 20,
            left: isMobile ? 0 : 20,
          }}
        >
          <XAxis
            type="category"
            dataKey="quarter"
            name="Quarter"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            stroke="#e5e7eb"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={isMobile ? 1 : 0}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="EPS"
            domain={[0.6, 2.0]}
            tickCount={isMobile ? 5 : 7}
            tickLine={false}
            axisLine={false}
            tickMargin={isMobile ? 5 : 10}
            stroke="#e5e7eb"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={isMobile ? 35 : 45}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={
              <ChartTooltipContent
                formatter={(value, name) =>
                  name === "y" ? [`${value}`, "EPS"] : [value, name]
                }
              />
            }
          />
          <Scatter name="EPS Values" data={adjustedEpsData}>
            {adjustedEpsData.map((entry, index) => {
              let fillColor = "#ef4444";
              if (entry.category === "estimate") fillColor = "#10b981";
              if (entry.category === "beat") fillColor = "#3b82f6";
              return (
                <circle
                  key={`circle-${index}`}
                  cx={0}
                  cy={0}
                  r={entry.z / 10}
                  fill={fillColor}
                  fillOpacity={0.3}
                  stroke={fillColor}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
