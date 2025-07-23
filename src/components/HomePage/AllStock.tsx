"use client";
import Image from "next/image";
import Link from "next/link";
import { useUserPayment } from "../context/paymentContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogHeader } from "../ui/dialog";
import { Unlock } from "lucide-react";
import { Button } from "../ui/button";
import { useLanguage } from "@/providers/LanguageProvider";

interface TrendingStock {
  symbol: string;
  currentPrice: number;
  priceChange: number | null;
  percentChange: number | null;
  buy: number;
  hold: number;
  sell: number;
  targetMean: number | null;
  upsidePercent: string | null;
}

interface StockTrackingTableProps {
  trendingStocks: TrendingStock[];
}

export default function StockTrackingTable({
  trendingStocks,
}: StockTrackingTableProps) {
  const { paymentType } = useUserPayment();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { dictionary } = useLanguage();

  if (!trendingStocks || trendingStocks.length === 0) {
    return (
      <div className="mt-4 p-8 text-center text-gray-500">
        No trending stocks data available
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] w-full max-w-4xl mx-auto">
        <div className="mt-4 grid grid-cols-4 gap-2 rounded-t-md bg-green-50 p-2 text-sm font-medium">
          <div className="flex flex-col justify-center">
            {dictionary.company}
          </div>
          <div className="ml-10 flex flex-col justify-center">
            {dictionary.score}
          </div>
          <div className="ml-7 flex flex-col justify-center">
            {dictionary.priceChange}
          </div>
          <div className="flex flex-col justify-center">
            {dictionary.lastDays}
          </div>
        </div>

        <div className="bg-white rounded-b-md">
          {trendingStocks.map((stock, index) => (
            <div
              key={`${stock.symbol}-${index}`}
              className={`grid grid-cols-4 p-3 items-center ${
                index !== trendingStocks.length - 1
                  ? "border-b border-gray-200"
                  : ""
              }`}
            >
              {/* Stock Info */}
              <div className="flex items-center">
                <Link href={`/search-result?q=${stock?.symbol}`}>
                  <div>
                    <div className="text-[#2e7d32] font-medium">
                      {stock.symbol}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Price & Changes */}
              <div className="ml-10">
                <div
                  className={`font-medium ${
                    stock.priceChange !== null && stock.priceChange < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  ${stock.currentPrice?.toFixed(2) ?? "N/A"}
                </div>
                <div
                  className={`text-sm ${
                    stock.priceChange !== null && stock.priceChange < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {stock.priceChange !== null && stock.percentChange !== null
                    ? `${
                        stock.priceChange >= 0 ? "+" : ""
                      }${stock.priceChange.toFixed(
                        2
                      )} (${stock.percentChange.toFixed(2)}%)`
                    : "No change data"}
                </div>
              </div>

              {/* Price Target */}
              <div className="flex items-center ml-8">
                {paymentType === "free" ? (
                  <div
                    onClick={() => setShowUpgradeModal(true)}
                    className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#28A745] z-0 cursor-pointer"
                    style={{
                      filter: "blur(1px)",
                      boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <Image
                      src="/images/lock.png"
                      alt="lock-image"
                      width={20}
                      height={20}
                      className="absolute z-1000"
                    />
                  </div>
                ) : (
                  <>
                    {stock?.targetMean !== null ? (
                      <span
                        className={`text-sm font-medium ${
                          stock.targetMean >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        $ {stock.targetMean.toFixed(2)}
                      </span>
                    ) : (
                      <div className="text-green-500 text-sm">No data</div>
                    )}
                  </>
                )}
              </div>

              {/* Upside Potential */}
              <div className="font-medium mt-3 ml-3">
                {paymentType === "free" ? (
                  <div
                    onClick={() => setShowUpgradeModal(true)}
                    className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#28A745] z-0 cursor-pointer"
                    style={{
                      filter: "blur(1px)",
                      boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <Image
                      src="/images/lock.png"
                      alt="lock-image"
                      width={20}
                      height={20}
                      className="absolute z-1000"
                    />
                  </div>
                ) : (
                  <>
                    {stock?.buy !== undefined &&
                    stock?.hold !== undefined &&
                    stock?.sell !== undefined ? (
                      (() => {
                        const total = stock.buy + stock.hold + stock.sell;
                        const score =
                          total > 0 ? Math.round((stock.buy / total) * 10) : 0;

                        return (
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-yellow-400 flex items-center justify-center">
                              <span className="text-base sm:text-lg font-bold">
                                {score}
                              </span>
                            </div>
                            <div className="flex flex-col text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-sm"></div>
                                <span>{stock.buy} Buy</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 sm:w-3 h-2 sm:h-3 bg-yellow-400 rounded-sm"></div>
                                <span>{stock.hold} Hold</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-sm"></div>
                                <span>{stock.sell} Sell</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-green-500 text-sm">No data</div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade Modal */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="sm:max-w-[480px] p-6">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-lg font-semibold">
                Upgrade Required
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Our free plan does not allow you to access this page. <br />
                Upgrade your plan to unlock this page.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full text-white bg-green-600 flex items-center justify-center mb-4">
                <Unlock size={32} />
              </div>
              <p className="text-sm text-gray-600 max-w-xs">
                To get access to full price targets and upside potential, please
                upgrade your subscription. Manage your investments with more
                flexibility.
              </p>
              <Link href="/explore-plan">
                <Button className="border rounded-md px-4 py-2 bg-green-600 hover:bg-green-600 mt-5 transition">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
