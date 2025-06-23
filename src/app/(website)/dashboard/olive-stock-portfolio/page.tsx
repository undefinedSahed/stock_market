import Link from "next/link";
import PathTracker from "../_components/PathTracker";
import PortfolioStockTable from "./_components/PortfolioStockTable";

const page = () => {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />

        <Link href={"/dashboard/olive-stock-portfolio/add-olive-stock"}>
          <button className="bg-[#28a745] py-2 px-5 rounded-lg text-white font-semibold">
            + Add Olive Stock Portfolio
          </button>
        </Link>
      </div>

      <div>
        <PortfolioStockTable />
      </div>
    </div>
  );
};

export default page;
