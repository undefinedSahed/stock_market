"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const monthShortMap: Record<string, string> = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};

export function EarningsChart({
  earningsChart,
}: {
  earningsChart: Record<string, number>;
}) {
  // Convert API object to chart-friendly array
  const chartData = Object.entries(earningsChart || {}).map(
    ([month, value]) => ({
      month: monthShortMap[month] || month,
      earnings: value,
    })
  );

  return (
    <ChartContainer
      config={{
        earnings: {
          label: "Earnings",
          color: "hsl(142, 76%, 36%)",
        },
      }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            tickFormatter={(value) => `$${value}`}
            domain={[0, "dataMax + 200"]}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="bg-black text-white p-2 rounded-md shadow-lg"
                indicator={undefined}
              />
            }
            cursor={false}
          />
          <Line
            type="monotone"
            dataKey="earnings"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
            activeDot={{
              r: 6,
              fill: "#22c55e",
              stroke: "white",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
