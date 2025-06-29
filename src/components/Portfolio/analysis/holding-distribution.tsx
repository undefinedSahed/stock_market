"use client"

import * as React from "react"
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartTooltip } from "@/components/ui/chart"
import { useSession } from "next-auth/react"
import { usePortfolio } from "../portfolioContext"
import { useMutation } from "@tanstack/react-query"

// Types
interface SectorItem {
    sector: string
    percent: string
}

export function HoldingsDistribution() {
    const [activeTab, setActiveTab] = React.useState("sector")
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

    const holdingDistData: SectorItem[] = assetAllocation?.holdingsBySector || []

    const chartData = holdingDistData.map((item, idx) => ({
        name: item.sector,
        percentage: parseFloat(item.percent),
        color: ["#FF5733", "#28A745", "#2695FF", "#FFD700", "#0D3459"][idx % 5],
        count: 1,
    }))

    return (
        <Card className="w-full overflow-hidden shadow-[0px_0px_10px_1px_#0000001A]">
            <div className="px-4 py-2">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
                    <TabsList className="grid grid-cols-1 h-auto rounded-none bg-transparent">
                        <TabsTrigger
                            value="sector"
                            className={cn(
                                "py-2 px-1 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0",
                                "data-[state=active]:text-black data-[state=active]:font-semibold text-gray-500",
                            )}
                        >
                            By Sector
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    {/* Chart and Legend */}
                    <div className="w-full md:w-1/2 flex flex-col">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="percentage"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        stroke="#fff"
                                        strokeWidth={2}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        formatter={(value: any) => [`${value}%`, "Percentage"]}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-white p-2 border rounded shadow-sm">
                                                        <p className="font-medium">{data.name}</p>
                                                        <p>{`${data.percentage.toFixed(2)}%`}</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="mt-4">
                            <ul className="space-y-2">
                                {chartData.map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <span className="text-black text-sm">
                                            {item.percentage.toFixed(2)}% {item.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Metrics Table */}
                    <div className="w-full md:w-1/2">
                        <h3 className="font-semibold mb-3">Holdings by Sector</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-medium text-sm">Sector</th>
                                    <th className="text-left py-2 font-medium text-sm">% of Portfolio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2 text-sm">{item.name}</td>
                                        <td className="py-2 text-sm">{item.percentage.toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
