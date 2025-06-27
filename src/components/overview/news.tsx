"use client";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface News {
  url: string;
  _id: string;
  image: string;
  category : string;
  headline : string;
  datetime : number;
}

export default function RecentNews() {
  const axiosInstance = useAxios();
  const { data: recentNews = [], isLoading } = useQuery({
    queryKey: ["recet-news"],
    queryFn: async () => {
      const res = await axiosInstance(`/admin/news/market-news`);
      return res.data.data;
    },
  });

  if (isLoading) return <div>Loading....</div>;

  return (
    <div className="w-full">
      <h2 className="mb-6 text-2xl font-bold">Recent News</h2>
      <div className="space-y-4">
        {recentNews.slice(40, 45).map((item : News) => (
          <div
            key={item._id}
            className="overflow-hidden rounded-lg border border-gray-200 shadow-sm h-[120px]"
          >
            <Link href={item.url} target="_blank">
              <div className="flex gap-2">
                <div>
                  {item.image && (
                    <div className="flex-shrink-0">
                      <Image
                        src={item.image}
                        alt="Market chart"
                        width={150}
                        height={150}
                        className="h-[120px] w-[120px] object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 py-2">
                  <p className="text-sm font-medium text-gray-600">
                    {item.category}
                  </p>
                  <h3 className="mt-1 font-semibold text-gray-900 text-sm">
                    {item.headline.slice(0, 35)}....
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{`${(
                    item?.datetime /
                    (1000 * 60 * 60 * 24)
                  ).toFixed(1)}d ago`}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
        <Link
          href={"/news"}
          className="flex justify-end items-center gap-2 text-[#2695FF]"
        >
          More News <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
