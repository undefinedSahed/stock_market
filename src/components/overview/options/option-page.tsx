"use client";
import React from "react";
import OptionsChainTable from "./options-table";
import RecentNews from "../news";
import OverviewFAQ from "../overview-faq";
import StockPremiumBanner from "@/components/Portfolio/chart/chart-bottom";

export default function OptionsTablePage() {

  return (
    <div className="flex min-h-screen flex-col lg:p-4 md:p-6 lg:w-[80vw] w-[98vw]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-5">
        <div className="col-span-full lg:col-span-5">
          <OptionsChainTable />
          {/* <OptionsNews /> */}
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
