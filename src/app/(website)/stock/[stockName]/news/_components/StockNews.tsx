import StockAds from "@/shared/StockAds";
import MarketNewsCard from "./MarketNewsCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface NewsItem {
  _id: string;
  image: string;
  category: string;
  headline: string;
  datetime: number;
  url: string;
}

interface StockNewsProps {
  stockNews: NewsItem[];
}

export default function StockNews({ stockNews }: StockNewsProps) {
  const firstNews = stockNews[10];

  const fifthNews = stockNews[75];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
        <div className="lg:col-span-4">
          <Link href={`${firstNews?.url}`}>
            <MarketNewsCard
              image={firstNews?.image}
              category={firstNews?.category}
              title={firstNews?.headline}
              timeAgo={`${(firstNews?.datetime / (1000 * 60 * 60 * 24)).toFixed(
                1
              )}d ago`}
              tags={[{ name: "AAPL" }, { name: "AVGO" }]}
            />
          </Link>
        </div>

        <div className="lg:col-span-2">
          <Link href={`${firstNews?.url}`}>
            <MarketNewsCard
              image={fifthNews?.image}
              category={fifthNews?.category}
              title={fifthNews?.headline}
              timeAgo={`${(fifthNews?.datetime / (1000 * 60 * 60 * 24)).toFixed(
                1
              )}d ago`}
              tags={[{ name: "AAPL" }, { name: "AVGO" }]}
            />
          </Link>

          <div className="mt-5">
            <StockAds />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {stockNews.map((news) => (
          <MarketNewsCard
            key={news?._id}
            image={news?.image}
            category={news?.category}
            title={news?.headline}
            timeAgo={`${(news?.datetime / (1000 * 60 * 60 * 24)).toFixed(
              1
            )}d ago`}
            tags={[{ name: "AAPL" }, { name: "AVGO" }]}
          />
        ))}
      </div>

      <div className="font-medium text-blue-500 text-xl mt-2 flex justify-end">
        <Link href={"/news"}>
          <button className="flex items-center gap-2 ">
            <h1>More News</h1>
            <h1>
              <ChevronRight />
            </h1>
          </button>
        </Link>
      </div>
    </div>
  );
}
