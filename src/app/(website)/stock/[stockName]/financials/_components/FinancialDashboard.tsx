"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import FilterButtons from "./FilterButtons";
import FinancialChart from "./chart/FinancialChart";
import { AxiosInstance } from "axios"; // Import AxiosInstance type
import useAxios from "@/hooks/useAxios";

// --- Type Definitions for API Response ---
interface FinancialDataApiResponse {
  symbol: string;
  dates: string[];
  incomeStatement: Record<string, number[]>; // Values are numbers from API
  balanceSheet: Record<string, number[]>; // Values are numbers from API
  cashFlow: Record<string, number[]>; // Values are numbers from API
}

// --- Type Definitions for Chart Data ---
interface FinancialChartDataPoint {
  year: string;
  // Earnings Chart specific keys
  revenue: number;
  earnings: number;
  profitMargin: number;
  // Debt Chart specific keys
  assets: number;
  liabilities: number;
  debtRatio: number;
  [key: string]: string | number;
}

export default function FinancialDashboard() {
  const [filter, setFilter] = useState<"annual" | "ttm" | "quarterly">(
    "annual"
  );
  const axiosInstance = useAxios() as AxiosInstance; // Cast to AxiosInstance
  const params = useParams();

  const stockName = params.stockName as string;

  // --- API Data Fetching ---
  const {
    data: financialData,
    isLoading,
    isError,
    error,
  } = useQuery<FinancialDataApiResponse, Error>({
    queryKey: ["financial-overview", stockName],
    queryFn: async () => {
      const res = await axiosInstance.get<FinancialDataApiResponse>(
        `/stocks/financial-overview/${stockName.toUpperCase()}`
      );
      return res.data;
    },
    enabled: !!stockName,
  });

  // --- Helper to format numbers for chart display (optional, can be done in chart too) ---
  const formatChartValue = (value: number | undefined): number => {
    return value !== undefined ? value / 1_000_000_000 : 0; // Convert to Billions for display in chart
  };

  // --- Data Transformation for Charts ---
  const { earningsChartData, debtChartData } = useMemo(() => {
    if (!financialData) {
      return { earningsChartData: [], debtChartData: [] };
    }

    const { dates, incomeStatement, balanceSheet } = financialData;

    // Determine the slice of data based on the filter
    let sliceLength = dates.length; // Default to all available dates

    if (filter === "ttm" || filter === "quarterly") {
      // For TTM/Quarterly, let's take the most recent 4 periods as an approximation
      // Adjust this logic if your API provides true TTM/quarterly data
      sliceLength = Math.min(4, dates.length); // Get up to last 4 periods
    }

    const slicedDates = dates.slice(0, sliceLength);

    const earningsData: FinancialChartDataPoint[] = slicedDates
      .map((date, index) => {
        const netSales = incomeStatement["Net sales"]?.[index] ?? 0;
        const netIncome = incomeStatement["Net income"]?.[index] ?? 0;
        const profitMargin =
          netIncome !== undefined && netSales !== undefined && netSales !== 0
            ? (netIncome / netSales) * 100
            : 0;

        // Provide default values for debt-related fields
        return {
          year: date ?? "",
          revenue: formatChartValue(netSales), // Convert to Billions
          earnings: formatChartValue(netIncome), // Convert to Billions
          profitMargin: profitMargin,
          assets: 0,
          liabilities: 0,
          debtRatio: 0,
        };
      })
      .reverse(); // Reverse to show oldest to newest on chart

    const debtData: FinancialChartDataPoint[] = slicedDates
      .map((date, index) => {
        const totalAssets = balanceSheet["Total assets"]?.[index] ?? 0;
        const totalLiabilities =
          balanceSheet["Total liabilities"]?.[index] ?? 0;
        const debtRatio =
          totalLiabilities !== undefined &&
          totalAssets !== undefined &&
          totalAssets !== 0
            ? (totalLiabilities / totalAssets) * 100
            : 0;

        return {
          year: date ?? "",
          revenue: 0,
          earnings: 0,
          profitMargin: 0,
          assets: formatChartValue(totalAssets), // Convert to Billions
          liabilities: formatChartValue(totalLiabilities), // Convert to Billions
          debtRatio: debtRatio,
        };
      })
      .reverse(); // Reverse to show oldest to newest on chart

    return { earningsChartData: earningsData, debtChartData: debtData };
  }, [financialData, filter]); // Re-run memoization when financialData or filter changes

  // --- Loading and Error States ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg m-4 animate-fadeIn">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
        <p className="ml-5 text-lg font-medium text-gray-700">
          Loading financial chart data...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-700 bg-red-50 border border-red-300 rounded-xl mx-4 my-8 animate-fadeIn">
        <p className="font-bold text-xl mb-2">
          Oops! Error Fetching Chart Data
        </p>
        <p className="text-lg">
          {error?.message || "An unexpected error occurred."}
        </p>
        <p className="mt-4 text-sm text-red-600">
          Please verify the stock symbol or try again later.
        </p>
      </div>
    );
  }

  // Handle case where financialData might be null even after isLoading/isError checks
  if (!financialData) {
    return (
      <div className="text-center py-10 text-gray-700 bg-gray-50 border border-gray-300 rounded-xl mx-4 my-8 animate-fadeIn">
        <p className="font-bold text-xl mb-2">No Financial Data Available</p>
        <p className="text-lg">
          No financial data found to display charts for{" "}
          {stockName ? stockName.toUpperCase() : "the selected stock"}.
        </p>
        <p className="mt-4 text-sm text-gray-600">
          Please check the stock symbol or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-16 px-4">
      <FilterButtons activeFilter={filter} setFilter={setFilter} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {financialData.symbol} Earnings and Revenue History
            </h2>
            <div className="flex justify-between mb-2 items-center">
              <div className="text-sm font-medium text-gray-600">
                Revenue (B) & Earnings (B)
              </div>
              <div className="text-sm font-medium text-gray-600">
                Profit Margin (%)
              </div>
            </div>
            {earningsChartData.length > 0 ? (
              <FinancialChart
                data={earningsChartData}
                barKey1="revenue"
                barKey2="earnings"
                lineKey="profitMargin"
                barColor1="#22c55e" // Green
                barColor2="#9ca3af" // Gray for earnings (less prominent)
                lineColor="#ef4444" // Red for profit margin line
                yAxisLabel="B"
                percentageAxis={true}
                legend={[
                  { key: "revenue", label: "Revenue", color: "#22c55e" },
                  { key: "earnings", label: "Earnings", color: "#9ca3af" },
                  {
                    key: "profitMargin",
                    label: "Profit Margin",
                    color: "#ef4444",
                  },
                ]}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                No earnings data available for charts.
              </div>
            )}
            <div className="flex justify-end mt-4">
              <a
                href="#"
                className="text-blue-600 text-sm flex items-center hover:underline"
              >
                <div className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Debt Chart */}
        <div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {financialData.symbol} Debt and Asset Overview
            </h2>
            <div className="flex justify-between mb-2 items-center">
              <div className="text-sm font-medium text-gray-600">
                Assets (B) & Liabilities (B)
              </div>
              <div className="text-sm font-medium text-gray-600">
                Debt to Assets (%)
              </div>
            </div>
            {debtChartData.length > 0 ? (
              <FinancialChart
                data={debtChartData}
                barKey1="assets"
                barKey2="liabilities"
                lineKey="debtRatio"
                barColor1="#3b82f6" // Blue
                barColor2="#93c5fd" // Lighter Blue for liabilities
                lineColor="#ef4444" // Red for debt ratio
                yAxisLabel="B"
                percentageAxis={true}
                legend={[
                  { key: "assets", label: "Assets", color: "#3b82f6" },
                  {
                    key: "liabilities",
                    label: "Liabilities",
                    color: "#93c5fd",
                  },
                  {
                    key: "debtRatio",
                    label: "Debt to Assets",
                    color: "#ef4444",
                  },
                ]}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                No debt data available for charts.
              </div>
            )}
            <div className="flex justify-end mt-4">
              <a
                href="#"
                className="text-blue-600 text-sm flex items-center hover:underline"
              >
                <div className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
