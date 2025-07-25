"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { shortTimeAgo } from "../../utils/shortTimeAgo";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";

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
  const pathname = usePathname();
  const params = useSearchParams();
  const relatedStockParams = params.get("q");
  const { dictionary, selectedLangCode } = useLanguage();

  const { data: stockNews } = useQuery({
    queryKey: ["stocks-news"],
    queryFn: async () => {
      const res = await axiosInstance("/admin/news/market-news");
      return res.data.data as StockNewsItem[];
    },
  });

  const { data: relatedStockNews, isLoading } = useQuery({
    queryKey: ["related-stocks-news"],
    queryFn: async () => {
      const res = await axiosInstance(
        `/admin/news/market-news?symbol=${relatedStockParams}`
      );
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

  const { data: relatedDeepResearch } = useQuery({
    queryKey: ["related-deep-research"],
    queryFn: async () => {
      const res = await axiosInstance(
        `/admin/news/deep-research?symbol=${relatedStockParams}`
      );
      return res.data.data as DeepResearchItem[];
    },
  });

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
      title: dictionary.marketNews,
      data:
        pathname === "/search-result"
          ? relatedStockNews || []
          : stockNews || [],
    },
    {
      value: "deep-research",
      title: dictionary.deepResearch,
      data:
        pathname === "/search-result"
          ? relatedDeepResearch || []
          : deepResearch || [],
    },
  ];

  if (isLoading)
    return <div className="text-center text-xl font-semibold">Loading....</div>;

  return (
    <section className="py-16 px-2 lg:px-0">
      <div className="container mx-auto">
        <div className="pb-4">
          <h2 className="text-3xl font-semibold">
            {dictionary.latestArticles}
          </h2>
        </div>

        <Tabs defaultValue="allstocks">
          <TabsList className="bg-transparent mb-3 text-[16px]">
            {tabsData.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                dir={selectedLangCode === "ar" ? "rtl" : "ltr"}
              >
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabsData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.data && tab.data.length > 0 ? (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
                  {tab.value === "deep-research"
                    ? (tab.data as DeepResearchItem[]).slice(0, 3).map((item) => (
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
                    : (tab.data as StockNewsItem[]).slice(60, 63).map((item) => (
                        <Link key={item.id} href={item?.url}>
                          <div className="p-4 border rounded-2xl">
                            <Image
                              src={item.image || "/images/news-placeholder.png"}
                              alt={item.headline}
                              width={600}
                              height={300}
                              className="w-full h-[300px] object-cover rounded-lg"
                            />
                            <h5 className="font-medium text-[16px] text-[#595959] py-3">
                              {item.category}
                            </h5>
                            <h2 className="text-lg font-medium pb-3">
                              {item.headline.slice(0, 75)}.....
                            </h2>
                            <div className="flex justify-between items-center">
                              <p className="font-normal text-[16px]">
                                {shortTimeAgo(item.datetime)}
                              </p>
                              <span className="uppercase text-base font-semibold px-5 py-1 border border-[#28A745] rounded-3xl">
                                {item.source}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                </div>
              ) : (
                <div className="flex justify-center items-center py-12">
                  <p className="text-gray-500 text-lg">
                    {tab.value === "deep-research"
                      ? "No deep research articles available."
                      : "No market news articles available."}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
