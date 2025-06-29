"use client";

import type React from "react";

import Image from "next/image";
import { useSocketContext } from "@/providers/SocketProvider";

export default function StockSearchSection() {
  const { notifications } = useSocketContext();

  return (
    <section className="w-full bg-[#f0f7f0] py-16">
      <div className="container mx-auto px-4">

        {/* Stock Grid */}
        <div className="mb-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {notifications?.map((stock, index) => (
              <div
                key={`stock-top-${index}`}
                className="flex items-center justify-between rounded-full bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full">
                    {stock?.logo && (
                      <Image
                        src={stock.logo}
                        alt="Company Logo"
                        width={38}
                        height={47}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-blue-500">
                      {stock.symbol}
                    </div>
                    <div className="text-sm font-medium">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {parseFloat(stock.currentPrice)?.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      parseFloat(stock.change) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {parseFloat(stock.change)?.toFixed(2)} (
                    {parseFloat(stock.percent)?.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Title Section */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-black md:text-4xl lg:text-5xl">
            Make Informed, Data-Driven Investments
          </h2>
          <p className="mt-4 text-lg text-gray-800">
            We empower everyone with access to institutional-grade research
            tools and data.
          </p>
        </div>
      </div>
    </section>
  );
}
