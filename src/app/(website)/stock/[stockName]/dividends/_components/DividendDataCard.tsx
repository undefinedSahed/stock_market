"use client";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DividendDataCard() {
  const axiosInstence = useAxios();
  const params = useParams();

  const stockName = params.stockName as string;

  const { data: cardData, isLoading } = useQuery({
    queryKey: ["devident-card-data"],
    queryFn: async () => {
      const res = await axiosInstence(
        `/portfolio/dividends/${stockName.toUpperCase()}`
      );
      return res.data;
    },
  });

  const cardData2 = cardData?.rawDividends?.length;
  const cardData3 = cardData?.rawDividends[cardData2 - 1];

  if (isLoading)
    return (
      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
      </div>
    );

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Dividend Data</h2>
      <div className="shadow-[0px_0px_8px_0px_#00000029] overflow-hidden py-4">
        <div className="grid grid-cols-1 md:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Last Ex-Dividend Date */}
          <div className="p-4">
            <p className="text-sm text-gray-600 font-medium">
              Last Ex-Dividend Date
            </p>
            <p className="text-base font-semibold mt-2">{cardData3?.date}</p>
            <div className="mt-3">
              <p className="text-xs text-gray-500">Payment Date</p>
              <p className="text-xs text-gray-700">{cardData3?.payDate}</p>
            </div>
          </div>

          {/* Dividend Amount */}
          <div className="p-4">
            <p className="text-sm text-gray-600 font-medium">
              Dividend Amount Per Share
            </p>
            <p className="text-base font-semibold mt-2">{cardData3?.amount}</p>
            <div className="mt-3">
              <p className="text-xs text-gray-700">Quarterly</p>
            </div>
          </div>

          {/* Dividend Yield */}
          <div className="p-4">
            <p className="text-sm text-gray-600 font-medium">Dividend Yield</p>
            <p className="text-base font-semibold mt-2">
              {cardData?.dividendYield}
            </p>
            <div className="mt-3">
              <p className="text-xs text-gray-500">Sector: Technology</p>
              <p className="text-xs text-gray-500">Sector Average: 0.71%</p>
            </div>
          </div>

          {/* Payout Ratio */}
          <div className="p-4">
            <p className="text-sm text-gray-600 font-medium">Payout Ratio</p>
            <p className="text-base font-semibold mt-2">
              {cardData?.payoutRatio}
            </p>
          </div>

          {/* Dividend Growth */}
          <div className="p-4">
            <p className="text-sm text-gray-600 font-medium">Dividend Growth</p>
            <p className="text-base font-semibold mt-2">
              {cardData?.dividendGrowth}
            </p>
            <div className="mt-3">
              <p className="text-xs text-gray-500">Since 2012</p>
            </div>
          </div>

          {/* Analyst Consensus */}
          <div className="p-4">
            <p className="text-sm text-gray-600 font-medium">
              <span className="text-blue-500">Analyst Consensus</span>
              <span className="text-gray-600">›</span>
            </p>
            <p className="text-base font-semibold mt-2 text-green-500">
              Moderate Buy
            </p>
            <div className="mt-3">
              <p className="text-xs text-gray-500">Last 3 Months</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Link */}
      <div className="border-t border-gray-200 p-3 text-right">
        <Link
          href="/dividend-calculator"
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          Open AAPL in Dividend Calculator ›
        </Link>
      </div>
    </div>
  );
}
