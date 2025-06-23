"use client";
import { Button } from "@/components/ui/button";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import { Book } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

interface News {
  _id: string;
  newsTitle: string;
  newsDescription: string;
  newsImage: string;
  time?: string;
  // Add other fields as needed
}

const Page = ({ params }: PageProps) => {
  const axiosInstance = useAxios();
  const isPaid = false;

  const { data: newsDetails = {}, isLoading } = useQuery({
    queryKey: ["blog-details"],
    queryFn: async () => {
      const res = await axiosInstance(`/admin/news/${params?.id}`);
      return res.data.data;
    },
  });

  const { data: allNews = [] } = useQuery({
    queryKey: ["related-news"],
    queryFn: async () => {
      const res = await axiosInstance(`/admin/news/all-news`);
      return res.data.data;
    },
  });

  const relatedNews = (allNews as News[])
    .filter((news: News) => news?._id !== params?.id)
    .slice(0, 5);

  const { newsTitle, newsDescription } = newsDetails;

  if (isLoading)
    return (
      <div className="min-h-[calc(100vh-68px)] flex justify-center items-center flex-col">
        Loading......
      </div>
    );

  return (
    <div className="mt-10 container mx-auto grid grid-cols-8 gap-5 mb-16">
      <div className="col-span-2 p-5 h-[500px] bg-green-100 rounded-lg font-bold sticky top-24">
        Ads
      </div>

      <div className="col-span-4">
        <h1 className="font-bold text-4xl mb-5">{newsTitle}</h1>
        {isPaid ? (
          <div
            className="quill-content text-gray-700 max-w-none"
            dangerouslySetInnerHTML={{ __html: newsDescription }}
          />
        ) : (
          <div>
            <div
              className="quill-content text-gray-700 max-w-none"
              dangerouslySetInnerHTML={{
                __html: (() => {
                  const tempElement = document.createElement("div");
                  tempElement.innerHTML = newsDescription;
                  const text = tempElement.textContent || "";
                  const sliceLength = Math.floor(text.length * 0.3);
                  return `<p>${text.slice(0, sliceLength)}</p>`;
                })(),
              }}
            />

            <div className="flex justify-center">
              <Link href={`/explore-plan`}>
                <button className="py-3 px-5 rounded-3xl font-bold text-white bg-[#22c55e] flex items-center gap-2 text-lg">
                  {" "}
                  <Book /> <span>Contune Reading</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-2 p-5 bg-[#f5f5f5] rounded-lg h-[800px]">
        <h1 className="font-bold text-4xl mb-5">Related News</h1>

        <div className="flex flex-col gap-5">
          {relatedNews.map((news: News) => (
            <div
              key={news?._id}
              className="rounded-xl flex justify-between bg-white h-[120px]"
            >
              <div>
                <Image
                  src={news?.newsImage}
                  alt="Stock market chart"
                  width={300}
                  height={200}
                  className={`object-cover rounded-t-xl h-[120px] w-[120px] aspect-auto`}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2 px-2 mt-5">
                  Olive Stock News
                </div>
                <h3 className="text-sm font-bold mb-2 px-2">
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

        <Link href={"/news"}>
          <button className="text-xs text-blue-500 hover:underline mt-3">
            More Stock Analysis & News &gt;
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Page;
