"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  TrendingUp,
  Star,
  Calendar,
  Briefcase,
  Eye,
  Newspaper,
  LogIn,
  Menu,
  LogOut,
  Search,
  type LucideIcon,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { BiNotification } from "react-icons/bi";
import { usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface StockResult {
  symbol: string;
  description: string;
  flag: string;
  price: number;
  change: number;
  percentChange: number;
  exchange: string;
  logo?: string;
}

interface SearchResponse {
  success: boolean;
  results: StockResult[];
}

const navigationLinks: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  {
    name: "Olive Stock's Portfolio",
    href: "/olivestocks-portfolio",
    icon: TrendingUp,
  },
  { name: "Quality Stocks", href: "/quality-stocks", icon: Star },
  { name: "Stock of the Month", href: "/stock-of-month", icon: Calendar },
  { name: "My Portfolio", href: "/my-portfolio", icon: Briefcase },
  { name: "Watchlist", href: "/watchlist", icon: Eye },
  { name: "News", href: "/news", icon: Newspaper },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  const axiosInstance = useAxios();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: searchData, isLoading } = useQuery<SearchResponse>({
    queryKey: ["navbar-stock-search", debouncedQuery],
    queryFn: async () => {
      const res = await axiosInstance.get(`/stocks/search?q=${debouncedQuery}`);
      return res.data;
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 30000,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };

  const handleStockSelect = () => {
    setShowResults(false);
    setSearchQuery("");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const renderAuthSection = () => {
    if (status === "loading") {
      return (
        <div className="hidden lg:block flex-shrink-0">
          <div
            className={cn(
              "bg-gray-200 animate-pulse rounded-full transition-all duration-300",
              scrolled ? "h-8 w-20" : "h-10 w-24"
            )}
          />
        </div>
      );
    }

    if (session?.user) {
      return (
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          <Link href="/notification">
            <Bell className="text-green-600" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-2 cursor-pointer hover:bg-white/20 rounded-full transition-all duration-300 px-2 py-1",
                  scrolled ? "gap-1" : "gap-2"
                )}
              >
                <Avatar
                  className={cn(
                    "transition-all duration-300",
                    scrolled ? "h-6 w-6" : "h-8 w-8"
                  )}
                >
                  <AvatarImage
                    src={
                      session.user.image ||
                      "/placeholder.svg?height=32&width=32"
                    }
                    alt={session.user.name || "User"}
                  />
                  <AvatarFallback className="text-xs font-semibold bg-green-500 text-white">
                    {session.user.name ? getInitials(session.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "text-left transition-all duration-300",
                    scrolled ? "hidden xl:block" : "block"
                  )}
                >
                  <p
                    className={cn(
                      "font-semibold text-gray-700 leading-tight transition-all duration-300",
                      scrolled ? "text-xs" : "text-sm"
                    )}
                  >
                    {session.user.name || "User"}
                  </p>
                  <p
                    className={cn(
                      "text-gray-500 leading-tight transition-all duration-300 capitalize",
                      "text-xs"
                    )}
                  >
                    {session.user.role || "Member"}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email || "No email"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <Link href="/login" className="hidden lg:block flex-shrink-0">
        <Button
          className={cn(
            "bg-green-500 hover:bg-green-600 transition-all duration-300 rounded-full",
            scrolled ? "px-3 py-2 text-sm" : "px-4 py-2 text-base"
          )}
        >
          <LogIn
            className={cn(
              "transition-all duration-300",
              scrolled ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"
            )}
          />
          <span
            className={cn(
              "transition-all duration-300",
              scrolled ? "hidden xl:inline" : "inline"
            )}
          >
            Log in
          </span>
        </Button>
      </Link>
    );
  };

  const renderMobileAuthSection = () => {
    if (session?.user) {
      return (
        <div className="mt-4 px-2 border-t pt-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg mb-3">
            <Link href="/notification">
              <BiNotification className="text-green-600" />
            </Link>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  session.user.image || "/placeholder.svg?height=40&width=40"
                }
                alt={session.user.name || "User"}
              />
              <AvatarFallback className="bg-green-500 text-white font-semibold">
                {session.user.name ? getInitials(session.user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {session.user.name || "User"}
              </p>
              <p className="text-sm text-gray-600">
                {session.user.email || "No email"}
              </p>
              <p className="text-xs text-green-600 capitalize">
                {session.user.role || "Member"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      );
    }

    return (
      <div className="mt-4 px-2">
        <Button className="w-full bg-green-500 hover:bg-green-600 rounded-full">
          <LogIn className="mr-2 h-4 w-4" />
          Log in
        </Button>
      </div>
    );
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full transition-all duration-700 ease-in-out",
          scrolled ? "pt-1" : "pt-6"
        )}
      >
        <div
          className={cn(
            "transition-all duration-700 ease-in-out mx-auto px-4",
            scrolled ? "container" : "max-w-[80rem]"
          )}
        >
          <div className="bg-white/10 border border-gray-200/50 backdrop-blur-lg rounded-full shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center flex-shrink-0">
                <Image
                  src="/images/Stock-logo-1.png"
                  alt="Stock Logo"
                  width={32}
                  height={40}
                  className={cn(
                    "transition-all duration-300",
                    scrolled ? "h-8 w-6" : "h-10 w-8"
                  )}
                />
              </Link>

              <div className="hidden lg:flex items-center gap-1 flex-1 justify-center mx-4">
                {navigationLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "relative cursor-pointer text-[10px] font-semibold px-3 py-2 rounded-full transition-colors",
                        "text-gray-700 hover:text-green-600",
                        isActive && "bg-green-50 text-green-600",
                        scrolled ? "px-4" : "px-4"
                      )}
                    >
                      <span
                        className={cn(
                          "transition-all duration-300",
                          scrolled ? "hidden xl:inline" : "hidden 2xl:inline"
                        )}
                      >
                        {item.name}
                      </span>
                      <span
                        className={cn(
                          "transition-all duration-300",
                          scrolled ? "xl:hidden" : "2xl:hidden"
                        )}
                      >
                        <Icon size={scrolled ? 16 : 18} strokeWidth={2.5} />
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="lamp"
                          className="absolute inset-0 w-full bg-green-500/10 rounded-full -z-10"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        >
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-green-500 rounded-t-full">
                            <div className="absolute w-8 h-4 bg-green-500/20 rounded-full blur-md -top-1 -left-1" />
                            <div className="absolute w-6 h-4 bg-green-500/20 rounded-full blur-md -top-1" />
                            <div className="absolute w-3 h-3 bg-green-500/20 rounded-full blur-sm top-0 left-1.5" />
                          </div>
                        </motion.div>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* 🌟 Search Bar */}
              <div
                className="hidden lg:block relative w-[260px] mx-4"
                ref={searchRef}
              >
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length > 0 && setShowResults(true)}
                  className="w-full px-4 py-2 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                {showResults && (
                  <div className="absolute top-11 -left-20 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 mt-2 max-h-96 w-[500px] overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-2 text-sm">Searching...</p>
                      </div>
                    ) : searchData?.results?.length ? (
                      <>
                        <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                          <Search className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Search Results
                          </span>
                        </div>
                        {searchData.results.map((stock, index) => (
                          <Link
                            key={`${stock.symbol}-${index}`}
                            href={`/search-result?q=${stock.symbol}`}
                            onClick={handleStockSelect}
                          >
                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-none cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                  {stock.logo ? (
                                    <Image
                                      src={stock.logo}
                                      alt="Logo"
                                      width={40}
                                      height={40}
                                      className="rounded-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-400">
                                      N/A
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900">
                                      {stock.symbol}
                                    </p>
                                    {stock.flag && (
                                      <Image
                                        src={stock.flag}
                                        alt="Flag"
                                        width={16}
                                        height={16}
                                        className="w-4 h-4"
                                        onError={(e) => {
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                      />
                                    )}
                                    <span className="text-xs text-gray-600">
                                      {stock.exchange}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {stock.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm text-gray-900">
                                  ${stock.price?.toFixed(2)}
                                </p>
                                <p
                                  className={`text-xs font-medium ${
                                    stock.change >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {stock.change >= 0 ? "+" : ""}
                                  {stock.change?.toFixed(2)} (
                                  {stock.percentChange?.toFixed(2)}%)
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p>
                          No results found for <strong>{searchQuery}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {renderAuthSection()}

              <div className="lg:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <Menu className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[80%] sm:w-[350px]">
                    <div className="mt-6 flex flex-col space-y-4">
                      {navigationLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-2 py-2 text-base font-medium rounded-lg transition-colors ${
                              isActive
                                ? "text-green-600 bg-green-50"
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                            onClick={() => setOpen(false)}
                          >
                            <Icon size={20} />
                            {link.name}
                          </Link>
                        );
                      })}
                      {renderMobileAuthSection()}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div
        className={cn(
          "transition-all duration-700",
          scrolled ? "h-16" : "h-20"
        )}
      />
    </>
  );
}
