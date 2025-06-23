"use client";

import type React from "react";
import { useParams, usePathname } from "next/navigation";
import { MdAltRoute } from "react-icons/md";
import { SiRedbull } from "react-icons/si";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChartBar, ChevronDown } from "lucide-react";
import { HiOutlineNewspaper } from "react-icons/hi";
import { LiaCoinsSolid } from "react-icons/lia";
import { GiChart } from "react-icons/gi";
import { TbChartBubble } from "react-icons/tb";
import { TiWaves } from "react-icons/ti";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  params?: {
    [key: string]: string;
  };
}

export function OverviewSidebar() {
  const pathname = usePathname();

  console.log(pathname);

  const params = useParams();

  const stockName = params.stockName as string;

  const sidebarItems: SidebarItem[] = [
    {
      icon: <ChartBar />,
      label: "Overview",
      href: `/stock/${stockName}?q=${stockName.toUpperCase()}`,
    },
    // {
    //     icon: <FaBookReader />,
    //     label: "Analyst Forecasts",
    //     href: "/stock/aapl/analyst-forecasts",
    // },
    // {
    //     icon: <CiMicrochip />,
    //     label: "AI Stock Analysis",
    //     href: "/stock/aapl/stock-analysis",
    // },
    {
      icon: <SiRedbull />,
      label: "News",
      href: `/stock/${stockName}/news`,
    },
    {
      icon: <HiOutlineNewspaper />,
      label: "Financials",
      href: `/stock/${stockName}/financials`,
    },
    {
      icon: <LiaCoinsSolid />,
      label: "Dividends",
      href: `/stock/${stockName}/dividends`,
    },
    // {
    //     icon: <MdStackedLineChart />,
    //     label: "Technical Analysis",
    //     href: "/stock/aapl/technical-analysis",
    // },
    {
      icon: <MdAltRoute />,
      label: "Options",
      href: `/stock/${stockName}/options`,
    },
    {
      icon: <GiChart />,
      label: "Chart",
      href: `/stock/${stockName}/chart`,
    },
    // {
    //     icon: <RiPieChartFill />,
    //     label: "Earnings",
    //     href: "/stock/aapl/earnings",
    // },
    {
      icon: <TbChartBubble />,
      label: "Ownership",
      href: `/stock/${stockName}/ownership`,
    },
    // {
    //     icon: <TbUserDollar />,
    //     label: "Stock Buybacks",
    //     href: "/stock/aapl/stock-buybacks",
    // },
    {
      icon: <TiWaves />,
      label: "Similar Stocks",
      href: `/stock/${stockName}/similar-stocks`,
    },
  ];

  return (
    <Sidebar className="max-h-lvh z-40  shadow-[2px_0px_8px_0px_#00000029]">
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="flex items-center gap-2 py-[44px]">
            <Image
              src="/images/Stock-logo-1.png"
              alt="Logo"
              width={350}
              height={150}
              className="w-20 h-16 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-base font-medium text-black">AAPL</span>
              <span className="text-xl font-medium text-black">Apple</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="pt-4 border-t">
            <SidebarMenu className="gap-0">
              {sidebarItems.map((item) => {
                // Extract pathname from item.href, ignoring query string
                const itemPath = new URL(item.href, "http://localhost")
                  .pathname;
                const isActive = pathname === itemPath;

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-7 py-8 text-xl rounded-none",
                          isActive
                            ? "bg-[#EAF6EC] text-[#28A745] relative after:absolute after:h-full after:w-1 after:bg-[#28A745] after:right-0 after:top-0"
                            : "text-[#4E4E4E] hover:text-gray-900"
                        )}
                      >
                        <span
                          className={cn(
                            "h-8 w-8 rounded-md flex justify-center items-center p-1 border",
                            isActive
                              ? "text-[#28A745] border-[#28A745]"
                              : "text-gray-500"
                          )}
                        >
                          {item.icon}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            isActive ? "text-[#28A745]" : ""
                          )}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="flex items-center justify-between px-7 py-5 text-xl rounded-none text-[#4E4E4E] hover:text-gray-900">
                    <span className="text-xs font-semibold">More</span>
                    <ChevronDown className="h-5 w-5" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-full bg-transparent shadow-none border-none"
                >
                  <DropdownMenuLabel className="bg-[#E0E0E0]">
                    Research Tools
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/research/top-olive-stocks">
                      Top Olive Stocks
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/research/stock-screener">Stock Screener</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
