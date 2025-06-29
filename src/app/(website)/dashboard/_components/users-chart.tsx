"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const monthOrder: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

export function UsersChart({
  userChart,
}: {
  userChart: { paid: Record<string, number>; free: Record<string, number> };
}) {
  const chartData = monthOrder.map((month) => ({
    month: monthShortMap[month],
    paid: userChart?.paid?.[month] ?? 0,
    free: userChart?.free?.[month] ?? 0,
  }));

  return (
    <ChartContainer
      config={{
        paid: {
          label: "Paid",
          color: "hsl(142, 76%, 36%)",
        },
        free: {
          label: "Free",
          color: "hsl(186, 83%, 61%)",
        },
      }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
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
            tickFormatter={(value) => `${value}`}
            domain={[0, "dataMax + 200"]}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="bg-black text-white p-2 rounded-md shadow-lg"
                indicator="dot"
              />
            }
            cursor={false}
          />
          <Legend
            align="right"
            verticalAlign="top"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 10 }}
          />
          <Bar
            dataKey="paid"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Bar
            dataKey="free"
            fill="#22d3ee"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
