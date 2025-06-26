"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { PieChart, Pie, Cell } from "recharts";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type OwnershipData = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  ownerOverview: {
    breakdown: {
      insiders: number;
      mutualFunds: number;
      otherInstitutions: number;
      publicRetail: number;
    };
  };
};

export default function OwnershipOverview({ ownerOverview }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Create dynamic ownership data from prop
  const ownershipData: OwnershipData[] = useMemo(() => {
    const breakdown = ownerOverview?.breakdown;

    if (!breakdown) return [];

    return [
      {
        name: "Insiders",
        value: breakdown.insiders,
        color: "#FF5733",
      },
      {
        name: "Mutual Funds",
        value: breakdown.mutualFunds,
        color: "#4CAF50",
      },
      {
        name: "Other Institutional Investors",
        value: breakdown.otherInstitutions,
        color: "#2196F3",
      },
      {
        name: "Public Companies and Individual Investors",
        value: breakdown.publicRetail,
        color: "#FFC107",
      },
    ].filter((item) => item.value > 0); // Optional: filter out 0% entries
  }, [ownerOverview]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-bold">Ownership Overview</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center p-4">
        {/* Chart */}
        <div className="w-full flex justify-center mb-4">
          <div className="w-full max-w-[250px] aspect-square">
            {isMounted ? (
              <PieChart width={250} height={250}>
                <Pie
                  data={ownershipData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={0}
                  strokeWidth={0}
                >
                  {ownershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p>Loading chart...</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="w-full">
          <ul className="space-y-2">
            {ownershipData.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm">
                  <span className="font-medium">{item.value}%</span> {item.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      {!pathname.endsWith("ownership") && (
        <CardFooter className="flex justify-center py-2">
          <Link
            href="/stock/aapl/ownership"
            className="text-blue-500 text-sm flex items-center"
          >
            Detailed Ownership Overview
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
