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
import { Loader2 } from "lucide-react"

const MyPortfolio = () => {
  const { data: session } = useSession();
  const { selectedPortfolioId } = usePortfolio();

  const isQueryEnabled = !!session?.user?.accessToken

  const {
    data: portfolioData,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ["portfolio", selectedPortfolioId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/portfolio/get`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );
      const data = await res.json();
      return data;
    },
    enabled: isQueryEnabled,
  });


  console.log("Fuckury : ", portfolioData);

  // Show loading if the query is enabled and is either loading or not yet fetched
  if (isQueryEnabled && (isLoading || !isFetched)) {
    return (
      <div className="w-[80vw] flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-green-500" />
        </div>
      </div>
    );
  }

  // After query is finished and portfolioData is still nullish
  if (isQueryEnabled && isFetched && portfolioData.length === 0) {
    return (
      <div className="w-[80vw] flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 md:text-xl lg:text-3xl mb-12 text-center">
            No Portfolio on this Profile
          </h2>
          <AddPortfolioDialog />
        </div>
      </div>
    );
  }

  // If portfolio is empty
  if (portfolioData?.stocks?.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <div className="">
          <SocketProvider>
            <AddToPortfolio />
          </SocketProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[83vw] overflow-hidden">
      <StockTickerCarousel />
      <PortfolioPanels />
      <PortfolioTable />
    </div>
  )
}

export default MyPortfolio
