"use client"
import { EarningsChart } from "./_components/earnings-chart";
import { MetricCard } from "./_components/metric-card";
import PathTracker from "./_components/PathTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersChart } from "./_components/users-chart";
import useAxios from "@/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";

const Page = () => {

  const axiosInstance = useAxios();

  const {data : dashboardData} = useQuery({
    queryKey : ["dashboard-data"],
    queryFn : async () => {
      const res = await axiosInstance(`/admin/dashboard`);
      return res.data;
    }
  })

  const earningsChart = dashboardData?.earningsChart;
  const userChart = dashboardData?.userChart;


  return (
    <div>
      <div className="mb-8">
        <PathTracker />
      </div>

      <div>
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <MetricCard
            title="Total Earnings"
            value={dashboardData?.totalEarnings}
          />
          <MetricCard
            title="Total User"
            value={dashboardData?.totalUsers}
          />
          <MetricCard
            title="Paid User"
            value={dashboardData?.paidUsers}
          />
          <MetricCard
            title="Unpaid User"
            value={dashboardData?.unpaidUsers}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle>Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <EarningsChart earningsChart={earningsChart} />
            </CardContent>
          </Card>

          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle>User</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersChart userChart={userChart} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;
