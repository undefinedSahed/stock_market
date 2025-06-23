"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PerformanceData {
  date: string;
  murakkabAverage: number;
  murakkabAverageSecondary?: number;
  sp500: number;
  myPortfolio: number;
}

export default function PerformanceDashboard() {
  const [showMurakkab, setShowMurakkab] = useState(true);
  const [showSP500, setShowSP500] = useState(true);
  const [showPortfolio, setShowPortfolio] = useState(true);

  // Dummy data
  const performanceData: PerformanceData[] = [
    {
      date: "Apr 2025",
      murakkabAverage: -3.02,
      murakkabAverageSecondary: -3.02,
      sp500: 3.02,
      myPortfolio: -3.02,
    },
    {
      date: "Apr 2025",
      murakkabAverage: -4.15,
      murakkabAverageSecondary: -2.89,
      sp500: 3.02,
      myPortfolio: -3.02,
    },
    {
      date: "Apr 2025",
      murakkabAverage: -2.75,
      murakkabAverageSecondary: -3.02,
      sp500: 3.02,
      myPortfolio: -3.02,
    },
    {
      date: "Apr 2025",
      murakkabAverage: -3.45,
      murakkabAverageSecondary: -3.02,
      sp500: 3.02,
      myPortfolio: -3.02,
    },
    {
      date: "Apr 2025",
      murakkabAverage: -3.89,
      murakkabAverageSecondary: 3.02,
      sp500: -3.02,
      myPortfolio: 3.02,
    },
    {
      date: "Apr 2025",
      murakkabAverage: 3.02,
      murakkabAverageSecondary: 3.02,
      sp500: 3.02,
      myPortfolio: 3.02,
    },
  ];

  const maxValue = 26.01;
  const minValue = -26.01;

  // Function to calculate bar height based on percentage
  const getBarHeight = (value: number) => {
    const percentage = (Math.abs(value) / maxValue) * 100;
    return Math.max(percentage, 5); // Minimum 5% height for visibility
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-[0px_0px_16px_0px_#00000029]">
      <h1 className="text-3xl font-bold mb-4 pb-2 border-b">Performance</h1>

      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="murakkab"
            checked={showMurakkab}
            onCheckedChange={() => setShowMurakkab(!showMurakkab)}
            className="h-5 w-5 rounded-full bg-green-500 border-green-500 text-white"
          />
          <Label htmlFor="murakkab" className="text-base font-medium">
            Olive Stock&apos;s Average
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="sp500"
            checked={showSP500}
            onCheckedChange={() => setShowSP500(!showSP500)}
            className="h-5 w-5 rounded-full bg-yellow-400 border-yellow-400 text-white"
          />
          <Label htmlFor="sp500" className="text-base font-medium">
            S&P 500
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="portfolio"
            checked={showPortfolio}
            onCheckedChange={() => setShowPortfolio(!showPortfolio)}
            className="h-5 w-5 rounded-full bg-red-500 border-red-500 text-white"
          />
          <Label htmlFor="portfolio" className="text-base font-medium">
            My Portfolio
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="flex flex-col gap-2 mt-4 col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            <span className="text-sm">Olive Stock&apos;s Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
            <span className="text-sm">S&P 500</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
            <span className="text-sm">My Portfolio</span>
          </div>
        </div>

        <div className="mb-8 col-span-4 overflow-x-scroll lg:overflow-auto">
          <div className="flex justify-start mb-2">
            <span className="text-gray-700 font-medium">
              {maxValue.toFixed(2)}%
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-1 min-w-[600px]">
            {performanceData.map((data, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="h-36 w-full bg-gray-100 relative flex flex-col justify-center items-center">
                  <div className="absolute w-full h-[1px] bg-gray-300 top-1/2 transform -translate-y-1/2"></div>

                  {showMurakkab && data.murakkabAverage > 0 && (
                    <div
                      className="absolute bottom-1/2 w-6 bg-green-500 rounded-t-sm"
                      style={{
                        height: `${getBarHeight(data.murakkabAverage)}%`,
                      }}
                    ></div>
                  )}

                  {showMurakkab && data.murakkabAverage < 0 && (
                    <div
                      className="absolute top-1/2 w-6 bg-green-500 rounded-b-sm"
                      style={{
                        height: `${getBarHeight(data.murakkabAverage)}%`,
                      }}
                    ></div>
                  )}

                  {showSP500 && data.sp500 > 0 && (
                    <div
                      className="absolute bottom-1/2 w-6 bg-yellow-400 rounded-t-sm -ml-16"
                      style={{ height: `${getBarHeight(data.sp500)}%` }}
                    ></div>
                  )}

                  {showSP500 && data.sp500 < 0 && (
                    <div
                      className="absolute top-1/2 w-6 bg-yellow-400 rounded-b-sm -ml-16"
                      style={{ height: `${getBarHeight(data.sp500)}%` }}
                    ></div>
                  )}

                  {showPortfolio && data.myPortfolio > 0 && (
                    <div
                      className="absolute bottom-1/2 w-6 bg-red-500 rounded-t-sm ml-16"
                      style={{ height: `${getBarHeight(data.myPortfolio)}%` }}
                    ></div>
                  )}

                  {showPortfolio && data.myPortfolio < 0 && (
                    <div
                      className="absolute top-1/2 w-6 bg-red-500 rounded-b-sm ml-16"
                      style={{ height: `${getBarHeight(data.myPortfolio)}%` }}
                    ></div>
                  )}
                </div>

                <div className="text-sm font-medium mt-1">{data.date}</div>

                <div className="flex flex-col gap-1 mt-2">
                  {showMurakkab && (
                    <div
                      className={`flex items-center gap-1 ${
                        data.murakkabAverage > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {data.murakkabAverage > 0 ? "▲" : "▼"}{" "}
                      {Math.abs(data.murakkabAverage).toFixed(2)}%
                    </div>
                  )}

                  {showMurakkab && (
                    <div
                      className={`flex items-center gap-1 ${
                        data.murakkabAverageSecondary &&
                        data.murakkabAverageSecondary > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {data.murakkabAverageSecondary &&
                      data.murakkabAverageSecondary > 0
                        ? "▲"
                        : "▼"}{" "}
                      {data.murakkabAverageSecondary
                        ? Math.abs(data.murakkabAverageSecondary).toFixed(2)
                        : "0.00"}
                      %
                    </div>
                  )}

                  {showSP500 && (
                    <div
                      className={`flex items-center gap-1 ${
                        data.sp500 > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {data.sp500 > 0 ? "▲" : "▼"}{" "}
                      {Math.abs(data.sp500).toFixed(2)}%
                    </div>
                  )}

                  {showPortfolio && (
                    <div
                      className={`flex items-center gap-1 ${
                        data.myPortfolio > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {data.myPortfolio > 0 ? "▲" : "▼"}{" "}
                      {Math.abs(data.myPortfolio).toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-start">
            <span className="text-gray-700 font-medium">
              {minValue.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
