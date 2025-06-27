"use client"

import { UserProfile } from "./user-profile"
import { PerformanceMetrics } from "./performance-metrics"
import PerformanceDashboard from "./performance-chart"
import { useQuery } from "@tanstack/react-query"
import { usePortfolio } from "../portfolioContext"


export function PortfolioPerformance() {

    const { selectedPortfolioId } = usePortfolio()

    const { data: performaceData } = useQuery({
        queryKey: ['portfolioPerformance'],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-performance/${selectedPortfolioId}`)
            return response.json()
        },
        enabled: !!selectedPortfolioId
    })


    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 lg:gap-5 lg:mt-20 mt-5">
            <div className="col-span-1 h-fit shadow-[0px_0px_16px_0px_#00000029] rounded-md">
                <UserProfile />
                <PerformanceMetrics successRate={performaceData?.rankings.successRate} averageReturn={performaceData?.rankings.averageReturn} profitableTransactions={0} totalTransactions={1} />
            </div>
            <div className="col-span-2 mt-5 lg:mt-0">
                <PerformanceDashboard />
            </div>
        </div>
    )
}
