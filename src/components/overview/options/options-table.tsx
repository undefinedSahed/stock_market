"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import useAxios from "@/hooks/useAxios";

// Types for API response and options data
type OptionData = {
  strike: number;
  last_price: number;
  change_percent: number;
  volume: number;
  oi: number | null;
  last_trade: string;
  delta?: number; // Optional since not provided in API
};

type ApiOptionData = {
  lastPrice: string;
  percentChange: string;
  volume: number;
  openInterest: number;
  lastTrade: string;
  strike: number;
};

type ApiData = {
  expirationDate: string;
  calls: ApiOptionData[];
  puts: ApiOptionData[]; // Added puts property
};

type ApiResponse = {
  symbol: string;
  expirations: string[];
  data: ApiData[];
};

export default function OptionsChainTable() {
  // State for filters and view options
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [strikesFilter, setStrikesFilter] = useState<string>("5 Strikes +/-");
  const [tableView, setTableView] = useState<string>("Side by Side");

  // API call
  const axiosInstance = useAxios();
  const params = useParams();
  const stockName = params.stockName as string;

  const { data: apiResponse, isLoading } = useQuery<ApiResponse>({
    queryKey: ["option-data", stockName],
    queryFn: async () => {
      const res = await axiosInstance(`/stocks/options/${stockName}`);
      return res.data;
    },
    enabled: !!stockName,
  });

  // Process API data into OptionsChainData format
  const optionsData = useMemo(() => {
    if (!apiResponse || !apiResponse.data) {
      return { call_data: [], put_data: [] };
    }

    // Set initial expiration date if not already set
    if (!expirationDate && apiResponse.expirations.length > 0) {
      setExpirationDate(apiResponse.expirations[0]);
    }

    // Find data for the selected expiration date
    const selectedData = apiResponse.data.find(
      (d) => d.expirationDate === expirationDate
    );

    if (!selectedData) {
      return { call_data: [], put_data: [] };
    }

    // Map API calls to OptionData format
    const call_data: OptionData[] = selectedData.calls.map((call) => ({
      strike: call.strike,
      last_price: parseFloat(call.lastPrice.replace("$", "")),
      change_percent: parseFloat(call.percentChange.replace("%", "")),
      volume: call.volume,
      oi: call.openInterest,
      last_trade: call.lastTrade,
      delta: 0, // Default delta since not provided
    }));

    // API doesn't provide put data, so return empty array
    const put_data: OptionData[] = selectedData.puts.map((call) => ({
      strike: call.strike,
      last_price: parseFloat(call.lastPrice.replace("$", "")),
      change_percent: parseFloat(call.percentChange.replace("%", "")),
      volume: call.volume,
      oi: call.openInterest,
      last_trade: call.lastTrade,
      delta: 0, // Default delta since not provided
    }));

    return { call_data, put_data };
  }, [apiResponse, expirationDate]);

  // Filter strikes based on the selected filter
  const filteredData = useMemo(() => {
    const centerIndex = Math.floor(optionsData.call_data.length / 2);
    const centerStrike = optionsData.call_data[centerIndex]?.strike || 0;

    let numStrikes = 5;
    if (strikesFilter === "3 Strikes +/-") numStrikes = 3;
    else if (strikesFilter === "10 Strikes +/-") numStrikes = 10;
    else if (strikesFilter === "All Strikes") return optionsData;

    return {
      call_data: optionsData.call_data.filter(
        (item) => Math.abs(item.strike - centerStrike) <= numStrikes
      ),
      put_data: optionsData.put_data.filter(
        (item) => Math.abs(item.strike - centerStrike) <= numStrikes
      ),
    };
  }, [optionsData, strikesFilter]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const [date, time] = dateStr.split(", ");
    const [month, day] = date.split("/");
    return `${month}/${day}, ${time}`;
  };

  if (isLoading)
    return (
      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
      </div>
    );

  return (
    <div className="w-full border border-gray-200 rounded-md overflow-hidden">
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between p-4 gap-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Expiration Date</span>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <Select value={expirationDate} onValueChange={setExpirationDate}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select expiration" />
            </SelectTrigger>
            <SelectContent>
              {apiResponse?.expirations.map((exp) => (
                <SelectItem key={exp} value={exp}>
                  {exp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Strikes</span>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <Select value={strikesFilter} onValueChange={setStrikesFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select strikes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3 Strikes +/-">3 Strikes +/-</SelectItem>
              <SelectItem value="5 Strikes +/-">5 Strikes +/-</SelectItem>
              <SelectItem value="10 Strikes +/-">10 Strikes +/-</SelectItem>
              <SelectItem value="All Strikes">All Strikes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Table View</span>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <Select value={tableView} onValueChange={setTableView}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Side by Side">Side by Side</SelectItem>
              <SelectItem value="Stacked">Stacked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* In the Money indicator */}
      <div className="flex justify-end p-2">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
          In the Money
        </div>
      </div>

      {/* Options Chain Table */}
      {tableView === "Side by Side" ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th colSpan={5} className="text-center py-3 font-semibold">
                  {apiResponse?.symbol || "Stock"} Option Calls
                </th>
                <th colSpan={1} className="text-center py-3 font-semibold">
                  {expirationDate}
                </th>
                <th colSpan={5} className="text-center py-3 font-semibold">
                  {apiResponse?.symbol || "Stock"} Option Puts
                </th>
              </tr>
              <tr className="border-b border-gray-200 text-sm">
                <th className="py-2 px-3 text-left font-medium">Last Price</th>
                <th className="py-2 px-3 text-left font-medium">%Change</th>
                <th className="py-2 px-3 text-left font-medium">Volume</th>
                <th className="py-2 px-3 text-left font-medium">OI</th>
                <th className="py-2 px-3 text-left font-medium">Last Trade</th>
                <th className="py-2 px-3 text-center font-medium bg-gray-100">
                  Strike
                </th>
                <th className="py-2 px-3 text-left font-medium">Last Price</th>
                <th className="py-2 px-3 text-left font-medium">%Change</th>
                <th className="py-2 px-3 text-left font-medium">Volume</th>
                <th className="py-2 px-3 text-left font-medium">OI</th>
                <th className="py-2 px-3 text-left font-medium">Last Trade</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.call_data.map((call, index) => {
                const put = filteredData.put_data[index] || {
                  last_price: 0,
                  change_percent: 0,
                  volume: 0,
                  oi: null,
                  last_trade: "",
                  delta: 0,
                  strike: call.strike,
                };
                const isEvenRow = index % 2 === 0;

                return (
                  <tr
                    key={index}
                    className={cn(
                      "border-b border-gray-200",
                      isEvenRow ? "bg-gray-50" : "bg-white"
                    )}
                  >
                    {/* Call data */}
                    <td className="py-3 px-3 text-sm">
                      ${call.last_price.toFixed(2)}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-3 text-sm",
                        call.change_percent > 0
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {/* {call.change_percent >  reik0 ? "+" : ""} */}
                      {call.change_percent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {call.volume.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {call.oi?.toLocaleString() || "-"}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {formatDate(call.last_trade)}
                    </td>

                    {/* Strike price */}
                    <td className="py-3 px-3 text-sm font-medium text-center bg-gray-100">
                      {call.strike.toFixed(1)}
                    </td>

                    {/* Put data */}
                    <td className="py-3 px-3 text-sm">
                      {put.last_price ? `$${put.last_price.toFixed(2)}` : "-"}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-3 text-sm",
                        put.change_percent > 0
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {put.change_percent
                        ? (put.change_percent > 0 ? "+" : "") +
                          put.change_percent.toFixed(2) +
                          "%"
                        : "-"}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {put.volume ? put.volume.toLocaleString() : "-"}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {put.oi?.toLocaleString() || "-"}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {put.last_trade ? formatDate(put.last_trade) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // Stacked view
        <div className="overflow-x-auto">
          {/* Calls Table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th colSpan={6} className="text-center py-3 font-semibold">
                  {apiResponse?.symbol || "Stock"} Option Calls -{" "}
                  {expirationDate}
                </th>
              </tr>
              <tr className="border-b border-gray-200 text-sm">
                <th className="py-2 px-3 text-center font-medium bg-gray-100">
                  Strike
                </th>
                <th className="py-2 px-3 text-left font-medium">Strike Δ</th>
                <th className="py-2 px-3 text-left font-medium">Last Price</th>
                <th className="py-2 px-3 text-left font-medium">%Change</th>
                <th className="py-2 px-3 text-left font-medium">Volume</th>
                <th className="py-2 px-3 text-left font-medium">OI</th>
                <th className="py-2 px-3 text-left font-medium">Last Trade</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.call_data.map((call, index) => (
                <tr
                  key={`call-${index}`}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="py-3 px-3 text-sm font-medium text-center bg-gray-100">
                    {call.strike.toFixed(1)}
                  </td>
                  <td className="py-3 px-3 text-sm">
                    {call.delta?.toFixed(2) || "-"}
                  </td>
                  <td className="py-3 px-3 text-sm">
                    ${call.last_price.toFixed(2)}
                  </td>
                  <td
                    className={cn(
                      "py-3 px-3 text-sm",
                      call.change_percent > 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {call.change_percent > 0 ? "+" : ""}
                    {call.change_percent.toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 text-sm">
                    {call.volume.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-sm">
                    {call.oi?.toLocaleString() || "-"}
                  </td>
                  <td className="py-3 px-3 text-sm">
                    {formatDate(call.last_trade)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Puts Table (only shown if put_data exists) */}
          {filteredData.put_data.length > 0 && (
            <table className="w-full border-collapse mt-6">
              <thead>
                <tr className="border-b border-gray-200">
                  <th colSpan={6} className="text-center py-3 font-semibold">
                    {apiResponse?.symbol || "Stock"} Option Puts -{" "}
                    {expirationDate}
                  </th>
                </tr>
                <tr className="border-b border-gray-200 text-sm">
                  <th className="py-2 px-3 text-center font-medium bg-gray-100">
                    Strike
                  </th>
                  <th className="py-2 px-3 text-left font-medium">Strike Δ</th>
                  <th className="py-2 px-3 text-left font-medium">
                    Last Price
                  </th>
                  <th className="py-2 px-3 text-left font-medium">%Change</th>
                  <th className="py-2 px-3 text-left font-medium">Volume</th>
                  <th className="py-2 px-3 text-left font-medium">OI</th>
                  <th className="py-2 px-3 text-left font-medium">
                    Last Trade
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.put_data.map((put, index) => (
                  <tr
                    key={`put-${index}`}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="py-3 px-3 text-sm font-medium text-center bg-gray-100">
                      {put.strike.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {put.delta?.toFixed(2) || "-"}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      ${put.last_price.toFixed(2)}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-3 text-sm",
                        put.change_percent > 0
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {put.change_percent > 0 ? "+" : ""}
                      {put.change_percent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {put.volume.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {put.oi?.toLocaleString() || "-"}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {formatDate(put.last_trade)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
