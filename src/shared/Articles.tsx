"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface StockNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface DeepResearchItem {
  _id: string;
  newsTitle: string;
  newsDescription: string;
  newsImage: string;
  views: number;
  symbol: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function Articles() {
  const axiosInstance = useAxios();

  const { data: stockNews } = useQuery({
    queryKey: ["stocks-news"],
    queryFn: async () => {
      const res = await axiosInstance("/admin/news/market-news");
      return res.data.data as StockNewsItem[];
    },
  });

  const { data: deepResearch } = useQuery({
    queryKey: ["deep-research"],
    queryFn: async () => {
      const res = await axiosInstance("/admin/news/deep-research");
      return res.data.data as DeepResearchItem[];
    },
  });

  // Helper function to format timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // Helper function to format ISO date
  const formatISODate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const tabsData = [
    {
      value: "allstocks",
      title: "Market News",
      data: stockNews || [],
    },
    {
      value: "deep-research",
      title: "Olive Stock's Deep Research",
      data: deepResearch || [],
    },
  ];

  return (
    <section className="py-16 px-2 lg:px-0">
      <div className="container mx-auto">
        <div className="pb-4">
          <h2 className="text-3xl font-semibold">Latest Articles</h2>
        </div>
        <Tabs defaultValue="allstocks">
          <TabsList className="bg-transparent mb-3 text-[16px]">
            {tabsData.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabsData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
                {tab.value === "deep-research"
                  ? // Render deep research items
                    (tab.data as DeepResearchItem[]).map((item) => (
                      <Link key={item._id} href={`/news/${item?._id}`}>
                        <div className="p-4 border rounded-2xl">
                          <Image
                            src={
                              item.newsImage ||
                              "/placeholder.svg?height=300&width=600"
                            }
                            alt={item.newsTitle}
                            width={600}
                            height={300}
                            className="w-full h-[300px] object-cover rounded-lg"
                          />
                          <h5 className="font-medium text-[16px] text-[#595959] py-3">
                            {item.source}
                          </h5>
                          <h2 className="text-lg font-medium pb-3 line-clamp-2">
                            {item.newsTitle}
                          </h2>
                          <div className="flex justify-between items-center">
                            <p className="font-normal text-[16px]">
                              {formatISODate(item.createdAt)}
                            </p>
                            <span className="uppercase text-base font-semibold px-5 py-1 border border-[#28A745] rounded-3xl">
                              {item.symbol}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  : // Render stock news items
                    (tab.data as StockNewsItem[]).slice(60, 63).map((item) => (
                      <Link key={item.id} href={item?.url} target="_blank">
                        <div className="p-4 border rounded-2xl">
                          <Image
                            src={
                              item.image ||
                              "/placeholder.svg?height=300&width=600"
                            }
                            alt={item.headline}
                            width={600}
                            height={300}
                            className="w-full h-[300px] object-cover rounded-lg"
                          />
                          <h5 className="font-medium text-[16px] text-[#595959] py-3">
                            {item.category}
                          </h5>
                          <h2 className="text-lg font-medium pb-3 line-clamp-2">
                            {item.headline}
                          </h2>
                          <div className="flex justify-between items-center">
                            <p className="font-normal text-[16px]">
                              {formatDate(item.datetime)}
                            </p>
                            <span className="uppercase text-base font-semibold px-5 py-1 border border-[#28A745] rounded-3xl">
                              {item.source}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
              </div>

              {/* Show loading state when data is not available */}
              {!tab.data ||
                (tab.data.length === 0 && (
                  <div className="flex justify-center items-center py-12">
                    <p className="text-gray-500">Loading articles...</p>
                  </div>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
