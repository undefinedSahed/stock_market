import { InfoIcon as InfoCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PerformanceMetricsProps {
    successRate: number
    averageReturn: number
    profitableTransactions: number
    totalTransactions: number
}

export function PerformanceMetrics({
    successRate,
    averageReturn,
    profitableTransactions,
    totalTransactions,
}: PerformanceMetricsProps) {
    const isNegativeReturn = averageReturn <= 0
    const isNegativeSuccessRate = successRate <= 0

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 px-2 pb-2">
            <div className="bg-white p-4 rounded-lg shadow-sm border-2">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm text-gray-600 font-medium">Success Rate</h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoCircle className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Percentage of profitable transactions</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="flex justify-center items-center h-24 md:h-32 mb-6">
                    <span className={`text-3xl md:text-4xl font-bold ${isNegativeSuccessRate ? "text-red-500" : "text-green-500"}`}>
                        {isNegativeSuccessRate ? "" : "+"}
                        {successRate}
                    </span>
                </div>

                <p className="text-xs text-center mt-2 text-gray-500">
                    {profitableTransactions} out of {totalTransactions} profitable transactions
                </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border-2">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm text-gray-600 font-medium">Average Return</h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoCircle className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Average return per transaction</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="flex justify-center items-center h-24 md:h-32 mb-6">
                    <span className={`text-3xl md:text-4xl font-bold ${isNegativeReturn ? "text-red-500" : "text-green-500"}`}>
                        {isNegativeReturn ? "" : "+"}
                        {averageReturn}%
                    </span>
                </div>

                <p className="text-xs text-center mt-2 text-gray-500">Average return per transaction</p>
            </div>
        </div>
    )
}
