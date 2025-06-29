import { ArrowUp } from "lucide-react"

interface RiskScaleProps {
    myPosition: number // 0-9 position on the scale
    avgPosition: number // 0-9 position on the scale
}

export default function RiskScale({ myPosition, avgPosition }: RiskScaleProps) {
    // Create an array of 10 positions for the risk scale
    const scalePositions = Array.from({ length: 10 }, (_, i) => i)

    // Determine colors for the scale
    const getScaleColor = (position: number) => {
        if (position <= 2) return "bg-green-500" // Green zone
        if (position <= 4) return "bg-green-300" // Light green zone
        if (position <= 6) return "bg-gray-400" // Gray zone
        if (position <= 8) return "bg-red-300" // Light red zone
        return "bg-red-500" // Red zone
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
                    <div
                        key={pos}
                        className={`h-6 ${getScaleColor(pos)}`}
                    />
                ))}
            </div>

            {/* Position Indicators */}
            <div className="grid grid-cols-10 gap-1 relative h-12">
                {scalePositions.map((pos) => (
                    <div key={pos} className="flex flex-col items-center relative">
                        {pos === myPosition && (
                            <div className="flex flex-col items-center absolute top-0">
                                <ArrowUp className="h-4 w-4 text-green-600" />
                                <span className="text-xs text-center">
                                    My
                                    <br />
                                    Portfolio
                                </span>
                            </div>
                        )}
                        {pos === avgPosition && (
                            <div className="flex flex-col items-center absolute top-0">
                                <ArrowUp className="h-4 w-4 text-gray-600" />
                                <span className="text-xs text-center">
                                    Avg.
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