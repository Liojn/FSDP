"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useData, MonthlyData } from "@/context/DataContext";
import { useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { memo } from "react";

// Dynamically import components with skeleton fallback
const DynamicNetZeroGraph = dynamic(() => import("./netZeroGraph/netZeroGraph"), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,
});

const DynamicEmissionsChart = dynamic(
  () => import("./carbonNeutralGraph/predictionGraph"),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
    ssr: false,
  }
);

// Memoize components to prevent unnecessary re-renders
const MemoizedNetZeroGraph = memo(DynamicNetZeroGraph);
const MemoizedEmissionsChart = memo(DynamicEmissionsChart);

export default function PredictionPage() {
  const netZeroGraphRef = useRef<HTMLDivElement>(null);
  const emissionsChartRef = useRef<HTMLDivElement>(null);
  const { setData, setIsLoading, setError } = useData();

  useEffect(() => {
    const fetchHistoricalData = async () => {
      const userName =
        typeof window !== "undefined" ? localStorage.getItem("userName") : null;

      if (!userName) {
        setError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const endYear = new Date().getFullYear();
        const startYear = endYear - 4;

        const promises = Array.from({ length: 5 }, (_, i) => {
          const year = startYear + i;
          return fetch("/api/prediction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              userName: userName,
            },
            body: JSON.stringify({
              endYear: year,
              dataType: "carbon-emissions",
            }),
          }).then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch data for year ${year}`);
            }
            return res.json();
          });
        });

        const results = await Promise.all(promises);

        const combinedData: MonthlyData = {
          equipment: [],
          livestock: [],
          crops: [],
          waste: [],
          totalMonthlyEmissions: [],
          totalMonthlyAbsorption: [],
          netMonthlyEmissions: [],
          emissionTargets: {},
        };

        results.forEach((result) => {
          Object.keys(result.monthlyData).forEach((key) => {
            if (key === "emissionTargets") {
              combinedData.emissionTargets = {
                ...combinedData.emissionTargets,
                ...result.monthlyData.emissionTargets,
              };
            } else {
              combinedData[key as keyof MonthlyData] = [
                ...(combinedData[key as keyof MonthlyData] as number[]),
                ...result.monthlyData[key as keyof MonthlyData],
              ];
            }
          });
        });
        setData(combinedData);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [setData, setError, setIsLoading]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="pt-0 flex justify-between items-center mb-4">
        <PageHeader title="Prediction" />
      </div>
      
      <div className="" ref={netZeroGraphRef}>
        <MemoizedNetZeroGraph />
      </div>

      <div ref={emissionsChartRef}>
        <MemoizedEmissionsChart />
      </div>
    </div>
  );
}