"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useData, MonthlyData } from "@/context/DataContext";
import { useRef, useEffect, useState, memo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Define UserGoals interface
export interface UserGoals {
  annualEmissionsTarget: number;
  targetYear: number;
  percentageReduction: number;
}

// Define userGoals constant
export const userGoals: UserGoals = {
  annualEmissionsTarget: 10000,
  targetYear: 2030,
  percentageReduction: 50,
};

// Dynamically import components with skeleton fallback
const NetZeroGraph = dynamic(() => import("./netZeroGraph/netZeroGraph"), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false, // Set to false if the component relies on client-side only APIs
});

const EmissionsChart = dynamic(
  () => import("./predictionComponents/predictionGraph"),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
    ssr: false, // Set to false if the component relies on client-side only APIs
  }
);

// Memoize components to prevent unnecessary re-renders
const MemoizedNetZeroGraph = memo(NetZeroGraph);
const MemoizedEmissionsChart = memo(EmissionsChart);

export default function PredictionPage() {
  const netZeroGraphRef = useRef<HTMLDivElement>(null);
  const emissionsChartRef = useRef<HTMLDivElement>(null);
  const { setData, setIsLoading, isLoading } = useData();

  // Local error state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      const userName =
        typeof window !== "undefined" ? localStorage.getItem("userName") : null;

      if (!userName) {
        setError("User not authenticated.");
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
      } catch (err: Error | unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [setData, setIsLoading]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="pt-0 flex justify-between items-center mb-4">
        {isLoading ? (
          <Skeleton className="w-1/3 h-8" />
        ) : (
          <PageHeader title="Prediction" />
        )}
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500">Error: {error}</div>}

      {/* Net Zero Graph Section */}
      <div ref={netZeroGraphRef}>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <MemoizedNetZeroGraph userGoals={userGoals} />
        )}
      </div>

      {/* Emissions Chart Section */}
      <div ref={emissionsChartRef}>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <MemoizedEmissionsChart />
        )}
      </div>
    </div>
  );
}
