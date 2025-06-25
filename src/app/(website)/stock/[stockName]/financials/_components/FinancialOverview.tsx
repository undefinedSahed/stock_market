"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios"; // Assuming this hook returns an AxiosInstance

// --- Type Definitions ---

interface FinancialData {
  symbol: string;
  dates: string[];
  incomeStatement?: Record<string, (number | string)[]>;
  balanceSheet?: Record<string, (number | string)[]>;
  cashFlow?: Record<string, (number | string)[]>;
}

interface TableRow {
  metric: string;
  values: string[]; // Formatted values will be strings (e.g., "$1.23B", "N/A")
}

interface FinancialTableProps {
  title: string;
  dataRows: TableRow[];
  dates: string[];
  initialRowsToShow?: number;
  metricTextLength?: number;
}

// --- Main Component ---

export default function FinancialOverview() {
  const [activeTab, setActiveTab] = useState("Overview");
  const axiosInstance = useAxios();
  const params = useParams();

  const stockName = params.stockName as string;

  const {
    data: financialData,
    isLoading,
    isError,
    error,
  } = useQuery<FinancialData, Error>({
    // Specify types for data and error
    queryKey: ["financial-overview", stockName],
    queryFn: async () => {
      const res = await axiosInstance.get<FinancialData>(
        `/stocks/financial-overview/${stockName.toUpperCase()}`
      );
      return res.data;
    },
    enabled: !!stockName,
  });

  // Tabs configuration
  const tabs = [
    "Overview",
    "Income Statement",
    "Balance Sheet",
    "Cash Flow",
    "Ratios",
  ];

  // Helper function to format large numbers to Billions, Millions, or Thousands
  const formatValue = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null || value === "") return "N/A";
    if (typeof value === "number") {
      const absValue = Math.abs(value);
      if (absValue >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
      }
      if (absValue >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
      }
      if (absValue >= 1_000) {
        return `$${(value / 1_000).toFixed(2)}K`;
      }
      return `$${value.toFixed(2)}`;
    }
    return String(value); // Ensure it's always a string for display
  };

  // Helper function to truncate long text with a tooltip
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return <span title={text}>{text.substring(0, maxLength)}...</span>;
    }
    return text;
  };

  // Helper function to prepare table rows dynamically, filtering out specific metrics
  const getTableRows = (
    dataObject: Record<string, (number | string)[] | undefined> | undefined
  ): TableRow[] => {
    if (!dataObject) return [];
    const metrics = Object.keys(dataObject);

    // Refined filter keywords: Focus on filtering out very specific, often redundant
    // or highly detailed accounting line items not typically needed in a high-level overview.
    const filterKeywords = [
      "in dollars per share", // Handled separately for EPS
      "in shares", // Share counts, not core financials
      "Common stock, shares", // Specific common stock share details
      "Total comprehensive income", // Often derived, can clutter
      "Comprehensive income (loss)", // Derived
      "Change in foreign currency translation", // Detailed OCI item
      "Change in fair value of derivative instruments", // Detailed OCI item
      "Adjustment for net (gains)/losses realized and included in net income", // Detailed OCI item
      "Total change in unrealized gains/losses on derivative instruments", // Detailed OCI item
      "Change in fair value of marketable debt securities", // Detailed OCI item
      "Total change in unrealized gains/losses on marketable debt securities", // Detailed OCI item
      "Total other comprehensive income/(loss)", // Aggregated OCI
      "Deferred income tax expense/(benefit)", // Tax detail
      "Accumulated amortization", // Often part of PPE net
      "Accumulated depreciation, depletion and amortization", // Part of PPE net
      "Noncontrolling interests", // Minority interests
      "Treasury stock", // Part of equity, often combined
      "Accumulated deficit", // Sometimes redundant with Retained Earnings
      "Accumulated other comprehensive loss", // Detailed OCI
      "Common stock and additional paid-in capital", // Detailed equity line
      "Retained earnings/(Accumulated deficit)", // Redundant with Retained Earnings
      "Increase/(Decrease) in cash, cash equivalents and restricted cash", // Often aggregated at the end
      "Increase/(Decrease) in cash, cash equivalents, and restricted cash and cash equivalents", // Aggregated cash flow
      "Deferred revenue", // Keeping it for now but could be filtered if too detailed
      "Cash paid for income taxes, net", // Detail of tax payment
      "Cash paid for interest", // Detail of interest payment
      "Payments made in connection with business acquisitions, net", // Investing cash flow detail
      "Decrease in cash, cash equivalents and restricted cash", // More specific cash flow change
      "Deferred income tax benefit", // Tax detail
      "Purchases of non-marketable securities", // Investing detail
      "Proceeds from non-marketable securities", // Investing detail
      "Proceeds from issuance of common stock", // Financing detail
      "Repayments of commercial paper, net", // Financing detail
    ];

    const filteredMetrics = metrics.filter(
      (metric) => !filterKeywords.some((keyword) => metric.includes(keyword))
    );

    // Prioritize key metrics for ordering, then sort alphabetically
    const orderPriority = [
      "Net sales",
      "Cost of sales",
      "Gross margin",
      "Operating income",
      "Net income", // Income Statement
      "Cash and cash equivalents",
      "Total current assets",
      "Total assets",
      "Total current liabilities",
      "Total liabilities",
      "Total shareholders’ equity",
      "Total liabilities and shareholders’ equity", // Balance Sheet
      "Net income",
      "Cash generated by operating activities",
      "Cash generated by/(used in) investing activities",
      "Cash used in financing activities", // Cash Flow
    ];

    filteredMetrics.sort((a, b) => {
      const indexA = orderPriority.indexOf(a);
      const indexB = orderPriority.indexOf(b);

      if (indexA === -1 && indexB === -1) {
        return a.localeCompare(b); // Alphabetical if neither in priority list
      }
      if (indexA === -1) return 1; // 'a' not in priority, 'b' is, so 'b' comes first
      if (indexB === -1) return -1; // 'b' not in priority, 'a' is, so 'a' comes first
      return indexA - indexB; // Sort by priority index
    });

    return filteredMetrics.map((metric) => ({
      metric: metric,
      values: (dataObject[metric] || []).map(formatValue),
    }));
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg m-4 animate-fadeIn">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
        <p className="ml-5 text-lg font-medium text-gray-700">
          Loading comprehensive financial data...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-700 bg-red-50 border border-red-300 rounded-xl mx-4 my-8 animate-fadeIn">
        <p className="font-bold text-xl mb-2">Oops! Error Fetching Data</p>
        <p className="text-lg">
          {error?.message || "An unexpected error occurred."}
        </p>
        <p className="mt-4 text-sm text-red-600">
          Please verify the stock symbol or try again later.
        </p>
      </div>
    );
  }

  // Ensure financialData is available before proceeding
  if (!financialData) {
    return (
      <div className="text-center py-10 text-gray-700 bg-gray-50 border border-gray-300 rounded-xl mx-4 my-8 animate-fadeIn">
        <p className="font-bold text-xl mb-2">No Financial Data Available</p>
        <p className="text-lg">
          We couldn&apos;t find detailed financial information for{" "}
          {stockName ? stockName.toUpperCase() : "this stock"}.
        </p>
        <p className="mt-4 text-sm text-gray-600">
          Please check the stock symbol or select another.
        </p>
      </div>
    );
  }

  // Safely access data properties after checking for financialData existence
  const incomeStatementRows = getTableRows(financialData.incomeStatement);
  const balanceSheetRows = getTableRows(financialData.balanceSheet);
  const cashFlowRows = getTableRows(financialData.cashFlow);

  const basicEpsData =
    financialData.incomeStatement?.["Basic (in dollars per share)"];
  const latestBasicEps =
    basicEpsData && basicEpsData.length > 0
      ? formatValue(basicEpsData[0])
      : "N/A";

  // FinancialTable Component - Modified to include show more/less logic and truncation
  const FinancialTable = ({
    title,
    dataRows,
    dates,
    initialRowsToShow = 8,
    metricTextLength = 25,
  }: FinancialTableProps) => {
    const [showAll, setShowAll] = useState(false); // State to control showing all rows

    const displayedRows = showAll
      ? dataRows
      : dataRows.slice(0, initialRowsToShow);
    const hasMoreRows = dataRows.length > initialRowsToShow;

    return (
      <div className="mb-8 last:mb-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white font-bold text-xl md:text-2xl sticky top-0 z-10">
          {title}
        </div>
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r border-gray-100">
                  Metric
                </th>
                {dates.map((date) => (
                  <th
                    key={date}
                    className="px-6 py-3 text-right text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {displayedRows.length > 0 ? (
                displayedRows.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-green-50 transition-colors duration-150 ease-in-out"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base font-medium text-gray-900 sticky left-0 bg-white z-20 border-r border-gray-100">
                      {truncateText(item.metric, metricTextLength)}
                    </td>
                    {item.values.map((value, idx) => (
                      <td
                        key={idx}
                        className="px-6 py-4 whitespace-nowrap text-sm md:text-base text-gray-800 text-right"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={dates.length + 1}
                    className="px-6 py-8 text-center text-gray-600 text-lg"
                  >
                    No data available for this section after filtering.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {hasMoreRows && (
          <div className="flex justify-center p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center px-6 py-2 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
            >
              {showAll ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 15l7-7 7 7"
                    ></path>
                  </svg>
                  Show Less
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                  Show More ({dataRows.length - initialRowsToShow} more)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 p-5 border-b border-gray-200 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-5 py-2.5 text-base font-semibold rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-green-500 to-green-700 text-white"
                  : "bg-white text-gray-800 border border-gray-300 hover:border-green-400 hover:text-green-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Company Info */}
        <div className="p-6 md:p-8 bg-white border-b border-gray-200">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            <span className="text-green-600">{financialData.symbol}</span>{" "}
            Financial Overview
          </h2>
          <p className="text-md md:text-lg text-gray-700 leading-relaxed max-w-3xl">
            A comprehensive look into the financial health and performance of **
            {financialData.symbol.toUpperCase()}**. The latest Basic Earnings
            Per Share (EPS) is reported as **{latestBasicEps}**.
            <span className="block mt-3 text-sm text-gray-600 italic">
              (Note: Key ratios like P/E, P/B, and Dividend Yield are typically
              derived from market data combined with financial statements and
              are not directly available in this dataset. They would require
              additional data sources.)
            </span>
          </p>
        </div>

        {/* Dynamic Table Content based on activeTab */}
        <div className="p-6 md:p-8">
          {activeTab === "Overview" && (
            <>
              <FinancialTable
                title="Income Statement"
                dataRows={incomeStatementRows}
                dates={financialData.dates}
                initialRowsToShow={8}
                metricTextLength={25}
              />
              <FinancialTable
                title="Balance Sheet"
                dataRows={balanceSheetRows}
                dates={financialData.dates}
                initialRowsToShow={8}
                metricTextLength={25}
              />
              <FinancialTable
                title="Cash Flow"
                dataRows={cashFlowRows}
                dates={financialData.dates}
                initialRowsToShow={8}
                metricTextLength={25}
              />
            </>
          )}

          {activeTab === "Income Statement" && (
            <FinancialTable
              title="Income Statement"
              dataRows={incomeStatementRows}
              dates={financialData.dates}
              initialRowsToShow={20}
              metricTextLength={30}
            />
          )}

          {activeTab === "Balance Sheet" && (
            <FinancialTable
              title="Balance Sheet"
              dataRows={balanceSheetRows}
              dates={financialData.dates}
              initialRowsToShow={20}
              metricTextLength={30}
            />
          )}

          {activeTab === "Cash Flow" && (
            <FinancialTable
              title="Cash Flow"
              dataRows={cashFlowRows}
              dates={financialData.dates}
              initialRowsToShow={20}
              metricTextLength={30}
            />
          )}

          {activeTab === "Ratios" && (
            <div className="p-6 md:p-8 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-5 border-b pb-3 border-gray-200">
                Key Financial Ratios
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-800">
                <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                  <p className="font-semibold text-green-800 text-lg mb-1">
                    Basic EPS:
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {latestBasicEps}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <p className="font-semibold text-gray-700 text-lg mb-1">
                    P/E Ratio:
                  </p>
                  <p className="text-2xl font-bold text-gray-800">N/A</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <p className="font-semibold text-gray-700 text-lg mb-1">
                    P/B Ratio:
                  </p>
                  <p className="text-2xl font-bold text-gray-800">N/A</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <p className="font-semibold text-gray-700 text-lg mb-1">
                    Dividend Yield:
                  </p>
                  <p className="text-2xl font-bold text-gray-800">N/A</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-6 leading-relaxed">
                These indicative ratios are essential for a quick assessment of
                a company&apos;s financial performance and valuation relative to its
                peers. Please note that a full analysis would involve comparing
                these figures against industry benchmarks and historical trends.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
