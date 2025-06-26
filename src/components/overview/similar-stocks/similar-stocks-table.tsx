"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Table2 } from "lucide-react";

// Updated StockData interface to match the structure after transformation in SimilarStocksPage
interface StockData {
  symbol: string;
  name: string;
  price: string;
  marketCap: string;
  peRatio: string;
  yearlyGain: string;
  analystConsensus: {
    rating: string;
    fillPercentage: number;
  };
  analystPriceTarget: boolean;
  topAnalystPriceTarget: boolean;
  smartScore: boolean;
}

interface SimilarStocksTableProps {
  title: string;
  subtitle?: string;
  data: StockData[];
}

export default function SimilarStocksTable({ title, subtitle, data }: SimilarStocksTableProps) {
  return (
    <div className="w-full">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-lg">{subtitle}</p>}
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 flex justify-end gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            <span>Select Columns</span>
          </Button>
          <Button variant="outline" className="w-10 h-10 p-0">
            <span className="text-green-600 text-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2v4a1 1 0 0 0 1 1h4" />
                <path d="M5 3v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7.5L14.5 2H6a1 1 0 0 0-1 1z" />
                <path d="M8 12h8" />
                <path d="M8 16h8" />
                <path d="M8 20h8" />
              </svg>
            </span>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Market Cap</TableHead>
                <TableHead className="font-semibold">P/E Ratio</TableHead>
                <TableHead className="font-semibold">Yearly Gain</TableHead>
                <TableHead className="font-semibold">Analyst Consensus</TableHead>
                <TableHead className="font-semibold">Analyst price Target</TableHead>
                <TableHead className="font-semibold">Top Analyst price Target</TableHead>
                <TableHead className="font-semibold">Smart Score</TableHead>
                <TableHead className="font-semibold">Follow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((stock, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <a href="#" className="text-blue-500 hover:underline">
                        {stock.symbol}
                      </a>
                      <div>{stock.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>${stock.price}</TableCell>
                  <TableCell>{stock.marketCap}</TableCell>
                  <TableCell>{stock.peRatio}</TableCell>
                  <TableCell className={stock.yearlyGain.startsWith('-') ? "text-red-500" : "text-green-500"}>
                    {stock.yearlyGain}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gray-300 rounded-full"></div>
                        <div
                          className="absolute inset-0 bg-teal-500 rounded-full"
                          style={{
                            clipPath: `polygon(0 0, ${stock.analystConsensus.fillPercentage}% 0, ${stock.analystConsensus.fillPercentage}% 100%, 0 100%)`,
                          }}
                        ></div>
                      </div>
                      <span className="text-teal-500">{stock.analystConsensus.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {!stock.analystPriceTarget && (
                      <div className="flex justify-center">
                        <Lock className="h-5 w-5 text-orange-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {!stock.topAnalystPriceTarget && (
                      <div className="flex justify-center">
                        <Lock className="h-5 w-5 text-orange-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {!stock.smartScore && (
                      <div className="flex justify-center">
                        <Lock className="h-5 w-5 text-orange-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-blue-500">
                        <Plus className="h-4 w-4 text-blue-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}