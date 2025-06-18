"use client"

import PortfolioPanels from "@/components/Portfolio/PortfolioPanels"
import PortfolioTable from "@/components/Portfolio/PortfolioTable"
import StockTickerCarousel from "@/components/Watchlist/StockTickerCarousel"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import AddToPortfolio from "./addToPortfolio"
import { AddPortfolioDialog } from "./add-portfolio-dialog"
import { usePortfolio } from "./portfolioContext"
import { SocketProvider } from "@/providers/SocketProvider"

const MyPortfolio = () => {

  const { data: session } = useSession()

  const { selectedPortfolioId } = usePortfolio(); // Use selectedPortfolioId from context

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



  if (!portfolioData) {
    return (
      <div className="w-[80vw] flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 md:text-xl lg:text-3xl mb-12 text-center">
            No Portfolio on this Profile
          </h2>
          <AddPortfolioDialog />
        </div>
      </div>
    )
  }


  if (portfolioData?.stocks?.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <div className="">
          <SocketProvider>
            <AddToPortfolio />
          </SocketProvider>
        </div>
      </div>
    )
  }


  return (
    <div className="w-full overflow-hidden">
      <StockTickerCarousel />
      <PortfolioPanels />
      <PortfolioTable />
    </div>
  )
}

export default MyPortfolio
