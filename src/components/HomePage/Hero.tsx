"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const swiperImages = [
  {
    src: "/images/hero.png",
    alt: "Financial data visualization with hand interacting with charts",
    caption:
      "**Benefit:** Stay informed with real-time stock news and analysis!", // Emphasized benefit
    author: "@Seler/Shop-name",
  },
  {
    src: "/images/hero.png",
    alt: "Stock market analysis dashboard",
    caption:
      "**Service:** Access powerful real-time analytics for informed decisions.", // Emphasized service
    author: "@Olives/Analytics",
  },
  {
    src: "/images/hero.png",
    alt: "Investment portfolio growth chart",
    caption:
      "**Key Differentiator:** Leverage AI-powered strategies to maximize your investment returns.", // Emphasized differentiator
    author: "@Olives/Portfolio",
  },
];

export default function HeroSwiper() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === swiperImages.length - 1 ? 0 : prev + 1
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative overflow-hidden py-14 lg:py-24">
      <div className="container mx-auto">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Text Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-center lg:justify-start">
              <Image
                src="/images/Stock-logo-1.png"
                alt="Olives Stocks Logo"
                width={60}
                height={60}
                className="h-15 w-15"
              />
            </div>
            <h3 className="ml-2 text-2xl font-bold text-green-600 mt-5 text-center lg:text-start">
              Olives Stocks
            </h3>

            <div className="mt-6 flex items-center justify-center lg:justify-start">
              <span className="inline-block rounded-full bg-green-50 px-4 py-1 text-sm font-medium text-green-800 text-center">
                Your Trusted Partner for Market Insights{" "}
                {/* More direct differentiator */}
              </span>
            </div>

            <h1 className="mt-6 text-2xl font-bold leading-tight text-black sm:text-5xl text-center lg:text-start">
              Unlock Your Investment Potential with Our Data-Driven Platform{" "}
              {/* Clear benefit */}
            </h1>

            <p className="mt-6 text-base text-gray-600 lg:text-start text-center">
              Gain a competitive edge with real-time stock data, AI-powered
              insights, and comprehensive financial research – all designed to
              help you make confident and profitable investment decisions.{" "}
              {/* More explicit benefits */}
            </p>

            <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-[95%] mx-auto lg:w-full lg:mx-0 justify-center lg:justify-normal">
              <Link
                href="/registration"
                className="inline-flex items-center justify-center rounded-md bg-green-500 px-8 py-3 text-base font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Register Now
              </Link>
              <Link
                href="/explore-plan"
                className="inline-flex items-center justify-center rounded-md border border-green-500 bg-white px-8 py-3 text-base font-medium text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                See What We Offer
              </Link>
            </div>
          </div>

          {/* Right Column - Image Swiper */}
          <div className="relative">
            <div className="relative h-[400px] w-full overflow-hidden rounded-lg sm:h-[500px] lg:h-[530px]">
              {/* Swiper */}
              <div className="relative h-full w-full">
                {swiperImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    <Image
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 to-transparent p-4 text-white ml-10">
                      <p className="lg:text-lg hidden lg:block font-medium">
                        {image.caption}
                      </p>
                      <p className="lg:text-sm hidden lg:block  text-green-400">
                        {image.author}
                      </p>
                      <div className="mt-2 flex space-x-1">
                        {swiperImages.map((_, i) => (
                          <span
                            key={i}
                            className={`h-2 w-2 rounded-full ${i === currentSlide
                              ? "bg-green-500"
                              : "bg-white/50"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative curved line */}
      <div className="absolute bottom-0 left-0 z-0 hidden w-1/3 lg:block">
        <svg
          width="400"
          height="200"
          viewBox="0 0 400 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-20"
        >
          <path
            d="M0 200C100 100 300 100 400 0"
            stroke="#22C55E"
            strokeWidth="60"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
}
