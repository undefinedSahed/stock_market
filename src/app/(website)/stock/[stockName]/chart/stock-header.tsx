"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StockHeaderProps {
    selectedStock: string
    timeframe: string
    onTimeframeChange: (timeframe: string) => void
}

export default function StockHeader({ selectedStock, timeframe, onTimeframeChange }: StockHeaderProps) {
    return (
        <div className="space-y-4 lg:px-12">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="font-bold text-2xl">{selectedStock}</div>
                </div>

                <Tabs value={timeframe} onValueChange={onTimeframeChange} className="h-9">
                    <TabsList className="grid grid-cols-8">
                        <TabsTrigger value="1D">1D</TabsTrigger>
                        <TabsTrigger value="5D">5D</TabsTrigger>
                        <TabsTrigger value="1M">1M</TabsTrigger>
                        <TabsTrigger value="3M">3M</TabsTrigger>
                        <TabsTrigger value="6M">6M</TabsTrigger>
                        <TabsTrigger value="YTD">YTD</TabsTrigger>
                        <TabsTrigger value="1Y">1Y</TabsTrigger>
                        <TabsTrigger value="5Y">5Y</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    )
}
