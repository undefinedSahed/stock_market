"use client";

import { Trash } from "lucide-react";
import { IoWarningOutline } from "react-icons/io5";
import { FiEdit2 } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";




import Image from "next/image";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link";
import { Input } from "../ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { usePortfolio } from "./portfolioContext";
import { toast } from "sonner";


interface AddHoldingData {
  symbol: string;
  quantity: number;
}

export default function PortfolioTable() {

  const [editableShares, setEditableShares] = useState<Record<string, number>>({});

  const { data: session } = useSession();

  const { selectedPortfolioId } = usePortfolio();

  const queryClient = useQueryClient();

  // Fetch portfolio data for selected ID
  const { data: portfolioData } = useQuery({
    queryKey: ["portfolio", selectedPortfolioId], // add selectedPortfolioId to the query key
    queryFn: async () => {
      // If selectedPortfolioId is undefined (initial load before a selection), prevent the fetch.
      // The `enabled` prop below also handles this, but it's good to be explicit here too.
      if (!selectedPortfolioId) {
        return null;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/get/${selectedPortfolioId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });
      const data = await res.json();
      return data;
    },
    enabled: !!session?.user?.accessToken && !!selectedPortfolioId, // only run when both are available
  });

  const { mutate: getOverview, data: overviewData } = useMutation({
    mutationFn: async (holdings) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/overview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ holdings }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch portfolio overview");
      }

      return res.json();
    },
  });

  // Trigger overview when portfolioData is ready
  useEffect(() => {
    if (portfolioData && portfolioData.stocks.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const holdings = portfolioData.stocks.map((stock: any) => ({
        symbol: stock.symbol,
        shares: stock.quantity,
      }));
      getOverview(holdings);
    }
  }, [portfolioData, getOverview]);


  useEffect(() => {
    if (overviewData?.holdings) {
      const sharesMap: Record<string, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overviewData.holdings.forEach((item: any) => {
        sharesMap[item.symbol] = item.shares;
      });
      setEditableShares(sharesMap);
    }
  }, [overviewData]);


  const { mutate: DeleteStock, isPending: isDeletingStock } = useMutation({
    mutationFn: async (data: { symbol: string; portfolioId: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protfolio/delete-stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", selectedPortfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-overview"] });
    },
  });


  const { mutate: addHolding } = useMutation({
    mutationFn: async (data: AddHoldingData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protfolio/add-stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          portfolioId: selectedPortfolioId,
          symbol: data.symbol,
          quantity: data.quantity
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add stock to portfolio.");
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || `Added stock to portfolio!`);
      queryClient.invalidateQueries({ queryKey: ["portfolio", selectedPortfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-overview"] });
    },
    onError: (error) => {
      toast.error(error.message || "Error adding stock to portfolio.");
    },
  })


  const handleUpdateQuantity = (symbol: string, quantity: number) => {
    addHolding({ symbol, quantity });
  }


  const handleDelete = async (stockSymbol: string) => {
    console.log("Deleted Stock: ", stockSymbol)
    DeleteStock({
      symbol: stockSymbol,
      portfolioId: selectedPortfolioId ? selectedPortfolioId : ""
    })
  }


  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm mt-[100px] lg:mb-20 mb-5">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="gap-2 my-3 bg-transparent text-white justify-start lg:justify-start max-w-[100vw] lg:max-w-full overflow-x-scroll lg:overflow-hidden">
          {/* <div className="hidden lg:flex items-center gap-2">
            <div className="flex gap-3 items-center bg-[#BFBFBF] p-1 rounded-sm">
              <div className="">
                <Image
                  src="/images/icon-2.png"
                  alt="icon-2"
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px]"
                />
              </div>
              <div className="flex gap-3">
                <Image
                  src="/images/icon-3.png"
                  width={50}
                  height={50}
                  alt="icon-3"
                  className="h-[18px] w-[18px]"
                />
                <Image
                  src="/images/icon-4.png"
                  width={50}
                  height={50}
                  alt="icon-4"
                  className="h-[18px] w-[18px]"
                />
              </div>
            </div>
          </div> */}
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#28A745] data-[state=active]:text-white bg-[#E0E0E0] px-5 py-2">Overview</TabsTrigger>
          <TabsTrigger value="tipranks" className="data-[state=active]:bg-[#28A745] data-[state=active]:text-white bg-[#E0E0E0] px-5 py-2">Olive Stocks Essentials</TabsTrigger>
          <TabsTrigger value="holdings" className="data-[state=active]:bg-[#28A745] data-[state=active]:text-white bg-[#E0E0E0] px-5 py-2">Holdings</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#28A745] data-[state=active]:text-white bg-[#E0E0E0] px-5 py-2">Performance</TabsTrigger>
          <TabsTrigger value="dividends" className="data-[state=active]:bg-[#28A745] data-[state=active]:text-white bg-[#E0E0E0] px-5 py-2">Dividends</TabsTrigger>
          <TabsTrigger value="earnings" className="data-[state=active]:bg-[#28A745] data-[state=active]:text-white bg-[#E0E0E0] px-5 py-2">Earnings</TabsTrigger>
          <TabsTrigger value="technicals" className="data-[state=active]:bg-[#28A745] data-[state=active]:text-white bg-[#E0E0E0] px-5 py-2">Technicals</TabsTrigger>
        </TabsList>

        {/* Overview table */}
        <TabsContent value="overview">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#EAF6EC] h-[70px]">
                <TableHead className="w-[120px]  text-center">Stock Name</TableHead>
                <TableHead className="w-[120px]  text-center">Number of Shares</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-center">Price Change</TableHead>
                <TableHead className="text-center">Ai Catalyst</TableHead>
                <TableHead className="text-center">Ai Consensus</TableHead>
                <TableHead className="text-center">Analyst Price Target</TableHead>
                <TableHead className="text-center">Smart Score</TableHead>
                <TableHead className="text-center">Holding Value</TableHead>
                <TableHead className="text-center">Holding Gain</TableHead>
                <TableHead className="text-center">Top Analyst Consensus</TableHead>
                <TableHead className="text-center">Alerts</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-center">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {overviewData?.holdings?.map((item: any, index: number) => (
                <TableRow key={index} className="h-24">
                  <TableCell className="font-medium">
                    <Link href={`/stock/${item.symbol.toLowerCase()}?q=${item.symbol}`}>
                      <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                          <div className="flex w-8 h-8 rounded-full bg-black justify-center items-center p-2">
                            <Image
                              src={item.logo}
                              alt={item.symbol}
                              width={350}
                              height={200}
                              className="w-5 h-5 object-cover"
                            />
                          </div>
                          <div className="">
                            <span className="hover:underline hover:text-blue-400">{item.symbol}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="">
                    <div className="flex gap-1 text-center items-center">
                      <span><IoWarningOutline className="text-[#FFD700]" /></span>
                      <Input
                        value={editableShares[item.symbol] ?? ""}
                        className="text-center w-14"
                        onChange={(e) =>
                          setEditableShares((prev) => ({
                            ...prev,
                            [item.symbol]: Number(e.target.value),
                          }))
                        }
                      />
                      <span><FiEdit2 onClick={() => handleUpdateQuantity(item.symbol, editableShares[item.symbol])} className="text-[#28A745] cursor-pointer" /></span>
                    </div>
                  </TableCell>
                  <TableCell>
                    ${item.price}
                  </TableCell>
                  <TableCell className="">
                    <div className="">
                      <p className="flex flex-col">
                        <span className="">${item.change}</span>
                        <p className="flex items-center">
                          <span>{item.change > 0 ? <FaCaretUp className="text-2xl text-green-500" /> : <FaCaretDown className="text-red-500 text-2xl" />}</span>
                          <span className={item.change > 0 ? "text-green-500" : "text-red-500"}>${item.percent.toFixed(2)}%</span>
                        </p>
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Image
                        src="/images/Ai.png"
                        alt={item.ticker}
                        width={350}
                        height={200}
                        className="w-5 h-5 object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>Moderate Buy</TableCell>
                  <TableCell>
                    <div className="relative w-9 h-9 mx-auto flex items-center justify-center">
                      {/* Green Glow */}
                      <div className="absolute w-full h-full bg-[#28A745] rounded-full blur-[6px]"></div>

                      {/* Lock Image (on top of glow) */}
                      <Image
                        src="/images/lock.png"
                        alt={item.ticker}
                        width={350}
                        height={200}
                        className="w-5 h-5 object-cover relative z-10"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative w-9 h-9 mx-auto flex items-center justify-center">
                      {/* Green Glow */}
                      <div className="absolute w-full h-full bg-[#28A745] rounded-full blur-[6px]"></div>

                      {/* Lock Image (on top of glow) */}
                      <Image
                        src="/images/lock.png"
                        alt={item.ticker}
                        width={350}
                        height={200}
                        className="w-5 h-5 object-cover relative z-10"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    ${item.value}
                  </TableCell>
                  <TableCell className="">
                    <div className={`${item.percent < 0 ? "text-red-500" : "text-[#28A745]"} flex items-center gap-2`}>
                      <span>{item.percent < 0 ? <FaCaretDown className="text-red-500 text-xl" /> : <FaCaretUp className="text-xl text-[#28A745]" />}</span>
                      {item.percent?.toFixed(2)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative w-9 h-9 mx-auto flex items-center justify-center">
                      {/* Green Glow */}
                      <div className="absolute w-full h-full bg-[#28A745] rounded-full blur-[6px]"></div>

                      {/* Lock Image (on top of glow) */}
                      <Image
                        src="/images/lock.png"
                        alt={item.ticker}
                        width={350}
                        height={200}
                        className="w-5 h-5 object-cover relative z-10"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <IoNotificationsOutline className="h-4 w-4" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center cursor-pointer">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          {/* Use a button or div if you don't want a default button style */}
                          <Trash className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to delete {item.symbol}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove {item.symbol} from your portfolio.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.symbol)}
                              disabled={isDeletingStock} // Disable button while deleting
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              {isDeletingStock ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* tipranks content */}
        <TabsContent value="tipranks">
          <h3 className="text-center py-10 text-2xl font-semibold text-[#28A745]">Olive Stocks Essential&apos;s data will appear there</h3>
        </TabsContent>

        {/* holdings */}
        <TabsContent value="holdings">
          <h3 className="text-center py-10 text-2xl font-semibold text-[#28A745]">Holdings data will appear there</h3>
        </TabsContent>

        {/* performance */}
        <TabsContent value="performance">
          <h3 className="text-center py-10 text-2xl font-semibold text-[#28A745]">Performance data will appear there</h3>
        </TabsContent>

        {/* dividends */}
        <TabsContent value="dividends">
          <h3 className="text-center py-10 text-2xl font-semibold text-[#28A745]">Dividends data will appear there</h3>
        </TabsContent>

        {/* earnings */}
        <TabsContent value="earnings">
          <h3 className="text-center py-10 text-2xl font-semibold text-[#28A745]">Earnings data will appear there</h3>
        </TabsContent>

        {/* technicals */}
        <TabsContent value="technicals">
          <h3 className="text-center py-10 text-2xl font-semibold text-[#28A745]">Technicals data will appear there</h3>
        </TabsContent>
      </Tabs>
    </div>
  );
}
