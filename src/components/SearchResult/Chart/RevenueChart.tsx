// "use client";
// import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import useAxios from "@/hooks/useAxios";
// import { useQuery } from "@tanstack/react-query";
// import { useSearchParams } from "next/navigation";
// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];
// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "hsl(var(--chart-1))",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "hsl(var(--chart-2))",
//   },
// } satisfies ChartConfig;

// const RevenueChart = () => {

//   const axiosInstance = useAxios();
//   const searchPamars = useSearchParams();
//   const query = searchPamars.get("q");

//   const {data : revenueData, isLoading} = useQuery({
//     queryKey : ["revenue-data"],
//     queryFn : async () => {
//       const res = await axiosInstance(`/stocks/stock/earnings-surprise?symbol=${query}`);
//       return res.data;
//     }
//   })

//   console.log(revenueData, isLoading)

//   return (
//     <div className="">
//       <Card className="">
//         <CardHeader>
//           <CardTitle>Earnings History</CardTitle>
//           <CardDescription>Last 7 days</CardDescription>
//         </CardHeader>
//         <CardContent >
//           <ChartContainer className="w-full h-[400px]" config={chartConfig}>
//             <BarChart accessibilityLayer data={chartData}>
//               <CartesianGrid vertical={false} />
//               <XAxis
//                 dataKey="month"
//                 tickLine={false}
//                 tickMargin={10}
//                 axisLine={false}
//                 tickFormatter={(value) => value.slice(0, 3)}
//               />
//               <ChartTooltip
//                 cursor={false}
//                 content={<ChartTooltipContent indicator="dashed" />}
//               />
//               <Bar dataKey="desktop" fill="#bce4c5" radius={4} />
//               <Bar dataKey="mobile" fill="#28a745" radius={4} />
//             </BarChart>
//           </ChartContainer>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default RevenueChart;


"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import useAxios from "@/hooks/useAxios"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"

const chartConfig = {
  desktop: {
    label: "Estimate",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Actual",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const RevenueChart = () => {
  const axiosInstance = useAxios()
  const searchParams = useSearchParams()
  const query = searchParams.get("q")

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["revenue-data"],
    queryFn: async () => {
      const res = await axiosInstance(`/stocks/stock/earnings-surprise?symbol=${query}`)
      return res.data
    },
  })

  // Define the type for revenue data items
  interface RevenueDataItem {
    period: string | number | Date
    estimate: number
    actual: number
  }

  // Transform API data to chart format
  const chartData =
    revenueData?.slice(0,20)?.map((item: RevenueDataItem) => ({
      period: new Date(item.period).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      desktop: item.estimate, // Estimate data
      mobile: item.actual, // Actual data
    })).reverse() || []

  return (
    <div className="">
      <Card className="">
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>{isLoading ? "Loading..." : `Showing ${chartData.length} periods`}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="w-full h-[400px]" config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="desktop" fill="#bce4c5" radius={4} />
              <Bar dataKey="mobile" fill="#28a745" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default RevenueChart
