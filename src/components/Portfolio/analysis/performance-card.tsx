import RiskScale from "./risk-scale"

interface Stock {
    id: number
    name: string
    ticker: string
    beta: number
}

interface PerformanceCardProps {
    title: string
    data: {
        myRisk: number
        myPosition: number
        avgPosition: number
        highestRiskStocks: Stock[]
    }
}

export default function PerformanceCard({ title, data }: PerformanceCardProps) {
    const getRiskDescription = () => {
        if (title === "Portfolio Volatility") {
            return `${data.myRisk} Beta`
        }
        if (title === "Portfolio P/E") {
            return `${data.myRisk} P/E Ratio`
        }
        if (title === "Portfolio Dividends") {
            return `${data.myRisk}% Dividend Yield`
        }
        return `${data.highestRiskStocks.length} Warning(s)`
    }

    return (
        <div className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{title}</h2>

            {/* Risk Indicator */}
            <div className={`mb-2 border-l-4 ${data.myPosition <= 2 ? 'border-green-500' :
                data.myPosition <= 4 ? 'border-green-300' :
                    data.myPosition <= 6 ? 'border-gray-400' :
                        data.myPosition <= 8 ? 'border-red-300' : 'border-red-500'
                } pl-2`}>
                <p className="font-medium">{getRiskDescription()}</p>
            </div>

            {/* Risk Scale */}
            <div className="mb-6">
                <RiskScale myPosition={data.myPosition} avgPosition={data.avgPosition} />
            </div>

            {/* Highest Risk Stocks */}
            {data.highestRiskStocks.length > 0 && (
                <div>
                    <div className="flex justify-between font-medium border-b pb-2 mb-2">
                        <span>{title === "Stock Warnings" ? "Warning Stocks" : "Highest Risk Stocks"}</span>
                        <span>{title === "Portfolio Volatility" ? "Beta" : "Value"}</span>
                    </div>

                    {data.highestRiskStocks.map((stock) => (
                        <div key={stock.id} className="flex justify-between py-2">
                            <div>
                                <span>
                                    {stock.id}. {stock.name} (
                                </span>
                                <a href={`#${stock.ticker}`} className="text-blue-500">
                                    {stock.ticker}
                                </a>
                                <span>)</span>
                            </div>
                            <span>
                                {title === "Portfolio Volatility" ? stock.beta :
                                    title === "Portfolio P/E" ? data.myRisk :
                                        title === "Portfolio Dividends" ? `${data.myRisk}%` :
                                            'Warning'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}