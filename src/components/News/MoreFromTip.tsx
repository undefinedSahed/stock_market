"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

interface StockNewsItem {
  _id: string;
  newsImage: string;
  newsTitle: string;
  time: string;
}

interface MoreFromTipProps {
  stockNews: StockNewsItem[];
}

export default function MoreFromTip({ stockNews } : MoreFromTipProps) {
  const [moreStockNews, setMoreStockNews] = useState(3);

  const visibleNews = stockNews.slice(0, moreStockNews);

  const customSlice = () => {
    setMoreStockNews((prev) => prev + 3);
  };

  if (!stockNews || stockNews.length === 0) {
    return (
      <div className="text-center text-2xl text-red-500">No news available</div>
    );
  }

  return (
    <div className="mb-[80px] container mx-auto">
      <h1 className="text-[32px] font-semibold mb-6">More From Olive Stock</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleNews.map((news : StockNewsItem) => (
          <div key={news?._id} className="border rounded-xl pb-2">
            <div>
              <Image
                src={news?.newsImage}
                alt="Stock market chart"
                width={300}
                height={200}
                className={`w-full object-cover mb-2 rounded-t-xl h-[200px]`}
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2 px-2 mt-5">
                Olive Stock News
              </div>
              <h3 className="text-sm font-medium mb-2 px-2">
                {news.newsTitle}
              </h3>
              <div className="flex items-center justify-between mt-auto px-2 py-3">
                <span className="text-xs text-gray-500">{news.time}</span>
                <Link href={`/news/${news?._id}`} target="_blank">
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
          More Stock Analysis & News &gt;
        </button>
      </div>
    </div>
  );
}
