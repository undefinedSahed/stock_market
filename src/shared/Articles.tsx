import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

export default function Articles() {
  const tabsArticleData = [
    {
      value: "allstocks",
      title: "Apple Stocks",
      data: [
        {
          id: 1,
          thumbnail: "/images/murakkabs_portfolio_page/article.png",
          category: "Market News",
          title: "Want up to 11% Dividend Yield? Analysts Select 2 D",
          time: "10.00 pm, 20/11/25",
        },
        {
          id: 2,
          thumbnail: "/images/murakkabs_portfolio_page/article.png",
          category: "Market News",
          title: "Want up to 11% Dividend Yield? Analysts Select 2 D",
          time: "10.00 pm, 20/11/25",
        },
        {
          id: 3,
          thumbnail: "/images/murakkabs_portfolio_page/article.png",
          category: "Market News",
          title: "Want up to 11% Dividend Yield? Analysts Select 2 D",
          time: "10.00 pm, 20/11/25",
        },
      ],
    },
    {
      value: "portfolio",
      title: "Portfolio Stocks",
      data: [
        {
          id: 1,
          thumbnail: "/images/murakkabs_portfolio_page/article2.png",
          category: "Market News",
          title: "Want up to 11% Dividend Yield? Analysts Select 2 D",
          time: "10.00 pm, 20/11/25",
        },
        {
          id: 2,
          thumbnail: "/images/murakkabs_portfolio_page/article2.png",
          category: "Market News",
          title: "Want up to 11% Dividend Yield? Analysts Select 2 D",
          time: "10.00 pm, 20/11/25",
        },
        {
          id: 3,
          thumbnail: "/images/murakkabs_portfolio_page/article2.png",
          category: "Market News",
          title: "Want up to 11% Dividend Yield? Analysts Select 2 D",
          time: "10.00 pm, 20/11/25",
        },
      ],
    },
    {
      value: "another",
      title: "Olive Stock's Deep Research",
      id: "deep-research",
      data: [
        {
          id: 1,
          thumbnail: "/images/murakkabs_portfolio_page/article2.png",
          category: "Market News",
          title: "Want up to 11% Dividend Yield? Analysts Select 2 D",
          time: "10.00 pm, 20/11/25",
        },
        {
          id: 2,
          thumbnail: "/images/murakkabs_portfolio_page/article2.png",
          category: "Market News",
          title: "Want up to 11% Dividend Yield? Analysts Select 2 D",
          time: "10.00 pm, 20/11/25",
        },
        {
          id: 3,
          thumbnail: "/images/murakkabs_portfolio_page/article2.png",
          category: "Market News",
          title: "Want up to 11% Dividend Yield? Analysts Select 2 D",
          time: "10.00 pm, 20/11/25",
        },
      ],
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
            {tabsArticleData.map((tabTitle) => (
              <TabsTrigger id={tabTitle.id} key={tabTitle.value} value={tabTitle.value}>
                {tabTitle.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabsArticleData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
                {tab.data.map((article) => (
                  <div key={article.id} className="p-4 border rounded-2xl">
                    <Image
                      src={article.thumbnail}
                      alt="article"
                      width={600}
                      height={500}
                      className="w-full h-[300px] object-cover"
                    />
                    <h5 className="font-medium text-[16px] text-[#595959] py-3">
                      {article.category}
                    </h5>
                    <h2 className="text-lg font-medium pb-3">
                      {article.title}
                    </h2>
                    <div className="flex justify-between items-center">
                      <p className="font-normal text-[16px]">{article.time}</p>
                      <span className="uppercase text-base font-semibold px-5 py-1 border border-[#28A745] rounded-3xl">
                        TSLA
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
