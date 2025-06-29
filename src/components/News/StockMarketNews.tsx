"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

interface AllNews {
  _id: string;
  url: string;
  image: string;
  category: string;
  headline: string;
  datetime: number; 
}

interface StockMarketNewsProps {
  allNews: AllNews[];
}

export default function StockMarketNews({ allNews }: StockMarketNewsProps) {
  const [moreStockNews, setMoreStockNews] = useState(9);

  const visibleNews = allNews.slice(0, moreStockNews);

  const customSlice = () => {
    setMoreStockNews((prev) => prev + 3);
  };

  if (!allNews || allNews.length === 0) {
    return <div className="text-center text-gray-500">No news available</div>;
  }

  return (
    <div className="mb-[80px] container mx-auto">
      <h1 className="text-[32px] font-semibold mb-6">Stock Market News</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleNews.map((article : AllNews) => (
          <div key={article._id} className="border rounded-xl pb-2">
            <div>
              <Image
                src={article.image}
                alt="Stock market chart"
                width={300}
                height={200}
                className="w-full object-cover mb-2 bg-black rounded-t-xl h-[200px]"
              />
            </div>
            <div className="">
              <div className="text-xs text-gray-500 mb-2 px-2 mt-5">
                {article.category}
              </div>
              <h3 className="text-sm font-medium mb-2 px-2">
                {article.headline}
              </h3>
              <div className="flex items-center justify-between mt-auto px-2 py-3">
                <span className="text-sm text-gray-500">{`${(
                  article?.datetime /
                  (1000 * 60 * 60 * 24)
                ).toFixed(1)}d ago`}</span>
                <Link href={`${article.url}`} target="_blank">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs h-7 px-3 border-[#2695FF] text-[#2695FF]"
                  >
                    READ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={customSlice}
          className="text-xs text-blue-500 hover:underline"
        >
          Stock Market News &gt;
        </button>
      </div>
    </div>
  );
}
