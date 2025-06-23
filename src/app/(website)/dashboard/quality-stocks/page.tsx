import Link from "next/link";
import PathTracker from "../_components/PathTracker";
import StockTable from "./_components/StockTable";

const page = () => {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />

        <Link href={"/dashboard/quality-stocks/add-quality-stocks"}>
          <button className="bg-[#28a745] py-2 px-5 rounded-lg text-white font-semibold">
            + Add Quality Stock
          </button>
        </Link>
      </div>

      <div>
        <StockTable />
      </div>
    </div>
  );
};

export default page;
