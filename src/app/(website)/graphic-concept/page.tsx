import Image from "next/image";
import LatestArticles from "@/shared/Articles";

const page = () => {
  return (
    <div className="mt-5">
      <div className=" bg-[#EAF6EC]">
        <div className="container mx-auto py-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-12 md:mb-0 md:max-w-[50%]">
              <div className="flex flex-col gap-2">
                <Image
                  src="/images/StockLogo.png"
                  alt="Olives Stocks Logo"
                  width={60}
                  height={60}
                />
                <h2 className="text-[#38a938] text-xl font-medium">
                  Olives Stocks
                </h2>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-black mt-12 mb-6 leading-tight">
                Know about the Graphic Concept and Grab Your Stock
              </h1>

              <p className="text-gray-700 text-lg">
                Here you can know about the Elements of the Graphic
              </p>
            </div>

            <div className="relative w-full md:w-[45%] h-[200px] md:h-[300px] flex items-center justify-end">
              <Image
                src="/images/olive.png"
                alt="Olive branch illustration"
                width={452.0469055175781}
                height={171.00022888183594}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className=" container mx-auto pt-16 bg-white">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Tooltip Description for Investors:
            </h1>

            <div className="space-y-4">
              <div>
                <span className="font-semibold text-gray-900">
                  Financial Health:
                </span>
                <span className="text-gray-700 ml-1">
                  Strong earnings, stable cash flow, minimal debt.
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">
                  Competitive Advantage:
                </span>
                <span className="text-gray-700 ml-1">
                  Distinct market position, brand strength, or high barriers to
                  entry.
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">Valuation:</span>
                <span className="text-gray-700 ml-1">
                  Trading at or below fair value; attractive for investment.
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">
                  Green Olive (On):
                </span>
                <span className="text-gray-700 ml-1">
                  Excellent or satisfactory condition based on clearly defined
                  metrics.
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">Olive Off:</span>
                <span className="text-gray-700 ml-1">
                  Needs attention; metric below acceptable standards-investors
                  should approach with caution.
                </span>
              </div>
            </div>
          </div>

          {/* Layout Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Layout of the Graphic
            </h2>

            <p className="text-gray-700 mb-4">
              The graphic will be divided into four quadrants:
            </p>

            <div className="space-y-3 ml-6">
              <div>
                <span className="font-semibold text-gray-900">Top Left:</span>
                <span className="text-gray-700 ml-1">
                  Fair Value Line with Stock Prices above it (High-Rate Stocks).
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">Top Right:</span>
                <span className="text-gray-700 ml-1">
                  Fair Value Line with Stock Prices below it (Low-Value Stocks).
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">
                  Bottom Left:
                </span>
                <span className="text-gray-700 ml-1">
                  Competitive Advantages and Financial Health indicators for
                  high-rate stocks.
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">
                  Bottom Right:
                </span>
                <span className="text-gray-700 ml-1">
                  Competitive Advantages and Financial Health indicators for
                  low-value stocks.
                </span>
              </div>
            </div>
          </div>

          {/* Color Scheme Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Color Scheme
            </h2>

            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-900">Green:</span>
                <span className="text-gray-700 ml-1">
                  Fair Value Line with Stock Prices above it (High-Rate Stocks).
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">Red:</span>
                <span className="text-gray-700 ml-1">
                  Fair Value Line with Stock Prices below it (Low-Value Stocks).
                </span>
              </div>

              <div>
                <span className="font-semibold text-gray-900">
                  Yellow/Orange:
                </span>
                <span className="text-gray-700 ml-1">
                  Competitive Advantages and Financial Health indicators for
                  high-rate stocks.
                </span>
              </div>
            </div>
          </div>

          {/* Conclusion Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Conclusion</h2>

            <p className="text-gray-700 leading-relaxed">
              This graphic will act as a comprehensive tool for investors and
              stakeholders to quickly assess the relationship between fair
              value, stock prices, competitive advantages, and financial health.
              By incorporating the olive symbol, it adds an engaging and
              memorable element to the analysis, making it easier for users to
              interpret stock performance on your website.
            </p>
          </div>
        </div>
      </div>

      <div>
        <LatestArticles />
      </div>
    </div>
  );
};

export default page;
