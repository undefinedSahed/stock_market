import { ArrowUp } from "lucide-react"

interface RiskScaleProps {
    myPosition: number // 0-9 position on the scale
    avgPosition: number // 0-9 position on the scale
}

export default function RiskScale({ myPosition, avgPosition }: RiskScaleProps) {
    // Create an array of 10 positions for the risk scale
    const scalePositions = Array.from({ length: 10 }, (_, i) => i)

    // Determine colors for the scale
    const getScaleColor = (position: number, isMyPosition: boolean, isAvgPosition: boolean) => {
        let baseColor = ""

        if (position < 3) {
            baseColor = isMyPosition ? "bg-green-500" : "bg-green-100"
        } else if (position < 5) {
            baseColor = isMyPosition ? "bg-green-600" : "bg-green-300"
        } else if (position < 7) {
            baseColor = isMyPosition || isAvgPosition ? "bg-gray-600" : "bg-gray-300"
        } else {
            baseColor = isMyPosition ? "bg-red-400" : "bg-red-200"
        }

        // If it's the average position and not also my position, use a darker gray
        if (isAvgPosition && !isMyPosition) {
            baseColor = "bg-gray-600"
        }

        return baseColor
    }

    return (
        <div className="w-full">
            <div className="flex justify-between mb-1 text-sm text-gray-600">
                <span>Low Risk</span>
                <span>High Risk</span>
            </div>

            {/* Risk Scale */}
            <div className="grid grid-cols-10 gap-1 mb-1">
                {scalePositions.map((pos) => (
                    <div key={pos} className={`h-6 ${getScaleColor(pos, pos === myPosition, pos === avgPosition)}`} />
                ))}
            </div>

            {/* Position Indicators */}
            <div className="grid grid-cols-10 gap-1">
                {scalePositions.map((pos) => (
                    <div key={pos} className="flex flex-col items-center">
                        {pos === myPosition && (
                            <div className="flex flex-col items-center">
                                <ArrowUp className="h-4 w-4 text-green-600" />
                                <span className="text-xs text-center">
                                    My
                                    <br />
                                    Portfolio
                                </span>
                            </div>
                        )}
                        {pos === avgPosition && (
                            <div className="flex flex-col items-center">
                                <ArrowUp className="h-4 w-4 text-gray-600" />
                                <span className="text-xs text-center">
                                    Avg. Olive Stock&apos;s
                                    <br />
                                    Portfolio
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
