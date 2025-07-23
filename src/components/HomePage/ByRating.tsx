"use client";
import Image from "next/image";
import Link from "next/link";
import { useUserPayment } from "../context/paymentContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogHeader } from "../ui/dialog";
import { Unlock } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";

interface TopStock {
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

interface TopStocksTableProps {
  topStocks: TopStock[];
}

export default function TopStocksTable({ topStocks }: TopStocksTableProps) {
  const { paymentType } = useUserPayment();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { dictionary } = useLanguage();

  if (!topStocks || topStocks.length === 0) {
    return (
      <div className="mt-4 p-8 text-center text-gray-500">
        No top stocks data available
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
            {dictionary.priceChange}
          </div>
          <div className="ml-7 flex flex-col justify-center">
            {dictionary.price}
          </div>
          <div className="flex flex-col justify-center">
            {dictionary?.upsidePotential}
          </div>
        </div>

        <div className="bg-white rounded-b-md">
          {topStocks.map((stock, index) => {
            return (
              <div
                key={`${stock.symbol}-${index}`}
                className={`grid grid-cols-4 p-3 items-center ${
                  index !== topStocks.length - 1
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

                {/* Company Price & Changes */}
                <div className="ml-10">
                  <div
                    className={`font-medium ${
                      stock.priceChange !== null && stock.priceChange < 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    ${stock.currentPrice.toFixed(2)}
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

                {/*  Price Data */}
                <div className="flex items-center ml-8">
                  {paymentType === "free" ? (
                    <div
                      onClick={() => setShowUpgradeModal(true)}
                      className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#28A745] z-0"
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
                <div className="text-green-500 font-medium mt-3 ml-3">
                  {paymentType === "free" ? (
                    <div
                      onClick={() => setShowUpgradeModal(true)}
                      className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#28A745] z-0"
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
                      {stock.upsidePercent ? (
                        <span
                          className={`font-medium ${
                            parseFloat(stock.upsidePercent) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {stock.upsidePercent}%
                        </span>
                      ) : (
                        <div className="text-green-500 text-sm">No data</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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
                To get access, multiple portfolios, please upgrade your
                subscription. Manage your investments with more flexibility.
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
