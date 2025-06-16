"use client";

import {
  LayoutDashboard,
  LogOut,
  MicVocal,
  Newspaper,
  Search,
  Settings,
  TableRowsSplit,
  UserRoundPlus,
  Users,
  Youtube,
} from "lucide-react";
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
import Image from "next/image";
import { FaBlogger } from "react-icons/fa";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

// Menu items.
const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Set Search Result",
    url: "/dashboard/set-search-result",
    addUrl: "/dashboard/youtube-video/add-set-search-result",
    icon: Search,
  },
  {
    title: "Youtube Video",
    url: "/dashboard/youtube-video",
    addUrl: "/dashboard/youtube-video/add-video",
    icon: Youtube,
  },
  {
    title: "News",
    url: "/dashboard/news",
    addUrl: "/dashboard/news/add-news",
    icon: Newspaper,
  },
  {
    title: "Deep Research",
    url: "/dashboard/deep-research",
    addUrl: "/dashboard/deep-research/add-deep-research",
    icon: Newspaper,
  },
  {
    title: "Ads",
    url: "/dashboard/ads",
    addUrl: "/dashboard/ads/add-ads",
    icon: TableRowsSplit,
  },
  {
    title: "Blogs",
    url: "/dashboard/blogs",
    addUrl: "/dashboard/blogs/add-blogs",
    icon: FaBlogger,
  },
  {
    title: "Influencers",
    url: "/dashboard/influencers",
    addUrl: "/dashboard/influencers/add-influencers",
    icon: Users,
  },
  { title: "Advertisement", url: "/dashboard/advertisement", icon: MicVocal },
  { title: "Refer", url: "/dashboard/refer", icon: UserRoundPlus },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-none">
      <SidebarContent className="bg-white pb-8 pt-5 flex flex-col justify-between">
        <SidebarGroup>
          <Link href={"/"}>
            <SidebarGroupLabel>
              <Image
                src={"/images/StockLogo.png"}
                alt="stock logo"
                height={54}
                width={48}
                className="mx-auto"
              />
            </SidebarGroupLabel>
          </Link>

          <SidebarGroupContent className="mt-8">
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  pathname === item.url || pathname === item.addUrl;
                return (
                  <SidebarMenuItem key={item.title} className="rounded-lg mt-2">
                    <SidebarMenuButton
                      className={clsx(
                        "pl-5 text-xl py-5 font-medium flex gap-3 items-center",
                        {
                          "bg-[#28a745] hover:bg-[#24923d] hover:text-white text-white":
                            isActive,
                          "hover:bg-[#28a745] hover:text-white": !isActive,
                        }
                      )}
                      asChild
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div>
          <button className="flex gap-2 font-medium pl-7">
            {" "}
            <LogOut /> Log Out
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
