"use client"

import * as React from "react"
import { PieChart, Pie, Cell, Label } from "recharts"
import { cn } from "@/lib/utils"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { usePortfolio } from "../portfolioContext"
import { useMutation } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

// Define type for asset allocation
type AssetItem = {
  class: string
  percentage: number
  color: string
}

export function AssetAllocation() {
  const [activeTab, setActiveTab] = React.useState<"assets">("assets")
  const { data: session } = useSession()
  const { selectedPortfolioId } = usePortfolio()

  const { mutate: getAssetAllocation, data: assetAllocation } = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/portfolio/allocation?portfolioId=${selectedPortfolioId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      )
      return response.json()
    },
  })

  React.useEffect(() => {
    if (selectedPortfolioId) {
      getAssetAllocation()
    }
  }, [selectedPortfolioId, getAssetAllocation])

  const allocationData = assetAllocation?.assetAllocation

  const assetClassesData: AssetItem[] = [
    { class: "Stocks", percentage: Number(allocationData?.stocks), color: "#FF5733" },
    { class: "Cash", percentage: Number(allocationData?.cash), color: "#2695FF" },
  ]

  return (
    <Card className="w-full mx-auto overflow-hidden shadow-[0px_0px_10px_1px_#0000001A]">
      <div className="relative">
        <div
          className="absolute top-0 left-1/2 h-2 bg-green-500 w-1/3"
          style={{ transform: "translateX(-50%)", transition: "transform 0.3s ease" }}
        ></div>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "assets")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-1 h-auto rounded-none bg-transparent">
            <TabsTrigger
              value="assets"
              className={cn(
                "py-4 px-2 md:text-sm text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0",
                "data-[state=active]:text-black data-[state=active]:font-semibold text-gray-500"
              )}
            >
              My Assets
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Chart */}
          <div className="w-full md:w-1/2">
            <ChartContainer
              config={{
                percentage: {
                  label: "Percentage",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="mx-auto aspect-square max-h-[250px] w-full"
            >
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={assetClassesData}
                  dataKey="percentage"
                  nameKey="class"
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="#fff"
                  startAngle={90}
                  endAngle={-270}
                >
                  {assetClassesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    value="My Assets"
                    position="center"
                    className="text-base font-medium fill-black"
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* Legend */}
          <div className="w-full md:w-1/2">
            <ul className="space-y-3">
              {assetClassesData.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-black">
                    {item.percentage.toFixed(2)}% {item.class}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
