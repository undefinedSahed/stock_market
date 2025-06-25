import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from 'next/image'

export default function UnderRader() {
    return (
        <section className='py-16'>
            <div className="container mx-auto">
                <div className="px-3 py-2 rounded-2xl shadow-[0px_0px_5.5px_0px_#00000040]">
                    <div className="py-2 px-3">
                        <h2 className='text-2xl font-medium pb-4'>Olive Stock&apos;s Under Rader</h2>
                    </div>
                    <Table className=''>
                        <TableHeader>
                            <TableRow className='text-xs h-[70px] bg-[#EAF6EC]'>
                                <TableHead className="text-center">Stock Name</TableHead>
                                <TableHead className='text-center'>Economic Moat</TableHead>
                                <TableHead className='text-center'>Capital Allocation</TableHead>
                                <TableHead className='text-center'>Uncertainty</TableHead>
                                <TableHead className='text-center'>Fair Value</TableHead>
                                <TableHead className='text-center'>Dividend Yield</TableHead>
                                <TableHead className="text-center">Notification/Dev</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className='h-[90px]'>
                                <TableCell className="font-medium text-center">
                                    <div className="flex gap-4 items-center justify-center">
                                        <div className="h-[40px] w-[40px] p-3 rounded-full flex justify-center items-center bg-black">
                                            <Image
                                                src='/images/murakkabs_portfolio_page/brandlogo.png'
                                                alt='logo'
                                                width={100}
                                                height={100}
                                                className='w-[30px] h-[30px] object-contain'
                                            />
                                        </div>
                                        <div className="text-base text-center">
                                            <h4>AAPL</h4>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>Low</TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>4%</TableCell>
                                <TableCell className="text-center text-xs">Yes</TableCell>
                            </TableRow>
                            <TableRow className='h-[90px]'>
                                <TableCell className="font-medium text-center">
                                    <div className="flex gap-4 items-center justify-center">
                                        <div className="h-[40px] w-[40px] p-3 rounded-full flex justify-center items-center bg-black">
                                            <Image
                                                src='/images/murakkabs_portfolio_page/brandlogo.png'
                                                alt='logo'
                                                width={100}
                                                height={100}
                                                className='w-[30px] h-[30px] object-contain'
                                            />
                                        </div>
                                        <div className="text-base text-center">
                                            <h4>AAPL</h4>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>Low</TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>4%</TableCell>
                                <TableCell className="text-center text-xs">Yes</TableCell>
                            </TableRow>
                            <TableRow className='h-[90px]'>
                                <TableCell className="font-medium text-center">
                                    <div className="flex gap-4 items-center justify-center">
                                        <div className="h-[40px] w-[40px] p-3 rounded-full flex justify-center items-center bg-black">
                                            <Image
                                                src='/images/murakkabs_portfolio_page/brandlogo.png'
                                                alt='logo'
                                                width={100}
                                                height={100}
                                                className='w-[30px] h-[30px] object-contain'
                                            />
                                        </div>
                                        <div className="text-base text-center">
                                            <h4>AAPL</h4>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>Low</TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>4%</TableCell>
                                <TableCell className="text-center text-xs">Yes</TableCell>
                            </TableRow>
                            <TableRow className='h-[90px]'>
                                <TableCell className="font-medium text-center">
                                    <div className="flex gap-4 items-center justify-center">
                                        <div className="h-[40px] w-[40px] p-3 rounded-full flex justify-center items-center bg-black">
                                            <Image
                                                src='/images/murakkabs_portfolio_page/brandlogo.png'
                                                alt='logo'
                                                width={100}
                                                height={100}
                                                className='w-[30px] h-[30px] object-contain'
                                            />
                                        </div>
                                        <div className="text-base text-center">
                                            <h4>AAPL</h4>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>Low</TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>4%</TableCell>
                                <TableCell className="text-center text-xs">Yes</TableCell>
                            </TableRow>
                            <TableRow className='h-[90px]'>
                                <TableCell className="font-medium text-center">
                                    <div className="flex gap-4 items-center justify-center">
                                        <div className="h-[40px] w-[40px] p-3 rounded-full flex justify-center items-center bg-black">
                                            <Image
                                                src='/images/murakkabs_portfolio_page/brandlogo.png'
                                                alt='logo'
                                                width={100}
                                                height={100}
                                                className='w-[30px] h-[30px] object-contain'
                                            />
                                        </div>
                                        <div className="text-base text-center">
                                            <h4>AAPL</h4>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>Low</TableCell>
                                <TableCell className='text-center text-xs'>Strong</TableCell>
                                <TableCell className='text-center text-xs'>4%</TableCell>
                                <TableCell className="text-center text-xs">Yes</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </section>
    )
}
