import PathTracker from "../../_components/PathTracker";
import AddOliveStock from "../_components/AddOliveStock";

const page = () => {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />
      </div>

      <AddOliveStock />
    </div>
  );
};

export default page;
