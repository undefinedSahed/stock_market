"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { GridComponent, GridComponentOption } from "echarts/components";
import { ScatterChart, ScatterSeriesOption } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import { useSearchParams } from "next/navigation";

echarts.use([GridComponent, ScatterChart, CanvasRenderer, UniversalTransition]);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | ScatterSeriesOption
>;

const MAX_POINTS = 30;

const EpsChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const axiosInstance = useAxios();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  // Fetch API data using React Query
  const { data, isLoading } = useQuery({
    queryKey: ["earnings-surprise", query],
    queryFn: async () => {
      if (!query) return [];
      const res = await axiosInstance(
        `/stocks/stock/earnings-surprise?symbol=${query}`
      );
      return res.data;
    },
    enabled: !!query,
  });

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    // Define a type for the earnings data
    type EarningsSurprise = {
      period: string;
      estimate: number;
      actual: number;
      [key: string]: unknown; // for any additional properties
    };

    // Prepare data: filter & slice to latest MAX_POINTS
    const filteredData = (data || [])
      .filter(
        (item: EarningsSurprise) =>
          item.period && item.estimate != null && item.actual != null
      )
      .slice(0, MAX_POINTS)
      .reverse(); // reverse to chronological order if needed

    // Map data for series
    // x-axis value: timestamp (for time axis)
    // y-axis value: estimate or actual

    const estimateData = filteredData.map((item: EarningsSurprise) => [
      new Date(item.period).getTime(),
      item.estimate,
    ]);

    const actualData = filteredData.map((item: EarningsSurprise) => [
      new Date(item.period).getTime(),
      item.actual,
    ]);

    const option: EChartsOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        formatter: (params: Array<{ seriesName: string; value: [number, number] }>) => {
          // params is array of series at hovered point
          return params
            .map(
              (p) =>
                `${p.seriesName} <br/> Date: ${new Date(
                  p.value[0]
                ).toLocaleDateString()} <br/> Value: ${p.value[1]}`
            )
            .join("<br/><br/>");
        },
      },
      xAxis: {
        type: "time",
        name: "Date",
        nameLocation: "middle",
        nameGap: 30,
        axisLabel: {
          formatter: (value: number) =>
            new Date(value).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
        },
      },
      yAxis: {
        type: "value",
        name: "Value",
        nameLocation: "middle",
        nameGap: 40,
      },
      series: [
        {
          name: "Estimate",
          type: "scatter",
          symbolSize: 20,
          color: "#BCE4C5",
          data: estimateData,
        },
        {
          name: "Actual",
          type: "scatter",
          symbolSize: 20,
          color: "#28A745",
          data: actualData,
        },
      ],
    };

    myChart.setOption(option);

    // Resize on window resize
    const handleResize = () => myChart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      myChart.dispose();
    };
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (!data || data.length === 0) return <p>No data available.</p>;

  return (
    <div>
      <div>
        <h1 className="text-xl font-medium">Earnings History</h1>
        <p>Showing last {Math.min(data.length, MAX_POINTS)} periods</p>
      </div>
      <div ref={chartRef} style={{ height: "400px", width: "100%" }} />
    </div>
  );
};

export default EpsChart;
