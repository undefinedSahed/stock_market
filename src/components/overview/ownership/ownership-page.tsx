// OwnershipPage.tsx
"use client";

import React from "react";
import RecentNews from "../news";
import StockOwnershipOverview from "./stock-ownership-overview";
import RecentInsiderTradingTable from "./recent-insider-table";
import HedgeFundTable from "./recent-hedge-fund-table";
import TopCatDataTable from "./top-category-table";
import OverviewFAQ from "../overview-faq";
import StockPremiumBanner from "@/components/Portfolio/chart/chart-bottom";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import { Loader2 } from "lucide-react";

export default function OwnershipPage() {
  const axiosInstance = useAxios();
  const params = useParams();
  const stockName = params.stockName;

  const { data: ownershipData, isLoading } = useQuery({
    queryKey: ["ownership-data", stockName],
    queryFn: async () => {
      const res = await axiosInstance(`/stocks/ownership/${stockName}`);
      return res.data;
    },
    enabled: !!stockName,
  });

  if (isLoading)
    return (
      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col lg:w-[80vw] w-[98vw]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-5">
        <div className="col-span-full lg:col-span-5">
          <StockOwnershipOverview ownerOverview={ownershipData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 lg:mt-20">
            <RecentInsiderTradingTable ownershipData={ownershipData} />
            <HedgeFundTable ownershipData={ownershipData} />
          </div>

          {/* Share Holders Table */}
          <div className="mt-8 lg:mt-20">
            <TopCatDataTable
              title="Top Share Holders"
              data={ownershipData?.topShareHolders || []}
              initialRowsToShow={8}
              showMore={true}
            />
          </div>

          {/* Mutual Fund Holders Table */}
          <div className="mt-8 lg:mt-20">
            <TopCatDataTable
              title="Top Mutual Fund Holders"
              data={ownershipData?.topMutualFundHolders || []}
              initialRowsToShow={8}
              showMore={true}
            />
          </div>

          {/* ETF Holders Table */}
          <div className="mt-8 lg:mt-20">
            <TopCatDataTable
              title="Top ETF Holders"
              data={ownershipData?.topETFHolders || []}
              initialRowsToShow={8}
              showMore={true}
            />
          </div>

          <div className="mt-8 lg:mt-20">
            <OverviewFAQ />
          </div>

          <div className="mt-8 lg:mt-20">
            <StockPremiumBanner />
          </div>
        </div>

        <div className="col-span-full lg:col-span-2">
          <RecentNews />
        </div>
      </div>
    </div>
  );
}
