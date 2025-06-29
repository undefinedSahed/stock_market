import { AssetAllocation } from "./asset-chart"
import { HoldingsDistribution } from "./holding-distribution"
import PerformanceGrid from "./performance-grid"

export default function AnalysisPage() {
    return (
        <div className="">
            <div className="grid grid-cols-1 w-[95vw] md:w-[98svw] lg:w-auto lg:px-3 lg:grid-cols-3 gap-6">
                <div className="col-span-1 lg:w-[500px] w-full">
                    <h3 className="text-xl font-semibold pb-4">Asset Allocation</h3>
                    <div className="min-w-full py-1">
                        <AssetAllocation />
                    </div>
                </div>
                <div className="col-span-1 lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Holdings Distribution</h2>
                    <div className="w-full">
                        <HoldingsDistribution />
                    </div>
                </div>
            </div>
            <div className="py-20 lg:px-2">
                <PerformanceGrid />
            </div>
        </div>
    )
}
