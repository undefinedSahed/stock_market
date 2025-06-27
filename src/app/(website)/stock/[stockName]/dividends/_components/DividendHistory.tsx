"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

interface DividendData {
  adjustedAmount: number;
  amount: number;
  currency: string;
  date: string; // Ex-date
  declarationDate: string;
  franking: number;
  freq: string;
  payDate: string;
  recordDate: string;
  symbol: string;
}

export default function DividendHistory() {
  const [showAll, setShowAll] = useState(false);
  const initialRows = 7;

  const axiosInstance = useAxios();
  const params = useParams();
  const stockName = params.stockName;

  const {
    data: history,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["history-chart"],
    queryFn: async () => {
      const res = await axiosInstance(`/portfolio/dividends/AAPL`);
      return res.data.rawDividends as DividendData[];
    },
  });

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get frequency text
  const getFrequencyText = (freq: string | number): string => {
    switch (freq.toString()) {
      case "0":
        return "Annually";
      case "1":
        return "Monthly";
      case "2":
        return "Quarterly";
      case "3":
        return "Semi-annually";
      case "4":
        return "Other/Unknown";
      case "5":
        return "Bimonthly";
      case "6":
        return "Trimesterly";
      case "7":
        return "Weekly";
      default:
        return "Other/Unknown";
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Sort data by date (most recent first) and slice for display
  const sortedData = history
    ? [...history].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  const displayedRows = showAll ? sortedData : sortedData.slice(0, initialRows);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading dividend history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">
          Error loading dividend history. Please try again.
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">
          No dividend history available.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4"><span className=" uppercase">{stockName}</span> Dividend History</h1>

      <div className="rounded-lg overflow-hidden border border-gray-200">
        <Table>
          <TableHeader className="bg-white">
            <TableRow>
              <TableHead className="text-center">Ex-Date</TableHead>
              <TableHead className="text-center">Record Date</TableHead>
              <TableHead className="text-center">Payment Date</TableHead>
              <TableHead className="text-center">Frequency</TableHead>
              <TableHead className="text-center">Declaration Date</TableHead>
              <TableHead className="text-center">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedRows.map((row, index) => (
              <TableRow key={`${row.date}-${index}`}>
                <TableCell className="text-center">
                  {formatDate(row.date)}
                </TableCell>
                <TableCell className="text-center">
                  {formatDate(row.recordDate)}
                </TableCell>
                <TableCell className="text-center">
                  {formatDate(row.payDate)}
                </TableCell>
                <TableCell className="text-center">
                  {getFrequencyText(row.freq)}
                </TableCell>
                <TableCell className="text-center">
                  {formatDate(row.declarationDate)}
                </TableCell>
                <TableCell className="text-center">
                  {formatCurrency(row.amount, row.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Show More/Less button - only show if there are more rows than initial display */}
      {sortedData.length > initialRows && (
        <Button
          onClick={toggleShowAll}
          variant="ghost"
          className="flex items-center justify-center w-full py-4 bg-gradient-to-t from-gray-400 via-white to-white text-green-500 font-medium transition-colors hover:text-green-600"
        >
          {showAll ? (
            <>
              <Minus className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Show More ({sortedData.length - initialRows} more)
            </>
          )}
        </Button>
      )}
    </div>
  );
}
