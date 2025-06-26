import React from "react";
import OwnershipOverview from "../ownership-overview";

type Props = {
  ownerOverview: {
    breakdown: {
      insiders: number;
      mutualFunds: number;
      otherInstitutions: number;
      publicRetail: number;
    };
  };
};

export default function StockOwnershipOverview({ ownerOverview }: Props) {
  const breakdown = ownerOverview?.breakdown || {
    insiders: 0,
    mutualFunds: 0,
    otherInstitutions: 0,
    publicRetail: 0,
  };

  const totalInstitutional =
    breakdown.mutualFunds + breakdown.otherInstitutions;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 py-6 px-2 md:px-5 shadow-[0px_0px_10px_1px_#0000001A]">
      <div className="w-full md:border-r-2">
        <OwnershipOverview ownerOverview={ownerOverview} />
      </div>
      <div className="lg:pl-6 pl-2 w-full text-sm md:text-base text-gray-700 leading-relaxed">
        <p>
          The ownership structure of Apple (AAPL) stock is a mix of
          institutional, insider, and retail investors. Approximately{" "}
          <strong>{totalInstitutional.toFixed(2)}%</strong> of the
          company&apos;s stock is owned by{" "}
          <strong>Institutional Investors</strong> (including{" "}
          {breakdown.mutualFunds.toFixed(2)}% Mutual Funds and{" "}
          {breakdown.otherInstitutions.toFixed(2)}% Other Institutions),{" "}
          <strong>{breakdown.insiders.toFixed(2)}%</strong> is owned by{" "}
          <strong>Insiders</strong>, and{" "}
          <strong>{breakdown.publicRetail.toFixed(2)}%</strong> is owned by{" "}
          <strong>Public Companies and Individual Investors</strong>.
        </p>
      </div>
    </div>
  );
}
