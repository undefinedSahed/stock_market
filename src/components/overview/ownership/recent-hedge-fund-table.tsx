"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

type Props = {
  ownershipData: {
    hedgeFundActivity: {
      date: string
      name: string
      activity: string
      value: string // e.g. "$13,534,448"
    }[]
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)

export default function HedgeFundTable({ ownershipData }: Props) {
  const hedgeFundData = ownershipData?.hedgeFundActivity || []

  const pageSize = 7
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(hedgeFundData.length / pageSize)

  const paginatedData = hedgeFundData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold pb-4">Recent Hedge Fund Trading Activity</h2>

      <div className="py-4 shadow-[0px_0px_10px_1px_#0000001A] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead className="whitespace-nowrap text-center">Date</TableHead>
                <TableHead className="whitespace-nowrap text-center">Name</TableHead>
                <TableHead className="whitespace-nowrap text-center">Activity</TableHead>
                <TableHead className="whitespace-nowrap text-center">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((record, index) => {
                const parsedValue = parseFloat(record.value.replace(/[^0-9.-]/g, ""))

                return (
                  <TableRow
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <TableCell className="font-medium">{record.date}</TableCell>
                    <TableCell>
                      <div className="text-blue-500">{record.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Lock className="h-5 w-5 text-red-500" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(parsedValue)}</TableCell>
                  </TableRow>
                )
              })}
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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
