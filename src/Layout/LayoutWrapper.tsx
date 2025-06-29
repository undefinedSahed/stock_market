"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer/Footer";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Navbar from "@/components/Navbar/Navbar";
import { PortfolioProvider } from "@/components/Portfolio/portfolioContext";

const queryClient = new QueryClient();

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname === "/registration" ||
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/enter-otp" ||
    pathname === "/reset-password";

  const shouldHideFooterSpecific =
    pathname.includes("my-portfolio") || pathname.includes("stock");
  return (
    <>
      

      <PortfolioProvider>
        <QueryClientProvider client={queryClient}>
          {!isAuthRoute && !isDashboardRoute && <Navbar />}
          <main>{children}</main>
        </QueryClientProvider>
      </PortfolioProvider>

      {!isAuthRoute && !isDashboardRoute && !shouldHideFooterSpecific && <Footer />}
    </>
  );
}