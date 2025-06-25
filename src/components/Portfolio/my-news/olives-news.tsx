"use client"

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'

interface News {
    createdAt: string,
    newsDescription: string
    newsImage: string
    newsTitle: string
    source: string
    updatedAt: string
    views: number
    _id: string
}


interface TrendingNews {
    category: string
    datetime: number
    headline: string
    id: number
    image: string
    url: string
}

export default function OlivesNews() {

    const { data: olivesNews } = useQuery({
        queryKey: ["olive-news"],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/news/all-news`);
            const data = await res.json();
            return data;
        },
        select: (data) => data?.data
    })


    const { data: trendingNews } = useQuery({
        queryKey: ["market-news"],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/news/market-news`);
            const data = await res.json();
            return data;
        },
        select: (data) => data?.data.filter((item: TrendingNews) => item.category === "top news").slice(0, 5)
    })

    console.log(trendingNews)


    function shortTimeAgo(dateInput: string | number | Date): string {
        const timestamp =
            typeof dateInput === "number"
                ? dateInput * 1000
                : new Date(dateInput).getTime();

        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        const units = [
            { label: "y", seconds: 31536000 },
            { label: "mo", seconds: 2592000 },
            { label: "w", seconds: 604800 },
            { label: "d", seconds: 86400 },
            { label: "h", seconds: 3600 },
            { label: "m", seconds: 60 },
            { label: "s", seconds: 1 },
        ];

        for (const unit of units) {
            const value = Math.floor(seconds / unit.seconds);
            if (value >= 1) {
                return `${value}${unit.label} ago`;
            }
        }

        return "just now";
    }

    return (
        <div>
            <div className="mb-5">
                <div className="mb-4">
                    <h2 className='lg:text-[32px] text-[24px] font-semibold pb-4'>Olive Stocks News & Analysis</h2>
                    <h5 className='lg:text-xl text-base font-semibold pb-2 inline-block relative after:absolute after:content-[""] after:bottom-0 after:left-0 after:w-[150%] after:h-[5px] after:bg-[#28A745]'>Latest News</h5>
                </div>

                {/* Latest News Part */}
                <div className="flex flex-col space-y-3">
                    {
                        olivesNews?.map((news: News) => (
                            <Link href={`/news/${news._id}`} key={news._id} target='_blank'>
                                <div className="grid grid-cols-5 items-center gap-2 border pr-2 rounded-lg">
                                    <div className="col-span-2">
                                        <Image
                                            src={news.newsImage}
                                            alt='news card image'
                                            width={600}
                                            height={400}
                                            className='w-full h-32 rounded-s-lg object-cover'
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <h5 className='text-xs pb-5 text-[#A8A8A8]'>Olive Stocks News</h5>
                                        <h2 className='text-sm font-medium pb-4 mb-4 border-b line-clamp-2'>{news.newsTitle}</h2>
                                        <span className=''>{shortTimeAgo(news.createdAt)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    }
                </div>
            </div>


            {/* Trending news part */}
            <div className="">
                <div className="mb-4">
                    <h5 className='text-xl font-semibold pb-2 inline-block relative after:absolute after:content-[""] after:bottom-0 after:left-0 after:w-[150%] after:h-[5px] after:bg-[#28A745]'>Trending News</h5>
                </div>

                {/* Latest News Part */}
                <div className="flex flex-col space-y-3">
                    {
                        trendingNews?.map((news: TrendingNews) => (
                            <Link href={news.url} key={news.id} target='_blank'>
                                <div className="grid grid-cols-5 items-center gap-2 border pr-2 rounded-lg">
                                    <div className="col-span-2">
                                        <Image
                                            src={news.image}
                                            alt={news.headline}
                                            width={600}
                                            height={400}
                                            className='w-full h-40 rounded-s-lg object-cover'
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <h5 className='text-xs pb-5 text-[#A8A8A8] capitalize'>{news.category}</h5>
                                        <h2 className='text-sm font-medium pb-4 mb-4 border-b line-clamp-2'>{news.headline}</h2>
                                        <span className=''>{shortTimeAgo(news.datetime)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
