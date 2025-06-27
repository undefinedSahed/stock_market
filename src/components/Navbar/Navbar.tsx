"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
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
  type LucideIcon,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import { BiNotification } from "react-icons/bi"
import { usePathname } from "next/navigation"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

const navigationLinks: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Olive Stock's Portfolio", href: "/olivestocks-portfolio", icon: TrendingUp },
  { name: "Quality Stocks", href: "/quality-stocks", icon: Star },
  { name: "Stock of the Month", href: "/stock-of-month", icon: Calendar },
  { name: "My Portfolio", href: "/my-portfolio", icon: Briefcase },
  { name: "Watchlist", href: "/watchlist", icon: Eye },
  { name: "News", href: "/news", icon: Newspaper },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const renderAuthSection = () => {
    if (status === "loading") {
      return (
        <div className="hidden lg:block flex-shrink-0">
          <div className={cn("bg-gray-200 animate-pulse rounded-full transition-all duration-300", scrolled ? "h-8 w-20" : "h-10 w-24")} />
        </div>
      )
    }

    if (session?.user) {
      return (
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          <Link href='/notification'><Bell className="text-green-600" /></Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={cn("flex items-center gap-2 cursor-pointer hover:bg-white/20 rounded-full transition-all duration-300 px-2 py-1", scrolled ? "gap-1" : "gap-2")}>
                <Avatar className={cn("transition-all duration-300", scrolled ? "h-6 w-6" : "h-8 w-8")}>
                  <AvatarImage src={session.user.image || "/placeholder.svg?height=32&width=32"} alt={session.user.name || "User"} />
                  <AvatarFallback className="text-xs font-semibold bg-green-500 text-white">
                    {session.user.name ? getInitials(session.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("text-left transition-all duration-300", scrolled ? "hidden xl:block" : "block")}>
                  <p className={cn("font-semibold text-gray-700 leading-tight transition-all duration-300", scrolled ? "text-xs" : "text-sm")}>
                    {session.user.name || "User"}
                  </p>
                  <p className={cn("text-gray-500 leading-tight transition-all duration-300 capitalize", "text-xs")}>
                    {session.user.role || "Member"}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{session.user.email || "No email"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }

    return (
      <Link href="/login" className="hidden lg:block flex-shrink-0">
        <Button className={cn("bg-green-500 hover:bg-green-600 transition-all duration-300 rounded-full", scrolled ? "px-3 py-2 text-sm" : "px-4 py-2 text-base")}>
          <LogIn className={cn("transition-all duration-300", scrolled ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
          <span className={cn("transition-all duration-300", scrolled ? "hidden xl:inline" : "inline")}>Log in</span>
        </Button>
      </Link>
    )
  }

  const renderMobileAuthSection = () => {
    if (session?.user) {
      return (
        <div className="mt-4 px-2 border-t pt-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg mb-3">
            <Link href='/notification'><BiNotification className="text-green-600" /></Link>
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user.image || "/placeholder.svg?height=40&width=40"} alt={session.user.name || "User"} />
              <AvatarFallback className="bg-green-500 text-white font-semibold">
                {session.user.name ? getInitials(session.user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{session.user.name || "User"}</p>
              <p className="text-sm text-gray-600">{session.user.email || "No email"}</p>
              <p className="text-xs text-green-600 capitalize">{session.user.role || "Member"}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="mt-4 px-2">
        <Button className="w-full bg-green-500 hover:bg-green-600 rounded-full">
          <LogIn className="mr-2 h-4 w-4" />
          Log in
        </Button>
      </div>
    )
  }

  return (
    <>
      <header className={cn("fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full transition-all duration-700 ease-in-out", scrolled ? "pt-1" : "pt-6")}>
        <div className={cn("transition-all duration-700 ease-in-out mx-auto px-4", scrolled ? "container" : "max-w-[75rem]")}>
          <div className="bg-white/10 border border-gray-200/50 backdrop-blur-lg rounded-full shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center flex-shrink-0">
                <Image src="/images/Stock-logo-1.png" alt="Stock Logo" width={32} height={40} className={cn("transition-all duration-300", scrolled ? "h-8 w-6" : "h-10 w-8")} />
              </Link>

              <div className="hidden lg:flex items-center gap-1 flex-1 justify-center mx-8">
                {navigationLinks.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "relative cursor-pointer text-sm font-semibold px-3 py-2 rounded-full transition-colors",
                        "text-gray-700 hover:text-green-600",
                        isActive && "bg-green-50 text-green-600",
                        scrolled ? "px-4" : "px-4"
                      )}
                    >
                      <span className={cn("transition-all duration-300", scrolled ? "hidden xl:inline" : "hidden 2xl:inline")}>
                        {item.name}
                      </span>
                      <span className={cn("transition-all duration-300", scrolled ? "xl:hidden" : "2xl:hidden")}>
                        <Icon size={scrolled ? 16 : 18} strokeWidth={2.5} />
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="lamp"
                          className="absolute inset-0 w-full bg-green-500/10 rounded-full -z-10"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-green-500 rounded-t-full">
                            <div className="absolute w-8 h-4 bg-green-500/20 rounded-full blur-md -top-1 -left-1" />
                            <div className="absolute w-6 h-4 bg-green-500/20 rounded-full blur-md -top-1" />
                            <div className="absolute w-3 h-3 bg-green-500/20 rounded-full blur-sm top-0 left-1.5" />
                          </div>
                        </motion.div>
                      )}
                    </Link>
                  )
                })}
              </div>

              {renderAuthSection()}

              <div className="lg:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                      <Menu className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[80%] sm:w-[350px]">
                    <div className="mt-6 flex flex-col space-y-4">
                      {navigationLinks.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-2 py-2 text-base font-medium rounded-lg transition-colors ${isActive
                              ? "text-green-600 bg-green-50"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                              }`}
                            onClick={() => setOpen(false)}
                          >
                            <Icon size={20} />
                            {link.name}
                          </Link>
                        )
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

      <div className={cn("transition-all duration-700", scrolled ? "h-16" : "h-20")} />
    </>
  )
}
