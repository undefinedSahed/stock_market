"use client"
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";

export default function EPBanner() {

  const { dictionary } = useLanguage();

  return (
    <section className="pt-32 sm:pt-20 md:pt-28 lg:pt-36 bg-[#EAF6EC] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          <div className="md:col-span-1 lg:col-span-3">
            <Image
              src="/images/explore_plan_page/banlogo.png"
              alt="logo"
              width={500}
              height={500}
              className="w-32 h-24 sm:w-28 sm:h-20 lg:w-32 lg:h-24 object-cover mb-6 sm:mb-8 lg:mb-10"
            />
            <h2 className="text-2xl sm:text-3xl md:text-[32px] lg:text-[40px] font-bold pb-4 sm:pb-6 lg:pb-8 max-w-[740px] leading-[120%]">
              {dictionary.heroTitle}
            </h2>
            <p className="max-w-[435px] text-sm sm:text-base lg:text-[16px] font-medium text-[#595959] pb-0 md:pb-0">
              {dictionary.heroDesc}
            </p>
          </div>
          <div className="md:col-span-1 lg:col-span-2 flex justify-center md:justify-end">
            <Image
              src="/images/explore_plan_page/ban.png"
              alt="banner arrow"
              width={1000}
              height={1000}
              className="w-full max-w-[300px] md:max-w-full md:max-h-[360px] lg:max-h-[460px] object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
