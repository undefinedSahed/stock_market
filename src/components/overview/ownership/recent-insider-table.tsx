"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button"; // Update if your button component is elsewhere

type InsiderTradingRecord = {
  date: string;
  name: string;
  position?: string;
  activity: "sale" | "purchase" | "grant" | "exercise";
  value: number;
};

type Props = {
  ownershipData: {
    insiderTrades: {
      date: string;
      name: string;
      activity: string; // like "S", "P", etc.
      value: string; // "$147.767"
    }[];
  };
};

export default function RecentInsiderTradingTable({ ownershipData }: Props) {
  const [displayData, setDisplayData] = useState<InsiderTradingRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 7;
  const totalPages = Math.ceil(displayData.length / pageSize);

  useEffect(() => {
    if (!ownershipData?.insiderTrades?.length) return;

    const mapActivity = (code: string): InsiderTradingRecord["activity"] => {
      switch (code.toUpperCase()) {
        case "S":
          return "sale";
        case "P":
          return "purchase";
        case "G":
          return "grant";
        case "E":
          return "exercise";
        default:
          return "sale";
      }
    };

    const cleanedData: InsiderTradingRecord[] = ownershipData.insiderTrades.map(
      (item) => ({
        date: item.date,
        name: item.name,
        activity: mapActivity(item.activity),
        value: parseFloat(item.value.replace(/[^0-9.]/g, "")) || 0,
      })
    );

    setDisplayData(cleanedData);
  }, [ownershipData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const currentData = displayData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        Recent Insider Trading Activity
      </h2>

      <div className="py-4 shadow-[0px_0px_10px_1px_#0000001A]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Activity</TableHead>
                <TableHead className="text-center">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((record, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <TableCell className="font-medium">{record.date}</TableCell>
                  <TableCell>
                    <div className="text-blue-500">{record.name}</div>
                    {record.position && (
                      <div className="text-sm">{record.position}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <div className="bg-red-100 p-2 rounded-full">
                        <Lock className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(record.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <p className="text-sm">
              Page <strong>{currentPage}</strong> of {totalPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
