"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import GaugeChart from "react-gauge-chart";
import useAxios from "@/hooks/useAxios";
import { useSearchParams } from "next/navigation";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface ChartConfig {
  operatingCashFlow: {
    label: string;
    color: string;
  };
  investingCashFlow: {
    label: string;
    color: string;
  };
  financingCashFlow: {
    label: string;
    color: string;
  };
}

const chartConfig = {
  operatingCashFlow: {
    label: "Operating Cash Flow",
    color: "hsl(134, 61%, 41%)", // green
  },
  investingCashFlow: {
    label: "Investing Cash Flow",
    color: "hsl(217, 91%, 60%)", // blue
  },
  financingCashFlow: {
    label: "Financing Cash Flow",
    color: "hsl(0, 84%, 60%)", // red
  },
} satisfies ChartConfig;

const CashFlowChart = () => {
  const axiosInstance = useAxios();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const { data: cashFlowData = [] } = useQuery({
    queryKey: ["cashFlow-chart", query],
    queryFn: async () => {
      const res = await axiosInstance(
        `/stocks/stock/cash-flow?symbol=${query}`
      );
      return res.data.cashFlows;
    },
    enabled: !!query,
  });

  // Get the last 10 years of data for better visualization
  const recentData = [...cashFlowData].slice(0, 10).reverse();

  // Calculate total cash flow for gauge chart
  const latestYear = recentData[recentData.length - 1];
  const totalCashFlow = latestYear
    ? latestYear.operatingCashFlow +
      latestYear.investingCashFlow +
      latestYear.financingCashFlow
    : 0;

  // Calculate gauge value (normalized between 0-1)
  // Positive ratio of operating cash flow to total absolute cash flows
  const gaugeValue = latestYear
    ? Math.max(
        0,
        Math.min(
          1,
          latestYear.operatingCashFlow /
            (Math.abs(latestYear.operatingCashFlow) +
              Math.abs(latestYear.investingCashFlow) +
              Math.abs(latestYear.financingCashFlow))
        )
      )
    : 0.5;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="lg:h-[400px] lg:w-1/2">
        <ChartContainer config={chartConfig}>
          {recentData.length > 0 ? (
            <BarChart
              accessibilityLayer
              data={recentData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar
                dataKey="operatingCashFlow"
                fill="var(--color-operatingCashFlow)"
                name="Operating"
              />
              <Bar
                dataKey="investingCashFlow"
                fill="var(--color-investingCashFlow)"
                name="Investing"
              />
              <Bar
                dataKey="financingCashFlow"
                fill="var(--color-financingCashFlow)"
                name="Financing"
              />
            </BarChart>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p>No data available</p>
            </div>
          )}
        </ChartContainer>
      </div>

      <div className="lg:h-[400px] lg:w-1/2 flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium mb-2">Operating Cash Flow Health</h3>
        <GaugeChart
          id="cash-flow-gauge"
          nrOfLevels={4}
          arcPadding={0.1}
          cornerRadius={3}
          percent={gaugeValue}
          textColor="#28a745"
          colors={["#ff0000", "#ffff00", "#28a745"]}
        />
        {latestYear && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Latest Year: {latestYear.year}
            </p>
            <p className="text-lg font-semibold">
              Operating: ${(latestYear.operatingCashFlow / 1000).toFixed(2)}B
            </p>
            <p className="text-sm">
              Total Cash Flow: ${(totalCashFlow / 1000).toFixed(2)}B
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowChart;
