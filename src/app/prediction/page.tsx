"use client";
import { PageHeader } from "@/components/shared/page-header";
import { useData, MonthlyData } from "@/context/DataContext";
import { useRef, useState, useEffect } from "react";
import NetZeroGraph from "./netZeroGraph/netZeroGraph";
import EmissionsChart from "./predictionComponents/predictionGraph";

export interface UserGoals {
  annualEmissionsTarget: number;
  targetYear: number;
  percentageReduction: number;
}

export default function PredictionPage() {
  const netZeroGraphRef = useRef<HTMLDivElement>(null);
  const emissionsChartRef = useRef<HTMLDivElement>(null);
  const { setData, setIsLoading, isLoading } = useData();
  const [userGoals] = useState<UserGoals>({
    annualEmissionsTarget: 10000,
    targetYear: 2030,
    percentageReduction: 50,
  });

  useEffect(() => {
    const fetchHistoricalData = async () => {
      const userName = localStorage.getItem("userName");
      try {
        const endYear = new Date().getFullYear();
        const startYear = endYear - 4;

        const promises = Array.from({ length: 5 }, (_, i) => {
          return fetch("/api/prediction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              userName: userName || "",
            },
            body: JSON.stringify({
              endYear: startYear + i,
              dataType: "carbon-emissions",
            }),
          }).then((res) => res.json());
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

        setData(combinedData); // Use setData from context
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false); // Use setIsLoading from context
      }
    };

    fetchHistoricalData();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="pt-0 flex justify-between items-center mb-4">
        <PageHeader title="NET ZERO Prediction" />
      </div>
      <div className="" ref={netZeroGraphRef}>
        <NetZeroGraph userGoals={userGoals} />
      </div>
      <div className="" ref={emissionsChartRef}>
        <EmissionsChart />
      </div>
    </div>
  );
}
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}
