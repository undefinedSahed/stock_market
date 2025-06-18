"use client"

import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Image from 'next/image'
import { CiEdit } from "react-icons/ci";
import { usePortfolio } from '../portfolioContext';
import { useEffect } from 'react';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';


export default function ProfileInfo() {

    const { selectedPortfolioId } = usePortfolio();

    const { data: session } = useSession();

    const userId = session?.user?.id
    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/get-user/${userId}`);
            const data = await res.json();
            return data;
        },
        select: (data) => data?.data,
        enabled: !!userId
    })

    const { mutate: getOverview, data: overviewData } = useMutation({
        mutationFn: async (holdings: { symbol: string; shares: number }[]) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/overview`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ holdings }),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch portfolio overview");
            }

            return res.json();
        },
    });


    const { data: portfolioData } = useQuery({
        queryKey: ["portfolio", selectedPortfolioId], // add selectedPortfolioId to the query key
        queryFn: async () => {
            // If selectedPortfolioId is undefined (initial load before a selection), prevent the fetch.
            // The `enabled` prop below also handles this, but it's good to be explicit here too.
            if (!selectedPortfolioId) {
                return null;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/get/${selectedPortfolioId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            });
            const data = await res.json();
            return data;
        },
        enabled: !!session?.user?.accessToken && !!selectedPortfolioId, // only run when both are available
    });


    useEffect(() => {
        if (portfolioData && portfolioData.stocks && portfolioData.stocks.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const holdings = portfolioData.stocks.map((stock: any) => ({
                symbol: stock.symbol,
                shares: stock.quantity,
            }));
            getOverview(holdings);
        }
    }, [portfolioData, getOverview]);


    const dailyReturnPercent = overviewData?.dailyReturnPercent ?? 0;

    const isReturnPercentPositive = dailyReturnPercent >= 0;

    return (
        <div className="w-full mb-12">
            <div className="flex md:flex-row flex-col gap-4 lg:gap-0 md:justify-between lg:items-center lg:mt-20 mt-4 rounded-xl py-4 px-4 shadow-[0px_0px_8px_0px_#00000029]">
                <div className="flex gap-4 items-center">
                    <div className="relative">
                        <Image
                            src={user?.profilePhoto || "/images/my_portfolio_page/user.png"}
                            alt={`${user?.fullname}`}
                            width={1000}
                            height={600}
                            className='w-24 h-24 rounded-full'
                        />
                        <div className="h-7 w-7 rounded-full bg-[#28A745] flex justify-center items-center text-white absolute right-1 bottom-0">
                            <CiEdit />
                        </div>
                    </div>
                    <div className="">
                        <h3 className='text-xl font-semibold pb-2'>{user?.fullName}</h3>
                        <div className="text-[#595959] text-sm">
                            <h5>{user?.email}</h5>
                            <p>Member since :
                                {
                                    user?.createdAt &&
                                    new Date(user.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                }
                            </p>

                        </div>
                    </div>
                </div>
                <div className="p-4 pr-12 bg-[#EAF6EC] rounded-xl text-[#28A745]">
                    <h3 className='text-xs pb-1'>Portfolio Value</h3>
                    <h2 className='text-lg font-semibold pb-1'>${overviewData?.totalHoldings}</h2>
                    <div className="flex gap-2 items-center">
                        <div className={`flex items-center ${isReturnPercentPositive ? "text-green-500" : "text-red-500"}`}>
                            {isReturnPercentPositive ? <FaCaretUp className="w-6 h-6 mr-1" /> : <FaCaretDown className="w-6 h-6 mr-1" />}
                            <span className="text-base font-semibold">{dailyReturnPercent}%</span>
                        </div>
                        <span>today</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
