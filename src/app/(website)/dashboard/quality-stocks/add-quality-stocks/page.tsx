import PathTracker from "../../_components/PathTracker";
import AddQualityStocks from "../_components/AddQualityStocks";

const page = () => {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />
      </div>

      <AddQualityStocks />
    </div>
  );
};

export default page;
