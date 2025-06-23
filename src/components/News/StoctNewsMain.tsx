import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";

interface FirstNews {
  url: string;
  image: string;
  category: string;
  headline: string;
  summary: string;
  datetime: number;
}

interface StockNewsMainProps {
  firstNews: FirstNews;
}

export default function StockNewsMain({ firstNews }: StockNewsMainProps) {
  return (
    <div className="w-full mb-[80px] container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Stock Market News</h1>

      <div className="">
        {/* Main Article */}
        <div className="flex gap-10">
          <div className="w-1/2">
            <Link href={`${firstNews?.url}`} target="_blank">
              {firstNews?.image && (
                <Image
                  src={firstNews?.image}
                  alt="Stock market chart"
                  width={400}
                  height={300}
                  className="w-full h-full object-contain rounded-lg bg-black"
                />
              )}
            </Link>
          </div>

          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-10">
              {firstNews?.category}
            </div>
            <h2 className="text-[40px] font-semiboldold mb-10 leading-[50px] text-[#000000]">
              {firstNews?.headline}
            </h2>
            <p className="text-gray-700 mb-4">{firstNews?.summary}</p>
            <hr className="my-8" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{`${(
                firstNews?.datetime /
                (1000 * 60 * 60 * 24)
              ).toFixed(1)}d ago`}</span>
              <div>
                <Link href={`${firstNews?.url}`} target="_blank">
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
        </div>
      </div>
    </div>
  );
}
