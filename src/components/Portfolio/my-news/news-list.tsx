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
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';


interface News {
    datetime: number,
    symbol: string,
    headline: string,
    url: string,
    id: number
}


export default function NewsList() {
    const { data: session } = useSession();
    const { selectedPortfolioId } = usePortfolio();


    const { mutate: getMyNews, data: myNews } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/news/get-protfolio-news`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
                body: JSON.stringify({ protfolioId: selectedPortfolioId }),
            });
            const data = await res.json();
            return data;
        },
    })

    useEffect(() => {
        if (selectedPortfolioId) {
            getMyNews()
        }
    }, [selectedPortfolioId, getMyNews])

    function shortTimeAgo(unixTimestamp: number): string {
        const seconds = Math.floor((Date.now() - unixTimestamp * 1000) / 1000);

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
                        <TableHead className="md:w-[100px] w-12 p-0 md:p-2">Date</TableHead>
                        <TableHead className='text-start p-0 md:p-2'>Ticker</TableHead>
                        <TableHead className='p-0'>Article</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className='md:text-sm text-xs'>
                    {myNews?.map((data: News) => (
                        <TableRow key={data.id} className='border-b-0'>
                            <TableCell className="font-medium text-start p-0 md:p-2">{shortTimeAgo(data.datetime)}</TableCell>
                            <TableCell className='text-start md:w-20 w-12 p-0 md:p-2'>{data.symbol}</TableCell>
                            <TableCell className='text-start p-0 pl-3'>
                                <Link href={data.url} target='_blank'>
                                    {data.headline}
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
