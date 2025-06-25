"use client"

import Hero from "@/components/HomePage/Hero";
import StockSearchSection from "@/components/HomePage/StockSearchSection";
import Services from "@/components/HomePage/Services";
import PortfolioGrowth from "@/components/HomePage/PortfolioGrowth";
import LatestArticles from "@/shared/Articles";
import StockDashboard from "@/shared/StockDashboard";
import { SocketProvider } from "@/providers/SocketProvider";
import { useSession } from "next-auth/react";
import PrivateHome from "@/components/PrivateHome/PrivateHome";

export default function Home() {
  const { data: session } = useSession();
  return (
    <main>
      {
        session == null ?
          <div className="px-2 md:px-0">
            <div>
              <Hero />
            </div>
            <div>
              <SocketProvider>
                <StockSearchSection />
              </SocketProvider>
            </div>
            <div>
              <Services />
            </div>

            <div>
              <PortfolioGrowth />
            </div>

            <div>
              <LatestArticles />
            </div>

            <div>
              <StockDashboard />
            </div>
          </div>
          : (
            <PrivateHome />
          )
      }
    </main>
  );
}
