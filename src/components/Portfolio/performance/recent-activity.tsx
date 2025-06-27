"use client"

import React from 'react'
import RecentActivityTable from './recent-activity-table'
import { usePortfolio } from '../portfolioContext';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export default function RecentActivity() {

    const { selectedPortfolioId } = usePortfolio()

    const { data: performaceData, isLoading: isLoadingPortfolioData } = useQuery({
        queryKey: ['portfolioPerformance'],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-performance/${selectedPortfolioId}`)
            return response.json()
        },
        enabled: !!selectedPortfolioId
    })

    const recentActivity = {
        oneMonthReturn: performaceData?.recentActivity?.oneMonth,
        sixMonthReturn: performaceData?.recentActivity?.sixMonth,
        twelveMonthReturn: performaceData?.recentActivity?.twelveMonth,
        ytdReturn: performaceData?.recentActivity?.ytd,
        totalReturn: performaceData?.recentActivity?.total,
    }

    const portfolioDetails = {
        activeSince: performaceData?.overview?.activeSince,
        riskProfile: performaceData?.overview?.riskProfile,
        twelveMonthReturn: performaceData?.overview?.twelveMonth ?? null,
        ytdReturn: performaceData?.overview?.YTDReturn,
        totalReturn: performaceData?.overview?.totalReturn
    }

    const mostProfitableTrade = {
        asset: performaceData?.mostProfitableTrade?.symbol,
        opened: performaceData?.mostProfitableTrade?.openDate,
        closed: null,
        gain: performaceData?.mostProfitableTrade?.gain
    }


    return (
        <div className='grid grid-cols-1 lg:grid-cols-3 lg:gap-5 lg:mt-20 my-5'>

            {/* Left Side Table*/}
            <div className="col-span-1 h-fit">

                {/* Recent Activity Part */}
                <div className="mb-4 rounded-md p-2 shadow-[0px_0px_16px_0px_#00000029]">
                    <h1 className='text-2xl font-medium pb-4'>Recent Activity</h1>
                    {
                        isLoadingPortfolioData ? (
                            <div className="flex justify-center items-center">
                                <Loader2 className='animate-spin w-10 h-10 text-green-500' />
                            </div>
                        )
                            :
                            (
                                <ul className=''>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>1-Month Return</p>
                                            <span className={`text-xs ${recentActivity.oneMonthReturn > 0 ? 'text-green-600' : 'text-red-600'} px-2 py-1 rounded-full`}>
                                                {recentActivity.oneMonthReturn ? "▲" : "▼"}
                                                {recentActivity.oneMonthReturn}%
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>6-Month Return</p>
                                            <span className={`text-xs ${recentActivity.sixMonthReturn > 0 ? 'text-green-600' : 'text-red-600'} px-2 py-1 rounded-full`}>
                                                {recentActivity.sixMonthReturn ? "▲" : "▼"}
                                                {recentActivity.sixMonthReturn}%
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>12-Month Return</p>
                                            <span className={`text-xs ${recentActivity.twelveMonthReturn > 0 ? 'text-green-600' : 'text-red-600'} px-2 py-1 rounded-full`}>
                                                {recentActivity.twelveMonthReturn ? "▲" : "▼"}
                                                {recentActivity.twelveMonthReturn}%
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>YTD Return</p>
                                            <span className={`text-xs ${recentActivity.ytdReturn > 0 ? 'text-green-600' : 'text-red-600'} px-2 py-1 rounded-full`}>
                                                {recentActivity.ytdReturn ? "▲" : "▼"}
                                                {recentActivity.ytdReturn}%
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>Total Return</p>
                                            <span className={`text-xs ${recentActivity.totalReturn > 0 ? 'text-green-600' : 'text-red-600'} px-2 py-1 rounded-full`}>
                                                {recentActivity.totalReturn ? "▲" : "▼"}
                                                {recentActivity.totalReturn}%
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            )
                    }
                </div>

                {/* Portfolio Details Part */}
                <div className="mb-4 rounded-md p-2 shadow-[0px_0px_16px_0px_#00000029]">
                    <h1 className='text-2xl font-medium pb-4'>Portfolio Details</h1>
                    {
                        isLoadingPortfolioData ? (
                            <div className="flex justify-center items-center">
                                <Loader2 className='animate-spin w-10 h-10 text-green-500' />
                            </div>
                        )
                            :
                            (
                                <ul className=''>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>Active Since</p>
                                            <span className="text-xs">
                                                {portfolioDetails.activeSince}
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>Risk Profile</p>
                                            <span className="text-xs flex items-center">
                                                <span className={`${portfolioDetails.riskProfile === 'Low' ? 'text-green-600' : ''}`}>Low</span>/
                                                <span className={`${portfolioDetails.riskProfile === 'Medium' ? 'text-[#E6C200]' : ''}`}>Medium </span>/
                                                <span className={`${portfolioDetails.riskProfile === 'High' ? 'text-red-600' : ''}`}>High</span>
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>12-Month Return</p>
                                            <span className={`text-xs  ${portfolioDetails.twelveMonthReturn !== null && portfolioDetails.twelveMonthReturn > 0 ? 'text-green-600' : 'text-red-600'} px-2 py-1 rounded-full`}>
                                                {portfolioDetails.twelveMonthReturn !== null ? (
                                                    <>
                                                        {portfolioDetails.twelveMonthReturn >= 0 ? "▲" : "▼"}
                                                        {portfolioDetails.twelveMonthReturn}%
                                                    </>
                                                ) : "--"}
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>YTD Return</p>
                                            <span className={`text-xs ${portfolioDetails.ytdReturn > 0 ? 'text-green-600' : 'text-red-600'} px-2 py-1 rounded-full`}>
                                                {portfolioDetails.ytdReturn ? "▲" : "▼"}
                                                {portfolioDetails.ytdReturn}%
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>Total Return</p>
                                            <span className={`text-xs ${portfolioDetails.totalReturn > 0 ? 'text-green-600' : 'text-red-600'} px-2 py-1 rounded-full`}>
                                                {portfolioDetails.totalReturn ? "▲" : "▼"}
                                                {portfolioDetails.totalReturn}%
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            )
                    }
                </div>

                {/* Most Profitable Trade Part */}
                <div className="mb-4 rounded-md p-2 shadow-[0px_0px_16px_0px_#00000029]">
                    <h1 className='text-2xl font-medium pb-4'>Most Profitable Trade</h1>
                    {
                        isLoadingPortfolioData ? (
                            <div className="flex justify-center items-center">
                                <Loader2 className='animate-spin w-10 h-10 text-green-500' />
                            </div>
                        )
                            :
                            (
                                <ul className=''>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>Asset</p>
                                            <span className="text-xs">
                                                {mostProfitableTrade.asset}
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>Opened</p>
                                            <span className="text-xs">
                                                {new Date(mostProfitableTrade.opened).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>Closed</p>
                                            <span className="text-xs">
                                                {mostProfitableTrade.closed || "--"}
                                            </span>
                                        </div>
                                    </li>
                                    <li className='py-4 border-t border-[#BFBFBF] px-8'>
                                        <div className="flex justify-between otems-center text-sm">
                                            <p>Gain</p>
                                            <span className={`text-xs ${mostProfitableTrade.gain > 0 ? 'text-green-600' : 'text-red-600'} px-2 py-1 rounded-full`}>
                                                {mostProfitableTrade.gain ? "▲" : "▼"}
                                                {mostProfitableTrade.gain}%
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            )
                    }
                </div>
            </div>

            {/* Right Side Table */}
            <div className="col-span-2">
                <RecentActivityTable />
            </div>
        </div>
    )
}
