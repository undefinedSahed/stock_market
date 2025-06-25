import Articles from "@/shared/Articles";
import StockDashboard from "@/shared/StockDashboard";
import FinancialFlowDiagram from "./_components/Tree";
import { Suspense } from "react";

const page = () => {
  return (
    <div>
      <div className="container h-[1000px] mx-auto mt-10">
        <Suspense>
          <FinancialFlowDiagram />
        </Suspense>
      </div>

      <Articles />

      <StockDashboard />
    </div>
  );
};

export default page;
