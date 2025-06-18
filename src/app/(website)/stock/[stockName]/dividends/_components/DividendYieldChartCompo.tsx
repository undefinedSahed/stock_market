"use client"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import useAxios from "@/hooks/useAxios"
import { useQuery } from "@tanstack/react-query"

interface ApiDividendData {
  year: string
  yield: string
}

interface ChartDividendData {
  year: string
  yield: number
}

const DividendYieldChartCompo = () => {
  const axiosInstance = useAxios()

  const {
    data: yieldData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["yield-dividends-data"],
    queryFn: async () => {
      const res = await axiosInstance(`/portfolio/dividends/AAPL`)
      return res.data.chartforYeild as ApiDividendData[]
    },
  })

  // Transform API data to chart format
  const chartData: ChartDividendData[] =
    yieldData?.map((item) => ({
      year: item.year,
      yield: Number.parseFloat(item.yield),
    })) || []

  if (isLoading) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">AAPL Dividend Yield</h1>
        <div className="w-full bg-white shadow-[0px_0px_8px_0px_#00000029] p-6">
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">AAPL Dividend Yield</h1>
        <div className="w-full bg-white shadow-[0px_0px_8px_0px_#00000029] p-6">
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-red-500">Error loading chart data</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AAPL Dividend Yield</h1>
      <div className="w-full bg-white shadow-[0px_0px_8px_0px_#00000029] p-6">
        <ChartContainer
          config={{
            yield: {
              label: "Dividend Yield",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="min-h-[400px]"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
              domain={["dataMin - 0.1", "dataMax + 0.1"]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value) => [`${value}%`, "Dividend Yield"]} />}
            />
            <Line
              dataKey="yield"
              type="monotone"
              stroke="#28af51"
              strokeWidth={3}
              dot={{
                fill: "white",
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                r: 7,
                stroke: "#28af51",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ChartContainer>
      </div>
      <div className="flex justify-end mt-2">
        <a href="#" className="text-blue-500 hover:underline text-sm">
          See AAPL Stats & Charts &gt;
        </a>
      </div>
    </main>
  )
}

export default DividendYieldChartCompo
