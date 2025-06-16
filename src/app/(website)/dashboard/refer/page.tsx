"use client";
import PathTracker from "../_components/PathTracker";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";

interface User {
  _id: string;
  userName: string;
  avatar: string;
  refferCount: number
}

const Page = () => {

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const axiosInstance = useAxios();

  const {data : allRefer = [], isLoading} = useQuery({
    queryKey : ['all-refer'],
    queryFn : async () => {
      const res = await axiosInstance('/user/get-refer');
      return res.data.data
    }
  })

  const totalPages = Math.ceil(allRefer.length / usersPerPage);
  const currentUsers = allRefer.slice(indexOfFirstUser, indexOfLastUser);

  if(isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      Loading.....
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <PathTracker />
      </div>

      <div>
        <div className="rounded-lg overflow-x-auto border border-[#b0b0b0]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#b0b0b0]">
                <TableHead className=" text-center font-medium">Name</TableHead>
                <TableHead className=" text-center font-medium">Refer</TableHead>
                <TableHead className=" text-center font-medium">
                  Earnings
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user : User) => (
                <TableRow key={user?._id} className="border-b border-[#b0b0b0]">
                  <TableCell className="flex items-center justify-center gap-3 py-4 border-none">
                    <Avatar className="h-12 w-12 border border-gray-200">
                      <AvatarImage
                        src={user?.avatar || "/placeholder.svg"}
                        alt={user?.userName}
                      />
                      <AvatarFallback>{user?.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user?.userName}</span>
                  </TableCell>
                  <TableCell className="border-none">{user?.refferCount}</TableCell>
                  <TableCell className="border-none">
                    0
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div>
            Showing {indexOfFirstUser + 1}-
            {Math.min(indexOfLastUser, allRefer.length)} from {allRefer.length}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <Button
                  key={i}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 ${
                    currentPage === pageNumber
                      ? "bg-green-500 border-green-500 hover:bg-green-600"
                      : ""
                  }`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
