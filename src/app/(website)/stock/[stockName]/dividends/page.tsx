"use client"
import RecentNews from "@/components/overview/news";
import DividendDataCard from "./_components/DividendDataCard";
import DividendChart from "./_components/chart/DividendChart";
import DividendYieldChartCompo from "./_components/DividendYieldChartCompo";
import DividendHistory from "./_components/DividendHistory";
import OverviewFAQ from "@/components/overview/overview-faq";
import StockPremiumBanner from "@/components/Portfolio/chart/chart-bottom";
import { useParams } from "next/navigation";

const Page = () => {

  const params = useParams();
  const stockName = params.stockName;

  return (
    <div className="lg:w-[75vw]">
      <div className="mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold">
            <span className=" uppercase">({stockName})</span> Stock News &
            Sentiment
          </h3>

          {/* <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="outline"
              className="h-9 px-4 border-green-500 text-green-600 hover:bg-green-50 rounded-3xl"
            >
              <ChevronUp className="mr-1 h-4 w-4" />
              Compare
            </Button>

            <Button className="h-9 px-4 bg-green-500 hover:bg-green-600 text-white rounded-3xl">
              <Check className="mr-1 h-4 w-4" />
              Follow
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 bg-green-500/45 text-white rounded-3xl"
            >
              Portfolio
            </Button>
          </div> */}
        </div>

        {/* <div className="mt-4 text-right text-sm text-gray-500">
          251,279 Followers
        </div> */}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <div className="lg:w-[75%]">
          <div>
            <DividendDataCard />
          </div>

          <div className="mt-8">
            <DividendChart />
          </div>

          <div className="mt-8">
            <DividendYieldChartCompo />
          </div>

          <div className="mt-8">
            <DividendHistory />
          </div>

          <div className="mt-8">
            <OverviewFAQ />
          </div>

          <div className="mt-8">
            <StockPremiumBanner />
          </div>
        </div>

        <div className="lg:w-[25%]">
          <RecentNews />
        </div>
      </div>
    </div>
  );
};

export default Page;
