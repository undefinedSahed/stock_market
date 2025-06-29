"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import Image from "next/image"

type FAQItem = {
    question: string
    answer: string
}

const faqs: FAQItem[] = [
    {
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse hendrerit a ex eget accumsan. Aliquam ullamcorper porttitor odio, non bibendum lorem consequat in. Interdum et malesuada fames ac ante ipsum primis in faucibus.",
    },
    {
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse hendrerit a ex eget accumsan. Aliquam ullamcorper porttitor odio, non bibendum lorem consequat in.",
    },
    {
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse hendrerit a ex eget accumsan. Aliquam ullamcorper porttitor odio, non bibendum lorem consequat in.",
    },
    {
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse hendrerit a ex eget accumsan. Aliquam ullamcorper porttitor odio, non bibendum lorem consequat in.",
    },
    {
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse hendrerit a ex eget accumsan. Aliquam ullamcorper porttitor odio, non bibendum lorem consequat in.",
    },
    {
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        answer:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse hendrerit a ex eget accumsan. Aliquam ullamcorper porttitor odio, non bibendum lorem consequat in.",
    },
]

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0)

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? -1 : index)
    }

    return (
        <section className="w-full py-12 md:py-16 lg:py-20 bg-[#EAF6EC]">
            <div className="container mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse hendrerit a ex eget accumsan. Aliquam
                        ullamcorper porttitor odio.
                    </p>
                </div>


                <div className="flex flex-col lg:flex-row justify-between items-center">
                    <div className="lg:w-[70%] space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border border-[#d0e8d0] rounded-lg overflow-hidden bg-white transition-all duration-300"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                                >
                                    <h3 className="font-medium text-lg">{faq.question}</h3>
                                    <span className="flex-shrink-0 ml-2 bg-blue-500 rounded-full p-1 text-white">
                                        {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                                    </span>
                                </button>
                                <div
                                    className={`px-4 overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96 pb-4" : "max-h-0"
                                        }`}
                                >
                                    <p className="text-gray-600">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="lg:w-[20%] bg-white p-4 rounded-lg shadow-sm">
                        <Image
                            src="/images/explore_plan_page/faq.png"
                            alt="Question marks illustration"
                            width={400}
                            height={500}
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}