"use client"

import React, { useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { LuSearch } from "react-icons/lu";
import { useSession } from 'next-auth/react';
import { usePortfolio } from '../portfolioContext';
import { useMutation, useQuery } from '@tanstack/react-query';



export default function NewsList() {
    const { data: session } = useSession();
    const { selectedPortfolioId } = usePortfolio();

    const isQueryEnabled = !!session?.user?.accessToken && !!selectedPortfolioId;

    const {
        data: portfolioData
    } = useQuery({
        queryKey: ["portfolio", selectedPortfolioId],
        queryFn: async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/portfolio/get/${selectedPortfolioId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                }
            );
            const data = await res.json();
            return data;
        },
        enabled: isQueryEnabled,
    });


    const { mutate: getMyNews, data: myNews } = useMutation({
        mutationFn: async (symbols: string[]) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/news/get-protfolio-news`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
                body: JSON.stringify({ symbols }),
            });
            const data = await res.json();
            return data;
        },
    })

    console.log(myNews)

    useEffect(() => {
        if (portfolioData && portfolioData.stocks.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const symbols = portfolioData.stocks.map((stock: any) => stock.symbol);
            getMyNews(symbols);
        }
    }, [portfolioData, getMyNews]);

    const dummyData = [
        {
            date: '2d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '2d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '3d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '4d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '4d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '5d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '5d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '5d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '5d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '5d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '5d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '5d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '5d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '5d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
        {
            date: '5d ago',
            ticker: 'AAPL',
            article: 'Microsoft Stock (MSFT) Narrowly Avoids Eight-Week Losing Streak',
        },
    ];

    return (
        <div className='p-2 shadow-[0px_0px_8px_0px_#00000029]'>
            <div className="mb-4">
                <h2 className='lg:text-[32px] text-[24px] font-semibold pb-4'>Portfolio News</h2>
                <h5 className='lg:text-xl text-base font-semibold pb-4'>Related News</h5>
                <Progress value={48} className='mb-4 h-[5px] bg-[#999999]' />
                <div className="relative w-[70%] inline-block">
                    <Input type="search" className='border border-[#28A745] h-12 rounded-3xl pl-6' placeholder="Search any Stock....." />
                    <LuSearch className='absolute right-4 top-1/2 -translate-y-1/2 text-xl' />
                </div>
            </div>
            <Table>
                <TableHeader className='[&_tr]:border-b-0'>
                    <TableRow className='text-xs'>
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead>Ticker</TableHead>
                        <TableHead>Article</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className='text-xs'>
                    {dummyData?.map((data, index) => (
                        <TableRow key={index} className='border-b-0'>
                            <TableCell className="font-medium">{data.date}</TableCell>
                            <TableCell>{data.ticker}</TableCell>
                            <TableCell>{data.article}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
