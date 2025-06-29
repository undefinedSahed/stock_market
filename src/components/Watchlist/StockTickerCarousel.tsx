"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "@/components/ui/carousel";
import { useSocketContext } from "@/providers/SocketProvider";
import Image from "next/image";

export default function StockTickerCarousel() {
  const { notifications } = useSocketContext();
  return (
    <div className="mx-auto container w-full lg:mt-20 mt-8">
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {notifications.map((stock, index) => (
            <CarouselItem
              key={index}
              className="basis-[220px] md:basis-[240px]"
            >
              <div className="px-4 py-3">
                <div className="flex items-center gap-4">
                  {/* Stock Info */}
                  <div className="">
                    <div className="">
                      <div className="text-[12px] text-blue-600 font-semibold">
                        {stock.name}
                      </div>
                      <div className="text-[12px] font-bold text-black">
                        {parseFloat(stock.currentPrice)?.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`text-xs font-medium text-green-500 ${
                          parseFloat(stock.change) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {/* {stock.trend === "up" ? "+" : "-"} */}
                        {parseFloat(stock.change)?.toFixed(2)} (
                        {parseFloat(stock.percent)?.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="h-10 w-20">
                    <Image
                      src="/images/svgTrack.svg"
                      alt="svg iamge"
                      width={200}
                      height={100}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Custom styled controls */}
        <CarouselNext className="!right-0 !bg-white !shadow-md hover:!bg-gray-100 transition" />
      </Carousel>
      <hr />
    </div>
  );
}
