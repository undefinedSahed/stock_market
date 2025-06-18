import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function StockPremiumBanner() {
    return (
        <div className="">
            <h2 className="text-xl font-bold mb-6">Become an Expert with Olives Stocks Premium</h2>
            <Card className="border-2 border-[#28A745] bg-[#f5fff7] mx-auto overflow-hidden px-5">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="p-6 flex-1">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold mb-4">What am I Missing?</h3>
                                <ul className="space-y-2">
                                    {[
                                        "Make informed decisions based on Top Analysts' activity",
                                        "Know what industry insiders are buying",
                                        "Get actionable alerts from top Wall Street Analysts",
                                        "Find out before anyone else which stock is going to shoot up",
                                        "Get powerful stock screeners & detailed portfolio analysis",
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Link href="/explore-plan">
                                    <Button className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">Subscribe Now</Button>
                                </Link>
                                <Link href="/explore-plan" className="text-blue-500 hover:underline text-sm">
                                    See Plans & Pricing
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <Image
                                src="/images/socials.png"
                                alt="Tech company logos including Amazon, Apple, Bitcoin, Meta and Facebook"
                                width={500}
                                height={500}
                                className="w-[300px] aspect-square object-contain"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
