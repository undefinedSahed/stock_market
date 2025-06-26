"use client";

import type React from "react";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DataTableProps<T extends Record<string, any>> {
  title: string;
  data: T[] | undefined;
  showMore?: boolean;
  showMoreText?: string;
  onShowMore?: () => void;
  initialRowsToShow?: number;
}

export default function TopCatDataTable<T extends Record<string, any>>({
  title,
  data,
  showMore = true,
  showMoreText = "Show More",
  onShowMore,
  initialRowsToShow = 10,
}: DataTableProps<T>) {
  const [rowsToShow, setRowsToShow] = useState(initialRowsToShow);

  // Validate data
  const validData = Array.isArray(data) ? data : [];

  // Get column headers from the first row
  const columns = validData.length > 0 ? Object.keys(validData[0]) : [];

  const handleShowMore = () => {
    if (onShowMore) {
      onShowMore();
    } else {
      setRowsToShow(validData.length);
    }
  };

  console.log(data)

  return (
    <div className="w-full overflow-hidden mb-6">
      <h2 className="text-xl font-bold pb-4">{title}</h2>
      <div className="overflow-x-auto border-2 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="text-center">
                  {formatColumnHeader(column)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {validData.length > 0 ? (
              validData.slice(0, rowsToShow).map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? "" : "bg-gray-50"}
                >
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column}`}>
                      {formatCellValue(column, row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showMore && rowsToShow < validData.length && (
        <div className="flex justify-center p-4 border-t border-gray-100 bg-gray-100">
          <button
            onClick={handleShowMore}
            className="text-green-500 flex items-center hover:underline"
          >
            <Plus className="h-4 w-4 mr-1" />
            {showMoreText}
          </button>
        </div>
      )}
    </div>
  );
}

// Convert camelCase/snake_case to Title Case with known cases handled
function formatColumnHeader(key: string): string {
  if (key === "id") return "ID";
  switch (key) {
    case "holder":
      return "Holder";
    case "shares":
      return "# of Shares";
    case "type":
      return "Type";
    case "percent":
    case "percentage":
      return "% Holding";
    case "value":
      return "Value";
    default:
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();
  }
}

// Format value strings like $123,456 or percentages
function formatCellValue(column: string, value: any): React.ReactNode {
  if (value === null || value === undefined) return "-";

  if (
    column === "value" &&
    typeof value === "string" &&
    !value.trim().startsWith("$")
  ) {
    return `$${value}`;
  }

  if (
    (column === "percent" || column === "percentage") &&
    typeof value === "string" &&
    !value.trim().endsWith("%")
  ) {
    return `${value}%`;
  }

  return value;
}
