"use client"

import { useEffect, useRef, useState } from "react"
import * as echarts from "echarts"
import { useSearchParams } from "next/navigation"

interface Node {
  name: string
}

interface Link {
  source: string
  target: string
  value: number
}

interface SankeyData {
  nodes: Node[]
  links: Link[]
}

interface SankeyChartProps {
  symbol?: string
  className?: string
}

export default function SankeyChart({ className = "" }: SankeyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [data, setData] = useState<SankeyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const params = useSearchParams();
  const query = params.get('q')

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/revenue-breakdown?symbol=${query}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        console.error("Error fetching Sankey data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [query])

  // Initialize and update chart
  useEffect(() => {
    if (!chartRef.current || !data) return

    // Initialize chart if not already done
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          if (params.dataType === "edge") {
            return `${params.data.source} → ${params.data.target}<br/>Value: $${params.data.value.toFixed(2)}B`
          } else {
            return `${params.data.name}`
          }
        },
      },
      animation: true,
      animationDuration: 1000,
      series: [
        {
          type: "sankey",
          top: "5%",
          bottom: "5%",
          left: "3%",
          right: "3%",
          nodeWidth: 20,
          nodeGap: 8,
          layoutIterations: 32,
          emphasis: {
            focus: "adjacency",
          },
          data: data.nodes,
          links: data.links,
          orient: "vertical",
          label: {
            position: "top",
            fontSize: 11,
            fontWeight: "bold",
            color: "#333",
            distance: 5,
          },
          lineStyle: {
            color: "gradient",
            curveness: 0.5,
            opacity: 0.7,
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: "#fff",
          },
          levels: [
            {
              depth: 0,
              itemStyle: {
                color: "#24963E",
              },
            },
            {
              depth: 1,
              itemStyle: {
                color: "#566AEA",
              },
            },
            {
              depth: 2,
              itemStyle: {
                color: "#C23636",
              },
            },
            {
              depth: 3,
              itemStyle: {
                color: "#D6AB1E",
              },
            },
          ],
        },
      ],
    }

    chartInstance.current.setOption(option, true)

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [data])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">Error loading data</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Revenue Breakdown - {query}</h2>
        <p className="text-gray-600">Financial flow visualization</p>
      </div>
      <div
        ref={chartRef}
        className="w-full h-[800px] border border-gray-200 rounded-lg bg-white"
        style={{ minHeight: "800px", width: "100%" }}
      />
    </div>
  )
}
