import SearchResult from "@/components/SearchResult/SearchResult";
import { Suspense } from "react";

const page = () => {
  return (
    <div className="mt-10 mb-16">
      <Suspense>
        <SearchResult />
      </Suspense>
    </div>
  );
};

export default page;
