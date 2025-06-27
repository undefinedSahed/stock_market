"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useAxios from "@/hooks/useAxios"
import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface DividendData {
  year: string
  amount: string
}

interface ChartData {
  month: string
  dividend: number
  isLatest: boolean
}

export default function DividendChart() {
  const axiosInstence = useAxios()

  const { data: apiData, isLoading } = useQuery({
    queryKey: ["amount-chart-data"],
    queryFn: async () => {
      const res = await axiosInstence(`/portfolio/dividends/AAPL`)
      return res.data.chartforAmmount as DividendData[]
    },
  })

  // Transform API data to chart format
  const chartData: ChartData[] =
    apiData?.map((item, index, array) => ({
      month: item.year,
      dividend: Number.parseFloat(item.amount),
      isLatest: index === array.length - 1,
    })) || []

  // Calculate dynamic Y-axis domain
  const maxDividend = Math.max(...chartData.map((item) => item.dividend), 0)
  const yAxisMax = Math.ceil(maxDividend * 1.2 * 10) / 10 // Add 20% padding and round to 1 decimal

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-0">
          <CardTitle className="text-lg font-medium mb-4">Dividend Amount Per Share</CardTitle>
        </CardHeader>
        <CardContent className="p-4 shadow-[0px_0px_8px_0px_#00000029]">
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-medium mb-4">Dividend Amount Per Share</CardTitle>
      </CardHeader>
      <CardContent className="p-4 shadow-[0px_0px_8px_0px_#00000029]">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickMargin={8} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                domain={[0, yAxisMax]}
                tick={{ fontSize: 12 }}
              />
              <Bar
                dataKey={(data) => (data.isLatest ? 0 : data.dividend)}
                radius={[2, 2, 0, 0]}
                barSize={30}
                fill="#2CB14A"
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={1000}
              />
              <Bar
                dataKey={(data) => (data.isLatest ? data.dividend : 0)}
                radius={[2, 2, 0, 0]}
                barSize={30}
                fill="#5A5A5A"
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
