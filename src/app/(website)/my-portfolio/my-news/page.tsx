import NewsList from '@/components/Portfolio/my-news/news-list'
import { Plus } from 'lucide-react'
import React from 'react'
import OlivesNews from '@/components/Portfolio/my-news/olives-news'

export default function page() {
    return (
        <div className="lg:py-20 py-5 lg:w-[95%]">
            <div className="flex justify-end gap-5 mb-10">
                <button className="border rounded-md px-4 py-2 text-green-500 hover:bg-green-50 transition">
                    Add Portfolio
                </button>
                <button className="bg-green-500 rounded-md px-4 py-2 text-white flex items-center gap-1 hover:bg-green-600 transition">
                    <Plus className="h-4 w-4" />
                    Add Holdings
                </button>
            </div>
            <div className='grid lg:grid-cols-10 gap-6'>
                <div className="lg:col-span-6">
                    <NewsList />
                </div>
                <div className="lg:col-span-4">
                    <OlivesNews />
                </div>
            </div>
        </div>
    )
}
