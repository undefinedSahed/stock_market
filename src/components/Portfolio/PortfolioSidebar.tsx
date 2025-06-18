"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { GoDesktopDownload } from "react-icons/go";
import { MdOutlineAccountCircle, MdOutlineSupportAgent } from "react-icons/md";
import { IoIosStarHalf } from "react-icons/io";
import { RiNewspaperLine } from "react-icons/ri";
import { SiSimpleanalytics } from "react-icons/si";
import { FaRegCalendarAlt, FaChartLine } from "react-icons/fa";
import { CiShare1 } from "react-icons/ci";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { usePortfolio } from "./portfolioContext";



interface SidebarItem {
  icon: React.ReactNode
  label: string
  href: string
}

export function PortfolioSidebar() {
  const pathname = usePathname()

  const sidebarItems: SidebarItem[] = [
    {
      icon: <GoDesktopDownload />,
      label: "Portfolio",
      href: "/my-portfolio",
    },
    {
      icon: <MdOutlineAccountCircle />,
      label: "My Account",
      href: "/my-portfolio/my-account",
    },
    {
      icon: <IoIosStarHalf />,
      label: "Performance",
      href: "/my-portfolio/performance",
    },
    {
      icon: <RiNewspaperLine />,
      label: "My News",
      href: "/my-portfolio/my-news",
    },
    {
      icon: <SiSimpleanalytics />,
      label: "Analysis",
      href: "/my-portfolio/analysis",
    },
    {
      icon: <FaRegCalendarAlt />,
      label: "My Calendar",
      href: "/my-portfolio/my-calendar",
    },
    {
      icon: <FaChartLine />,
      label: "Chart",
      href: "/my-portfolio/chart",
    },
    {
      icon: <CiShare1 />,
      label: "Refer with friends",
      href: "/my-portfolio/refer-with-friends",
    },
    {
      icon: <MdOutlineSupportAgent />,
      label: "Support",
      href: "/my-portfolio/support",
    }
  ]

  const { data: session } = useSession();

  const { data: portfolioData } = useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/get`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });
      const data = await res.json();
      return data;
    },
    enabled: !!session?.user?.accessToken,
  });
  // Set from localStorage or default to first portfolio


  // inside component
  const { selectedPortfolioId, setSelectedPortfolioId } = usePortfolio()

  useEffect(() => {
    if (portfolioData?.length > 0) {
      const validStored = portfolioData.find((p: { _id: string }) => p._id === selectedPortfolioId)

      const defaultId = validStored?._id || portfolioData[0]._id
      setSelectedPortfolioId(defaultId)
    }
  }, [portfolioData, selectedPortfolioId, setSelectedPortfolioId])


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
              <span className="text-base font-medium text-black">Smart</span>
              <span className="text-xl font-medium text-black">Portfolio</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="pt-4 border-t">
            <SidebarMenu className="gap-0">
              <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
                <SelectTrigger className="flex items-center gap-3 px-7 py-3 text-base border border-green-500 rounded-md">
                  <SelectValue placeholder="Select Portfolio" />
                </SelectTrigger>

                <SelectContent>
                  {portfolioData?.map((item: { _id: string; name: string }) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-7 py-8 text-xl rounded-none",
                          isActive ? "bg-[#EAF6EC] text-[#28A745] relative after:absolute after:h-full after:w-1 after:bg-[#28A745] after:right-0 after:top-0" : "text-[#4E4E4E] hover:text-gray-900",
                        )}
                      >
                        <span className={cn("h-8 w-8 rounded-md flex justify-center items-center p-1 border", isActive ? "text-[#28A745] border-[#28A745]" : "text-gray-500")}>{item.icon}</span>
                        <span className={cn("text-xs font-semibold", isActive ? "text-[#28A745]" : "")}>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>

  )
}
