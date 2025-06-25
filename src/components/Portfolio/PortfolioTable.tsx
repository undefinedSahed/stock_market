"use client";

import { ChevronDown, ChevronUp, Trash } from "lucide-react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { usePortfolio } from "./portfolioContext";
import { toast } from "sonner";
import Portfolio from "../olivestocks_portfolio/Portfolio";


interface AddHoldingData {
  symbol: string;
  quantity: number;
  price: number;
}

export default function PortfolioTable() {

  const [editableShares, setEditableShares] = useState<Record<string, number>>({});
  const [editablePrices, setEditablePrices] = useState<Record<string, number>>({});


  const { data: session } = useSession();
  const { selectedPortfolioId } = usePortfolio();
  const queryClient = useQueryClient();

  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({
    key: null,
    direction: null,
  });

  const { mutate: getOverview, data: overviewData } = useMutation({
    mutationFn: async (portfolioId: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/overview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: portfolioId }),
      });
      if (!res.ok) throw new Error("Failed to fetch portfolio overview");
      return res.json();
    },
  });

  useEffect(() => {
    if (overviewData?.holdings) {
      const sharesMap: Record<string, number> = {};
      const priceMap: Record<string, number> = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overviewData.holdings.forEach((item: any) => {
        sharesMap[item.symbol] = item.shares;
        priceMap[item.symbol] = item.holdingPrice;
      });

      setEditableShares(sharesMap);
      setEditablePrices(priceMap);
    }
  }, [overviewData]);

  useEffect(() => {
    if (selectedPortfolioId) {
      getOverview(selectedPortfolioId);
    }
  }, [selectedPortfolioId, getOverview]);

  const { mutate: DeleteStock, isPending: isDeletingStock } = useMutation({
    mutationFn: async ({ symbol, portfolioId }: { symbol: string; portfolioId: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protfolio/delete-stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({ symbol, portfolioId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", selectedPortfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-overview"] });
      if (selectedPortfolioId) {
        getOverview(selectedPortfolioId);
      }
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
          quantity: data.quantity,
          price: data.price,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add stock to portfolio.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || `Added stock to portfolio!`);
      queryClient.invalidateQueries({ queryKey: ["portfolio", selectedPortfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-overview"] });
      if (selectedPortfolioId) {
        getOverview(selectedPortfolioId);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Error adding stock to portfolio.");
    },
  });

  const handleUpdateHolding = (symbol: string, field: "shares" | "price", newValue: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = overviewData?.holdings?.find((h: any) => h.symbol === symbol);
    if (!current) return;

    const quantity = field === "shares" ? newValue : editableShares[symbol] ?? current.shares;
    const price = field === "price" ? newValue : editablePrices[symbol] ?? current.holdingPrice;

    addHolding({ symbol, quantity, price });
  };


  const handleDelete = async (stockSymbol: string) => {
    DeleteStock({
      symbol: stockSymbol,
      portfolioId: selectedPortfolioId || "",
    });
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedHoldings = useMemo(() => {
    if (!overviewData?.holdings || !sortConfig.key || !sortConfig.direction) {
      return overviewData?.holdings || [];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return [...overviewData.holdings].sort((a: any, b: any) => {
      const valueA = a[sortConfig.key!];
      const valueB = b[sortConfig.key!];

      if (valueA === undefined || valueB === undefined) return 0;

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
      }
      return sortConfig.direction === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }, [overviewData?.holdings, sortConfig]);


  const handleNotification = async (symbol: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protfolio/watchlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({ symbol }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data?.error;
        return toast.error(errorMessage);
      }
      return toast.success(data.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return toast.error(error.message);
    }
  };



  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm mt-[100px] lg:mb-20 mb-5">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="gap-2 my-3 bg-transparent text-white justify-start lg:justify-start max-w-[100vw] lg:max-w-full overflow-x-scroll lg:overflow-hidden">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#28A745] data-[state=active]:text-white bg-[#E0E0E0] px-5 py-2">Overview</TabsTrigger>
          <TabsTrigger value="essentials" className="data-[state=active]:bg-[#28A745] data-[state=active]:text-white bg-[#E0E0E0] px-5 py-2">Olive Stocks Essentials</TabsTrigger>
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
                <TableHead className="w-[120px] text-center">Stock Name</TableHead>

                {[
                  { label: "Company Name", key: "name" },
                  { label: "Number of Shares", key: "shares" },
                  { label: "Share Price", key: "buyPrice" },
                  { label: "Curr. Price", key: "price" },
                  { label: "Price Change", key: "change" },
                  { label: "Olive's Rating", key: "value" },
                  { label: "Holding Gain", key: "percent" },
                ].map(({ label, key }) => {
                  const isActive = sortConfig.key === key;
                  const isAsc = isActive && sortConfig.direction === "asc";
                  const isDesc = isActive && sortConfig.direction === "desc";
                  return (
                    <TableHead
                      key={key}
                      onClick={() => handleSort(key)}
                      className="text-center cursor-pointer select-none"
                    >
                      <div className="inline-flex items-center space-x-1">
                        <span>{label}</span>
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`w-3 h-3 -mb-1 ${isAsc ? "text-black" : "text-gray-400"
                              }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 ${isDesc ? "text-black" : "text-gray-400"
                              }`}
                          />
                        </div>
                      </div>
                    </TableHead>
                  );
                })}

                <TableHead className="text-center">Holding Value</TableHead>
                <TableHead className="text-center">Monthly Return</TableHead>
                <TableHead className="text-center">Alerts</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-center">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {sortedHoldings.map((item: any, index: number) => (
                <TableRow key={index} className="h-24">
                  <TableCell className="font-medium">
                    <Link href={`/stock/${item.symbol.toLowerCase()}?q=${item.symbol}`}>
                      <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                          <div className="flex w-8 h-8 rounded-full bg-black justify-center items-center p-2">
                            <Image
                              src={item.logo}
                              alt={item.name}
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
                  <TableCell>
                    {item.name}
                  </TableCell>
                  <TableCell>
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateHolding(item.symbol, "shares", editableShares[item.symbol]);
                          }
                        }}
                      />
                      <span>
                        <FiEdit2
                          onClick={() => handleUpdateHolding(item.symbol, "shares", editableShares[item.symbol])}
                          className="text-[#28A745] cursor-pointer"
                        />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editablePrices[item.symbol] ?? ""}
                      className="text-center w-16"
                      onChange={(e) =>
                        setEditablePrices((prev) => ({
                          ...prev,
                          [item.symbol]: Number(e.target.value),
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateHolding(item.symbol, "price", editablePrices[item.symbol]);
                        }
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    ${item.price}
                  </TableCell>
                  <TableCell className="">
                    <div className="">
                      <p className="flex flex-col">
                        <span className={`${item.change > 0 ? "text-green-500" : "text-red-500"}`}>${item.change}</span>
                        <p className="flex items-center">
                          <span>{item.change > 0 ? <FaCaretUp className="text-2xl text-green-500" /> : <FaCaretDown className="text-red-500 text-2xl" />}</span>
                          <span className={item.change > 0 ? "text-green-500" : "text-red-500"}>${item.percent.toFixed(2)}%</span>
                        </p>
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <svg
                      width="150"
                      height="70"
                      viewBox="0 0 369 191"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto mt-4"
                    >
                      <path
                        d="M322.624 39.3246H324.382V40.9746H322.624V39.3246ZM323.796 29.9746C326.932 30.0956 328.297 33.0656 326.434 35.2931C325.947 35.8431 325.162 36.2061 324.775 36.6681C324.382 37.1246 324.382 37.6746 324.382 38.2246H322.624C322.624 37.3061 322.624 36.5306 323.016 35.9806C323.403 35.4306 324.189 35.1061 324.675 34.7431C326.094 33.5111 325.742 31.7676 323.796 31.6246C323.33 31.6246 322.882 31.7984 322.553 32.1079C322.223 32.4173 322.038 32.837 322.038 33.2746H320.279C320.279 32.3994 320.65 31.56 321.309 30.9412C321.969 30.3223 322.863 29.9746 323.796 29.9746Z"
                        fill="white"
                      />
                      <path
                        d="M225.361 33.3092L225.484 28.8699L227.931 28.87L227.93 33.2973C244.486 37.2315 246.519 66.8143 237.377 80.1525C229.77 91.2512 221.267 88.4465 217.967 85.6568C207.491 77.3919 207.835 60.9144 209.317 53.7087C211.795 37.6732 221.045 33.4276 225.361 33.3092Z"
                        fill={item.olives?.valuation}
                      />
                      <path
                        d="M232.203 38.033L230.362 37.9533C236.306 42.4438 237.066 51.0313 237.196 55.5522C238.263 63.8277 236.653 76.9332 230.008 83.6572C229.187 84.6992 227.581 85.3951 226.98 85.668C237.785 86.163 240.331 62.7676 238.823 52.5304C238.049 43.6958 234.087 39.1844 232.203 38.033Z"
                        fill="white"
                      />
                      <path
                        d="M154.376 24.1034C154.35 23.9941 154.323 23.8877 154.298 23.7798L125.42 11.185L153.646 22.2997L153.698 21.329L153.617 21.302C143.54 -11.2344 100.541 3.4891 100.541 3.4891C100.541 3.4891 123.907 45.3747 154.376 24.1034Z"
                        fill="#406325"
                      />
                      <path
                        d="M188.163 36.2371L186.92 31.944L186.876 31.8099L189.446 31.4629L190.603 35.4322C207.551 34.0906 218.547 61.8171 213.94 77.4244C210.107 90.4112 201.162 90.3486 197.169 88.6939C184.675 84.0072 179.955 68.1077 179.156 60.7438C176.601 44.6088 184.096 37.6831 188.163 36.2371Z"
                        fill={item.olives?.competitiveAdvantage}
                      />
                      <path
                        d="M196.304 38.9141L194.527 39.4026C201.562 41.854 204.919 49.7945 206.429 54.0579C209.982 61.6075 212.469 74.5753 208.206 83.0131C207.744 84.2566 206.429 85.4113 205.941 85.8554C216.377 83.0131 211.625 59.9644 207.051 50.6827C203.605 42.5113 198.45 39.4322 196.304 38.9141Z"
                        fill="white"
                      />
                      <path
                        d="M169.566 37.823L170.951 34.0273H173.722L172.033 38.3465C175.046 38.6999 177.935 41.9549 179.003 43.5382C173.358 55.9634 178.569 70.8056 181.167 75.9537C171.947 99.1201 157.1 91.3107 153.983 84.8538C148.832 76.0409 149.64 63.767 151.04 58.1972C155.23 41.7233 165.137 37.7503 169.566 37.823Z"
                        fill={item.olives?.financialHealth}
                      />
                      <path
                        d="M293.557 25.8881L294.197 40.1143C253.538 19.0028 172.949 32.2187 137.737 41.4655C135.8 41.8069 102.382 51.9455 85.9151 56.972L127.913 45.9468L128.269 46.4447C124.966 58.5085 116.405 66.9304 112.538 69.6333C92.2647 81.4695 63.6111 74.5651 51.8184 69.6333C83.139 25.7598 112.419 33.5701 123.144 42.9595C213.063 15.19 274.219 20.0079 293.557 25.8881Z"
                        fill="#406325"
                      />
                    </svg>
                  </TableCell>
                  <TableCell>

                    {item.holdingGain > 0 ? (
                      <div className={`flex items-center gap-2 ${item.holdingGain > 0 ? "text-[#28A745]" : ""}`}>
                        <span className="text-[#28A745]">
                          <FaCaretUp />
                        </span>
                        {item.holdingGain?.toFixed(2)}%
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 ${item.holdingGain < 0 ? "text-red-500" : ""}`}>
                        <span className="text-red-500">
                          <FaCaretDown />
                        </span>
                        {item.holdingGain?.toFixed(2)}%
                      </div>
                    )
                    }

                    {/* <div className="relative w-9 h-9 mx-auto flex items-center justify-center">
                      <div className="absolute w-full h-full bg-[#28A745] rounded-full blur-[6px]"></div>
                      <Image
                        src="/images/lock.png"
                        alt={item.name}
                        width={350}
                        height={200}
                        className="w-5 h-5 object-cover relative z-10"
                      />
                    </div> */}
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
                    <div className="flex justify-center">
                      <IoNotificationsOutline onClick={() => handleNotification(item.symbol)} className="h-4 w-4 cursor-pointer" />
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

        {/* Olive Stocks Essentials */}
        <TabsContent value="essentials">
          <Portfolio title="" />
        </TabsContent>


        {/* tipranks content */}
        <TabsContent value="holdings">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#EAF6EC] h-[70px]">
                <TableHead className="w-[120px] text-center">Stock Name</TableHead>

                {[
                  { label: "Company Name", key: "name" },
                  { label: "Number of Shares", key: "shares" },
                  { label: "Share Price", key: "buyPrice" },
                  { label: "Curr. Price", key: "price" },
                  { label: "Price Change", key: "change" },
                  { label: "Olive's Rating", key: "value" },
                  { label: "Holding Gain", key: "percent" },
                ].map(({ label, key }) => {
                  const isActive = sortConfig.key === key;
                  const isAsc = isActive && sortConfig.direction === "asc";
                  const isDesc = isActive && sortConfig.direction === "desc";
                  return (
                    <TableHead
                      key={key}
                      onClick={() => handleSort(key)}
                      className="text-center cursor-pointer select-none"
                    >
                      <div className="inline-flex items-center space-x-1">
                        <span>{label}</span>
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`w-3 h-3 -mb-1 ${isAsc ? "text-black" : "text-gray-400"
                              }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 ${isDesc ? "text-black" : "text-gray-400"
                              }`}
                          />
                        </div>
                      </div>
                    </TableHead>
                  );
                })}

                <TableHead className="text-center">Holding Value</TableHead>
                <TableHead className="text-center">Monthly Return</TableHead>
                <TableHead className="text-center">Alerts</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-center">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {sortedHoldings.map((item: any, index: number) => (
                <TableRow key={index} className="h-24">
                  <TableCell className="font-medium">
                    <Link href={`/stock/${item.symbol.toLowerCase()}?q=${item.symbol}`}>
                      <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                          <div className="flex w-8 h-8 rounded-full bg-black justify-center items-center p-2">
                            <Image
                              src={item.logo}
                              alt={item.name}
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
                  <TableCell>
                    {item.name}
                  </TableCell>
                  <TableCell>
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateHolding(item.symbol, "shares", editableShares[item.symbol]);
                          }
                        }}
                      />
                      <span>
                        <FiEdit2
                          onClick={() => handleUpdateHolding(item.symbol, "shares", editableShares[item.symbol])}
                          className="text-[#28A745] cursor-pointer"
                        />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editablePrices[item.symbol] ?? ""}
                      className="text-center w-16"
                      onChange={(e) =>
                        setEditablePrices((prev) => ({
                          ...prev,
                          [item.symbol]: Number(e.target.value),
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateHolding(item.symbol, "price", editablePrices[item.symbol]);
                        }
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    ${item.price}
                  </TableCell>
                  <TableCell className="">
                    <div className="">
                      <p className="flex flex-col">
                        <span className={`${item.change > 0 ? "text-green-500" : "text-red-500"}`}>${item.change}</span>
                        <p className="flex items-center">
                          <span>{item.change > 0 ? <FaCaretUp className="text-2xl text-green-500" /> : <FaCaretDown className="text-red-500 text-2xl" />}</span>
                          <span className={item.change > 0 ? "text-green-500" : "text-red-500"}>${item.percent.toFixed(2)}%</span>
                        </p>
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <svg
                      width="150"
                      height="70"
                      viewBox="0 0 369 191"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto mt-4"
                    >
                      <path
                        d="M322.624 39.3246H324.382V40.9746H322.624V39.3246ZM323.796 29.9746C326.932 30.0956 328.297 33.0656 326.434 35.2931C325.947 35.8431 325.162 36.2061 324.775 36.6681C324.382 37.1246 324.382 37.6746 324.382 38.2246H322.624C322.624 37.3061 322.624 36.5306 323.016 35.9806C323.403 35.4306 324.189 35.1061 324.675 34.7431C326.094 33.5111 325.742 31.7676 323.796 31.6246C323.33 31.6246 322.882 31.7984 322.553 32.1079C322.223 32.4173 322.038 32.837 322.038 33.2746H320.279C320.279 32.3994 320.65 31.56 321.309 30.9412C321.969 30.3223 322.863 29.9746 323.796 29.9746Z"
                        fill="white"
                      />
                      <path
                        d="M225.361 33.3092L225.484 28.8699L227.931 28.87L227.93 33.2973C244.486 37.2315 246.519 66.8143 237.377 80.1525C229.77 91.2512 221.267 88.4465 217.967 85.6568C207.491 77.3919 207.835 60.9144 209.317 53.7087C211.795 37.6732 221.045 33.4276 225.361 33.3092Z"
                        fill={item.olives?.valuation}
                      />
                      <path
                        d="M232.203 38.033L230.362 37.9533C236.306 42.4438 237.066 51.0313 237.196 55.5522C238.263 63.8277 236.653 76.9332 230.008 83.6572C229.187 84.6992 227.581 85.3951 226.98 85.668C237.785 86.163 240.331 62.7676 238.823 52.5304C238.049 43.6958 234.087 39.1844 232.203 38.033Z"
                        fill="white"
                      />
                      <path
                        d="M154.376 24.1034C154.35 23.9941 154.323 23.8877 154.298 23.7798L125.42 11.185L153.646 22.2997L153.698 21.329L153.617 21.302C143.54 -11.2344 100.541 3.4891 100.541 3.4891C100.541 3.4891 123.907 45.3747 154.376 24.1034Z"
                        fill="#406325"
                      />
                      <path
                        d="M188.163 36.2371L186.92 31.944L186.876 31.8099L189.446 31.4629L190.603 35.4322C207.551 34.0906 218.547 61.8171 213.94 77.4244C210.107 90.4112 201.162 90.3486 197.169 88.6939C184.675 84.0072 179.955 68.1077 179.156 60.7438C176.601 44.6088 184.096 37.6831 188.163 36.2371Z"
                        fill={item.olives?.competitiveAdvantage}
                      />
                      <path
                        d="M196.304 38.9141L194.527 39.4026C201.562 41.854 204.919 49.7945 206.429 54.0579C209.982 61.6075 212.469 74.5753 208.206 83.0131C207.744 84.2566 206.429 85.4113 205.941 85.8554C216.377 83.0131 211.625 59.9644 207.051 50.6827C203.605 42.5113 198.45 39.4322 196.304 38.9141Z"
                        fill="white"
                      />
                      <path
                        d="M169.566 37.823L170.951 34.0273H173.722L172.033 38.3465C175.046 38.6999 177.935 41.9549 179.003 43.5382C173.358 55.9634 178.569 70.8056 181.167 75.9537C171.947 99.1201 157.1 91.3107 153.983 84.8538C148.832 76.0409 149.64 63.767 151.04 58.1972C155.23 41.7233 165.137 37.7503 169.566 37.823Z"
                        fill={item.olives?.financialHealth}
                      />
                      <path
                        d="M293.557 25.8881L294.197 40.1143C253.538 19.0028 172.949 32.2187 137.737 41.4655C135.8 41.8069 102.382 51.9455 85.9151 56.972L127.913 45.9468L128.269 46.4447C124.966 58.5085 116.405 66.9304 112.538 69.6333C92.2647 81.4695 63.6111 74.5651 51.8184 69.6333C83.139 25.7598 112.419 33.5701 123.144 42.9595C213.063 15.19 274.219 20.0079 293.557 25.8881Z"
                        fill="#406325"
                      />
                    </svg>
                  </TableCell>
                  <TableCell>

                    {item.holdingGain > 0 ? (
                      <div className={`flex items-center gap-2 ${item.holdingGain > 0 ? "text-[#28A745]" : ""}`}>
                        <span className="text-[#28A745]">
                          <FaCaretUp />
                        </span>
                        {item.holdingGain?.toFixed(2)}%
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 ${item.holdingGain < 0 ? "text-red-500" : ""}`}>
                        <span className="text-red-500">
                          <FaCaretDown />
                        </span>
                        {item.holdingGain?.toFixed(2)}%
                      </div>
                    )
                    }

                    {/* <div className="relative w-9 h-9 mx-auto flex items-center justify-center">
                      <div className="absolute w-full h-full bg-[#28A745] rounded-full blur-[6px]"></div>
                      <Image
                        src="/images/lock.png"
                        alt={item.name}
                        width={350}
                        height={200}
                        className="w-5 h-5 object-cover relative z-10"
                      />
                    </div> */}
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